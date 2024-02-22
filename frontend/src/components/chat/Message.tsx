import React from 'react';
import { UserType } from './Conversation';
import avatar_icon from '../assets/avatar.png';

interface MessageProps {
  sender: UserType;
  text: string;
  send_by_user: boolean;
}

const Message = ({ sender, text, send_by_user }: MessageProps) => {
  return (
    <div
      className={`w-fit max-w-[60%] rounded-full p-2 ${
        send_by_user ? 'self-end bg-darkBlue-2 text-white-1' : 'self-start bg-white-3'
      }`}
    >
      <div className="flex gap-2">
        <img
          className="flex items-center justify-center w-8 h-8 rounded-full"
          src={sender.imagePath ? sender.imagePath : avatar_icon}
          alt={sender.username}
        />
        <span>{sender.username}</span>
      <p>{text}</p>
    </div>
  </div>
  );
};


export default Message;