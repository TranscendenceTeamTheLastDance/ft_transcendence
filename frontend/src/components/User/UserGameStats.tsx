import React from 'react';
import CircularProgress from './CircularProgress.tsx';

const UserGameStats = ({ gameStats, winPercentage, lossPercentage }) => {
	return (
	<div className="bg-white rounded-lg z-10">
		<h2 className="text-black text-xl font-bold mx-auto pt-4 text-center">GAME STATS</h2>
			<div className="p-4 flex flex-col items-center">
			<div className="font-bold mt-4">Wins</div>
			<CircularProgress winPercentage={winPercentage} />
			<div className="font-bold mt-4">Losses</div>
			<CircularProgress winPercentage={lossPercentage} />
			<div className="font-bold mt-4">Total Games Played</div>
			<div>{gameStats.totalGamesPlayed}</div>
			<div className="font-bold mt-4">Ranking</div>
			<div>{gameStats.Rank} / 1</div>
		</div>
	</div>
	);
}

export default UserGameStats;