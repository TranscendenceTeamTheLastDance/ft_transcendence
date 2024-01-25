import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import avatar_icon from '../components/assets/avatar.png';
import {Cookies} from 'react-cookie';
import { User } from '../types';
const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const fetchUserData = useCallback(async () => {
		// Access the cookie using the key
		const cookies = new Cookies();
		const access_token = cookies.get(process.env.REACT_APP_JWT_ACCESS_TOKEN_COOKIE);
		console.log(access_token ? ("frontend: user cookie defined.") : ("frontend: user cookie undefined, for now..."));
		if (access_token) 
		{
			try {
			const response = await axios.get('http://localhost:8080/users/me', { withCredentials: true });
			const userData = response.data;
			if (userData) {
				setUser({
				...userData,
				avatar: userData.profilePic || avatar_icon,
				});
			}
			} catch (error: any) {
				if (error.response && error.response.status === 401) {
				setUser(null);
				console.error('frontend: error fetching user data: unautorized or not existent (yet):', error);
				}
			}
		}
	  }, []);

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	// For debug purposes, prints latest user info 
	useEffect(() => {
		if (user) {
			console.log("frontend: current user info:", user);
		  } else {
			console.log("frontend: no user info available, for now...");
		  }		  
	}, [user]);

	// Updates user info, you can pass anything to it
	const updateUser = (updatedFields) => {
		setUser((currentUser) => {
			const updatedUser = {
				...currentUser,
				...updatedFields,
			};
			console.log("frontend: user info successfully updated !");

			return updatedUser;
		});
	};

	return (
		<UserContext.Provider value={{ user, setUser, updateUser, fetchUserData,}}>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);