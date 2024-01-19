import React, { useState } from 'react';

export default function MessageInput({ send }: { send: (value: string) => void }) {
	const [value, setValue] = useState<string>('')
	return (
		<>
			<input 
				onChange={(e) => setValue(e.target.value)}
				placeholder="Type a message..."
				value={value} />
			<button style={{ color: 'white' }} onClick={() => send(value)}>Send</button>
		</>
	)
}