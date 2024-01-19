import React, { useState } from "react";

// Ce composant est responsable de l'affichage d'un champ de saisie et d'un bouton pour envoyer des messages.
// Il reçoit une fonction `send` en tant que prop, qui est appelée lorsque l'utilisateur clique sur le bouton d'envoi.
export default function MessageInput({
  send,
}: {
  send: (value: string) => void;
}) {
  const [value, setValue] = useState<string>("");

  return (
    <>
      <input
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tapez un message..."
        value={value}
      />
      <button style={{ color: "white" }} onClick={() => send(value)}>
        Envoyer
      </button>
    </>
  );
}
