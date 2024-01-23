import React from 'react';

const UpdateModal = ({showUpdateModal, isUpdateSuccessful, updateModalMessage }) => {

    return (
    showUpdateModal && (
            <div className={`fixed inset-0 z-50 flex justify-center rounded-lg font-bold items-center border-gray-500 ${isUpdateSuccessful ? 'text-green-500' : 'text-red-500'}`}>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <p>{updateModalMessage}</p>
                </div>
            </div>
        )
    );
};

export default UpdateModal;
