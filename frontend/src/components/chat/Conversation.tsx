import React, { useEffect, useState } from "react";
// import { UseQueryResult } from 'react-query';
import { Socket } from "socket.io-client";

import info_icon from "../assets/chat/info.svg";
import send_icon from "../assets/chat/send.svg";
// import { userDto } from '../dto/userDto';

import { ChannelType } from "./Chat";
import ChatInfos from "./ChatInfos";
import ChatModal from "./ChatModal";
import Message from "./Message";

import { useUserContext } from "../../context/UserContext";

interface ConversationProps {
  channel: ChannelType;
  socket: Socket;
}

export interface UserType {
  id: number;
  username: string;
  // status: string;
  profilePic: string;
  // role: string; // a ajouter dans le user-context
}

export interface MessageType {
  id: number;
  creadtedAt: string;
  content: string;
  channelId: number;
  authorId: number;
  author: UserType;
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

const Conversation = ({ channel, socket }: ConversationProps) => {
  const { user } = useUserContext();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState<string>("");

  let infos: userDto | undefined;
  if (user) {
    infos = user;
  }

  useEffect(() => {
    socket.on("message", (data: MessageType) => {
      // TODO fix wrong MessageType from server
      // if (messages.length > 0 && messages[messages.length - 1].id === data.id) return;
      console.log(data);
      // setMessages((messages) => [...messages, data]);
    });
    socket.emit(
      "history",
      { channel: channel.name, offset: 0, limit: 100 },
      (res: MessageType[]) => {
        setMessages(res);
      }
    );
    return () => {
      socket.off("message");
    };
    // eslint-disable-next-line
  }, [channel]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("message", { channel: channel.name, content: message });
    setMessage("");
  };

  //   if (isLoading) return <div>loading</div>;
  //   if (isError) return <div>error</div>;
  if (!infos) return <div>error</div>;

  return (
    <div className="flex w-[500px] flex-col border-l border-l-white-3">
      {showModal && (
        <ChatModal>
          <ChatInfos
            setShowModal={setShowModal}
            socket={socket}
            channelName={channel.name}
            currentUserLogin={infos.username}
          />
        </ChatModal>
      )}
      <div className="flex justify-between p-3">
        <h3 className="text-xl">{channel.name}</h3>
        <div className="flex gap-2">
          <button
            className="rounded-full p-1 hover:bg-white-3"
            onClick={() => setShowModal(true)}
          >
            <img className="w-6" src={info_icon} alt="info" />
          </button>
        </div>
      </div>
      <div className="flex h-full flex-col justify-end gap-1 p-3">
        {messages.map((m) => {
          return (
            <Message
              key={m.id}
              text={m.content}
              send_by_user={m.author.username === infos?.username}
              sender={m.author.username}
            />
          );
        })}
      </div>
      <div className="border-t border-t-white-3">
        <form
          className="m-2 flex gap-3 rounded-2xl bg-white-3 p-2"
          onSubmit={(e) => sendMessage(e)}
        >
          <input
            className="w-full bg-white-3 outline-none"
            type="text"
            placeholder="ecrire un nouveau message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button>
            <img className="w-5" src={send_icon} alt="send" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;
