import React, {useState} from 'react';
import Modal from './Modal.tsx';

const Button = ({ buttonText, modalText, clickFunction }) => {
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        triggerModal();
        clickFunction(); // Call the provided clickFunction
    };

	const triggerModal = () => {
        setShowModal(true);

        setTimeout(() => {
            setShowModal(false);
        }, 2000); // Hide modal after 2 seconds
    };
    return (
        <>
        <button className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2"
            onClick={handleClick}>
            {buttonText}
        </button>
        <Modal show={showModal} message={modalText} />
        </>
    );
};

export default Button;