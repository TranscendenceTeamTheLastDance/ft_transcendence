import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface Paddle  {
    top: number;
    bottom: number;
    left: number;
    right: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    score: number;
};

interface Ball  {
    top: number;
    bottom: number;
    left: number;
    right: number;
    x: number;
    y: number;
    radius: number;
    velocityX: number;
    velocityY: number;
    speed: number;
    color: string;
};


function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawNet(ctx: CanvasRenderingContext2D, net: { x: number, y: number, width: number, height: number, color: string }, canvasHeight: number): void {
    for (let i = 0; i <= canvasHeight; i += 15) {
        drawRect(ctx, net.x, net.y + i, net.width, net.height, net.color);
    }
}

function drawArc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

function resetBall(ball : Ball, canvas : HTMLCanvasElement): void {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}


const PongGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef(io('http://localhost:8080/game'));
    socketRef.current.emit('start');

// Initialisation du jeu
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const socket = socketRef?.current;
        if (!canvas || !ctx || !socket) return;
        
        let animationFrameId: number;
            
        // Initialisation de la raquette de l'utilisateur
        const user: Paddle = {
            x: 0,
            y: (canvas.height - 100) / 2,
            width: 10,
            height: 100,
            score: 0,
            color: "WHITE",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };

        const com: Paddle = {
            x: canvas.width - 10,
            y: (canvas.height - 100) / 2,
            width: 10,
            height: 100,
            score: 0,
            color: "WHITE",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };

        const ball: Ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 10,
            velocityX: 5,
            velocityY: 5,
            speed: 7,
            color: "WHITE",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
        
        // Initialisation du filet
        const net = {
            x: (canvas.width - 2) / 2,
            y: 0,
            width: 2,
            height: 10,
            color: "WHITE"
        };

        socket.on('game-state', (gameState) => {
            com.y = gameState.padU2.y;
            ball.x = gameState.ball.x;
            ball.y = gameState.ball.y;
            user.score = gameState.score.scoreU1;
            com.score = gameState.score.scoreU2;
            // Mettez à jour les scores ici si nécessaire
        });
        
        // creation des formes

        const gameLoop = () => {
            drawRect(ctx, 0, 0, canvas.width, canvas.height, "#000");
            drawRect(ctx, user.x, user.y, user.width, user.height, user.color);
            drawRect(ctx, com.x, com.y, com.width, com.height, com.color);
            drawArc(ctx, ball.x, ball.y, ball.radius, ball.color);
            drawNet(ctx, net, canvas.height);
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        // Gestionnaire d'événements
        const mouseMoveHandler = (event: MouseEvent) => {
            // Obtenir la position relative de la souris dans le canvas
            const rect = canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;

            // Mettre à jour la position Y de la raquette
            // On s'assure que la raquette ne sort pas du canvas en bas
            user.y = Math.min(mouseY - user.height / 2, canvas.height - user.height);

            // Empêcher la raquette de sortir du canvas en haut
            if (user.y < 0) {
                user.y = 0;
            }
            // console.log("pute");
            socket.emit('user-paddle-move', { y: user.y });
        };

        canvas.addEventListener('mousemove', mouseMoveHandler);

        return () => {
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            cancelAnimationFrame(animationFrameId);
            socket.off('game-state');
        };
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} width="800" height="400" />
        </div>
    );
};

export default PongGame;
