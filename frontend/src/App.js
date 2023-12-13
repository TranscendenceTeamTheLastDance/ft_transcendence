import React, { useEffect, useState } from 'react';
import axios from 'axios';

function TestComponent() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/auth/test')
             .then(response => setMessage(response.data))
             .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}

export default TestComponent;
