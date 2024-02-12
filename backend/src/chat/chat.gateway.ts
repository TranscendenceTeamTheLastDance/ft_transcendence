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
	WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { BadRequestTransformationFilter } from '../utils/bad-request-exception.filter';

import { ChannelsService } from './channels.service';
import { 
	CreateChannelDTO,
	JoinChannelDTO,
	SendMessageDTO 
} from './chat.dto';
import { ChatEvent } from './chat.state';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from 'src/auth/strategy';
import { ConfigService } from '@nestjs/config';

// @UsePipes(new ValidationPipe())
@WebSocketGateway({
	cors: {
		origin: 'http://localhost:3000', // Autoriser l'origine du message pour établir la connexion
		credentials: true, // Autoriser l'envoi de cookies
	},
	namespace: 'chat', // Spécifier le namespace pour éviter les conflits
})
@UseFilters(BadRequestTransformationFilter)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
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
			
			const token = cookieHeaderValue.split(`${cookieName}=`)[1];
			// Validation du token JWT et récupération des données utilisateur
			const payload = this.jwtService.decode(token);
			client.data.user = await this.userService.getUnique(payload.sub);

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
			const channels = await this.channelsService.getJoinedChannels(client.data.user);
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
		// Création d'un nouveau canal de discussion
		try {
			const data = await this.channelsService.createChannel(
				channel,
				client.data.user,
			);
			client.join(channel.name);
			return { event: 'youJoined', data: data };
		} catch (error) {
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

	// Méthode de souscription à l'événement pour la réception de messages dans un canal donné
	@SubscribeMessage(ChatEvent.Message)
	async onMessage(@MessageBody() messageDTO: SendMessageDTO, @ConnectedSocket() client: Socket) {
		// Envoi du message à tous les utilisateurs du canal spécifié
		const message = await this.channelsService.sendMessage(messageDTO, client.data.user);
		this.io.to(messageDTO.channel).emit(ChatEvent.Message, message);
	}
}
