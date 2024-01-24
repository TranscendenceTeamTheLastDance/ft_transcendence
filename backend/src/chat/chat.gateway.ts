import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { emit } from 'process';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // l'origine du message pour autoriser la connection
  },
  namespace: 'chat', // spécification pour éviter les conflits
})
export class ChatGateway {
  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger(ChatGateway.name); // pour le log de l'envoi du message

  afterInit(server : Server) {
    this.io.on('connection', (socket) => {
      this.logger.log('Client connected: ' + socket.id);
    });
    // setInterval(() => { // pour envoyer un message toutes les 2 secondes
    //   this.io.emit('message', 'Hello world!');
    // }, 2000);
  }


  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string) {
    this.logger.log('Message received: ' + message);
	this.io.emit('message', 'You sent: ' + message);
  }
}
