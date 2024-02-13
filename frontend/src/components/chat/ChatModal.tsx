import React from 'react';

interface ModalProps {
  children: React.ReactNode;
}

const Modal = ({ children }: ModalProps) => {
  return (
    <div className="absolute left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-white-3/30">
      {children}
    </div>
  );
};

export default Modal;