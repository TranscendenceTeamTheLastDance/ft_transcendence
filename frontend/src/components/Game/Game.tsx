import React, { useEffect, useRef} from 'react';
import { Socket } from 'socket.io-client';
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

interface InfoGame {
    roomID : string;
    NumPalyer: number;
    playerName1: string;
    playerName2: string;
    socket: Socket;
}

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

const CanvasGame: React.FC<{ infoGame: InfoGame }>= ({ infoGame }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const roomIdRef = useRef(infoGame.roomID);
    const socket = infoGame.socket;
    const numPlayer = infoGame.NumPalyer;
    const playerName1 = infoGame.playerName1;
    const playerName2 = infoGame.playerName2;

    
    // Initialisation du jeu
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        // const resizeCanvas = () => {
        //     const rect = canvas.getBoundingClientRect();
        //     canvas.width = rect.width;
        //     canvas.height = rect.height;
        //     // Redessiner le contenu du canvas
        //     // Ici, vous devrez réécrire le code pour redessiner le jeu en fonction de la nouvelle taille du canvas
        //     const player1InitialY = (canvas.height - 100) / 2;
        //     const player2InitialY = (canvas.height - 100) / 2;

        //     player1 = {
        //         ...player1,
        //         y: player1InitialY,
        //         height: 100
        //     };

        //     player2 = {
        //         ...player2,
        //         x: canvas.width - 10,
        //         y: player2InitialY,
        //         height: 100
        //     };

        //     ball = {
        //         ...ball,
        //         x: canvas.width / 2,
        //         y: canvas.height / 2
        //     };

        //     net = {
        //         x: (canvas.width - 2) / 2,
        //         y: 0,
        //         width: 2,
        //         height: 10,
        //         color: "WHITE"
        //     };
        // };
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx ) 
            return;
    
    let animationFrameId: number;
    // console.log("canvas.width:", canvas.width);
    // console.log("canvas.height:", canvas.height);

    let player1: Paddle = {
        x: 0,
        y: (canvas.height - 100) / 2,
        width: 10,
        height: canvas.height / 4,
        score: 0,
        color: "WHITE",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };
    
    let player2: Paddle = {
        x: canvas.width - 10,
        y: (canvas.height - 100) / 2,
        width: 10,
        height: canvas.height / 4,
        score: 0,
        color: "WHITE",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };

    
    let ball: Ball = {
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
        let net = {
            x: (canvas.width - 2) / 2,
            y: 0,
            width: 2,
            height: 10,
            color: "WHITE"
        };

        socket.on('game-state', (gameState) => {
            if (numPlayer === 1)
                player2.y = (gameState.padU2.y / 400) * canvas.height;
            else
            {
                player1.y = (gameState.padU2.y / 400) * canvas.height;
            }
            ball.x = (gameState.ball.x / 800 )* canvas.width;
            ball.y = (gameState.ball.y / 400) * canvas.height;
            player1.score = gameState.score.scoreU1;
            player2.score = gameState.score.scoreU2;      
        });



        const gameLoop = () => {
            drawRect(ctx, 0, 0, canvas.width, canvas.height, "#000");
            drawRect(ctx, player1.x, player1.y, player1.width, player1.height, player1.color);
            drawRect(ctx, player2.x, player2.y, player2.width, player2.height, player2.color);
            drawArc(ctx, ball.x, ball.y, ball.radius, ball.color);
            drawNet(ctx, net, canvas.height);
            drawText(ctx, `${playerName1}: ${player1.score}`, 10, 30);
            drawText(ctx, `${playerName2}: ${player2.score}`, canvas.width - 150, 30);
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();
    
        // Gestionnaire d'événements
        const mouseMoveHandler = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;
        
            if (numPlayer === 1) {
                player1.y = mouseY;
                if (player1.y < 0) {
                    player1.y = 0;
                } else if (player1.y + player1.height > canvas.height) { // Assurez-vous que le paddle ne dépasse pas le bas du canvas
                    player1.y = canvas.height - player1.height;
                }
                socket.emit('user-paddle-move', { y: player1.y / canvas.height, roomId: roomIdRef.current, x: player1.x });
            } else {
                player2.y = mouseY;
                if (player2.y < 0) {
                    player2.y = 0;
                } else if (player2.y + player2.height > canvas.height) { // Assurez-vous que le paddle ne dépasse pas le bas du canvas
                    player2.y = canvas.height - player2.height;
                }
                socket.emit('user-paddle-move', { y: player2.y / canvas.height, roomId: roomIdRef.current, x: player2.x });
            }
        };

        // window.addEventListener('resize', resizeCanvas);

        // const mouseMoveHandler = (event: MouseEvent) => {
        //     const rect = canvas.getBoundingClientRect();
        //     const mouseY = event.clientY - rect.top;
        //     // console.log("rect.height:", height);
        //     // console.log("event.clientY:", event.clientY);
        //     console.log("mouseY:", mouseY);
        //     // console.log("canvas.height:", canvas.height);
        //     if (numPlayer === 1) {
        //         // player1.y = Math.min(mouseY - player1.height / 2, canvas.height - player1.height);
        //         // player1.y = mouseY - player1.height / 2;
        //         player1.y = mouseY;
        //         if (player1.y < 0) {
        //             player1.y = 0;
        //         }
        //         else if (player1.y > rect.height) {
        //             player1.y = canvas.height;
        //         }
        //         socket.emit('user-paddle-move', { y: player1.y / canvas.height, roomId: roomIdRef.current, x: player1.x});
        //     }
        //     else {
        //         // player2.y = Math.min(mouseY - player2.height / 2, canvas.height - player2.height);
        //         // player2.y = mouseY - player2.height / 2;
        //         player2.y = mouseY;
        //         if (player2.y < 0) {
        //             player2.y = 0;
        //         }
        //         else if (player2.y > rect.height) {
        //             player2.y = rect.height;
        //         }
        //         socket.emit('user-paddle-move', { y: player2.y / canvas.height, roomId: roomIdRef.current, x: player2.x});
        //     }
        // };

        document.addEventListener('mousemove', mouseMoveHandler);

        return () => {
            // window.removeEventListener('resize', resizeCanvas);
            document.removeEventListener('mousemove', mouseMoveHandler);
            cancelAnimationFrame(animationFrameId);
            socket.off('game-state');
            // socket.emit('client-disconnect');
        };
    }, [socket, numPlayer, playerName1, playerName2]);

    return (
        <div>
            <canvas ref={canvasRef} height="400" width="800"  className='canvas'/>
        </div>
    );
};

export default CanvasGame;
