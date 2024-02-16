import { Socket } from 'socket.io';
import { PrismaService } from 'nestjs-prisma';
import { GameService } from './game.service';
import { ChannelRole, ChannelType, Prisma, User, Game } from '@prisma/client';


export class GameRoom {
    private player1: Socket;
    private player2: Socket;
    private gameService: GameService;
    private gameLoopInterval: NodeJS.Timeout | null = null;
    private updateInterval = 1000 / 50;
    private prisma: PrismaService;
  
    constructor(player1: Socket, player2: Socket, prisma: PrismaService) {
      this.player1 = player1;
      this.player2 = player2;
      this.gameService = new GameService();
      this.gameService.resetGameState();
      this.prisma = prisma; // Assign prisma here
    }

  async createGame(IDwinner: number, IDloser: number, scoreWinner: number,  scoreLoser: number): Promise<void> {
    await this.prisma.game.create({
      data: {
        winnerScore: scoreWinner,
        loserScore: scoreLoser,
        loserId: IDloser,
        winnerId: IDwinner
      },
    });
  }


  startGameLoop(): void {
    console.log("startloop");
    this.gameLoopInterval = setInterval(() => {
      this.gameService.updateGameState();
      const gameState1 = this.gameService.broadcastGameState(1);
      const gameState2 = this.gameService.broadcastGameState(2);

      if (gameState1.score.scoreU1 >= 11 || gameState1.score.scoreU2 >= 11) {
        this.player1.emit('game-finish', gameState1);
        this.player2.emit('game-finish', gameState2);
        // a faire envoie les donne de fin de partie a prisma pour le game history
        this.createGame(1, 2, gameState1.score.scoreU1, gameState1.score.scoreU2);
        clearInterval(this.gameLoopInterval);
      }
      else {
        this.player1.emit('game-state', gameState1);
        this.player2.emit('game-state', gameState2);
      }
    }, this.updateInterval);
  }

  stopGameLoop(): void {
    console.log("endloop");
    if (this.gameLoopInterval) {81
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  updatePaddlePosition( y: number, x: number) {
    if (x === 0) {
      this.gameService.updateUserPaddle(y);
    } else {
      this.gameService.updateUserPaddle2(y);
    }
  }

  notifyPlayerOfDisconnect(client : Socket) {
    if (this.player1 === client) {
      this.player2.emit('player-left-game');
    }else if (this.player2 === client) {
      this.player1.emit('player-left-game');
    }
  }

  includesPlayer(client : Socket) : boolean {
    if (client === this.player1 || client === this.player2)
      return (true);
    return (false);
  }

  deletePlayerInRoom(client : Socket) {
    if (client === this.player1)
      this.player1 = null;
    if (client === this.player2)
      this.player2 = null;
  }
}