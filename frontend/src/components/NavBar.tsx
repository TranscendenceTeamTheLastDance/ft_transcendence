import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Particles from './Home/Particles';

const navigation = [
	{ name: "HOME", href: "/home" },
	{ name: "CHAT", href: "/chat" },
	{ name: "PLAY", href: "/play" },
	{ name: "USER", href: "/user" },
  ];

  const NavBar = () => {
	// Utilisez useLocation pour obtenir la route actuelle
	const location = useLocation();
  
	// Vérifiez si la route actuelle est "/home"
	const isHome = location.pathname === "/home";
	const isLogin = location.pathname === "/";
  
	// Ne rien rendre si la route est "/home"
	if (isHome || isLogin) {
	  return null;
	}
  
	return (
	  <>
		<nav className="my-6">
		  <Particles className="absolute inset-0 -z-10" quantity={1000} />
		  <ul className="flex items-top justify-center gap-8">
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
	  </>
	);
  };

export default NavBar;