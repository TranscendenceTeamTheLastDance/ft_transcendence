import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import avatar_icon from '../components/assets/avatar.png';
import {Cookies} from 'react-cookie';
import axios from 'axios';
import { useAuthAxios } from './AuthAxiosContext';
const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const authAxios = useAuthAxios();
	
	const fetchUserData = useCallback(async () => {
		// Access the cookie using the key
		const cookies = new Cookies();
		const access_token = cookies.get(process.env.REACT_APP_JWT_ACCESS_TOKEN_COOKIE);
		if (access_token) 
		{
			try {
			const response = await authAxios.get('/users/me', { withCredentials: true });
			const userData = response.data;
			if (userData) {
				setUser({
				...userData,
				avatar: userData.profilePic || avatar_icon,
				});
			}
			} catch (error: any) {
				if (error.response && error.response.status === 401) {
					try
					{
						await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/refresh`, { withCredentials: true });
						const response = await authAxios.get('/users/me', { withCredentials: true });
						const userData = response.data;
						setUser({
							...userData,
							avatar: userData.profilePic || avatar_icon,
							});
					}
					catch (error: any) {
						setUser(null);
						console.error('frontend: error fetching refresh user data: unautorized or not existent (yet):', error);
					}
				}
				else {
				setUser(null);
				console.error('frontend: error fetching user data: unautorized or not existent (yet):', error);
				}
			}
		}
	  }, [authAxios]);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	// Updates user info, you can pass anything to it
	const updateUser = (updatedFields) => {
		setUser((currentUser) => {
			const updatedUser = {
				...currentUser,
				...updatedFields,
			};

			return updatedUser;
		});
	};

	return (
		<UserContext.Provider value={{ user, setUser, updateUser, fetchUserData}}>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);