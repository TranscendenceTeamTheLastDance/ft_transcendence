import React, { FormEvent, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

import { Channel } from './Chat';

interface CreateChannelProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>; // Fonction pour afficher ou masquer le modal
  socket: Socket; // Socket pour la communication WebSocket avec le serveur
}

const CreateChannel = ({ setShowModal, socket }: CreateChannelProps) => {
  const [channelType, setChannelType] = useState<string>('Public');
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const createChannel = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const channel: Channel = {
      name: nameRef.current?.value || '', 
      type: channelType.toUpperCase(), 
    };

    if (channelType === 'protected') {
      channel.password = passwordRef.current?.value; 
    }

    socket.emit('create', channel);
    
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white-2 p-6 shadow-xl">
      <h2 className="mb-4 text-2xl">Create a channel</h2>
      <form className="flex flex-col gap-2" onSubmit={createChannel}>
        {/* Champ de saisie pour le nom du canal */}
        <input
          pattern="[a-z0-9]+" // Motif regex autorisant uniquement les lettres minuscules et les chiffres
          title="Only lowercase letters and numbers are allowed" // Titre affiché en cas d'erreur de validation
          className="rounded-lg border-2 border-white-3 p-2"
          type="text"
          placeholder="Channel name"
          ref={nameRef} // Associe le champ de saisie à la référence nameRef
        />
        {/* Menu déroulant pour sélectionner le type de canal */}
        <select
          className="rounded-lg border-2 border-white-3 p-2"
          onChange={(e) => setChannelType(e.target.value)} // Met à jour le state channelType lorsqu'une nouvelle option est sélectionnée
        >
          <option value="public">Public</option>
          <option value="protected">Protected</option>
          <option value="private">Private</option>
        </select>
        {/* Champ de saisie pour le mot de passe du canal, visible uniquement si le canal est de type 'protected' */}
        {channelType === 'protected' && (
          <input
            className="rounded-lg border-2 border-white-3 p-2"
            type="password"
            placeholder="Password"
            ref={passwordRef} // Associe le champ de saisie à la référence passwordRef
          />
        )}

        {/* Boutons pour annuler ou créer le canal */}
        <div className="flex justify-between">
          <button
            onClick={() => setShowModal(false)} // Fonction pour masquer le modal lors du clic sur le bouton Annuler
            className="rounded-lg border-2 border-white-3 p-2 hover:bg-red hover:text-white-1"
          >
            Cancel
          </button>
          <button className="rounded-lg border-2 border-white-3 p-2 hover:bg-darkBlue-2 hover:text-white-1">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChannel;
