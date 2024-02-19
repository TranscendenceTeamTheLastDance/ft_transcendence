import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import Particles from './Particles';
import Leaderboard from './Leaderboard';
import { useUserContext } from '../../context/UserContext';
import NotConnected from '../NotSignedIn';

const navigation = [
  { name: "CHAT", href: "/chat" },
  { name: "PLAY", href: "/play" },
  { name: "USER", href: "/user" },
];

const Home = () => {
	const {user, fetchUserData } = useUserContext();

	useEffect(() => {
		fetchUserData();
	  }, [fetchUserData]);
	
	return user ? (
	<div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
	  <nav className="my-16 animate-fade-in">
		<ul className="flex items-center justify-center gap-4">
		  {navigation.map((item) => (
			<li key={item.href}>
			  <Link
				to={item.href}
				className="text-4xl duration-500 text-zinc-500 hover:text-zinc-300"
			  >
				{item.name}
			  </Link>
			</li>
		  ))}
		</ul>
	  </nav>
	  <Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={1000} />
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
