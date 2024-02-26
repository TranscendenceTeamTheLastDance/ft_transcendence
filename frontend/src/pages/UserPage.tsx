import React, { useState, useEffect } from 'react';
import UserInformation from '../components/User/UserInformation.tsx';
import UserGameStats from '../components/User/UserGameStats.tsx';
import FriendsList from '../components/User/UserFriendsList.tsx';
import Particles from '../components/Home/Particles.tsx';
import NotConnected from '../components/NotSignedIn.tsx';
import { useUserContext } from '../context/UserContext';
import { useAuthAxios } from '../context/AuthAxiosContext';
import UpdateModal from '../components/UpdateModal.tsx'
import TwoFactorMod from '../components/LoginSignup/TwoFactorMod.tsx';
import { ModalInputs } from '../components/LoginSignup/TwoFactorMod.tsx';

const User = () => {
	const {user, updateUser, fetchUserData } = useUserContext();
	const [avatarFile, setAvatarFile] = useState(null);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [updateModalMessage, setUpdateModalMessage] = useState('');
	const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);

	const [is2FAEnabled, setIs2FAEnabled] = useState(user ? user.twoFactorEnabled : false);
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | undefined>();
	const [twoFactorSecret, setTwoFactorSecret] = useState<string | undefined>();
	const [error, setError] = useState<string | undefined>();
	const [display2FAModal, setDisplay2FAModal] = useState(false);
	const [display2FADisableModal, setDisplay2FADisableModal] = useState(false);

	const authAxios = useAuthAxios();


	useEffect(() => {
		fetchUserData();
	  }, [fetchUserData]);

	useEffect(() => {
		console.log(showUpdateModal ? "modal is ON" : "modal is OFF");
	  }, [showUpdateModal]);

	const onAvatarFileSelect = (file) => {
		setAvatarFile(file);
	};

	const triggerModal = (success) => {
		setIsUpdateSuccessful(success);
		setShowUpdateModal(true);
		setTimeout(() => {
		  setShowUpdateModal(false);
		}, 2000); // Hide modal after 2 seconds
	  };

	const handleUpdateProfile = async () => {

		// Send new data if updated
		const userData = {
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			hash: user.password,
		  };
		  console.log("frontend: data being passed to back:", userData);
		  try {
			const response = await authAxios.patch('/users', userData, {
			  withCredentials: true,
			});
				console.log('frontend: user information successfully updated!', response.data);
				setUpdateModalMessage('User information successfully updated!');
				triggerModal(true); 
			} catch (error) {
				console.error('frontend: error updating user information:', error);
				setUpdateModalMessage('Error updating user information.');
				triggerModal(false); 
			}
		
		// Check if there's a new avatar to upload
		if (avatarFile) {
			const formData = new FormData();
			formData.append('file', avatarFile);
			console.log("frontend: image being sent :", formData);

			try {
				const response = await authAxios.post('/users/upload-profile-picture', formData, {
					withCredentials: true,
					headers: {
						'Content-Type': undefined,
					},
				});
				console.log('frontend: new profile pic successfully uploaded!', response.data);
				setUpdateModalMessage('new profile pic successfully uploaded!');
				triggerModal(true); 
			} catch (error) {
				console.error('frontend: error uploading a new profile pic:', error);
				setUpdateModalMessage('error uploading a new profile pic!');
				triggerModal(false);
			}
		} else {
			console.log('frontend: no new avatar to upload, no request made to back.');
		}
	};
	
	///2FA
	const manage2FAInit = async () => {
		if (user && is2FAEnabled === false && user.twoFactorEnabled === false) {
		const response = await authAxios.get('/users/2FAInit', {
		withCredentials: true },);
		setQrCodeDataUrl(response.data.qrCode);
		setTwoFactorSecret(response.data.secret);
		setDisplay2FAModal(true);
		//updateUser({ twoFactorEnabled: true });
		}
	else if (user && user.twoFactorEnabled === true) {
		setDisplay2FADisableModal(true);
		//updateUser({ twoFactorEnabled: false });
		}
	};

	const handle2FAToggle = () => {
		try {
			manage2FAInit();
		} catch (error: any) {
			console.error('frontend: error initializing 2FA:', error);
		}
	};

	useEffect(() => {
		console.log(is2FAEnabled ? "2FA ON" : "2FA OFF");
	  }, [is2FAEnabled]);



	const enableTwoFactor = async (data: ModalInputs) => {
		try {
			console.log('frontend: data2FA being pass to back:', data);
			await authAxios.post('/users/2FAEnable', 
				{code: data.validationCode }, 
				{withCredentials: true});
			setDisplay2FAModal(false);
			setError(undefined);
			updateUser({ twoFactorEnabled: true });
			console.log('frontend: user information successfully updated!');
			setIs2FAEnabled(true);
			console.log('is2FAEnabled =====', is2FAEnabled)
		} catch (error: any) {
			console.error('frontend: error enabling 2FA:', error);
			console.log('frontend: error enabling 2FA:', error.response.data.message);
			setError(error.response.data.message);
		}
	};

	const disableTwoFactor = async (data: ModalInputs) => {
		try {
			await authAxios.post('/users/2FADisable', 
				{code: data.validationCode }, 
				{withCredentials: true});
			setDisplay2FADisableModal(false);
			setError(undefined);
			updateUser({ twoFactorEnabled: false });
			setIs2FAEnabled(false);
		} catch (error: any) {
			console.error('frontend: error disabling 2FA:', error);
			setError(error.response.data.message);
		}
	};

	if (!user) return <NotConnected message="User profile not found" />;

	return (
		<div className="flex items-center justify-center flex-col min-h-screen relative pb-8 ">
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
				{/* Conditional rendering of the update status modal */}
			<UpdateModal showUpdateModal={showUpdateModal} updateModalMessage={updateModalMessage} isUpdateSuccessful={isUpdateSuccessful}/>
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
				<FriendsList/>
			</div>
		
			{/* Right Section: Game Stats */}
				{/* Game Stats Box */}
				<UserGameStats />

		</div>
		{display2FAModal ? (
				<TwoFactorMod
					title="TWO-FACTOR AUTHENTICATION"
					qrCodeDataUrl={qrCodeDataUrl}
					secret={twoFactorSecret}
					modalId={'Enable-2fa-modal'}
					closeModal={() => setDisplay2FAModal(false)}
					onSubmit={enableTwoFactor}
					error={error}
				/>
			) : null}
		{display2FADisableModal ? (
				<TwoFactorMod
					title="TWO-FACTOR AUTHENTICATION"
					modalId={'Disable-2fa-modal'}
					closeModal={() => setDisplay2FADisableModal(false)}
					onSubmit={disableTwoFactor}
					error={error}
				/>
			) : null}
	</div>
	)
}

export default User;