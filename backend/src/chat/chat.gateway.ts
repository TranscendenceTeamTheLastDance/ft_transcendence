import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { BadRequestTransformationFilter } from '../utils/bad-request-exception.filter';

import { ChannelsService } from './channels.service';
import { CreateChannelDTO, JoinChannelDTO } from './chat.dto';
import { ChatEvent } from './chat.state';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from 'src/auth/strategy';
import { ConfigService } from '@nestjs/config';

// @UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // l'origine du message pour autoriser la connection
    credentials: true, // autoriser l'envoi de cookies
  },
  namespace: 'chat', // spécification pour éviter les conflits
})
@UseFilters(BadRequestTransformationFilter)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger(ChatGateway.name);
  config: any;
  private socketsID = new Map<string, Socket[]>(); // Map pour stocker les sockets des utilisateurs

  constructor(
    private jwtService: JwtService,
    private channelsService: ChannelsService,
    private userService: UserService,
    private jwtStrategy: JwtStrategy,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Initialized!');

    // setInterval(() => this.io.emit('message', 'hello'), 2000);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const cookieName = this.configService.get('JWT_ACCESS_TOKEN_COOKIE'); // Récupérez le nom du cookie JWT à partir de la configuration
    const token = client.handshake.headers.cookie.split(`${cookieName}=`)[1]; // Récupérez le token JWT du cookie

    if (token) {
      this.logger.log('Token: ' + token);
      const payload = this.jwtService.decode(token); // Décoder le token\
	  this.logger.log("Payload: " + JSON.stringify(payload));
	  client.data.user = await this.userService.getUnique(payload.sub); // Récupérez l'utilisateur à partir de la base de données
	//   this.logger.log("User attache au socket " + client.data.user.id);
    } else {
      this.logger.error('No token found in cookies.');
      // Gérez le cas où aucun token n'est trouvé dans les cookies
    }

	const username = client.data.user.username;
    const existingSockets = this.socketsID.get(username) || [];
    existingSockets.push(client);
    this.socketsID.set(username, existingSockets);


	const channels = await this.channelsService.getJoinedChannels(client.data.user);
    const channelsName = channels.map((c) => c.name);
    client.join(channelsName);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ' + client.id);

    const username = client.data.user.username;
    const existingSockets = this.socketsID.get(username) || [];
    const updatedSockets = existingSockets.filter((s) => s.id !== client.id);

    if (updatedSockets.length > 0) {
      this.socketsID.set(username, updatedSockets);
    } else {
      // If there are no more sockets for the user, remove the entry from the map
      this.socketsID.delete(username);
    }
  }

  @SubscribeMessage(ChatEvent.Create)
  async onCreateChannel(
    @MessageBody() channel: CreateChannelDTO,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('Create channel: ' + JSON.stringify(channel));
    this.logger.log('User: ' + JSON.stringify(client.data.user));
    try {
      const data = await this.channelsService.createChannel(
        channel,
        client.data.user,
      );
      client.join(channel.name);
      return { event: 'youJoined', data: data };
    } catch (error) {
      // Gérer les erreurs et renvoyer une réponse appropriée au client
      throw new WsException('Failed to create channel');
    }
  }

  @SubscribeMessage(ChatEvent.Join)
  async onJoinChannel(
    @MessageBody() channel: JoinChannelDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const data = await this.channelsService.joinChannel(
      channel,
      client.data.user,
    );
    this.io.to(channel.name).emit(ChatEvent.Join, data.toChannel); // Envoyer un message à tous les utilisateurs du canal
    client.join(channel.name); // Ajouter l'utilisateur au canal
	this.logger.log("User " + client.data.user.username + " joined channel " + channel.name);
    return { event: 'youJoined', data: data.toClient };
  }

  @SubscribeMessage(ChatEvent.ChannelList)
  async onChannelList() {
    return await this.channelsService.getChannelList();
  }

  @SubscribeMessage(ChatEvent.JoinedChannels)
  async onGetJoinedChannels(@ConnectedSocket() client: Socket) {
    return await this.channelsService.getJoinedChannels(client.data.user);
  }

  @SubscribeMessage(ChatEvent.Message)
  onMessage(@MessageBody() message: string): WsResponse<string> {
    return { event: ChatEvent.Message, data: 'You sent: ' + message };
  }
}
