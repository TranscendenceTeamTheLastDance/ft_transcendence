// my.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GameGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('user-paddle-move')
    handlePaddleMove(client: any, data: { y: number }) {
        console.log('Position Y de la raquette utilisateur reçue:', data.y);
        // Traiter les données ici

        // Envoyer un message de confirmation au client
        client.emit('paddle-move-ack', { status: 'received' });
    }
}