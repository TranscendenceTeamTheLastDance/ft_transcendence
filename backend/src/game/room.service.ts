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
      const gameState = this.gameService.broadcastGameState();

      this.player1.emit('game-state', gameState);
      this.player2.emit('game-state', gameState);
    }, this.updateInterval);
  }

  public stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  updatePaddlePosition(playerId: string, y: number) {
    if (this.player1.id === playerId) {
      // Mettre à jour la position de la raquette pour le joueur 1
      this.gameService.updateUserPaddle(y); // 1 pour joueur 1
    } else if (this.player2.id === playerId) {
      // Mettre à jour la position de la raquette pour le joueur 2
      this.gameService.updateUserPaddle2(y); // 2 pour joueur 2
    }
  }

  // ... autres méthodes utiles, comme la gestion des déconnexions, etc. ...
}