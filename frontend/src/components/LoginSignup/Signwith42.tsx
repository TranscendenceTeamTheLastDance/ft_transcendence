import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';


const Signwith42 = () => {

	const navigate = useNavigate();
	const location = useLocation();
	const [error, setError] = useState('');

	
	useEffect(() => {
		const code = new URLSearchParams(location.search).get('code');
		if (!code) 
		{
			setError('No authorization code found');
			return;
		}
		const fetchToken = async () => {
			try {
				const response = await axios.get('http://localhost:8080/auth/signin42', 
					{ params: {code}, withCredentials: true });
				if (response.data.user) {
					console.log(response.data.user);
					navigate('/home');
				}
			} catch (error: any) {
				setError(error.response?.message || 'An unknown error occurred');
			}
		};
		fetchToken();
	}, [location.search, navigate]);

	useEffect(() => {
        if (error) {
            const timeout = setTimeout(() => {
                navigate('/');
            }, 3000);

            return () => {
                clearTimeout(timeout);
            };
        }
    }, [error, navigate]);

	return <div>Sign with 42</div>;
}
export default Signwith42