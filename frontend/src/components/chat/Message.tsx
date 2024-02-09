import React from 'react';

interface MessageProps {
  sender: string;
  text: string;
  send_by_user: boolean;
}

const Message = ({ text, sender, send_by_user }: MessageProps) => {
  return (
    <div
      className={`w-fit max-w-[60%] rounded-full p-2 ${
        send_by_user ? 'self-end bg-darkBlue-2 text-white-1' : 'self-start bg-white-3'
      }`}
    >
      <p>{text}</p>
    </div>
  );
};

export default Message;