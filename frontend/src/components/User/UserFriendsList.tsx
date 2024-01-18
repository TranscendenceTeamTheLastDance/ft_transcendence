import React from 'react';
import avatar_icon from '../assets/avatar.png';

const FriendsList = ({ friends }) => {
	return (
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
	);
}

export default FriendsList;
