import React from "react";
import { motion } from "framer-motion";

const RedButton = ({ text, onclick }) => {
    return (
        <motion.button onClick={onclick} className="text-3xl bg-red-500 text-red font-bold py-1 rounded"
				whileHover={{ scale: 1.2 }}
				whileTap={{ scale: 0.8 }}>
            {text}
        </motion.button>
    );
};

export default RedButton;