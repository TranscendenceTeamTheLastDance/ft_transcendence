import React, { useEffect, useRef, useState } from 'react';

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

const PongGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Initialisation du jeu
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // ... Initialisation de vos objets ici (ball, user, com, etc.)

        const gameLoop = () => {
            if (!isPaused) {
                // Mettre à jour et rendre le jeu
            }
        };

        const loop = setInterval(gameLoop, 1000 / 50);

        // Gestionnaire d'événements
        const mouseMoveHandler = (event: MouseEvent) => {
            // Logique de déplacement de la raquette
        };

        canvas.addEventListener('mousemove', mouseMoveHandler);

        // Nettoyage
        return () => {
            clearInterval(loop);
            canvas.removeEventListener('mousemove', mouseMoveHandler);
        };
    }, [isPaused]);

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    return (
        <div>
            <canvas ref={canvasRef} width="800" height="400" />
            <button onClick={togglePause}>{isPaused ? "Resume" : "Pause"}</button>
        </div>
    );
};

export default PongGame;
