import { Socket } from 'socket.io';
import { GameService } from './game.service';

export class GameRoom {
  private player1: Socket;
  private player2: Socket;
  private gameService: GameService;
  private gameLoopInterval: NodeJS.Timeout | null = null;
  private updateInterval = 1000 / 50;

  constructor(player1: Socket, player2: Socket) {
    this.player1 = player1;
    this.player2 = player2;
    this.gameService = new GameService();
    this.gameService.resetGameState();
    this.startGameLoop();
  }

  private startGameLoop(): void {
    this.gameLoopInterval = setInterval(() => {
      this.gameService.updateGameState();
      const gameState1 = this.gameService.broadcastGameState(1);
      const gameState2 = this.gameService.broadcastGameState(2);

      this.player1.emit('game-state', gameState1);
      this.player2.emit('game-state', gameState2);
    }, this.updateInterval);
  }

  stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  // a modif car pas claire avec les chiffre mais peut etre plus rapide qu'avec les socket
  updatePaddlePosition( y: number, x: number) {
    if (x === 0) {
      // Mettre à jour la position de la raquette pour le joueur 1
      this.gameService.updateUserPaddle(y); // 1 pour joueur 1
    } else {
      // Mettre à jour la position de la raquette pour le joueur 2
      this.gameService.updateUserPaddle2(y); // 2 pour joueur 2
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