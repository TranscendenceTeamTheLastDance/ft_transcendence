/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
// import { UseQueryResult } from "react-query";
import { io, Socket } from "socket.io-client";

import chat_channel from "../assets/chat/Chat.svg";
import chat_plus from "../assets/chat/chat_plus.svg";
import chat_DM from "../assets/chat/comment.svg";
// import find_someone from '@/assets/chat/find_someone.png';
import chat_join from "../assets/chat/join-channel.svg";
// import { useApi } from "@/hooks/useApi";

import ChatList from "./ChatList";
import ChatModal from "./ChatModal";
import Conversation from "./Conversation";
import CreateChannel from "./CreateChannel";
// import DmConversation from './DmConversation';
// import DmCreate from './DmCreate';
// import DmList from './DmList';
import JoinChannel from "./JoinChannel";

import { useUserContext } from "../../context/UserContext";
import "./index.css";
// import axios from 'axios';

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
  username: string;
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

const Chat = () => {
  const { user, fetchUserData } = useUserContext();
  const [showCreateChannelModal, setShowCreateChannelModal] =
    useState<boolean>(false);
  const [showJoinChannelModal, setShowJoinChannelModal] =
    useState<boolean>(false);
  // eslint-disable-next-line
  const [showDmSomeoneModal, setShowDmSomeoneModal] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket>();
  const [loading, setLoading] = useState<boolean>(true);
  const [joinedChannels, setJoinedChannels] = useState<ChannelType[]>([]);
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
    const tmpSocket = io("http://localhost:8080/chat", {
      withCredentials: true,
    });
    console.log("connecting");
    tmpSocket.on("connect", () => {
      setSocket(tmpSocket);
      setLoading(false);
      console.log("connected");

      tmpSocket.emit("joinedChannels", (data: ChannelType[]) => {
        setJoinedChannels(data);
        console.log("joinedChannels", data);
      });

      tmpSocket.on("youJoined", (data: ChannelType) => {
        setCurrentChannel(data);
        setJoinedChannels((prev) => [...prev, data]);
        console.log("youJoined", data);
      });
    });

    return () => {
      socket?.off("youJoined");
      socket?.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket?.on("youLeft", (data: any) => {
      setCurrentChannel(null);
      setJoinedChannels(joinedChannels.filter((c) => c.name !== data.channel));
      if (!data.reason.includes("disconnected")) {
        alert(`You left ${data.channel}, ${data.reason}`);
      }
    });

    return () => {
      socket?.off("youLeft");
    };
    // eslint-disable-next-line
  }, [joinedChannels]);

  if (loading) return <div>loading</div>;
  if (!socket) return <div>socket not initialized</div>;
  // eslint-disable-next-line
  me = user;

  console.log("me", me);

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
      {showJoinChannelModal && (
        <ChatModal>
          <JoinChannel
            setShowModal={setShowJoinChannelModal}
            socket={socket}
            joinedChannels={joinedChannels}
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
                <img
                  className="w-5 md:w-6"
                  src={chat_channel}
                  alt="Direct messages"
                />
              </button>
              <button
                className="rounded-full p-1 hover:bg-white-3"
                title="Join a channel"
                onClick={() => setShowJoinChannelModal(true)}
              >
                <img
                  className="w-5 md:w-6"
                  src={chat_join}
                  alt="join channel"
                />
              </button>
              <button
                title="Create a channel"
                onClick={() => setShowCreateChannelModal(true)}
                className="rounded-full p-1 hover:bg-white-3"
              >
                <img
                  className="w-5 md:w-6"
                  src={chat_plus}
                  alt="create channel"
                />
              </button>
            </div>
          </div>
          <ChatList
            joinedChannels={joinedChannels.filter((c) => c.isDM === false)}
            setCurrentChannel={setCurrentChannel}
            currentChannel={currentChannel}
          />
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
      {currentChannel && (
        <Conversation socket={socket} channel={currentChannel} />
      )}
    </div>
  );
};

export default Chat;
