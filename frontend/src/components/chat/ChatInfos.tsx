import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

// import kick_icon from '../assets/chat/ban.svg';
import game_icon from "../assets/chat/boxing-glove.svg";
import profilePic from "../assets/avatar.png";
import addFriendIcon from "../assets/chat/Group_add_light.png";
import chatIcon from "../assets/chat/Chat.svg";

// import promote_icon from '../assets/chat/crown.svg';

import { UserType } from "@/common/userType.interface";
// import { UserType } from "./Conversation";

interface ChatInfosProps {
  setShowModal: (show: boolean) => void;
  socket: Socket;
  channelName: string;
  currentUserLogin: string;
}

interface UserListResponse {
  channel: string;
  users: UserType[];
}

const ChatInfos = ({
  setShowModal,
  socket,
  channelName,
  currentUserLogin,
}: ChatInfosProps) => {
  const [users, setUsers] = useState<UserType[]>([]);
  // const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    socket.emit(
      "userList",
      { channel: channelName },
      (res: UserListResponse) => {
        setUsers(
          res.users.filter((user) => user.username) //!== currentUserLogin)
        );
        // const user =
        // res.users.find((user) => user.login === currentUserLogin) || null;
        // if (user && (user.role === 'ADMIN' || user.role === 'OWNER')) setIsAdmin(true);
      }
    );
    // eslint-disable-next-line
  }, []);

  //   const promoteUser = (user: UserType) => {
  //     socket.emit('promote', { channel: channelName, user: user.login });
  //     setUsers(
  //       users.map((u) => {
  //         if (u.id === user.id) {
  //           return { ...u, role: 'ADMIN' };
  //         }
  //         return u;
  //       }),
  //     );
  //   };

  //   const kickUser = (user: UserType) => {
  //     socket.emit('kick', { channel: channelName, user: user.login });
  //     setUsers(users.filter((u) => u.id !== user.id));
  //   };

  // Contains the list of members in the channel, whith a possibility to kick them, to promote them as admin, and to start a game with them
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white-1 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl">Members</h2>
        <button
          onClick={() => setShowModal(false)}
          className="rounded-lg border-2 border-white-3 p-1 text-xl hover:bg-red hover:text-white-1"
        >
          Close
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {users.map((user) => {
          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full"
                  src={profilePic} // change to user.profilePic
                  alt="user"
                />
                <h3 className="text-lg">{user.username}</h3>
              </div>
              {/* conditionally render the add friend button */}
              {user.username !== currentUserLogin && (
                <div className="flex gap-2">
                  <button
                    className="rounded-full p-1 hover:bg-green-1"
                    title="Start a game"
                  >
                    <img
                      className="w-6"
                      src={game_icon}
                      alt="start game icon"
                    />
                  </button>{" "}
                  <button
                    className="rounded-full p-1 hover:bg-green-1"
                    title="Send DM"
                  >
                    <img className="w-6" src={chatIcon} alt="chat icon" />
                  </button>
                  <button
                    className="rounded-full p-1 hover:bg-green-1"
                    title="Add friend"
                  >
                    <img
                      className="w-6"
                      src={addFriendIcon}
                      alt="add friend icon"
                    />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInfos;
