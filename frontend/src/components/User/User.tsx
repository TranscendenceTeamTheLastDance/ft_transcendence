import React from 'react';
import Particles from '../Home/Particles.tsx';
import avatar_icon from '../assets/avatar.png'


const User = () => {
	return (
	  <div className="flex items-center justify-center min-h-screen">
		<div className="flex flex-col bg-white w-[600px] mx-auto mt-[200px] pb-[30px] rounded-lg">
		  <Particles className="absolute inset-0 -z-10" quantity={1000} />
		
			{/* Header */}
			<h1 className="text-black text-2xl font-bold mx-auto mt-8">USER INFORMATION</h1>

			{/* Avatar sutff */}
			<div className="flex items-center mx-auto ml-5 mt-8">
				<img src={avatar_icon} alt="User Avatar" className="w-20 h-20 object-cover mx-auto ml-12 rounded-full" />			
				<p className="text-lg font-bold ml-8">John Doe</p>
			</div>

			{/* Additional details */}
			<div className="bg-gray-200 p-4 rounded-lg mx-auto mt-8  w-3/4">
			<p className="text-lg font-bold">RANK : </p>
			<p className="text-lg">WINS & LOSSES </p>
			</div>

			{/* Amend button */}
			<button className="bg-gray-500 text-white py-2 px-4 rounded-full text-lg font-bold my-4 mx-auto"
			style={{ width: '220px', height: '59px' }}>Update Profile</button>
		</div>
	  </div>
	);
  }

export default User;
