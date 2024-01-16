import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import avatar_icon from '../components/assets/avatar.png';
const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const fetchUserData = async () => {
		try {
		  const response = await axios.get('http://localhost:8080/users/me', { withCredentials: true });
		  const userData = response.data;
		  if (userData) {
			setUser({
			  ...userData,
			  avatar: userData.profilePic || avatar_icon,
			});
		  }
		} catch (error) {
		  setUser(null);
			// console.error('Error fetching user data:', error);
		}
	  };

	useEffect(() => {
		fetchUserData();
	}, []);

	// For debug purposes, prints latest user info 
	useEffect(() => {
		console.log("Current user info:", user);
	}, [user]);

	// Updates user info, you can pass anything to it
	const updateUser = (updatedFields) => {
		setUser((currentUser) => {
			const updatedUser = {
				...currentUser,
				...updatedFields,
			};
			console.log("User info successfully updated !");
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