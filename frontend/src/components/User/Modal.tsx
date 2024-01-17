import React from 'react';

const Modal = ({ show, message }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-lg text-center font-semibold">{message}</p>
            </div>
        </div>
    );
};

export default Modal;
