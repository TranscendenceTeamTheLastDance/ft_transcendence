import React from 'react';
import Avatar from './UserAvatar';
import ToggleSwitch from './2FAToggle.tsx';
import { useUserContext } from '../../context/UserContext';

const UserInformation = ({handle2FAToggle, handleUpdateProfile, onAvatarFileSelect}) => {
	const { user } = useUserContext();

	return (
		<div className="bg-white w-[600px] pb-[30px] rounded-lg z-10">
				<h1 className="text-black text-2xl font-bold mx-auto mt-8 text-center">USER INFORMATION</h1>
				<div className="flex mt-8 mx-auto w-3/4">
				
					{/* Left side - Avatar and Nickname */}
					<div className="flex flex-col items-center justify-center w-1/4 bg-gray-100 p-4 rounded-lg mr-4">
					<Avatar onFileSelect={onAvatarFileSelect} />
					</div>
				
					{/* Right side - User Details*/}
					<div className="w-3/4 bg-gray-100 p-4 rounded-lg">
						{user && (
							<>
								<div className="flex justify-between mb-2">
									<span className="font-bold">Username:</span>
									<span>{user.username}</span>
								</div>
								<div className="flex justify-between mb-2">
									<span className="font-bold">First Name:</span>
									<span>{user.firstName}</span>
								</div>
								<div className="flex justify-between mb-2">
									<span className="font-bold">Last Name:</span>
									<span>{user.lastName}</span>
								</div>
								<div className="flex justify-between mb-2">
									<span className="font-bold">Email:</span>
									<span>{user.email}</span>
								</div>
								<div className="flex justify-between mb-2">
									<span className="font-bold">Password:</span>
									<span>*******</span>
								</div>
							</>
						)}
						<div className="flex justify-between">
							<span className="font-bold">2FA:</span>
							<ToggleSwitch isOn={user.twoFactorEnabled} handleToggle={handle2FAToggle} />
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
