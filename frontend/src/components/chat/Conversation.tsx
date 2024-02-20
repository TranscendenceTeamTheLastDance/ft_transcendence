import React, { useEffect, useState, useRef } from "react";
// import { UseQueryResult } from 'react-query';
import { Socket } from "socket.io-client";

import info_icon from "../assets/chat/info.svg";
import send_icon from "../assets/chat/send.svg";

import { ChannelType } from "./Chat";
import ChatInfos from "./ChatInfos";
import ChatModal from "./ChatModal";
import Message from "./Message";

import { useUserContext } from "../../context/UserContext";
import { userDto } from "./dto/userDto";

interface ConversationProps {
  channel: ChannelType;
  me: userDto | undefined;
  socket: Socket;
}

export interface UserType {
  intraImageURL: string | undefined;
  id: number;
  username: string;
  status: string;
  imagePath: string;
  role: string;
}

export interface MessageType {
  id: number;
  creadtedAt: string;
  content: string;
  user: UserType;
  channel: ChannelType;
}

const Conversation = ({ channel, socket, me }: ConversationProps) => {
  const { user } = useUserContext();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState<string>("");
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);
  const bottomEl = useRef<HTMLDivElement>(null);
  const blockedUsersRef = useRef<UserType[]>([]);

  let infos: userDto | undefined;
  if (user) {
    infos = user;
  }

  useEffect(() => {
    socket.on('message', (data: MessageType) => {
      // Access the latest blockedUsers using the ref
      const currentBlockedUsers = blockedUsersRef.current;
      if (currentBlockedUsers.some((u) => u.id === data.user.id)) {
        console.log(`blocking message from ${data.user.username}: ${data.content}`);
        return;
      }

      setMessages((messages) => [...messages, data]);
    });
    
    socket.emit(
      'history',
      { channel: channel.name, offset: 0, limit: 100 },
      (messages: MessageType[]) => {
        const filteredMessages = messages.filter((m) => {
          return !blockedUsersRef.current.some((u) => u.username === m.user.username);
        });
        setMessages(filteredMessages);
      },
    );

    socket.emit('blockList', (data: UserType[]) => {
      setBlockedUsers(data);
    });

    return () => {
      socket.off("message");
    };
    // eslint-disable-next-line
  }, [channel]);

  useEffect(() => {
    blockedUsersRef.current = blockedUsers;
  }, [blockedUsers]);

  useEffect(() => {
    bottomEl?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message) return;
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
            blockedUsers={blockedUsers}
            setBlockedUsers={setBlockedUsers}
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
      <div
        className="flex h-full flex-col gap-1 overflow-y-auto p-3"
        style={{ maxHeight: "600px" }}
      >
        {messages.map((m, idx) => {
            return (
              <Message
                key={idx}
                text={m.content}
                send_by_user={m.user.username === me?.username}
                sender={m.user}
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
