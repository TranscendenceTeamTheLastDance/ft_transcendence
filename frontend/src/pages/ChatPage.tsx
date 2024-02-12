import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import {
  User,
  Message as MessageType,
} from "../../../shared/interfaces/chat.interface";

const socket: Socket = io();

const chatPage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await authenticate();
        const userData = await response.json();

        if (response.ok) {
          setUser(userData);
        } else {
          console.error("Error fetching user data:", userData.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("chat", (e) => {
      setMessages((messages) => [e, ...messages]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat");
    };
  });
};
