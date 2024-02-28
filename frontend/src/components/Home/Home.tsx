import React, {useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Particles from './Particles';
import Leaderboard from './Leaderboard';
import { useUserContext } from '../../context/UserContext';
import { useAuthAxios } from '../../context/AuthAxiosContext.tsx';
import NotConnected from '../NotSignedIn';
import { motion } from 'framer-motion';
import Alien from '../assets/alien.png';

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
		try {
			await authAxios.get('/auth/logout', {
				withCredentials: true,
			});
			setUser(null); 
			navigate('/');
		} catch (error: any) {
		}
	};
	
	return user ? (
	<div className="flex flex-col items-center justify-center w-screen h-screen overflow-auto bg-gradient-to-tl from-black via-zinc-600/20 to-black">
	  <motion.div animate={{
      	scale: [1, 1.5, 1.5, 1, 1, 1.5, 1.5, 1, 1],
      	x: [0, 180, 0, -180, 0, 180, 0, -180, 0],
      }} transition={{ duration: 3, times: [0, 0.5, 1] }}>
	  <img src={Alien} alt="alien" className="w-90 h-90"/>
	  </motion.div>
	  <nav className="my-0 animate-fade-in">
	  <ul className="flex items-top justify-center gap-8">
			{navigation.map((item) => (
			  <motion.li key={item.href} 
			  	whileHover={{ scale: 1.2 }}
			  	whileTap={{ scale: 0.5 }}>
				<Link
				  to={item.href}
				  className="text-5xl duration-500 text-zinc-500 hover:text-zinc-300"
				>
				  {item.name}
				</Link>
			  </motion.li>

			))}
			<motion.button onClick={handleLogOut} className="text-5xl bg-red-500 text-red font-bold py-1 rounded"
				whileHover={{ scale: 1.5 }}
				whileTap={{ scale: 0.5 }}>
            	⏻
        	</motion.button>
		  </ul>
	  </nav>
	  <Particles className="absolute inset-0 -z-10" quantity={1000} />
	  <div className="mt-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 max-w-lg w-full mx-auto">
          <Leaderboard />
    	</div>
	</div>
  ) : (
	<NotConnected message="You need to log in to access your settings" />
  );
};

export default Home;
