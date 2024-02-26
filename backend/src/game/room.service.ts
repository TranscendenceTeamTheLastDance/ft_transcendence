import { Socket } from 'socket.io';
import { PrismaService } from 'nestjs-prisma';
import { GameService, GameStateSend } from './game.service';
import { ChannelRole, ChannelType, Prisma, User, Game } from '@prisma/client';

export class GameRoom {
  private player1: Socket;
  private idPlayer1: number;
  private idPlayer2: number;
  private player2: Socket;
  private gameService: GameService;
  private gameLoopInterval: NodeJS.Timeout | null = null;
  private updateInterval = 1000 / 50;
  private prisma: PrismaService;

  constructor(
    player1: Socket,
    player2: Socket,
    idPlayer1: number,
    idPlayer2: number,
    prisma: PrismaService,
  ) {
    this.player1 = player1;
    this.idPlayer1 = idPlayer1;
    this.idPlayer2 = idPlayer2;
    this.player2 = player2;
    this.gameService = new GameService();
    this.gameService.resetGameState();
    this.prisma = prisma;
  }

  getIdPlayer1(): number {
    return this.idPlayer1;
  }

  getIdPlayer2(): number {
    return this.idPlayer2;
  }


  async createGame(
    IDwinner: number,
    IDloser: number,
    scoreWinner: number,
    scoreLoser: number,
  ): Promise<void> {
    await this.prisma.game.create({
      data: {
        winnerScore: scoreWinner,
        loserScore: scoreLoser,
        winner: {
          connect: { id: IDwinner },
        },
        loser: {
          connect: { id: IDloser },
        },
      },
    });
  }

  async sendGameHistory(
    gameState: GameStateSend,
    player1ID: number,
    player2ID: number,
  ): Promise<void> {
    // if player 1 wins
    if (gameState.score.scoreU1 > gameState.score.scoreU2) {
      this.createGame(
        player1ID,
        player2ID,
        gameState.score.scoreU1,
        gameState.score.scoreU2,
      );
      this.incrementGamesPlayed(player1ID, player2ID, player1ID);
      //else if player 2 wins
    } else {
      this.createGame(
        player2ID,
        player1ID,
        gameState.score.scoreU2,
        gameState.score.scoreU1,
      );
      this.incrementGamesPlayed(player1ID, player2ID, player2ID);
    }
  }

  // at the end of a game payed increment nb of games played for both players
  // remove this eventually to make it loss + wins directly
  async incrementGamesPlayed(
    player1ID: number,
    player2ID: number,
    winnerId: number,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: player1ID },
      data: {
        gamesPlayed: { increment: 1 },
      },
    });

    await this.prisma.user.update({
      where: { id: player2ID },
      data: {
        gamesPlayed: { increment: 1 },
      },
    });

    await this.prisma.user.update({
      where: { id: winnerId },
      data: {
        totalPoints: { increment: 3 },
      },
    });
  }

  async updateStatusUsers(
    player1ID: number,
    player2ID: number,
    Status: number,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: player1ID },
      data: {
        status: Status,
      },
    });

    await this.prisma.user.update({
      where: { id: player2ID },
      data: {
        status: Status,
      },
    });
  }

  startGameLoop(): void {
    // mettre à jour le status du joueur "en jeu"
    const player1ID: number = this.idPlayer1;
    const player2ID: number = this.idPlayer2;
    this.updateStatusUsers(player1ID, player2ID, 2);
    this.gameLoopInterval = setInterval(() => {
      this.gameService.updateGameState(false);
      const gameState1 = this.gameService.broadcastGameState(1);
      const gameState2 = this.gameService.broadcastGameState(2);
      if (gameState1.score.scoreU1 >= 11 || gameState1.score.scoreU2 >= 11) {
        this.sendGameHistory(gameState1, player1ID, player2ID);
        this.player1.emit('game-finish', gameState1);
        this.player2.emit('game-finish', gameState2);
        this.updateStatusUsers(player1ID, player2ID, 1);
        clearInterval(this.gameLoopInterval);
      } else {
        this.player1.emit('game-state', gameState1);
        this.player2.emit('game-state', gameState2);
      }
    }, this.updateInterval);
  }

  startGameLoopFreestyle(): void {
    const player1ID: number = this.idPlayer1;
    const player2ID: number = this.idPlayer2;
    this.updateStatusUsers(player1ID, player2ID, 2);
    this.gameLoopInterval = setInterval(() => {
      this.gameService.updateGameState(true);
      const gameState1 = this.gameService.broadcastGameState(1);
      const gameState2 = this.gameService.broadcastGameState(2);

      if (gameState1.score.scoreU1 >= 11 || gameState1.score.scoreU2 >= 11) {
        this.sendGameHistory(gameState1, player1ID, player2ID);
        this.player1.emit('game-finish', gameState1);
        this.player2.emit('game-finish', gameState2);
        this.updateStatusUsers(player1ID, player2ID, 1);
        clearInterval(this.gameLoopInterval);
      } else {
        this.player1.emit('game-state', gameState1);
        this.player2.emit('game-state', gameState2);
      }
    }, this.updateInterval);
  }

  stopGameLoop(): void {
    // this.updateStatusUsers(player1ID, player2ID, 1);
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  updatePaddlePosition(y: number, x: number) {
    if (x === 0) {
      this.gameService.updateUserPaddle(y);
    } else {
      this.gameService.updateUserPaddle2(y);
    }
  }

  notifyPlayerOfDisconnect(client: Socket) {
    if (this.player1 === client) {
      this.player2.emit('player-left-game');
    } else if (this.player2 === client) {
      this.player1.emit('player-left-game');
    }
  }

  includesPlayer(client: Socket): boolean {
    if (client === this.player1 || client === this.player2) return true;
    return false;
  }

  deletePlayerInRoom(client: Socket) {
    if (client === this.player1) this.player1 = null;
    if (client === this.player2) this.player2 = null;
  }
}
