// my.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { GameRoom } from './room.service';

@WebSocketGateway({
    cors: {
        origin : 'http://localhost:3000'//l'origine du message pour autoriser la connection
    },
    namespace: 'game',//specification pour pas que sa rentre en conflit
})
export class GameGateway {
    @WebSocketServer()
    server: Server;

    private updateInterval = 1000 / 50;
    private gameLoopInterval: string | number | NodeJS.Timeout;
    // private players: Socket[] = [];
    // private gameStarted = false;

    constructor(private gameService: GameService, private gameRoom: GameRoom) {}

    // @SubscribeMessage('join-game')
    // handleJoinGame(@ConnectedSocket() client: Socket) {
    //   if (this.players.length < 2) {
    //     this.players.push(client);
    //     client.emit('wait', { message: 'En attente d’un autre joueur...' });
  
    //     if (this.players.length === 2) {
    //       this.gameStarted = true;
    //       this.players.forEach(player => player.emit('start-game'));
    //       this.startGameLoop();
    //     }
    //   }
    // }

    @SubscribeMessage('start')
    handleStart(@ConnectedSocket() client: Socket) {
        this.gameService.resetGameState(); // Réinitialisez l'état du jeu
      
        this.gameLoopInterval = setInterval(() => {
          this.gameService.updateGameState(); // Met à jour l'état du jeu
          const gameState = this.gameService.broadcastGameState();
      
          // Envoi des données de l'état du jeu
          this.server.emit('game-state', gameState);
        }, this.updateInterval);
    }

    @SubscribeMessage('user-paddle-move')
    handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() data: { y: number }) {
        this.gameService.updateUserPaddle(data.y);
    }

    @SubscribeMessage('stop')
    handleStop(@ConnectedSocket() client: Socket) {
    if (this.gameLoopInterval) {
        clearInterval(this.gameLoopInterval);
        this.gameLoopInterval = null;
    }
    }
}