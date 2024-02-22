import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import React from 'react';

import game_icon from '../assets/chat/boxing-glove.svg';
import avatar_icon from '../assets/avatar.png';


import { UserType } from './DmConversation';

interface DmInfosProps {
  setShowModal: (show: boolean) => void;
  socket: Socket;
  channelName: string;
  currentUserLogin: string | undefined;
}

interface UserListResponse {
  channel: string;
  users: UserType[];
}

const DmInfos = ({ setShowModal, socket, channelName, currentUserLogin }: DmInfosProps) => {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    socket.emit('userList', { channel: channelName }, (res: UserListResponse) => {
      setUsers(res.users.filter((user) => user.username !== currentUserLogin));
    });
  }, [ channelName, currentUserLogin, socket]);

  const startGame = () => {
    // const code = (Math.random() + 1).toString(36).substring(7);
    const message = `Come join me in a Pong game! ${window.location.origin}/play`;
    const names = channelName.substring(1).split('_');
    const otherLogin = names[0] === currentUserLogin ? names[1] : names[0];
    socket.emit('dm', { username: otherLogin, content: message });
  };

  // Contains the list of members in the channel, whith a possibility to kick them, to promote them as admin, and to start a game with them
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white-1 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl">User</h2>
        <button
          onClick={() => setShowModal(false)}
          className="rounded-lg border-2 border-white-3 p-1 text-xl hover:bg-red hover:text-white-1"
        >
          Close
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {users.map((user) => {
          return (
            <div key={user.id} className="flex items-center justify-between gap-4">
              <Link to={'/user/' + user.username}>
                <div className="flex items-center gap-2">
                  <img className="w-8 rounded-full" src={user.imagePath ? user.imagePath : avatar_icon} alt="user" />
                  <h3 className="text-lg">{user.username}</h3>
                </div>
              </Link>
              <div className="flex gap-2">
                <button
                  className="rounded-full p-1 hover:bg-green-1"
                  title="Start a game"
                  onClick={() => startGame()}
                >
                  <img className="w-6" src={game_icon} alt="close" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DmInfos;