// import logo from '@/assets/logo.svg';

import { ChannelType } from "./Chat";

interface ChatListElemProps {
  chatInfos: ChannelType;
  currentChannel: ChannelType | null;
  setCurrentChannel: (channel: ChannelType) => void;
}

const ChatListElem = ({
  chatInfos,
  setCurrentChannel,
  currentChannel,
}: ChatListElemProps) => {
  const handleClick = (channel: ChannelType) => {
    if (currentChannel === null || channel.id !== currentChannel.id)
      setCurrentChannel(channel);
  };

  return (
    <button
      onClick={() => handleClick(chatInfos)}
      className={`flex w-full cursor-pointer p-3 enabled:hover:bg-white-2 ${
        currentChannel?.name === chatInfos.name && "bg-white-3"
      }`}
      disabled={currentChannel?.name === chatInfos.name}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <h3 className="font-bold">{chatInfos.name}</h3>
        </div>
      </div>
    </button>
  );
};

interface ChatListProps {
  joinedChannels: ChannelType[];
  currentChannel: ChannelType | null;
  setCurrentChannel: (channel: ChannelType) => void;
}

const ChatList = ({
  joinedChannels,
  currentChannel,
  setCurrentChannel,
}: ChatListProps) => {
  return (
    <div
      className="h-full w-full overflow-y-auto"
      style={{ maxHeight: "600px" }}
    >
      {joinedChannels.map((chat) => (
        <ChatListElem
          setCurrentChannel={setCurrentChannel}
          key={chat.id}
          chatInfos={chat}
          currentChannel={currentChannel}
        />
      ))}
    </div>
  );
};

export default ChatList;
