/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
// import { UseQueryResult } from "react-query";
import { io, Socket } from "socket.io-client";

import chat_channel from '../assets/chat/Chat.svg';
import chat_plus from '../assets/chat/chat_plus.svg';
import chat_DM from '../assets/chat/comment.svg';
// import find_someone from '@/assets/chat/find_someone.png';
// import chat_join from '@/assets/chat/join-channel.svg';
// import { useApi } from "@/hooks/useApi";

// import ChatList from './ChatList';
import ChatModal from "./ChatModal";
// import Conversation from './Conversation';
import CreateChannel from "./CreateChannel";
// import DmConversation from './DmConversation';
// import DmCreate from './DmCreate';
// import DmList from './DmList';
// import JoinChannel from './JoinChannel';

import { useUserContext } from "../../context/UserContext";
import './index.css';

export interface Channel {
  name: string;
  type: string;
  password?: string;
}

export interface ChannelType {
  createdAt: string;
  id: number;
  name: string;
  type: "PUBLIC" | "PROTECTED" | "PRIVATE";
  isDM: boolean;
}

export interface userDto {
  id: number;
  login: string;
  first_name: string;
  last_name: string;
  email: string;
  imagePath: string;
  JWTtoken?: string;
  displayName: string;
  description: string;
  bannerPath: string;
  intraImageURL: string;
  status: string;
}

export const dummyUserDto: userDto = {
  id: 621458,
  login: "nibenoit",
  first_name: "nicolas",
  last_name: "benoit",
  email: "lorem@ipsum.fr",
  imagePath: "image",
  displayName: "NoobMaster",
  description: "",
  intraImageURL: "",
  bannerPath: "",
  status: "",
};

// eslint-disable-next-line
const Chat = () => {

  const { user, fetchUserData } = useUserContext();
  const [showCreateChannelModal, setShowCreateChannelModal] =
    useState<boolean>(false);
    // eslint-disable-next-line
  const [showJoinChannelModal, setShowJoinChannelModal] =
    useState<boolean>(false);
    // eslint-disable-next-line
  const [showDmSomeoneModal, setShowDmSomeoneModal] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line
  const [joinedChannels, setJoinedChannels] = useState<ChannelType[]>([]);
  // eslint-disable-next-line
  const [currentChannel, setCurrentChannel] = useState<ChannelType | null>(
    null
  );
  const [showChannels, setShowChannels] = useState<boolean>(true);
  
  let me: userDto | undefined;

  useEffect(() => {
	fetchUserData();
  }, [fetchUserData]);



  useEffect(() => {
    setLoading(true);
    const tmpSocket = io("http://localhost:8080/chat", { withCredentials: true });
    console.log("connecting");
    tmpSocket.on("connect", () => {
      setSocket(tmpSocket);
      setLoading(false);
      console.log("connected");

      tmpSocket.on("exception", (data) => {
        if (Array.isArray(data.message)) {
          alert(data.message.join("\n"));
        } else {
          alert(data.message);
        }
      });
    });

    return () => {
      socket?.off("youJoined");
      socket?.off("exception");
      socket?.off("dm");
      socket?.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>loading</div>;
  if (!socket) return <div>socket not initialized</div>;
// eslint-disable-next-line
  me = user;

  const handleShowChannels = (boolean: boolean) => {
    setCurrentChannel(null);
    setShowChannels(boolean);
  };

  return (
    <div className="flex max-h-full min-h-[65%] w-full rounded-lg bg-white-1 md:w-auto">
      {showCreateChannelModal && (
        <ChatModal>
          <CreateChannel
            setShowModal={setShowCreateChannelModal}
            socket={socket}
          />
        </ChatModal>
      )}
      {showChannels ? (
        <div className="flex w-[35%] flex-col md:w-auto">
          <div className="flex  justify-between px-1 py-3  md:gap-2 md:p-3">
            <h2 className="text-base md:text-xl">Channels</h2>
            <div className="flex w-full gap-1 md:gap-2">
              <button
                className="rounded-full p-1 hover:bg-white-3"
                title="Go to direct messages"
                onClick={() => handleShowChannels(false)}
              >
              <img className="w-5 md:w-6" src={chat_channel} alt="Direct messages" />
              </button>
              <button
                className="rounded-full p-1 hover:bg-white-3"
                title="Join a channel"
                onClick={() => setShowJoinChannelModal(true)}
              ></button>
              <button
                title="Create a channel"
                onClick={() => setShowCreateChannelModal(true)}
                className="rounded-full p-1 hover:bg-white-3"
              >
                <img className="w-5 md:w-6" src={chat_plus} alt="create channel" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-[35%] flex-col md:w-auto">
          <div className="flex  justify-between px-1 py-3  md:gap-2 md:p-3">
            <h2 className="text-base md:text-xl">Direct message</h2>
            <div className="flex w-full justify-center gap-1 md:gap-2">
              <button
                className="rounded-full p-1 hover:bg-white-3"
                title="Go to channels"
                onClick={() => handleShowChannels(true)}
              >
                <img className="w-5 md:w-6" src={chat_DM} alt="Channels" />
              </button>
              <button
                className="rounded-full p-1 hover:bg-white-3"
                title="Find someone"
                onClick={() => setShowDmSomeoneModal(true)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
