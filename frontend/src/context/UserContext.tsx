import React, { createContext, useContext, useState, useEffect } from 'react';
import avatar_icon from '../components/assets/avatar.png';
const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	//TODO: Fetch data from backend
	useEffect(() => {
	const fetchUserData = async () => {
			const userData = {
				firstName: "John",
				lastName: "Doe",
				nickName: "Johnny",
				email: "johndoe@example.com",
				password: "*******",
				twoFactorEnabled: false,
				avatar: avatar_icon
			};
			setUser(userData);
		};

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
		<UserContext.Provider value={{ user, setUser, updateUser }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);