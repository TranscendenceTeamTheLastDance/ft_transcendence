import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import MessageInput from "./MessageInput";
import Messages from "./Messages";

// Définition du composant Chat
const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket>(); // Déclaration de l'état socket
  const [messages, setMessages] = useState<string[]>([]); // Déclaration de l'état messages

  // Fonction pour envoyer un message
  const send = (value: string) => {
    socket?.emit("message", value);
  };

  // Effect pour initialiser la connexion socket
  useEffect(() => {
    const newSocket = io("http://localhost:8080/chat");
    setSocket(newSocket);
  }, [setSocket]);

  // Fonction pour écouter les messages reçus
  const messageListener = (message: string) => {
    setMessages([...messages, message]);
  };

  // Effect pour écouter les messages reçus et nettoyer les listeners
  useEffect(() => {
    socket?.on("message", messageListener);
    return () => {
      socket?.off("message", messageListener);
    };
  }, [messageListener]);

  // Rendu du composant Chat
  return (
    <>
      {" "}
      <MessageInput send={send} />{" "}
      {/* Composant pour saisir et envoyer un message */}
      <Messages messages={messages} />{" "}
      {/* Composant pour afficher les messages */}
    </>
  );
};

export default Chat;
