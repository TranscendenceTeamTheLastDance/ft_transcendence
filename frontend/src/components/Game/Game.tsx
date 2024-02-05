import React, { useEffect, useRef, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import io from 'socket.io-client';
import './Game.css';

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
    ctx.font = "20px fantasy";
    ctx.fillText(text, x, y);
}

const PongGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef(io('http://localhost:8080/game'));
    const waitingForPlayerRef = useRef(true); // Utiliser useRef pour gérer l'attente
    const roomIdRef = useRef<string | null>(null);
    const playerLeftGame = useRef(false);
    
    

  

    const [showOptions, setShowOptions] = useState(true); // Nouvel état pour gérer l'affichage des options
    const { user } = useUserContext();

    // ... useEffect et autres fonctions ...

    const startGame = () => {
        // Fonction pour démarrer le jeu
        setShowOptions(true);
    }
    
    // Initialisation du jeu
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const socket = socketRef?.current;
        if (!canvas || !ctx || !socket) 
        return;
    
    let animationFrameId: number;
    let finish: boolean = false;
    let mainPlayer: boolean = true;//ca va etre utile
    
    socket.emit('join');
    
    // Initialisation de la raquette de l'utilisateur
    const userGame: Paddle = {
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
            userGame.score = gameState.score.scoreU1;
            com.score = gameState.score.scoreU2;
            if ((userGame.score || com.score ) >= 10) {
                socket.emit('finish');
                finish = true;
            }        
        });

        // creation des formes

        socket.on('room-id', (id) => {
            roomIdRef.current = id.roomID; // Stocker l'ID de la room
            waitingForPlayerRef.current = false; // Commencer le jeu
            if (id.Nplayer === 2) {
                const tmp = com.x;
                com.x = userGame.x;
                userGame.x = tmp;
                mainPlayer = false;
            }
        });

        socket.on('player-left-game',() => {
            playerLeftGame.current = true;
        });

        const gameLoop = () => {
            if (waitingForPlayerRef.current) {
                drawText(ctx, "Waiting for another player...", canvas.width / 2 - 100, canvas.height / 2);
                console.log("CONSOLE LOG DU USER", user.username);
            }
            else if (finish) {
                drawRect(ctx, 0, 0, canvas.width, canvas.height, "#000");
                drawText(ctx, `Player 2: ${com.score}`, canvas.width - 150, 30);
                drawText(ctx, `Player 1: ${userGame.score}`, 10, 30);
                drawText(ctx, "Game finished", canvas.width / 2 - 50, canvas.height / 2);

            }
            else if (playerLeftGame.current) {
                drawRect(ctx, 0, 0, canvas.width, canvas.height, "#000");
                drawText(ctx, `Player 2: ${com.score}`, canvas.width - 150, 30);
                drawText(ctx, `Player 1: ${userGame.score}`, 10, 30);
                drawText(ctx, "the other player has left the game", canvas.width / 2 - 100, canvas.height / 2);
            }
            else {
                drawRect(ctx, 0, 0, canvas.width, canvas.height, "#000");
                drawRect(ctx, userGame.x, userGame.y, userGame.width, userGame.height, userGame.color);
                drawRect(ctx, com.x, com.y, com.width, com.height, com.color);
                drawArc(ctx, ball.x, ball.y, ball.radius, ball.color);
                drawNet(ctx, net, canvas.height);
                drawText(ctx, `Player 1: ${userGame.score}`, 10, 30);
                drawText(ctx, `Player 2: ${com.score}`, canvas.width - 150, 30);
            }
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
            userGame.y = Math.min(mouseY - userGame.height / 2, canvas.height - userGame.height);

            // Empêcher la raquette de sortir du canvas en haut
            if (userGame.y < 0) {
                userGame.y = 0;
            }
            socket.emit('userGame-paddle-move', { y: userGame.y , roomId: roomIdRef.current, x: userGame.x});
        };

        canvas.addEventListener('mousemove', mouseMoveHandler);

        return () => {
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            cancelAnimationFrame(animationFrameId);
            socket.emit('client-disconnect');
            socket.off('game-state');
        };
    }, []);

    return (
        <div className='game-container'>
            <canvas ref={canvasRef} width="800" height="400" className='canvas'/>
        </div>
    );
};

export default PongGame;