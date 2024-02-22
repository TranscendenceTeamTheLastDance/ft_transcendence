import React, { useState, useEffect } from 'react';
import Particles from '../components/Home/Particles.tsx';
import NotConnected from '../components/NotSignedIn.tsx';
import { useAuthAxios } from '../context/AuthAxiosContext';
import { useParams } from 'react-router-dom';
import avatar_icon from '../components/assets/avatar.png';

interface userProfileDto {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	profilePic: string;
	status: string;
	gamesPlayed: number;
	gamesWon: number[];
	gamesLose: number[];

  }

function UserProfile() {
	const { username } = useParams();
	console.log(username);

	const [user, setUser] = useState<userProfileDto | null>(null);
	const authAxios = useAuthAxios();
	
	useEffect(() => {
		const fetchUserData = async () => {
		  try {
			console.log("Fetching user data for:", username);
			const userResponse = await authAxios.get(`/users/profile/${username}`);
			console.log("User data received:", userResponse.data);
			setUser(userResponse.data);
		  } catch (error) {
			console.error("Error fetching user data:", error);
		  }
		};
	
		fetchUserData();
	  }, [username, authAxios]);
	
	return user ? (
		<div className="flex items-center justify-center min-h-screen relative pb-8">
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
			<div className="container mx-auto flex-row justify-center" style={{ flexDirection: 'row' }}>
				<div className="bg-white max-w-md mt-8 pb-8 rounded-lg shadow-md">
					<div className="flex justify-center items-center py-4 px-4">
						<div className="flex flex-col items-center">
							<img
								src={user.profilePic ? user.profilePic : avatar_icon}
								alt="User Avatar"
								className="w-24 h-24 rounded-full"
							/>
							<h2 className="text-black text-xl font-bold mt-4">
								{user.username}
							</h2>
							<p className="text-gray-500">{user.email}</p>
						</div>
					</div>
				</div>
				<div className="bg-white max-w-md mt-8 pb-8 rounded-lg shadow-md">
					<h2 className="text-black text-xl font-bold mt-4 text-center">
						GAME STATS
					</h2>
					<div className="p-4 flex flex-col items-center">
						<div className="font-bold mt-4">Wins: {user.gamesWon}</div>
						<div className="font-bold mt-4">Losses: {user.gamesLose}</div>
						<div className="font-bold mt-4">
							Games Played: {user.gamesPlayed}
						</div>
						{/* Add more game stats as needed */}
					</div>
				</div>
			</div>
		</div>
	) : (
		<NotConnected message="You need to log in to access your settings" />
	);
}

export default UserProfile;