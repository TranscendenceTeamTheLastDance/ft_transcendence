import React, { useState, useEffect, useRef } from 'react';
import Particles from '../Home/Particles.tsx';
import ToggleSwitch from './2FAToggle.tsx';
import avatar_icon from '../assets/avatar.png';
import axios from 'axios';

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


const User = () => {
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const [selectedImage, setSelectedImage] = useState('');
	const [userName, setUserName] = useState('');
	const fileInputRef = useRef(avatar_icon);
	const [winPercentage, setWinPercentage] = useState(0);
	
	useEffect(() => {
		const fetchUserData = async () => {
		  try {
				const response = await axios.get('http://localhost:8080/users/me', { withCredentials: true });
				const userData = response.data;
				setSelectedImage(userData.userPictu || avatar_icon ); // Set user's picture
				setUserName(userData.name || 'DEFAULT NAME'); // Set user's name or default
				if (userData.twoFactorAuthEnabled !== undefined) {
					setIs2FAEnabled(userData.twoFactorAuthEnabled);
				  }
		  	} 
			catch (error) {
				console.error('Error fetching user data:', error);
		  	}
		};
	
		fetchUserData();
	  }, []);

	const handleImageChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			let img = e.target.files[0];
			setSelectedImage(URL.createObjectURL(img));
		}
	};

	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleUpdateProfile = async () => {
		if (!fileInputRef.current.files[0]) return; // Check if a file is selected
	  
		const formData = new FormData();
		formData.append('file', fileInputRef.current.files[0]);

		
		try {
		  const response = await axios.post('http://localhost:8080/users/upload-profile-picture', formData, {
			withCredentials: true,
		  });
		  console.log('New profile pic successfully uploaded !', response.data);
		} catch (error) {
			console.error('Error uploading a new profile pic:', error); }
		};
	
	const handle2FAToggle = () => {
		setIs2FAEnabled(currentState => !currentState);
	};

	useEffect(() => {
		console.log('2FA is now:', is2FAEnabled);
	  }, [is2FAEnabled]);


	const userDetails = {
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@example.com',
		password: '********',
	};

	const friends = [
		{ nickname: 'Friend1', online: true },
		{ nickname: 'Friend2', online: false },
		{ nickname: 'Friend3', online: false },
		{ nickname: 'Friend4', online: false },
		{ nickname: 'Friend5', online: true },
		{ nickname: 'Friend6', online: false },
		{ nickname: 'Friend7', online: true },
		{ nickname: 'Friend8', online: false },
		// ... add more friends
	];

	const gameStats = {
		totalGamesPlayed: 30,
		totalWins: 20,
		totalLosses: 10,
		Rank: 1,
		// ... other stats
	  };

	  useEffect(() => {
		if (gameStats.totalGamesPlayed > 0) {
		  const winPct = (gameStats.totalWins / gameStats.totalGamesPlayed) * 100;
		  setWinPercentage(Math.round(winPct));
		}
	  }, [gameStats.totalWins, gameStats.totalGamesPlayed]);


	  return (
		<div className="flex items-center justify-center min-h-screen relative pb-8">
		  <Particles className="absolute inset-0 -z-10" quantity={1000} />
	  
		  <div className="flex"> {/* Main Flex Container */}
	  
			{/* Left Section: User Information and Friends */}
			<div className="flex flex-col mr-8"> {/* Margin right to separate from Game Stats */}
	  
			  {/* User Information Box */}
			  <div className="bg-white w-[600px] mt-[200px] pb-[30px] rounded-lg z-10">
				<h1 className="text-black text-2xl font-bold mx-auto mt-8 text-center">USER INFORMATION</h1>
	  
				<div className="flex mt-8 mx-auto w-3/4">
				  {/* Left side - Avatar and Nickname */}
				  <div className="flex flex-col items-center justify-center w-1/4 bg-gray-100 p-4 rounded-lg mr-4">
					<img src={selectedImage} alt="User Avatar" className="w-20 h-20 object-cover rounded-full cursor-pointer mb-2" onClick={handleImageClick} />
					<p className="text-center font-bold">{userName}</p>
					<input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
				  </div>
	  
				  {/* Right side - User Details */}
				  <div className="w-3/4 bg-gray-100 p-4 rounded-lg">
					{Object.entries(userDetails).map(([key, value]) => (
					  <div key={key} className="flex justify-between mb-2">
						<span className="font-bold capitalize">{key}:</span>
						<span>{value}</span>
					  </div>
					))}
					<div className="flex justify-between">
					  <span className="font-bold">2FA:</span>
					  <ToggleSwitch isOn={is2FAEnabled} handleToggle={handle2FAToggle} />
					</div>
				  </div>
				</div>
	  
				{/* Update Profile Button */}
				<div className="flex justify-center mt-4">
				  <button className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2" onClick={handleUpdateProfile}>
					Update Profile
				  </button>
				</div>
			  </div>
	  
			  {/* Friends Box */}
			  <div className="bg-white w-[600px] mt-8 pb-[30px] rounded-lg z-10">
				<h2 className="text-black text-xl font-bold mx-auto pt-4 text-center">FRIENDS</h2>
				<div className="flex overflow-x-auto py-4 px-4">
				  {friends.map((friend, index) => (
					<div key={index} className="flex flex-col items-center mr-10">
					  <img src={avatar_icon} alt="User Avatar"></img>{/* Replace with friend's image */}
					  <div className="flex items-center mt-2">
						<p className="text-center font-bold mr-2">{friend.nickname}</p>
						<span className={`h-3 w-3 rounded-full ${friend.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
					  </div>
					</div>
				  ))}
				</div>
			  </div>
			</div>
	  
			{/* Right Section: Game Stats */}
			<div className="bg-white w-[600px] pb-[30px] rounded-lg z-10">
			  <h2 className="text-black text-xl font-bold mx-auto pt-4 text-center">GAME STATS</h2>
			  <div className="p-4 flex flex-col items-center">
				<div className="font-bold">Total Games Played</div>
				<div>{gameStats.totalGamesPlayed}</div>
				<div className="mt-4">
				  <CircularProgress winPercentage={winPercentage} />
				</div>
				<div className="mt-2">Wins: {gameStats.totalWins} / {gameStats.totalGamesPlayed}</div>
			  </div>
			</div>
		  </div>
		</div>
	);

}

export default User;