// my.gateway.ts
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameRoom } from './room.service';
import { PrismaService } from 'nestjs-prisma'; // Import PrismaService

@WebSocketGateway({
    cors: {
        origin : `http://${process.env.REACT_APP_SERVER_ADDRESS}:3000`,//mettre une variable pour pouvoir modifie en temp reel
      },
    namespace: 'game',//specification pour pas que sa rentre en conflit
})
export class GameGateway {
    @WebSocketServer()
    server: Server;

    private waitingPlayers: { client: Socket, username: string, userId: number }[] = [];
    private waitingPlayersFreestyle: { client: Socket, username: string, userId: number }[] = [];
    private waitingPlayersInvite: { client: Socket, username: string, userId: number, inviteID: string}[] = [];
    private gameRooms: Map<string, GameRoom> = new Map();

  constructor(private prisma: PrismaService) {}

    deleteplayerInWaitList(client: Socket) {
      this.waitingPlayers = this.waitingPlayers.filter(player => player.client.id !== client.id);
      this.waitingPlayersFreestyle = this.waitingPlayersFreestyle.filter(player => player.client.id !== client.id);
      this.waitingPlayersInvite = this.waitingPlayersInvite.filter(player => player.client.id !== client.id);
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
          // peut pas ici updateStatusUsers
          gameRoom.updateStatusUsers(gameRoom.getIdPlayer1(), gameRoom.getIdPlayer2(), 1);
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

findCouplePlayerNormal(player: { client: Socket, username: string, userId: number }) {
    const player2Index = this.waitingPlayers.findIndex(Player => Player.userId !== player.userId);
    return player2Index;
}


findCouplePlayerFreestyle(player: { client: Socket, username: string, userId: number }) {
  const player2Index = this.waitingPlayersFreestyle.findIndex(Player => Player.userId !== player.userId);
  return player2Index;
}

    @SubscribeMessage('join')
handleJoin(@ConnectedSocket() client: Socket, 
@MessageBody() data: { username: string, userId: number }) {

    this.waitingPlayers.push({ client, username: data.username, userId: data.userId });

    const findCouplePlayerIndex = this.findCouplePlayerNormal(this.waitingPlayers[0]);

    if (this.waitingPlayers.length >= 2 && findCouplePlayerIndex !== -1) {
      const player1Index = this.waitingPlayers.findIndex(player => player.userId !== this.waitingPlayers[findCouplePlayerIndex].userId);
      const player1 = this.waitingPlayers.splice(player1Index, 1)[0];
      const player2 = this.waitingPlayers.splice(findCouplePlayerIndex - 1, 1)[0]; // Retire le joueur de la liste

        if (player2 && player1) {
            const roomID = this.createRoomID(player1.client, player2.client);
            const gameRoom = new GameRoom(player1.client, player2.client, player1.userId, player2.userId, this.prisma);
            this.gameRooms.set(roomID, gameRoom);

            player1.client.emit('room-id', { roomID: roomID, NumPlayer: 1, playerName1: player1.username, playerName2: player2.username });
            player2.client.emit('room-id', { roomID: roomID, NumPlayer: 2, playerName1: player1.username, playerName2: player2.username });

            gameRoom.startGameLoop();
        }
    }
}

    @SubscribeMessage('join-freestyle')
    handleJoinFreestyle(@ConnectedSocket() client: Socket, 
    @MessageBody() data: { username: string, userId: number }) {

      this.waitingPlayersFreestyle.push({ client, username: data.username, userId: data.userId });

      const findCouplePlayerIndex = this.findCouplePlayerFreestyle(this.waitingPlayersFreestyle[0]);
  
      if (this.waitingPlayersFreestyle.length >= 2 && findCouplePlayerIndex !== -1) {
        const player1Index = this.waitingPlayersFreestyle.findIndex(player => player.userId !== this.waitingPlayersFreestyle[findCouplePlayerIndex].userId);
        const player1 = this.waitingPlayersFreestyle.splice(player1Index, 1)[0];
        const player2 = this.waitingPlayersFreestyle.splice(findCouplePlayerIndex - 1, 1)[0]; // Retire le joueur de la liste
  
        if (player1 && player2) {
          const roomID = this.createRoomID(player1.client, player2.client);
          const gameRoom = new GameRoom(player1.client, player2.client, player1.userId, player2.userId, this.prisma);
          this.gameRooms.set(roomID, gameRoom);
  
          player1.client.emit('room-id', {roomID : roomID, NumPlayer : 1, playerName1: player1.username, playerName2: player2.username});
          player2.client.emit('room-id', {roomID : roomID, NumPlayer : 2, playerName1: player1.username, playerName2: player2.username});
          
          gameRoom.startGameLoopFreestyle();
        }
      }
    }

    @SubscribeMessage('join-invite')
    handleJoinInvite(@ConnectedSocket() client: Socket, 
        @MessageBody() data: { username: string, userId: number, inviteID: string }) {
          const existingPlayer = this.waitingPlayersInvite.find(player => player.client.id === client.id);
          if (existingPlayer)
              return;
        
          this.waitingPlayersInvite.push({ client, username: data.username, userId: data.userId, inviteID: data.inviteID });
      
          let playersWithSameInviteID = this.waitingPlayersInvite.filter(player => 
            player.inviteID === data.inviteID);

          
          if (playersWithSameInviteID.length >= 2) {
              const player1Index = this.waitingPlayersInvite.indexOf(playersWithSameInviteID[0]);
              const player2Index = this.waitingPlayersInvite.indexOf(playersWithSameInviteID[1]);
                const player1 = this.waitingPlayersInvite.splice(player1Index, 1)[0];
                const player2 = this.waitingPlayersInvite.splice(player2Index - 1, 1)[0];
                if (player1 && player2) {
                    const roomID = this.createRoomID(player1.client, player2.client);
                    const gameRoom = new GameRoom(player1.client, player2.client, player1.userId, player2.userId, this.prisma);
                    this.gameRooms.set(roomID, gameRoom);
        
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
          gameRoom.stopGameLoop();
          this.gameRooms.delete(roomId);
        }
      }
    }
}