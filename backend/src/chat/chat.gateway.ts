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
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { BadRequestTransformationFilter } from '../utils/bad-request-exception.filter';

import { 
  CreateChannelDTO,
	JoinChannelDTO,
	SendMessageDTO,
	MessageHistoryDTO,
  UserListInChannelDTO,
  SendDmDTO,
  PromoteUserDTO,
  DemoteUserDTO,
  KickUserDTO,
  BanUserDTO,
  MuteUserDTO,
  BlockUserDTO,
  LeaveChannelDTO,
  UpdateChannelDTO,
} from './chat.dto';
import { ChatEvent } from './chat.state';
import { ChannelsService } from './channels.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Autoriser l'origine du message pour établir la connexion
    credentials: true, // Autoriser l'envoi de cookies
  },
  namespace: 'chat', // Spécifier le namespace pour éviter les conflits
})
@UseFilters(BadRequestTransformationFilter)
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger(ChatGateway.name);
  private socketsID = new Map<string, Socket[]>(); // Map pour stocker les sockets des utilisateurs

  constructor(
    private jwtService: JwtService,
    private channelsService: ChannelsService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  // Méthode appelée après l'initialisation du serveur WebSocket
  afterInit(server: Server) {
    this.logger.log('Initialized!');
  }

  // Méthode appelée lorsqu'un client se connecte au serveur WebSocket
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      // Vérification de l'authentification du client à l'aide de JWT
      const cookieName = this.configService.get('JWT_ACCESS_TOKEN_COOKIE');
      const cookieHeaderValue = client.handshake.headers.cookie;

      if (!cookieHeaderValue) {
        this.logger.error('No cookies found in the request headers.');
        client.disconnect(); // Déconnecter proprement le client
        return;
      }

      const token = cookieHeaderValue
        .split(';')
        .find((c) => c.trim().startsWith(cookieName + '='))
        .split('=')[1];

      // Validation du token JWT et récupération des données utilisateur
      const payload = this.jwtService.decode(token);
      client.data.user = await this.userService.getUnique(payload.email);

      if (!client.data.user) {
        this.logger.error('User not authenticated');
        client.disconnect(); // Déconnecter proprement le client
        return;
      }

      // Stockage des sockets associées à l'utilisateur
      const username = client.data.user.username;
      const existingSockets = this.socketsID.get(username) || [];
      existingSockets.push(client);
      this.socketsID.set(username, existingSockets);

      // Rejoindre les canaux auxquels l'utilisateur est abonné
      const channels = await this.channelsService.getJoinedChannels(
        client.data.user,
      );
      const channelsName = channels.map((c) => c.name);
      client.join(channelsName);
    } catch (error) {
      this.logger.error('Failed to handle connection: ' + error.message);
      client.disconnect(); // Déconnecter proprement le client en cas d'erreur
    }
  }

  // Méthode appelée lorsqu'un client se déconnecte du serveur WebSocket
  handleDisconnect(client: Socket) {
    // Suppression des sockets associées à l'utilisateur qui se déconnecte
    if (client.data.user && client.data.user.username) {
      const username = client.data.user.username;
      const existingSockets = this.socketsID.get(username) || [];
      const updatedSockets = existingSockets.filter((s) => s.id !== client.id);

      if (updatedSockets.length > 0) {
        this.socketsID.set(username, updatedSockets);
      } else {
        // Si l'utilisateur n'a plus de sockets, supprimer l'entrée de la map
        this.socketsID.delete(username);
      }
    }
  }

  // Gestion des événements de création, de rejoindre un canal, etc.
  @SubscribeMessage(ChatEvent.Create)
  async onCreateChannel(
    @MessageBody() channel: CreateChannelDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const data = await this.channelsService.createChannel(channel, client.data.user);
    client.join(channel.name);
    return { event: 'youJoined', data: data };
  }

  @SubscribeMessage(ChatEvent.Join)
  async onJoinChannel(@MessageBody() channel: JoinChannelDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.joinChannel(channel, client.data.user);
    this.io.to(channel.name).emit(ChatEvent.Join, data.toChannel);
    client.join(channel.name);
    return { event: 'youJoined', data: data.toClient };
  }

  @SubscribeMessage(ChatEvent.Leave)
  async onLeaveChannel(@MessageBody() channel: LeaveChannelDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.leaveChannel(channel, client.data.user);
    client.leave(channel.name);
    this.io.to(channel.name).emit(ChatEvent.Leave, data);
    return { event: 'youLeft', data: data };
  }

  // Méthode de souscription à l'événement pour la réception de messages dans un canal donné
  @SubscribeMessage(ChatEvent.Message)
  async onMessage(@MessageBody() messageDTO: SendMessageDTO, @ConnectedSocket() client: Socket) {
    const message = await this.channelsService.sendMessage(messageDTO, client.data.user);
    this.io.to(messageDTO.channel).emit(ChatEvent.Message, message);
  }
  
  @SubscribeMessage(ChatEvent.MessageHistory)
  async onMessageHistory(
    @MessageBody() dto: MessageHistoryDTO,
    @ConnectedSocket() client: Socket,
  ) {
    return await this.channelsService.getMessageHistory(dto, client.data.user);
  }

  @SubscribeMessage(ChatEvent.UpdateChannel)
  async onUpdateChannel(
    @MessageBody() updateData: UpdateChannelDTO,
    @ConnectedSocket() client: Socket,
  ) {
    await this.channelsService.updateChannel(updateData, client.data.user);
    this.io.to(updateData.name).emit(ChatEvent.UpdateChannel, { type: updateData.type });
  }

  // @SubscribeMessage(ChatEvent.UserList)
  // async handleUserList(
  //   @MessageBody() UserListDTO: UserListInChannelDTO,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<{ channel: string; users: userType[] }> {
  //   try {
  //     const channelMembers = await this.channelsService.getChannelMembers(
  //       UserListDTO.channel,
  //     );

  //     // Extract only the desired fields from UserListDTO (frontend: userType)
  //     const extractedUserList = channelMembers.map((member) => ({
  //       id: member.id,
  //       username: member.username,
  //       profilePic: member.profilePic,
  //     }));

  //     const userTypeList = {
  //       channel: UserListDTO.channel,
  //       users: extractedUserList,
  //     };

  //     console.log(userTypeList);
  //     return userTypeList;
  //   } catch (error) {
  //     console.error('Error fetching channel members:', error);
  //     throw new WsException('Failed to fetch channel members');
  //   }
  // }

  @SubscribeMessage(ChatEvent.UserList)
  async onUserList(
    @MessageBody() dto: UserListInChannelDTO,
    @ConnectedSocket() client: Socket,
  ) {
    return await this.channelsService.getUserListInChannel(
      dto,
      client.data.user,
    );
  }

  // Méthode de souscription à l'événement pour récupérer la liste des canaux disponibles
  @SubscribeMessage(ChatEvent.ChannelList)
  async onChannelList() {
    return await this.channelsService.getChannelList();
  }

  // Méthode de souscription à l'événement pour obtenir la liste des canaux auxquels l'utilisateur est abonné
  @SubscribeMessage(ChatEvent.JoinedChannels)
  async onGetJoinedChannels(@ConnectedSocket() client: Socket) {
    return await this.channelsService.getJoinedChannels(client.data.user);
  }

  @SubscribeMessage(ChatEvent.Block)
  async onBlockUser(@MessageBody() toBlock: BlockUserDTO, @ConnectedSocket() client: Socket) {
    const user = await this.userService.blockUser(toBlock.username, client.data.user);
    return user.blocked;
  }

  @SubscribeMessage(ChatEvent.Unblock)
  async onUnblockUser(@MessageBody() toUnblock: BlockUserDTO, @ConnectedSocket() client: Socket) {
    const user = await this.userService.unblockUser(toUnblock.username, client.data.user);
    return user.blocked;
  }

  @SubscribeMessage(ChatEvent.BlockedUsersList)
  async onBlockedUsersList(@ConnectedSocket() client: Socket) {
    return await this.userService.getBlockedList(client.data.user);
  }

  @SubscribeMessage(ChatEvent.Promote)
  async onPromoteUser(@MessageBody() promotion: PromoteUserDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.promoteUser(promotion, client.data.user);
    this.io.to(promotion.channel).emit(ChatEvent.Promote, data);
  }

  @SubscribeMessage(ChatEvent.Demote)
  async onDemoteUser(@MessageBody() demotion: DemoteUserDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.demoteUser(demotion, client.data.user);
    this.io.to(demotion.channel).emit(ChatEvent.Demote, data);
  }

  @SubscribeMessage(ChatEvent.Kick)
  async onKickUser(@MessageBody() kick: KickUserDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.kickUser(kick, client.data.user);

    const sockets = this.socketsID.get(kick.username) || [];
    for (const socket of sockets) {
      socket.leave(kick.channel);
      socket.emit('youLeft', data);
    }

    this.io.to(kick.channel).emit(ChatEvent.Leave, data);
  }

  @SubscribeMessage(ChatEvent.Ban)
  async onBanUser(@MessageBody() ban: BanUserDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.banUser(ban, client.data.user);

    const sockets = this.socketsID.get(ban.username) || [];
    for (const socket of sockets) {
      socket.leave(ban.channel);
      socket.emit('youLeft', data);
    }

    this.io.to(ban.channel).emit(ChatEvent.Leave, data);
  }

  @SubscribeMessage(ChatEvent.Mute)
  async onMuteUser(@MessageBody() mute: MuteUserDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.muteUser(mute, client.data.user);
    this.io.to(mute.channel).emit(ChatEvent.Mute, data);
  }

  @SubscribeMessage(ChatEvent.DirectMessage)
  async onDirectMessageUser(@MessageBody() dm: SendDmDTO, @ConnectedSocket() client: Socket) {
    const data = await this.channelsService.sendDM(dm, client.data.user);

    const sockets = this.socketsID.get(dm.username) || [];
    for (const socket of sockets) {
      this.io.to(socket.id).emit(ChatEvent.DirectMessage, data);
    }

    client.emit(ChatEvent.DirectMessage, data);
  }
}
