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
import MatchHistory from '../components/User/UserMatchHistory.tsx';

const User = () => {
	const {user, updateUser, fetchUserData } = useUserContext();
	const [avatarFile, setAvatarFile] = useState(null);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [updateModalMessage, setUpdateModalMessage] = useState('');
	const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
	const [showMatchHistory, setShowMatchHistory] = useState(false);
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
	  }, [showUpdateModal]);

	const onAvatarFileSelect = (file) => {
		setAvatarFile(file);
	};

	const triggerModal = (success) => {
		setIsUpdateSuccessful(success);
		setShowUpdateModal(true);
		setTimeout(() => {
		  setShowUpdateModal(false);
		}, 2000);
	  };

	const handleUpdateProfile = async () => {
		const userData = {
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			hash: user.password,
		  };
		  try {
			await authAxios.patch('/users', userData, {
			  withCredentials: true,
			});
				setUpdateModalMessage('User information successfully updated!');
				triggerModal(true); 
			} catch (error) {
				console.error('frontend: error updating user information:', error);
				setUpdateModalMessage('Error updating user information.');
				triggerModal(false); 
			}
		if (avatarFile) {
			const formData = new FormData();
			formData.append('file', avatarFile);

			try {
				await authAxios.post('/users/upload-profile-picture', formData, {
					withCredentials: true,
					headers: {
						'Content-Type': undefined,
					},
				});
				setUpdateModalMessage('new profile pic successfully uploaded!');
				triggerModal(true); 
			} catch (error) {
				console.error('frontend: error uploading a new profile pic:', error);
				setUpdateModalMessage('error uploading a new profile pic!');
				triggerModal(false);
			}
		} else {
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
		}
	else if (user && user.twoFactorEnabled === true) {
		setDisplay2FADisableModal(true);
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
	  }, [is2FAEnabled]);



	const enableTwoFactor = async (data: ModalInputs) => {
		try {
			await authAxios.post('/users/2FAEnable', 
				{code: data.validationCode }, 
				{withCredentials: true});
			setDisplay2FAModal(false);
			setError(undefined);
			updateUser({ twoFactorEnabled: true });
			setIs2FAEnabled(true);
		} catch (error: any) {
			console.error('frontend: error enabling 2FA:', error);
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
		<div className="flex items-center justify-center flex-col min-h-screen relative pb-8 " style={{ minHeight: `calc(100vh - 210px)` }}>
			<Particles className="absolute inset-0 -z-10" quantity={1000} />
			<UpdateModal showUpdateModal={showUpdateModal} updateModalMessage={updateModalMessage} isUpdateSuccessful={isUpdateSuccessful}/>
	
			<div className="w-full max-w-4xl mx-auto px-4">
				<div className="flex flex-col justify-center items-center space-y-4"> 
					<div className="flex flex-col md:flex-row justify-center items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full"> 
						<div className="flex flex-col flex-1">
							<UserInformation 
								handle2FAToggle={handle2FAToggle}
								handleUpdateProfile={handleUpdateProfile}
								onAvatarFileSelect={onAvatarFileSelect}
							/>
							<FriendsList/>
						</div>
	
						<div className="flex flex-col flex-1">
							<UserGameStats />
						</div>
					</div>
					<div className="w-full flex justify-center">
						<button className="mt-4 bg-red-500 text-white py-2 px-4 rounded" onClick={() => setShowMatchHistory(!showMatchHistory)}>click for match history..</button>
					</div>
				</div>
				
				{showMatchHistory && <MatchHistory />}
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