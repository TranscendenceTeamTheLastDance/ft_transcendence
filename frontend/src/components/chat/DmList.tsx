// import logo from '@/assets/logo.svg';

import { userDto } from './dto/userDto';

import { ChannelType } from './Chat';
import React from 'react';

interface DmListElemProps {
  allUsers: userDto[] | undefined;
  chatInfos: ChannelType;
  currentChannel: ChannelType | null;
  setCurrentChannel: (channel: ChannelType) => void;
  me: userDto | undefined;
}

const DmListElem = ({
  chatInfos,
  setCurrentChannel,
  currentChannel,
  allUsers,
  me,
}: DmListElemProps) => {
  const handleClick = (channel: ChannelType) => {
    if (currentChannel === null || channel.id !== currentChannel.id) setCurrentChannel(channel);
  };

  let user;

  const findUserInfos = (chatName: string) => {
    chatName = chatName.substring(1);
    const names = chatName.split('_');
    if (names[0] === me?.username) {
      user = names[1];
    } else {
      user = names[0];
    }
    return user;
  };

  return (
    <button
      onClick={() => handleClick(chatInfos)}
      className={`flex w-full cursor-pointer p-3 enabled:hover:bg-white-2 ${
        currentChannel?.name === chatInfos.name && 'bg-white-3'
      }`}
      disabled={currentChannel?.name === chatInfos.name}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <h3 className="font-bold">{findUserInfos(chatInfos.name)}</h3>
        </div>
      </div>
    </button>
  );
};

interface DmListProps {
  allUsers: userDto[] | undefined;
  joinedChannels: ChannelType[];
  currentChannel: ChannelType | null;
  setCurrentChannel: (channel: ChannelType) => void;
  me: userDto | undefined;
}

const DmList = ({
  joinedChannels,
  currentChannel,
  setCurrentChannel,
  allUsers,
  me,
}: DmListProps) => {

  return (
    <div className="h-full w-full overflow-y-auto" style={{ maxHeight: '600px' }}>
      {joinedChannels.map((chat) => (
        <DmListElem
          me={me}
          setCurrentChannel={setCurrentChannel}
          allUsers={allUsers}
          key={chat.id}
          chatInfos={chat}
          currentChannel={currentChannel}
        />
      ))}
    </div>
  );
};

export default DmList;