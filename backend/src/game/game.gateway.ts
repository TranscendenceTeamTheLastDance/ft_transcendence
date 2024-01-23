// my.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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

    private waitingPlayers: Socket[] = [];
    private gameRooms: Map<string, GameRoom> = new Map();
  
    // ... autres méthodes ...
  
    @SubscribeMessage('join')
    handleJoin(@ConnectedSocket() client: Socket) {
      this.waitingPlayers.push(client);
  
      if (this.waitingPlayers.length >= 2) {
        const player1 = this.waitingPlayers.shift();
        const player2 = this.waitingPlayers.shift();
  
        if (player1 && player2) {
          const roomID = this.createRoomID(player1, player2);
          const gameRoom = new GameRoom(player1, player2);
          this.gameRooms.set(roomID, gameRoom);
  
          // Informer les joueurs de l'ID de la salle
          player1.emit('room-id', roomID);
          player2.emit('room-id', roomID);
        }
      }
    }
  
    private createRoomID(player1: Socket, player2: Socket): string {
      // Créer un identifiant unique pour la salle de jeu
      return `room-${Date.now()}-${player1.id}-${player2.id}`;
    }

    @SubscribeMessage('user-paddle-move')
    handlePaddleMove(
      @ConnectedSocket() client: Socket, 
      @MessageBody() data: { y: number, roomId: string }
    ) {
      const roomId = data.roomId;
      const gameRoom = this.gameRooms.get(roomId);
    
      if (gameRoom) {
        gameRoom.updatePaddlePosition(client.id, data.y);
      }
    }

}

















// @WebSocketGateway({
//     cors: {
//         origin : 'http://localhost:3000'//l'origine du message pour autoriser la connection
//     },
//     namespace: 'game',//specification pour pas que sa rentre en conflit
// })
// export class GameGateway {
//     @WebSocketServer()
//     server: Server;

//     private updateInterval = 1000 / 50;
//     private gameLoopInterval: string | number | NodeJS.Timeout;
//     private players: Socket[] = [];

//     constructor(private gameService: GameService) {}

//     @SubscribeMessage('start')
//     handleStart(@ConnectedSocket() client: Socket) {
//         this.gameService.resetGameState(); // Réinitialisez l'état du jeu
      
//         this.gameLoopInterval = setInterval(() => {
//           this.gameService.updateGameState(); // Met à jour l'état du jeu
//           const gameState = this.gameService.broadcastGameState();
      
//           // Envoi des données de l'état du jeu
//           this.server.emit('game-state', gameState);
//         }, this.updateInterval);
//     }

//     @SubscribeMessage('user-paddle-move')
//     handlePaddleMove(@ConnectedSocket() client: Socket, @MessageBody() data: { y: number }) {
//         this.gameService.updateUserPaddle(data.y);
//     }

//     @SubscribeMessage('stop')
//     handleStop(@ConnectedSocket() client: Socket) {
//     if (this.gameLoopInterval) {
//         clearInterval(this.gameLoopInterval);
//         this.gameLoopInterval = null;
//     }
//     }
// }