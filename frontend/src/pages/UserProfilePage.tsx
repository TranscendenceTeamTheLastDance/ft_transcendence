import React, { useState, useEffect } from 'react';
import Particles from '../components/Home/Particles.tsx';
import NotConnected from '../components/NotSignedIn.tsx';
import { useAuthAxios } from '../context/AuthAxiosContext';
import { useParams } from 'react-router-dom';
import avatar_icon from '../components/assets/avatar.png';
import { useUserContext } from '../context/UserContext';
import NotFound from '../components/NotFound.tsx';
import OtherMatchHistory from '../components/User/OtherUserMatchHistory.tsx';

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
	const { user } = useUserContext();
	const { username } = useParams();
	
	const [userProfile, setUserProfile] = useState<userProfileDto | null>(null);
	const [showMatchHistory, setShowMatchHistory] = useState(false);
	const [loading, setLoading] = useState(true);
	const authAxios = useAuthAxios();
	
	useEffect(() => {
		const fetchUserData = async () => {
		  try {
			setLoading(true);
			const userResponse = await authAxios.get(`/users/profile/${username}`);
			setUserProfile(userResponse.data);
			setLoading(false);
		  } catch (error) {
			console.error("Error fetching user data:", error);
			setLoading(false);
		  }
		};
	
		fetchUserData();
	  }, [username, authAxios]);

	  if (loading) return <div>Loading...</div>;
	  if (!user) return <NotConnected message="User profile not found" />;
	  if (!userProfile) return <NotFound />;
	
	return (
		<div className="flex items-center justify-center flex-col min-h-screen relative pb-8 " style={{ minHeight: `calc(100vh - 210px)` }}>
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
			
			<div className="container mx-auto flex-row justify-center" style={{ flexDirection: 'row' }}>
			<div className="flex flex-col justify-center items-center space-y-4"> 
				<div className="bg-white max-w-md mt-8 pb-8 rounded-lg shadow-md">
					<div className="flex justify-center items-center py-4 px-4">
						<div className="flex flex-col items-center">
							<img
								src={userProfile.profilePic ? userProfile.profilePic : avatar_icon}
								alt="User Avatar"
								className="w-24 h-24 rounded-full"
							/>
							<h2 className="text-black text-xl font-bold mt-4">
								{userProfile.username}
							</h2>
							<p className="text-gray-500">{userProfile.email}</p>
						</div>
					</div>
				</div>
				<div className="bg-white max-w-md mt-8 pb-8 rounded-lg shadow-md">
					<h2 className="text-black text-xl font-bold mt-4 text-center">
						GAME STATS
					</h2>
					<div className="p-4 flex flex-col items-center">
					<div className="font-bold mt-4">Wins: {userProfile.gamesWon?.length || 0}</div>
					<div className="font-bold mt-4">Losses: {userProfile.gamesLose?.length || 0}</div>
						<div className="font-bold mt-4">
							Games Played: {userProfile.gamesPlayed}
						</div>
					</div>
				</div>
				<div className="w-full flex justify-center">
						<button className="mt-4 bg-red-500 text-red py-2 px-4 rounded" onClick={() => setShowMatchHistory(!showMatchHistory)}>click for match history..</button>
					</div>				
				{showMatchHistory && <OtherMatchHistory userId={userProfile.id} />}
			</div>
		</div>
	</div>
	)
}

export default UserProfile;