import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin : 'http://localhost:3000'//l'origine du message pour autoriser la connection
    },
    namespace: 'chat',//specification pour pas que sa rentre en conflit
})
export class ChatGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    handleMessage(@MessageBody() message: string): void {
        console.log(message);
        this.server.emit('message', message);
    }
}