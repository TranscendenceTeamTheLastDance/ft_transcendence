// import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

// @WebSocketGateway()
// export class ChatGateway {
//   @SubscribeMessage('message')
//   handleMessage(client: any, payload: any): string {
//     return 'Hello world!';
//   }
// }

import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  private server: Server;

  afterInit(server: Server) {
    // Configure ici tout ce qui doit être fait lors de l'initialisation du serveur WebSocket.
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    // Gère ici les messages reçus depuis le client et envoie des mises à jour aux autres clients.
    this.server.emit('message', payload);
  }
}
