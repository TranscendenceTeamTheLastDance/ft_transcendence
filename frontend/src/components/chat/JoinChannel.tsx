import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import lock from "../assets/chat/lock.svg";

import { UserType } from "@/common/userType.interface";
import { ChannelType } from "./Chat";

interface UserListResponse {
  channel: string;
  users: UserType[];
}
interface JoinChannelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  socket: Socket;
  joinedChannels: ChannelType[];
}

const JoinChannel = ({
  setShowModal,
  socket,
  joinedChannels,
}: JoinChannelProps) => {
  const [searchChannel, setSearchChannel] = useState<string>("");
  const [isPasswordNeeded, setIsPasswordNeeded] = useState<boolean>(false);
  const [channelSelected, setChannelSelected] =
    useState<HTMLButtonElement | null>(null);
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [channelName, setChannelName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    socket.emit("channelList", (data: ChannelType[]) => {
      setChannels(data);
    });
  }, [socket]);

  const selectChannel = (
    e: React.MouseEvent<HTMLButtonElement>,
    channelType: ChannelType
  ) => {
    if (channelType.type === "PROTECTED") {
      setIsPasswordNeeded(true);
    } else {
      setIsPasswordNeeded(false);
    }

    if (e.currentTarget !== channelSelected) {
      setChannelName(e.currentTarget.firstChild?.textContent || "");
      if (channelSelected) {
        channelSelected.style.backgroundColor = "#FFFFFF";
        channelSelected.style.color = "#000000";
      }
      e.currentTarget.style.backgroundColor = "#37626D";
      e.currentTarget.style.color = "#FFFFFF";
      setChannelSelected(e.currentTarget);
    }
  };

  const handleJoinChannel = () => {
    socket.emit("join", { name: channelName, password: password });
    // TODO send notification if error
    setShowModal(false);
  };
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white-2 p-6 shadow-xl">
      <h2 className="mb-4 text-2xl">Join a channel</h2>
      <form className="flex flex-col gap-2" onSubmit={handleJoinChannel}>
        <div className="flex gap-2">
          <input
            className="rounded-lg border-2 border-white-3 p-2"
            type="text"
            placeholder="Filter channel"
            onChange={(e) => setSearchChannel(e.target.value)}
          />
          <button
            onClick={() => setShowModal(false)}
            className="rounded-lg border-2 border-white-3 p-2 hover:bg-red hover:text-white-1"
          >
            Cancel
          </button>
        </div>
        <div className="flex max-h-[300px] flex-col gap-1 overflow-x-scroll">
          {channels
            .filter((channel) =>
              channel.name.toLowerCase().includes(searchChannel.toLowerCase())
            )
            .map((channel) => {
              const joined = joinedChannels.some(
                (joinedChannel) => joinedChannel.id === channel.id
              );
              return (
                <button
                  className="flex justify-between gap-2 rounded-lg border-2 border-white-3 bg-white-1 p-2 enabled:hover:bg-darkBlue-2 enabled:hover:text-white-1 enabled:focus:bg-darkBlue-2 enabled:focus:text-white-1 disabled:cursor-not-allowed disabled:opacity-60"
                  key={channel.id}
                  disabled={joined}
                  onClick={(e) => selectChannel(e, channel)}
                  type="button"
                >
                  <div>{channel.name}</div>
                  <div className="flex">
                    {channel.type === "PROTECTED" && (
                      <img
                        className="mr-2 w-6 text-darkBlue-2"
                        src={lock}
                        alt="lock"
                      />
                    )}
                    {joined && <div className="text-darkBlue-2">Joined</div>}
                  </div>
                </button>
              );
            })}
        </div>
        <div className="flex justify-center gap-2">
          <input
            className={`rounded-lg border-2 border-white-3 p-2 ${
              isPasswordNeeded ? "" : "cursor-not-allowed"
            }`}
            type="password"
            placeholder="Password"
            required={isPasswordNeeded}
            disabled={!isPasswordNeeded}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full rounded-lg border-2 border-white-3 p-2 hover:bg-darkBlue-2 hover:text-white-1">
            Join
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinChannel;
