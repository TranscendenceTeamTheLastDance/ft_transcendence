const CircularProgress = ({ winPercentage }) => {
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const greenStrokeLength = (winPercentage / 100) * circumference; // The length of the green part
	const greyStrokeLength = circumference - greenStrokeLength; // The remaining part should be grey

	return (
		<svg width={100} height={100}>
			<circle
				stroke="grey"
				fill="transparent"
				strokeWidth="10"
				strokeDasharray={circumference}
				r={radius}
				cx={50}
				cy={50}
			/>
			<circle
				stroke="green"
				fill="transparent"
				strokeWidth="10"
				strokeDasharray={circumference}
				style={{ strokeDashoffset: greyStrokeLength }}
				r={radius}
				cx={50}
				cy={50}
			/>
			<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
				{winPercentage}%
			</text>
		</svg>
	);
};

export default CircularProgress;