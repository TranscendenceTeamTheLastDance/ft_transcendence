import React, { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

import edit_icon from '../assets/chat/edit.svg';
import info_icon from '../assets/chat/info.svg';
import leave_icon from '../assets/chat/leave.svg';
import send_icon from '../assets/chat/send.svg';

import { ChannelType } from "./Chat";
import ChatEdit from './ChatEdit';
import ChatInfos from "./ChatInfos";
import ChatModal from "./ChatModal";
import Message from "./Message";
import { MessageType } from "./DmConversation";

import { useUserContext } from "../../context/UserContext";
import { userDto } from "./dto/userDto";

interface ConversationProps {
  channel: ChannelType;
  me: userDto | undefined;
  socket: Socket;
}

export interface UserType {
  id: number;
  username: string;
  status: string;
  profilePic: string;
  role: string;
}

const Conversation = ({ channel, socket, me }: ConversationProps) => {
  const { user } = useUserContext();
  const [showInfoModal, setShowInfoModal] = React.useState<boolean>(false);
  const [showEditModal, setShowEditModal] = React.useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState<string>('');
  const [blockedUsers, setBlockedUsers] = useState<UserType[]>([]);
  const bottomEl = useRef<HTMLDivElement>(null);
  const blockedUsersRef = useRef<UserType[]>([]);

  let infos: userDto | undefined;
  if (user) {
    infos = user;
  }

  useEffect(() => {
    socket.on('message', (data: MessageType) => {
      const currentBlockedUsers = blockedUsersRef.current;
      if (currentBlockedUsers.some((u) => u.id === data.user.id)) {
        console.log(`blocking message from ${data.user.username}: ${data.content}`);
        return;
      }

      if (data.channel === channel.name) {
        setMessages((messages) => [...messages, data]);
      }
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
    socket.emit('message', { channel: channel.name, content: message });
    setMessage('');
  };

  const leaveChannel = (channel: ChannelType) => {
    socket.emit('leave', { name: channel.name });
  };

  if (!infos) return <div>error</div>;

  return (
    <div className="flex w-[65%] flex-col border-l border-l-white-3 md:w-[500px]">
      {showInfoModal && (
        <ChatModal>
          <ChatInfos
            setShowModal={setShowInfoModal}
            socket={socket}
            channelName={channel.name}
            currentUserLogin={infos.username}
            blockedUsers={blockedUsers}
            setBlockedUsers={setBlockedUsers}
          />
        </ChatModal>
      )}
      {showEditModal && (
        <ChatModal>
          <ChatEdit
            setShowModal={setShowEditModal}
            socket={socket}
            channelName={channel.name}
            currentUserLogin={me?.username}
          />
        </ChatModal>
      )}
      <div className="flex justify-between p-3">
        <h3 className="text-xl">{channel.name}</h3>
        <div className="flex gap-1">
          <button
            className="rounded-full p-1 hover:bg-white-3"
            onClick={() => leaveChannel(channel)}
          >
            <img className="w-6" src={leave_icon} alt="leave" />
          </button>
          <button
            className="rounded-full p-1 hover:bg-white-3"
            onClick={() => setShowEditModal(true)}
          >
            <img className="w-6" src={edit_icon} alt="info" />
          </button>
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
          onSubmit={(e) => sendMessage(e)}
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

export default Conversation;