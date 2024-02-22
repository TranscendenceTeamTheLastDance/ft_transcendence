import React from 'react';

const ButtonGame = ( {text, onClick}) => {
return (
    <>
        <button
			className="text-4xl duration-500 text-zinc-500 hover:text-zinc-300"
			onClick={onClick}>
			{text}
	    </button>
    </>
    );
};

export default ButtonGame;