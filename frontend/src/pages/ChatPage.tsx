import React from 'react';
import Chat from '../components/chat/Chat';
import Particles from '../components/Home/Particles';

const ChatPage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2" style={{ minHeight: `calc(100vh - 210px)` }}>
      <Particles className="absolute inset-0 -z-10" quantity={1000} />
      <Chat />
    </div>
  );
};

export default ChatPage;
