import React from 'react';
import { motion } from 'framer-motion';

const ButtonGame = ( {text, onClick}) => {
return (
    <>
        <motion.button
			className="text-4xl duration-500 text-zinc-500 hover:text-zinc-300 mx-6"
			onClick={onClick} whileHover={{ scale: 1.2 }}
			whileTap={{ scale: 0.8 }}>
			{text}
	    </motion.button>
    </>
    );
};

export default ButtonGame;