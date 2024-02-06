import React, { FormEvent, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { Channel } from './Chat';

interface CreateChannelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket;
}

const CreateChannel = ({ setShowModal, socket }: CreateChannelProps) => {
  const [channelType, setChannelType] = useState<string>('Public');
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const createChannel = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // send notification if success or error
    const channel: Channel = {
      name: nameRef.current?.value || '',
      type: channelType.toUpperCase(),
    };
    if (channelType === 'protected') {
      channel.password = passwordRef.current?.value;
    }
    socket.emit('create', channel);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white-2 p-6 shadow-xl">
      <h2 className="mb-4 text-2xl">Create a channel</h2>
      <form className="flex flex-col gap-2" onSubmit={createChannel}>
        <input
          pattern="[a-z0-9]+"
          title="Only lowercase letters and numbers are allowed"
          className="rounded-lg border-2 border-white-3 p-2"
          type="text"
          placeholder="Channel name"
          ref={nameRef}
        />
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
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChannel;