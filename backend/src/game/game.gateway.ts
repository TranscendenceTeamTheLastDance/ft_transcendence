// my.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoom } from './room.service';
import { PrismaService } from 'nestjs-prisma'; // Import PrismaService

@WebSocketGateway({
    cors: {
        origin : 'http://localhost:3000',//mettre une variable pour pouvoir modifie en temp reel
        credentials: true,//pour accepter l'envoi de cookies
      },
    namespace: 'game',//specification pour pas que sa rentre en conflit
})
export class GameGateway {
    @WebSocketServer()
    server: Server;

    private waitingPlayers: { client: Socket, username: string, userId: number }[] = [];
    private gameRooms: Map<string, GameRoom> = new Map();

  constructor(private prisma: PrismaService) {}

    deleteplayerInWaitList(client: Socket) {
      this.waitingPlayers = this.waitingPlayers.filter(player => player.client.id !== client.id);
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
          gameRoom.stopGameLoop();
          this.gameRooms.delete(roomId);
        }
      }
    }

    @SubscribeMessage('client-disconnect')
    handleClientDisconnect(@ConnectedSocket() client: Socket) {
      this.handleDisconnect(client);
    }
  
    @SubscribeMessage('join')
    handleJoin(@ConnectedSocket() client: Socket, 
    @MessageBody() data: { username: string, userId: number }) {
      // console.log("username:", data.username);
      // console.log("userId:", data.userId);
      this.waitingPlayers.push({ client, username: data.username, userId: data.userId });
  
      if (this.waitingPlayers.length >= 2) {
        const player1 = this.waitingPlayers.shift();
        const player2 = this.waitingPlayers.shift();
  
        if (player1 && player2) {
          const roomID = this.createRoomID(player1.client, player2.client);
          const gameRoom = new GameRoom(player1.client, player2.client, player1.userId, player2.userId, this.prisma);
          this.gameRooms.set(roomID, gameRoom);
  
          // console.log("username1:", player1.username);
          // console.log("userId1:", player1.userId);
          // console.log("username2:", player2.username);
          // console.log("userId2:", player2.userId);
          // Informer les joueurs de l'ID de la salle
          // username indefini donc peut etre definir la classe player avec un socket et un username
          player1.client.emit('room-id', {roomID : roomID, NumPlayer : 1, playerName1: player1.username, playerName2: player2.username});
          player2.client.emit('room-id', {roomID : roomID, NumPlayer : 2, playerName1: player1.username, playerName2: player2.username});
          gameRoom.startGameLoop();
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
        gameRoom.updatePaddlePosition(data.y * 400, data.x);
      }
    }
    
    @SubscribeMessage('finish')
    handleFinish(@ConnectedSocket() client: Socket) {
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
          //peut etre notifie les deux joueur que la partie est terminer????
          // Supprimer la salle de jeu
          gameRoom.stopGameLoop();
          this.gameRooms.delete(roomId);
        }
      }
    }
}