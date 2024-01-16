import React, { useState, useEffect, useRef } from 'react';
import UserInformation from '../components/User/UserInformation.tsx';
import UserGameStats from '../components/User/UserGameStats.tsx';
import FriendsList from '../components/User/UserFriendsList.tsx';
import avatar_icon from '../components/assets/avatar.png';
import Particles from '../components/Home/Particles.tsx';
import NotConnected from '../components/NotSignedIn.tsx';
import axios from 'axios';
import { useUserContext } from '../context/UserContext';

const User = () => {
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const [selectedImage, setSelectedImage] = useState('');
	const fileInputRef = useRef(avatar_icon);
	const {user, updateUser } = useUserContext();

	//THE USE EFFECTS
	useEffect(() => {
		const fetchUserData = async () => {
		  try {
				const response = await axios.get('http://localhost:8080/users/me', { withCredentials: true });
				const userData = response.data;
				setSelectedImage(userData.userPictu || avatar_icon ); // Set user's picture
				setUserName(userData.name || ''); // Set user's name or default
				if (userData.twoFactorAuthEnabled !== undefined) {
					console.log('2FA is now:', is2FAEnabled);
					setIs2FAEnabled(userData.twoFactorAuthEnabled);
				  }
		  	} 
			catch (error) {
				console.error('Error fetching user data:', error);
		  	}
		};
	
		fetchUserData();
	  }, [is2FAEnabled]);

	// ALL THE HANDLERS
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
					selectedImage={selectedImage} 
					handleImageClick={handleImageClick}
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
					gameStats={gameStats}/>

		</div>
	</div>
	)
	: (
		<NotConnected message="You need to log in to access your settings" />
	);
}

export default User;