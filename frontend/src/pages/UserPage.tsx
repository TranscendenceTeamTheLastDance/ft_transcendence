import React, { useState, useEffect } from 'react';
import UserInformation from '../components/User/UserInformation.tsx';
import UserGameStats from '../components/User/UserGameStats.tsx';
import FriendsList from '../components/User/UserFriendsList.tsx';
import Particles from '../components/Home/Particles.tsx';
import NotConnected from '../components/NotSignedIn.tsx';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';

const User = () => {
	const {user, updateUser, fetchUserData } = useUserContext();
	const [avatarFile, setAvatarFile] = useState(null);
	
	useEffect(() => {
		fetchUserData();
	  }, []);

	// ALL THE HANDLERS
	const onAvatarFileSelect = (file) => {
		setAvatarFile(file);
	};

	const handleUpdateProfile = async () => {
		// Check if there's a new avatar to upload
		if (avatarFile) {
			const formData = new FormData();
			formData.append('file', avatarFile);
			console.log("Image being sent :", formData);

			try {
				const response = await axios.post('http://localhost:8080/users/upload-profile-picture', formData, {
					withCredentials: true,
				});
				console.log('New profile pic successfully uploaded!', response.data);
			} catch (error) {
				console.error('Error uploading a new profile pic:', error);
			}
		} else {
			console.log('No new avatar to upload');
		}
	};
	
	
	const handle2FAToggle = () => {
		const new2FAStatus = !user.twoFactorEnabled;
		updateUser({ twoFactorEnabled: new2FAStatus });
	};


	//@@@TODO: Fetch data from backend 
	const friends = [
		{ nickname: 'Friend1', online: true },
		{ nickname: 'Friend2', online: false },
		{ nickname: 'Friend3', online: false },
		{ nickname: 'Friend4', online: false },
		{ nickname: 'Friend5', online: true },
		{ nickname: 'Friend6', online: false },
		{ nickname: 'Friend7', online: true },
		{ nickname: 'Friend8', online: false },
	];

	const gameStats = {
		totalGamesPlayed: 30,
		totalWins: 20,
		totalLosses: 10,
		Rank: 1,
	  };


	  return user ? (
		<div className="flex items-center justify-center min-h-screen relative pb-8">
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
			<div className="flex justify-start"> 
	  
			{/* Left Section: User Information and Friends */}
			<div className="flex flex-col mr-8"> {/* Margin right to separate from Game Stats */}
				{/* User Information Box */}
				<UserInformation 
					handle2FAToggle={handle2FAToggle}
					handleUpdateProfile={handleUpdateProfile}
					onAvatarFileSelect={onAvatarFileSelect}
					/>
	  
				{/* Friends Box */}
				<FriendsList friends={friends}/>
			</div>
	  
			{/* Right Section: Game Stats */}
				{/* Game Stats Box */}
				<UserGameStats 
					gameStats={gameStats}/>

		</div>
	</div>
	)
	: (
		<NotConnected message="You need to log in to access your settings" />
	);
}

export default User;