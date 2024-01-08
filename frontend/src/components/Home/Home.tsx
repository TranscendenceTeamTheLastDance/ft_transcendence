import React from 'react';
import { Link } from 'react-router-dom';
import Particles from './Particles';

const navigation = [
  { name: "CHAT", href: "/conversations" },
  { name: "PLAY", href: "/play" },
  { name: "USER", href: "/user" },
];

const Home = () => {
  return (
	<div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-600/20 to-black">
	  <nav className="my-16 animate-fade-in">
		<ul className="flex items-center justify-center gap-4">
		  {navigation.map((item) => (
			<li key={item.href}>
			  <Link
				to={item.href}
				className="text-2xl duration-500 text-zinc-500 hover:text-zinc-300"
			  >
				{item.name}
			  </Link>
			</li>
		  ))}
		</ul>
	  </nav>
	  <Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={1000} />
	  <h1 className="z-10 text-4xl text-white duration-1000 cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
		welcome
	  </h1>
	</div>
  );
};

export default Home;
