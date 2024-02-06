import React from 'react';
import Chat from '../components/chat/Chat';

const ChatPage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2">
      <Chat />
    </div>
  );
};

export default ChatPage;



// // eslint-disable-next-line
// import React, { useEffect, useRef, useState } from "react";
// import io, { Socket } from "socket.io-client";
// import MessageInput from "./MessageInput";
// import Messages from "./Messages";
// import CreateChannel from "./CreateChannel";

// // Définition du composant Chat
// const Chat: React.FC = () => {
//   const [socket, setSocket] = useState<Socket>(); // Déclaration de l'état socket
//   const [messages, setMessages] = useState<string[]>([]); // Déclaration de l'état messages

//   // Fonction pour envoyer un message
//   const send = (value: string) => {
//     socket?.emit("message", value);
//   };

//   // Effect pour initialiser la connexion socket
//   useEffect(() => {
//     const newSocket = io("http://localhost:8080/chat", { withCredentials: true }); // Utilisez io() pour clarifier l'intention de connexion
//     setSocket(newSocket);

//     // Nettoyez la connexion socket lors du démontage du composant
//     return () => {
//       newSocket.disconnect();
//     };
//   }, [setSocket]);

//   // Fonction pour écouter les messages reçus
//   const messageListener = (message: string) => {
//     // Utilisez la fonction de mise à jour de l'état avec une fonction
//     setMessages((prevMessages) => [...prevMessages, message]);
//   };

//   // Effect pour écouter les messages reçus et nettoyer les listeners
//   useEffect(() => {
//     socket?.on("message", messageListener);

//     // Nettoyez les listeners lors du démontage du composant
//     return () => {
//       socket?.off("message", messageListener);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [socket]);

//   // Rendu du composant Chat
//   return (
//     <>
//       {/* Composant pour saisir et envoyer un message */}
//       <MessageInput send={send} />
//       {/* Composant pour afficher les messages */}
//       <Messages messages={messages} />
//       {/* Composant pour créer un channel */}
//       <CreateChannel />
//     </>
//   );
// };

// export default Chat;
