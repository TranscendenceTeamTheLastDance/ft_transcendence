import React from 'react';

const Modal = ({ show, onClose, children }) => {
	if (!show) {
	  return null;
	}
  
	return (
	  <div className="modal-backdrop">
		<div className="modal-content">
		  {children}
		  <button onClick={onClose}>Close</button>
		</div>
	  </div>
	);
  };

export default Modal;