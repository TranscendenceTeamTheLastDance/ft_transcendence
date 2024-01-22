import { Logger, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { BadRequestTransformationFilter } from '../utils/bad-request-exception.filter';

import { ChannelsService } from './channels.service';
import { CreateChannelDTO, JoinChannelDTO } from './chat.dto';
import { ChatEvent } from './chat.state';
import { UserService } from 'src/user/user.service';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // l'origine du message pour autoriser la connection
  },
  namespace: 'chat', // spécification pour éviter les conflits
})
@UseFilters(BadRequestTransformationFilter)
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private channelsService: ChannelsService,
    private userService: UserService
  ) {}

  afterInit(server: Server) {
    this.logger.log('Initialized!');

    this.io.on('connection', (socket) => {
      this.logger.log('Client connected: ' + socket.id);
    });

    // setInterval(() => this.io.emit('message', 'hello'), 2000);
  }

  @SubscribeMessage(ChatEvent.Create)
  async onCreateChannel(
    @MessageBody() channel: CreateChannelDTO,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(client.data.user);
    this.logger.log('Create channel: ' + channel.name);
    await this.channelsService.createChannel(channel, client.data.user);
  }

  @SubscribeMessage(ChatEvent.Join)
  async onJoinChannel(@MessageBody() channel: JoinChannelDTO, @ConnectedSocket() client: Socket) {
    await this.channelsService.joinChannel(channel, client.data.user);
    //client.join(channel.channel);
  }

  @SubscribeMessage(ChatEvent.Message)
  onMessage(@MessageBody() message: string): WsResponse<string> {
    return { event: ChatEvent.Message, data: 'You sent: ' + message };
  }
}
