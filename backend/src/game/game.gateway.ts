// my.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoom } from './room.service';

@WebSocketGateway({
    cors: {
        origin : 'http://localhost:3000'//mettre une variable pour pouvoir modifie en temp reel
    },
    namespace: 'game',//specification pour pas que sa rentre en conflit
})
export class GameGateway {
    @WebSocketServer()
    server: Server;

    private waitingPlayers: Socket[] = [];
    private gameRooms: Map<string, GameRoom> = new Map();

    deleteplayerInWaitList(client: Socket) {
      this.waitingPlayers = this.waitingPlayers.filter(player => player.id !== client.id);
    }
  
    handleDisconnect(@ConnectedSocket() client: Socket) {
      // Identifier la salle de jeu du joueur déconnecté
      let roomId: string | null = null;
      this.deleteplayerInWaitList(client);
      this.gameRooms.forEach((room, id) => {
        if (room.includesPlayer(client)) {
          roomId = id;
        }
      });
  
      if (roomId) {
        const gameRoom = this.gameRooms.get(roomId);
        if (gameRoom) {
          // Informer l'autre joueur de la déconnexion
          gameRoom.notifyPlayerOfDisconnect(client);
          // Supprimer la salle de jeu
          this.gameRooms.delete(roomId);
        }
      }
    }

    @SubscribeMessage('client-disconnect')
    handleClientDisconnect(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
      this.handleDisconnect(client);
    }
  
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
          player1.emit('room-id', {roomID : roomID, Nplayer : 1});
          player2.emit('room-id', {roomID : roomID, Nplayer : 2});
        }
      }
    }
  
    private createRoomID(player1: Socket, player2: Socket): string {
      return `room-${Date.now()}-${player1.id}-${player2.id}`;
    }

    @SubscribeMessage('user-paddle-move')
    handlePaddleMove( 
      @MessageBody() data: { y: number, roomId: string, x: number }
    ) {
      const roomId = data.roomId;
      const gameRoom = this.gameRooms.get(roomId);
    
      if (gameRoom) {
        gameRoom.updatePaddlePosition(data.y, data.x);
      }
    }

}