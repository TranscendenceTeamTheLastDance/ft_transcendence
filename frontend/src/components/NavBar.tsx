import React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthAxios } from '../context/AuthAxiosContext.tsx';
import { useUserContext } from '../context/UserContext.tsx';
import { motion } from 'framer-motion';
import Particles from './Home/Particles';
import RedButton from './RedButton.tsx';
import NotConnected from './NotSignedIn.tsx';

const navigation = [
	{ name: "HOME", href: "/home" },
	{ name: "CHAT", href: "/chat" },
	{ name: "PLAY", href: "/play" },
	{ name: "USER", href: "/user" },
  ];

  const NavBar = () => {

    const navigate = useNavigate();
	const authAxios = useAuthAxios();
	const [error, setError] = useState(false);
	const { setUser } = useUserContext();

	// Utilisez useLocation pour obtenir la route actuelle
	const location = useLocation();
  
	// Vérifiez si la route actuelle est "/home"
	const isHome = location.pathname === "/home";
	const isSignIn = location.pathname === "/signwith42";
	const isLogin = location.pathname === "/";
  
	// Ne rien rendre si la route est "/home"
	if (isHome || isLogin || isSignIn) {
	  return null;
	}
  
	const handleLogOut = async () => {
		try {
			await authAxios.get('/auth/logout', {
				withCredentials: true,
			});
			setUser(null);
			navigate('/');
		} catch (error: any) {
			setError(true);
		}
	};


	if (error) {
		return (
			<NotConnected message="You need to log in to access your settings" />
		); }
	else {
		return (
		  <>
			<nav className="my-6">
			  <Particles className="absolute inset-0 -z-10" quantity={1000} />
			  <ul className="flex items-top justify-center gap-8">
				{navigation.map((item) => (
				  <motion.li key={item.href} 
				  	whileHover={{ scale: 1.2 }}
				  	whileTap={{ scale: 0.8 }}>
					<Link
					  to={item.href}
					  className={`text-4xl duration-500 hover:text-zinc-300 ${
						location.pathname === item.href ? 'text-zinc-300' : 'text-zinc-500'
					  }`}
					>
					  {item.name}
					</Link>
				  </motion.li>

				))}
				<RedButton
					  text="⏻"
					  onclick={handleLogOut}
				/>
			  </ul>
				
			</nav>
		  </>
		);
	}
  };

export default NavBar;