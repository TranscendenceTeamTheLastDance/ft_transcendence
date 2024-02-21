import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { Channel } from './Chat';

interface ChatEditProps {
  setShowModal: (show: boolean) => void;
  socket: Socket;
  channelName: string;
  currentUserLogin: string | undefined;
}

const ChatEdit = ({ setShowModal, socket, channelName }: ChatEditProps) => {
  const [channelType, setChannelType] = useState<string>('Public');
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {}, []);

  const updateChannel = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const channel: Channel = {
      name: channelName,
      type: channelType.toUpperCase(),
    };
    if (channelType === 'protected') {
      channel.password = passwordRef.current?.value;
    }
    socket.emit('updateChannel', channel);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white-1 p-4">
      <div className="flex flex-col items-center justify-between gap-4">
        <h2 className="text-2xl">Edit channel</h2>
        <form className="flex flex-col gap-2" onSubmit={updateChannel}>
          <select
            className="rounded-lg border-2 border-white-3 p-2"
            onChange={(e) => setChannelType(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="protected">Protected</option>
            <option value="private">Private</option>
          </select>
          {channelType === 'protected' && (
            <input
              className="rounded-lg border-2 border-white-3 p-2"
              type="password"
              placeholder="Password"
              ref={passwordRef}
            />
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setShowModal(false)}
              className="rounded-lg border-2 border-white-3 p-2 hover:bg-red hover:text-white-1"
            >
              Cancel
            </button>
            <button className="rounded-lg border-2 border-white-3 p-2 hover:bg-darkBlue-2 hover:text-white-1">
              Update
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-col gap-2"></div>
    </div>
  );
};

export default ChatEdit;