import React, {useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from './Particles';
import Leaderboard from './Leaderboard';
import { useUserContext } from '../../context/UserContext';
import { useAuthAxios } from '../../context/AuthAxiosContext.tsx';
import NotConnected from '../NotSignedIn';
import { motion } from 'framer-motion';
import RedButton from '../RedButton';

const navigation = [
  { name: "CHAT", href: "/chat" },
  { name: "PLAY", href: "/play" },
  { name: "USER", href: "/user" },
];

const Home = () => {
	const {user, fetchUserData, setUser } = useUserContext();
	const navigate = useNavigate();
	const authAxios = useAuthAxios();

	useEffect(() => {
		fetchUserData();
	  }, [fetchUserData]);

	const handleLogOut = async () => {
		console.log('frontend: logging out...');
		try {
			const response = await authAxios.get('/auth/logout', {
				withCredentials: true,
			});
			console.log(response.data);
			setUser(null); 
			console.log('user info cleared.');
			navigate('/');
		} catch (error: any) {
			console.log(error.response.data.message);
		}
	};
	
	return user ? (
	<div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
	  <nav className="my-4 animate-fade-in">
	  <ul className="flex items-top justify-center gap-8">
			{navigation.map((item) => (
			  <motion.li key={item.href} 
			  	whileHover={{ scale: 1.2 }}
			  	whileTap={{ scale: 0.5 }}>
				<Link
				  to={item.href}
				  className="text-4xl duration-500 text-zinc-500 hover:text-zinc-300"
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
	  <Particles className="absolute inset-0 -z-10" quantity={1000} />
	  {/* Leaderboard container */}
	  	<div className="mt-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 max-w-lg w-full">
          <Leaderboard />
    	</div>
	</div>
  ) : (
	<NotConnected message="You need to log in to access your settings" />
  );
};

export default Home;
