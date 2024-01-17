// my.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class MyGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('position')
  handleCustomEvent(client: any, data: any): void {
    console.log('Data received from client:', data);
    // Vous pouvez traiter les données ici et même envoyer une réponse
    // client.emit('response-event', { status: 'Data received' });
  }
}
