import React, { useEffect, useRef, useState } from 'react';
import { UseQueryResult } from 'react-query';
import { Socket } from 'socket.io-client';

import info_icon from '../assets/chat/info.svg';
import send_icon from '../assets/chat/send.svg';
import { userDto } from './dto/userDto';
// import { useApi } from '../hooks/useApi';

import { ChannelType } from './Chat';
import ChatModal from './ChatModal';
import DmInfos from './DmInfos';
import Message from './Message';
import axios from 'axios'; // Remove unused import

import { useAuthAxios } from "../../context/AuthAxiosContext.tsx";

interface ConversationProps {
  channel: ChannelType;
  me: userDto | undefined;
  socket: Socket;
  allUsers: userDto[] | undefined;
}

export interface UserType {
  id: number;
  username: string;
  imagePath: string;
  role: string;
  status: string;
}

export interface MessageType {
  id: number;
  creadtedAt: string;
  content: string;
  user: UserType;
}

const DmConversation = ({ channel, socket, me, allUsers }: ConversationProps) => {
  const [showInfoModal, setShowInfoModal] = React.useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState<string>('');
  const bottomEl = useRef<HTMLDivElement>(null);

  const users: userDto[] | undefined = [];
  const authAxios = useAuthAxios();

  console.log("All users in DmConversation", allUsers);

  const fetchData = async () => {
    try {
      const usersResponse = await authAxios.get("/chat/allUsers", {
        withCredentials: true,
      }) as unknown as UseQueryResult<userDto[], unknown>;

      usersResponse.data?.forEach((user: userDto) => {
        users?.push(user);
      });

      console.log("Users recup", users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    socket.on('dm', (data: MessageType) => {
      setMessages((messages) => [...messages, data]);
    });

    socket.emit(
      'history',
      { channel: channel.name, offset: 0, limit: 100 },
      (res: MessageType[]) => {
        setMessages(res);
      },
    );

    return () => {
      socket.off('message');
    };
  }, [channel]);

  useEffect(() => {
    bottomEl?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>, channelName: string) => {
    e.preventDefault();
    if (!message) return;
    const names = channelName.substring(1).split('_');
    const otherLogin = names[0] === me?.username ? names[1] : names[0];
    socket.emit('dm', { login: otherLogin, content: message });
    setMessage('');
  };

  function findUserInfos1(chatName: string) {
    if (!chatName) return '';

    fetchData();

    console.log("DmConversation Users recup", users);
    allUsers = users;

    const names = chatName.substring(1).split('_');
    if (names[0] === me?.username) {
      const user = allUsers?.filter((user) => user.username === names[1]);
      if (user?.length) {
        return user[0].username;
      } else {
        return names[1];
      }
    } else {
      const user = allUsers?.filter((user) => user.username === names[0]);
      if (user?.length) {
        return user[0].username;
      } else {
        return names[0];
      }
    }
  }

  return (
    <div className="flex w-[65%] flex-col border-l border-l-white-3 md:w-[500px]">
      {showInfoModal && (
        <ChatModal>
          <DmInfos
            setShowModal={setShowInfoModal}
            socket={socket}
            channelName={channel.name}
            currentUserLogin={me?.username}
          />
        </ChatModal>
      )}
      <div className="flex justify-between p-3">
        <h3 className="text-xl">{findUserInfos1(channel.name)}</h3>
        <div className="flex gap-1">
          <button
            className="rounded-full p-1 hover:bg-white-3"
            onClick={() => setShowInfoModal(true)}
          >
            <img className="w-6" src={info_icon} alt="info" />
          </button>
        </div>
      </div>
      <div
        className="flex h-full flex-col gap-1 overflow-y-auto p-3"
        style={{ maxHeight: '600px' }}
      >
        {messages.map((m, idx) => {
          // TODO replace idx by message id
          return (
            <Message
              key={idx}
              text={m.content}
              send_by_user={m.user.username === me?.username}
              sender={m.user}
            />
          );
        })}
        <div ref={bottomEl}></div>
      </div>
      <div className="border-t border-t-white-3">
        <form
          className="m-2 flex gap-3 rounded-2xl bg-white-3 p-2"
          onSubmit={(e) => sendMessage(e, channel.name)}
        >
          <input
            className="w-full bg-white-3 outline-none"
            type="text"
            placeholder="Write a new message"
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

export default DmConversation;