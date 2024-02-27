import React, {useEffect, useState} from 'react';
import axios from 'axios';
import avatar_icon from '../assets/avatar.png';

interface User {
    id: number;
    username: string; 
	profilePic?: string;
}


const FriendsList = () => {
	const [friends, setFriends] = useState<User[]>([]);

	useEffect (() => {
		const fetchFriends = async () => {
		try {
			const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/users/friends`, {
				withCredentials: true,
			});
			console.log('response:', response.data)
			setFriends(response.data);
		} catch (error) {
			console.error('Failed to fetch friends:', error);
		}
	}
	fetchFriends();
	} , []);

	return (
		<div className="bg-white w-[600px] mt-8 pb-[30px] rounded-lg z-10">
		  <h2 className="text-black text-2xl font-bold mx-auto mt-8 text-center">FRIENDS</h2>
		  <div className="flex justify-center items-center overflow-x-auto py-4 px-4" style={{ minHeight: '100px' }}>
			{friends.length > 0 ? (
			  <div className="flex flex-nowrap" style={{ gap: '20px' }}>
				{friends.map((friend, index) => (
				  <div key={index} className="flex flex-col items-center" style={{ minWidth: '100px' }}>
					<img src={friend.profilePic || avatar_icon} alt="User Avatar" style={{ width: '70px', height: '70px', borderRadius: '20px' }} />
					<p className="text-center font-bold mt-2">{friend.username}</p>
				  </div>
				))}
			  </div>
			) : (
			  <p className="text-center text-gray-600">Your friends list is looking a little lonely... Start adding friends now!</p>
			)}
		  </div>
		</div>
	  );
}	  

export default FriendsList;
