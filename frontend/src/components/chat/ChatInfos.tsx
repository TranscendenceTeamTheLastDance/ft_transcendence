import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Socket } from "socket.io-client";

import ban_icon from "../assets/chat/ban.svg";
import block_icon from "../assets/chat/block.svg";
import unblock_icon from "../assets/chat/unblock.svg";
import game_icon from "../assets/chat/boxing-glove.svg";
import promote_icon from "../assets/chat/crown.svg";
import demote_icon from "../assets/chat/demote.svg";
import kick_icon from "../assets/chat/kick.svg";
import mute_icon from "../assets/chat/mute.svg";
import avatar_icon from "../assets/avatar.png";
import addFriendIcon from "../assets/chat/Group_add_light.png";

import ChatModal from "./ChatModal";
import { UserType } from "./DmConversation";
import axios from "axios";

interface ChatInfosProps {
  setShowModal: (show: boolean) => void;
  socket: Socket;
  channelName: string;
  currentUserLogin: string;
  blockedUsers: UserType[];
  setBlockedUsers: (
    users: UserType[] | ((prev: UserType[]) => UserType[])
  ) => void;
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
  blockedUsers,
  setBlockedUsers,
}: ChatInfosProps) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [, setFriendIds] = useState<number[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showMuteModal, setShowMuteModal] = useState<boolean>(false);
  const [muteUserState, setMuteUser] = useState<UserType>();
  const muteDurationRef = useRef<HTMLInputElement>(null);
  const muteReasonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.emit(
      "userList",
      { channel: channelName },
      (res: UserListResponse) => {
        setUsers(
          res.users.filter((user) => user.username !== currentUserLogin)
        );
        const user =
          res.users.find((user) => user.username === currentUserLogin) || null;
        if (user && (user.role === "ADMIN" || user.role === "OWNER"))
          setIsAdmin(true);
      }
    );
  }, [channelName, currentUserLogin, socket]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/users/friends`,
          {
            withCredentials: true,
          }
        );
        setFriendIds(response.data.map((friend) => friend.id));
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      }
    };

    fetchFriends();
  }, []);

  const addFriend = async (friendId: number) => {
    try {
      const response = await axios.post(
        `http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/users/add-friend`,
        {
          userId: currentUserLogin,
          friendId,
        },
        {
          withCredentials: true,
        }
      );
      console.log("response:", response.data);
      setFriendIds((prevFriendIds) => [...prevFriendIds, friendId]);
    } catch (error) {
      console.error("Failed to add friend:", error);
    }
  };

  const promoteUser = (user: UserType) => {
    socket.emit("promote", { channel: channelName, username: user.username });
    setUsers(
      users.map((u) => {
        if (u.id === user.id) {
          return { ...u, role: "ADMIN" };
        }
        return u;
      })
    );
  };

  const demoteUser = (user: UserType) => {
    socket.emit("demote", { channel: channelName, username: user.username });
    setUsers(
      users.map((u) => {
        if (u.id === user.id) {
          return { ...u, role: "USER" };
        }
        return u;
      })
    );
  };

  const kickUser = (user: UserType) => {
    socket.emit("kick", { channel: channelName, username: user.username });
    setUsers(users.filter((u) => u.id !== user.id));
  };

  const banUser = (user: UserType) => {
    socket.emit("ban", { channel: channelName, username: user.username });
    setUsers(users.filter((u) => u.id !== user.id));
  };

  const blockUser = (user: UserType) => {
    socket.emit("block", { username: user.username });
    setBlockedUsers((prev) => [...prev, user]);
  };

  const unblockUser = (user: UserType) => {
    socket.emit("unblock", { username: user.username });
    setBlockedUsers(blockedUsers.filter((u) => u.id !== user.id));
  };

  const muteUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const muteData = {
      channel: channelName,
      username: muteUserState?.username,
      reason: muteReasonRef.current?.value,
      duration: Number(muteDurationRef.current?.value),
    };

    socket.emit("mute", muteData);
    setShowMuteModal(false);
  };

  const startGame = () => {
    // const code = (Math.random() + 1).toString(36).substring(7);
    const message = `Come join me in a Pong game! ${window.location.origin}/play`;
    socket.emit("message", { channel: channelName, content: message });
  };

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
              <Link to={"/user/" + user.username}>
                <div className="flex items-center gap-2">
                  <img
                    className="w-8 rounded-full"
                    src={user.profilePic ? user.profilePic : avatar_icon}
                    alt="user"
                  />
                  <h3 className="text-lg">
                    {user.username ? user.username : "NO USERNAME"}
                  </h3>
                </div>
              </Link>
              <div className="flex gap-2">
                <button
                  className="rounded-full p-1 hover:bg-green-1"
                  title="Start a game"
                  onClick={() => startGame()}
                >
                  <img className="w-6" src={game_icon} alt="close" />
                </button>
                {user.role === "ADMIN" || user.role === "OWNER" ? (
                  <button
                    className="rounded-full p-1 enabled:hover:bg-yellow-1 disabled:cursor-not-allowed"
                    title={"Demote user"}
                    disabled={!isAdmin || user.role === "OWNER"}
                    onClick={() => demoteUser(user)}
                  >
                    <img className="w-6" src={demote_icon} alt="demote" />
                  </button>
                ) : (
                  <button
                    className="rounded-full p-1 enabled:hover:bg-yellow-1 disabled:cursor-not-allowed"
                    title={"Promote user to admin"}
                    disabled={!isAdmin}
                    onClick={() => promoteUser(user)}
                  >
                    <img className="w-6" src={promote_icon} alt="promote" />
                  </button>
                )}
                <button
                  className="rounded-full p-1 hover:bg-green-1"
                  title="Add friend"
                  onClick={() => addFriend(user.id)}
                >
                  {/* show panel "friend added" ?*/}
                  <img
                    className="w-6"
                    src={addFriendIcon}
                    alt="add friend icon"
                  />
                </button>
                <button
                  className="rounded-full p-1 enabled:hover:bg-red disabled:cursor-not-allowed"
                  title={
                    isAdmin
                      ? "Kick user"
                      : "Can't kick user because you are not admin"
                  }
                  disabled={!isAdmin}
                  onClick={() => kickUser(user)}
                >
                  <img className="w-6" src={kick_icon} alt="kick" />
                </button>
                <button
                  className="rounded-full p-1 enabled:hover:bg-red disabled:cursor-not-allowed"
                  title={
                    isAdmin
                      ? "Ban user"
                      : "Can't ban user because you are not admin"
                  }
                  disabled={!isAdmin}
                  onClick={() => banUser(user)}
                >
                  <img className="w-6" src={ban_icon} alt="ban" />
                </button>
                <button
                  className="rounded-full p-1 enabled:hover:bg-red disabled:cursor-not-allowed"
                  title={
                    isAdmin
                      ? "Mute user"
                      : "Can't mute user because you are not admin"
                  }
                  disabled={!isAdmin}
                  onClick={() => {
                    setShowMuteModal(true);
                    setMuteUser(user);
                  }}
                >
                  <img className="w-6" src={mute_icon} alt="mute" />
                </button>
                {blockedUsers.some((u) => u.id === user.id) ? (
                  <button
                    className="rounded-full p-1 enabled:hover:bg-green-1 disabled:cursor-not-allowed"
                    title="Unblock user"
                    onClick={() => unblockUser(user)}
                  >
                    <img className="w-6" src={unblock_icon} alt="block" />
                  </button>
                ) : (
                  <button
                    className="rounded-full p-1 enabled:hover:bg-red disabled:cursor-not-allowed"
                    title="Block user"
                    onClick={() => blockUser(user)}
                  >
                    <img className="w-6" src={block_icon} alt="block" />
                  </button>
                )}
                {showMuteModal && (
                  <ChatModal>
                    <div className="flex flex-col gap-2 rounded-lg bg-white-1 p-4">
                      <div className="flex flex-col items-center justify-between gap-4">
                        <h2 className="text-2xl">Mute user</h2>
                        <form
                          className="flex flex-col gap-2"
                          onSubmit={(e) => muteUser(e)}
                        >
                          <input
                            className="rounded-lg border-2 border-white-3 p-2"
                            placeholder="Mute duration in seconds"
                            ref={muteDurationRef}
                            required
                          ></input>
                          <input
                            className="rounded-lg border-2 border-white-3 p-2"
                            placeholder="Mute reason (optional)"
                            ref={muteReasonRef}
                          ></input>
                          <div className="flex justify-between">
                            <button
                              onClick={() => setShowMuteModal(false)}
                              className="rounded-lg border-2 border-white-3 p-2 hover:bg-red hover:text-white-1"
                            >
                              Cancel
                            </button>
                            <button className="rounded-lg border-2 border-white-3 p-2 hover:bg-darkBlue-2 hover:text-white-1">
                              Mute
                            </button>
                          </div>
                        </form>
                      </div>
                      <div className="flex flex-col gap-2"></div>
                    </div>
                  </ChatModal>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInfos;
