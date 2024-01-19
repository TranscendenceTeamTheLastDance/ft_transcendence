import React from 'react';

const EditButton = ( {text, onClick}) => {
return (
    <>
        <button
			className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2"
			onClick={onClick}>
			{text}
	    </button>
    </>
    );
};

export default EditButton;