import React from 'react';
import { motion } from 'framer-motion';

const EditButton = ( {text, onClick}) => {
return (
    <>
        <motion.button
			className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2"
			onClick={onClick} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.5 }}>
			{text}
	    </motion.button>
    </>
    );
};

export default EditButton;