import { Socket } from 'socket.io';

class Paddle {
  id : Socket;
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  color: string;

  constructor(canvasHeight: number, isUser: boolean, canvasWidth: number) {
      this.width = 10;
      this.height = 100;
      this.score = 0;
      this.color = "WHITE";
      this.y = (canvasHeight - this.height) / 2;

      if (isUser) {
          this.x = 0;
      } else {
          this.x = canvasWidth - this.width;
      }
  }
}

class Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number) {
      this.radius = 10;
      this.velocityX = 5;
      this.velocityY = 5;
      this.speed = 7;
      this.color = "WHITE";
      this.x = canvasWidth / 2;
      this.y = canvasHeight / 2;
  }
}

class Score {
  scoreU1 : number;
  scoreU2 : number;
  constructor () {
    this.scoreU1 = 0; 
    this.scoreU2 = 0;
  }
}

class GameState {
  padU1 : Paddle;
  padU2 : Paddle;
  ball : Ball;
  canvasHeight: number;
  canvasWidth: number;
  score : Score;
  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.padU1 = new Paddle(canvasHeight, true, canvasWidth); // true for user
    this.padU2 = new Paddle(canvasHeight, false, canvasWidth); // false for computer or second user

    this.ball = new Ball(canvasWidth, canvasHeight);

    this.score = new Score();
  }
}

class GameStateSend {
  ball: { x: number; y: number };
  score: { scoreU1: number; scoreU2: number };
  padU2: { y: number };
  constructor(ball: Ball, score: Score, padU2: Paddle) {
    this.ball = { x: ball.x, y: ball.y };
    this.score = { scoreU1: score.scoreU1, scoreU2: score.scoreU2 };
    this.padU2 = { y: padU2.y };
  }
};

export class GameService {
    private gameState = new GameState(800, 400);

    resetGameState() {
      this.gameState = new GameState(800, 400);
    }

    getGameState() {
      return this.gameState;
    }

    updateGameState(): void {
      let ball = this.gameState.ball;

      // Mise à jour de la position de la balle
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;

      // Collision avec les murs supérieur et inférieur
      if (ball.y - ball.radius < 1 || ball.y + ball.radius > this.gameState.canvasHeight - 1) {
          ball.velocityY = -ball.velocityY;
      }

      // Gestion des scores et réinitialisation de la balle
      if (ball.x - ball.radius < 0) {
          this.gameState.score.scoreU2++;
          this.resetBall(this.gameState);
      } else if (ball.x + ball.radius > this.gameState.canvasWidth) {
          this.gameState.score.scoreU1++;
          this.resetBall(this.gameState);
      }

      // Détection de la collision avec les raquettes
      let player = (ball.x + ball.radius < this.gameState.canvasWidth / 2) ? this.gameState.padU1 : this.gameState.padU2;
      if (this.collision(ball, player)) {
          this.handleBallPaddleCollision(ball, player, this.gameState.canvasWidth);
      }
    }

  collision(b: Ball, p: Paddle): boolean {
      let bTop = b.y - b.radius;
      let bBottom = b.y + b.radius;
      let bLeft = b.x - b.radius;
      let bRight = b.x + b.radius;

      let pTop = p.y;
      let pBottom = p.y + p.height;
      let pLeft = p.x;
      let pRight = p.x + p.width;

      return pLeft < bRight && pTop < bBottom && pRight > bLeft && pBottom > bTop;
  }

  handleBallPaddleCollision(ball: Ball, paddle: Paddle, canvasWidth: number): void {
      let collidePoint = (ball.y - (paddle.y + paddle.height / 2));
      collidePoint = collidePoint / (paddle.height / 2);
      let angleRad = (Math.PI / 4) * collidePoint;
      let direction = ball.x + ball.radius < canvasWidth / 2 ? 1 : -1;
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      ball.speed += 0.1;
  }

  resetBall(gameState: GameState): void {
      let ball = gameState.ball;
      ball.x = gameState.canvasWidth / 2;
      ball.y = gameState.canvasHeight / 2;
      ball.velocityX = 5 * (Math.random() > 0.5 ? 1 : -1);
      ball.velocityY = 5 * (Math.random() > 0.5 ? 1 : -1);
      ball.speed = 7;
  }

  updateUserPaddle(y: number): void {
    this.gameState.padU1.y = y;
  }

  updateUserPaddle2(y: number): void {
    this.gameState.padU2.y = y;
  }


  //le proble est la !!!!1
  broadcastGameState(Nplayer: number) : GameStateSend {
    if (Nplayer === 1)
      return (new GameStateSend(this.gameState.ball, this.gameState.score, this.gameState.padU2));
    else
      return (new GameStateSend(this.gameState.ball, this.gameState.score, this.gameState.padU1));
  }
}