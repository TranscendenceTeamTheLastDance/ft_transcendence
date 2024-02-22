import React from "react";

const LogOutButton = ({ onclick }) => {
    return (
        <button onClick={onclick} className="bg-red-500 text-red font-bold py-2 px-4 rounded">
            Log Out
        </button>
    );
};

export default LogOutButton;