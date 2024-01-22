/**
 * Ce composant représente une page de création de canal.
 */
import React, { FormEvent, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChannelInfo {
	name: string;
	type: string;
	password?: string;
}

/**
 * Ce composant est une page de création de canal.
 * Il utilise React pour créer une interface utilisateur réactive.
 * Il utilise également socket.io-client pour communiquer avec le serveur de chat.
 */
const CreateChannel: React.FC = () => {
	const [channelInfo, setChannelInfo] = useState<ChannelInfo>({
		name: '',
		type: '',
		password: '',
	});

	const passwordRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);

	/**
	 * Gère la création d'un canal.
	 * @param e L'événement de soumission du formulaire.
	 */
	const handleCreateChannel = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log('Création d\'un canal', channelInfo);

		const socket: Socket = io('http://localhost:8080/chat');

		const channel: ChannelInfo = {
			name: nameRef.current?.value || '',
			type: channelInfo.type.toUpperCase(),
		};

		if (channelInfo.type === 'PROTECTED') {
			channel.password = passwordRef.current?.value;
		}

		socket.emit('create', channel );

		socket.on('create', (data: any) => {
			console.log('create', data);

		});

	};

	/**
	 * Gère le changement de valeur des champs de saisie.
	 * @param e L'événement de changement de valeur.
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setChannelInfo((prevChannelInfo) => ({
			...prevChannelInfo,
			[name]: value,
		}));
	};

	return (
		<div style={{ color: "white" }}>
			<form onSubmit={handleCreateChannel}>
				<button type="submit">Créer un canal</button>
				{/* Modal or form for entering channel information */}
				<div>
					<label>Nom du canal:</label>
					<input
						type="text"
						name="name"
						value={channelInfo.name}
						onChange={handleChange}
						className="blue-input"
						ref={nameRef}
					/>
				</div>
				<div>
					<label>Type:</label>
					<select
						name="type"
						value={channelInfo.type}
						onChange={handleChange}
						className="blue-input"
					>
						<option value="PUBLIC">PUBLIC</option>
						<option value="PROTECTED">PROTECTED</option>
						<option value="PRIVATE">PRIVATE</option>
					</select>
				</div>
				{channelInfo.type === 'PROTECTED' && (
					<div>
						<label>Mot de passe:</label>
						<input
							type="password"
							name="password"
							value={channelInfo.password}
							onChange={handleChange}
							className="blue-input"
							ref={passwordRef}
						/>
					</div>
				)}
			</form>
		</div>
	);
};

export default CreateChannel;
