import React from 'react';
import { useState, useEffect } from 'react';
import CircularProgress from '../CircularProgress.tsx';
import { useUserContext } from '../../context/UserContext.tsx';

const UserGameStats = () => {

	const [winPercentage, setWinPercentage] = useState(0);
	const [lossPercentage, setLossPercentage] = useState(0);
	const { user } = useUserContext();
	
	const gameStats = {
		gamesPlayed:user.gamesPlayed? user.gamesPlayed : 0, //@TODO amend this to win + losses
		totalWins:user.gamesWon? user.gamesWon.length : 0,
		totalLosses:user.gamesLose? user.gamesLose.length : 0,
		totalPoints:user.totalPoints? user.totalPoints : 0,
		rank:1,
	};	

	useEffect(() => {
		if (gameStats.gamesPlayed > 0) {
		  const winPct = (gameStats.totalWins / gameStats.gamesPlayed) * 100;
		  const lossPct = (gameStats.totalLosses / gameStats.gamesPlayed) * 100;
		  setLossPercentage(Math.round(lossPct));
		  setWinPercentage(Math.round(winPct));
		}
	}, [gameStats.totalWins, gameStats.totalLosses, gameStats.gamesPlayed]);

	return (
	<div className="bg-white rounded-lg z-10">
		<h2 className="text-black text-2xl font-bold mx-auto mt-8 text-center">STATS</h2>
			<div className="p-4 flex flex-col items-center">
			<div className="font-bold mt-4">Wins</div>
			<CircularProgress greenPercentage={winPercentage} />
			<div className="font-bold mt-4">Losses</div>
			<CircularProgress greenPercentage={lossPercentage} />
			<div className="font-bold mt-16">Games Played</div>
			<div>{gameStats.gamesPlayed}</div>
			<div className="font-bold mt-4">Total Points</div>
			<div>{gameStats.totalPoints}</div>
			<div className="font-bold mt-8"></div>
		</div>
	</div>
	);
}

export default UserGameStats;