import React, { useState, useEffect, useRef } from 'react';
import UserInformation from '../components/User/UserInformation.tsx';
import UserGameStats from '../components/User/UserGameStats.tsx';
import FriendsList from '../components/User/UserFriendsList.tsx';
import avatar_icon from '../components/assets/avatar.png';
import Particles from '../components/Home/Particles.tsx';
import axios from 'axios';

const User = () => {
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const [selectedImage, setSelectedImage] = useState('');
	const [userName, setUserName] = useState('');
	const fileInputRef = useRef(avatar_icon);
	const [winPercentage, setWinPercentage] = useState(0);
	const [lossPercentage, setLossPercentage] = useState(0);
	
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

	  useEffect(() => {
		if (gameStats.totalGamesPlayed > 0) {
		  const lossPct = (gameStats.totalLosses / gameStats.totalGamesPlayed) * 100;
		  setLossPercentage(Math.round(lossPct));
		}
	  }, [gameStats.totalLosses, gameStats.totalGamesPlayed]);


	  return (
		<div className="flex items-center justify-center min-h-screen relative pb-8">
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
			<div className="flex justify-start"> 
	  
			{/* Left Section: User Information and Friends */}
			<div className="flex flex-col mr-8"> {/* Margin right to separate from Game Stats */}
				{/* User Information Box */}
				<UserInformation 
					selectedImage={selectedImage} 
					handleImageClick={handleImageClick}
					userName={userName}
					userDetails={userDetails}
					is2FAEnabled={is2FAEnabled}
					handle2FAToggle={handle2FAToggle}
					handleUpdateProfile={handleUpdateProfile} 
					fileInputRef={fileInputRef}
					handleImageChange={handleImageChange}
					/>
	  
				{/* Friends Box */}
				<FriendsList friends={friends}/>
			</div>
	  
			{/* Right Section: Game Stats */}
				{/* Game Stats Box */}
				<UserGameStats 
					gameStats={gameStats}
					winPercentage={winPercentage}
					lossPercentage={lossPercentage} />

		</div>
	</div>
	);
}

export default User;