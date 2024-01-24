import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginSignup from './components/LoginSignup/LoginSignup';
import Signwith42 from './components/LoginSignup/Signwith42';
import TwoFactorForm from './components/LoginSignup/TwoFactorForm';
import Home from './components/Home/Home';
import User from './pages/UserPage';
import { UserProvider } from './context/UserContext';
import Chat from './pages/ChatPage';
import { useUserContext } from './context/UserContext';


function App() {
  return (
	<UserProvider>
		<Routes>
			<Route path="/" element={<LoginSignup />} />
			<Route path="/signwith42" element={<Signwith42 />} />
			<Route path="/home" element={<Home />} />
			<Route path="/user" element={<User />} />
			<Route path="/2fa" element={<TwoFactorForm />} />
			<Route path="/chat" element={<Chat />} />
		</Routes>
	</UserProvider>
  );
}

export default App;
