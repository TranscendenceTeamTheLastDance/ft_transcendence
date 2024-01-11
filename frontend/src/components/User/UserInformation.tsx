import React from 'react';
import ToggleSwitch from './2FAToggle.tsx';

const UserInformation = ({ selectedImage, handleImageClick, userName, userDetails, is2FAEnabled, handle2FAToggle, handleUpdateProfile, fileInputRef, handleImageChange }) => {
	return (
		<div className="bg-white w-[600px] pb-[30px] rounded-lg z-10">
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
						<span>{typeof value === 'string' ? value : 'Default value'}</span>
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
	);
}

export default UserInformation;
