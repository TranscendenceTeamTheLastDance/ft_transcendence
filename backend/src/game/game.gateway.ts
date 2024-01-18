// my.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PongService } from './game.service';
import { Interval } from '@nestjs/schedule';


@WebSocketGateway({
    cors: {
        origin : 'http://localhost:3000'//l'origine du message pour autoriser la connection
    },
    namespace: 'game',//specification pour pas que sa rentre en conflit
})
export class GameGateway {
    constructor() {}
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('user-paddle-move')
    handlePaddleMove(client: any, data: { y: number }) {
        // console.log('Position Y de la raquette utilisateur reçue:', data.y);
        // Traiter les données ici

        // Envoyer un message de confirmation au client
        client.emit('paddle-move-ack', { y: data.y });
    }
}