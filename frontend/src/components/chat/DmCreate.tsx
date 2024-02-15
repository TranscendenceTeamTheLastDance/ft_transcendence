import React, { useState } from 'react';
import { Socket } from 'socket.io-client';

import { userDto } from './dto/userDto';

import { ChannelType } from './Chat';

interface DmChannelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket;
  users: userDto[] | undefined;
  setCurrentChannel: (channel: ChannelType) => void;
}

const DmCreate = ({ setShowModal, socket, users, setCurrentChannel }: DmChannelProps) => {
  const [searchUser, setSearchUser] = useState<string>('');
  const [userButtonSelected, setUserButtonSelected] = useState<HTMLButtonElement | null>(null);
  const [selectedLogin, setSelectedLogin] = useState<string>('');

  console.log("All user in DmCreate ", users);

  const selectUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (userButtonSelected) {
      userButtonSelected.classList.remove('bg-darkBlue-2', 'text-white-1');
      userButtonSelected.classList.add('bg-white-1');
    }
    e.currentTarget.classList.remove('bg-white-1');
    e.currentTarget.classList.add('bg-darkBlue-2', 'text-white-1');
    setUserButtonSelected(e.currentTarget);
    console.log(e.currentTarget.textContent);
    setSelectedLogin(e.currentTarget.textContent || '');
  };



  const handleDirectMessage = () => {
    const message = document.querySelector<HTMLButtonElement>('#firstMessage')?.value;
    socket.emit('dm', { username: selectedLogin, content: message });
    socket.on('dm', (data) => {
      setCurrentChannel(data.channel);
    });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white-2 p-6 shadow-xl">
      <h2 className="mb-4 text-2xl">Users</h2>
      <form className="flex flex-col gap-2" onSubmit={handleDirectMessage}>
        <div className="flex gap-2">
          <input
            className="rounded-lg border-2 border-white-3 p-2"
            type="text"
            placeholder="Filter users"
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <button
            className="rounded-lg border-2 border-white-3 p-2 hover:bg-red hover:text-white-1"
            onClick={() => {
              setShowModal(false);
            }}
          >
            Cancel
          </button>
        </div>
        <input
          className="rounded-lg border-2 border-white-3 p-2"
          id="firstMessage"
          type="text"
          placeholder="First message"
          required
        />
        <div className="flex max-h-[300px] flex-col gap-1 overflow-x-scroll">
          {users ? (
            users
              .filter((user) =>
                user.username.toLowerCase().includes(searchUser.toLowerCase())
              )
              .map((user, index) => {
                return (
                  <button
                    className="flex justify-between gap-2 rounded-lg border-2 border-white-3 bg-white-1 p-2 enabled:hover:bg-darkBlue-2 enabled:hover:text-white-1 enabled:focus:bg-darkBlue-2 enabled:focus:text-white-1 disabled:cursor-not-allowed disabled:opacity-60"
                    id="user"
                    key={index}
                    onClick={(e) => selectUser(e)}
                    type="button"
                  >
                    <div>{user.username}</div>
                    <div className="flex"></div>
                  </button>
                );
              })
          ) : (
            <div></div>
          )}
        </div>
        <div className="flex justify-center gap-2">
          <button className="w-full rounded-lg border-2 border-white-3 p-2 hover:bg-darkBlue-2 hover:text-white-1">
            Direct message
          </button>
        </div>
      </form>
    </div>
  );
};

export default DmCreate;