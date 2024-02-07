import React, { useEffect, useRef, useState } from 'react';
import CanvasGame from './Game';
import io, { Socket } from 'socket.io-client';
import './Game.css';

interface InfoGame {
    roomID: string;
    NumPalyer: number;
    playerName1: string;
    playerName2: string;
    socket: Socket;
}

const PongGame: React.FC = () => {
    const socketRef = useRef(io('http://localhost:8080/game'));
    const [infoGame, setInfoGame] = useState<InfoGame | null>(null);
    const [playerLeftGame, setPlayerLeftGame] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [winningStatus, setWinningStatus] = useState("Win");
    const [scorePlayer1, setScorePlayer1] = useState(0);
    const [scorePlayer2, setScorePlayer2] = useState(0);

    useEffect(() => {
        const socket = socketRef?.current;
        if (!socket)
            return;

        let Name = "default";

        socket.emit('join', { data: Name });

        socket.on('room-id', (id) => {
            console.log("Numplayer: ", id.NumPlayer);
            setInfoGame({
                roomID: id.roomID,
                NumPalyer: id.NumPlayer,
                playerName1: id.playerName1,
                playerName2: id.playerName2,
                socket: socket,
            });
        });

        socket.on('player-left-game', () => {
            setPlayerLeftGame(true);
        });

        socket.on('game-finish', (data) => {
            setGameFinished(true);
            setScorePlayer1(data.score.scoreU1);
            setScorePlayer2(data.score.scoreU2);
            if (infoGame?.NumPalyer === 1)
                if (data.score.scoreU1 > data.score.scoreU2)
                    setWinningStatus("Win");
                else
                    setWinningStatus("Lose");
            else
                if (data.score.scoreU2 > data.score.scoreU1)
                    setWinningStatus("Win");
                else
                    setWinningStatus("Lose");
        });

        // Clean up
        return () => {
            socket.emit('client-disconnect');
            socket.off('room-id');
            socket.off('player-left-game');
        };
    }, []);

    // console.log(infoGame);

    return (
        <div className='game-container'>
            {infoGame ? (
                playerLeftGame ? (
                    <p>The other player has left the game.</p>
                ) : (
                    gameFinished ? (
                        <div>
                            <p>Finish</p>
                            <p>{winningStatus}</p>
                            <p>player1 {scorePlayer1}      player2 {scorePlayer2}</p>
                        </div>
                    ) : (
                        <CanvasGame infoGame={infoGame} />
                    )
                )
            ) : (
                <p>Waiting for another player...</p>
            )}
        </div>
    );
};

export default PongGame;
