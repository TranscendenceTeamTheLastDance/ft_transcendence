import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import TwoFactorFormMod from './TwoFactorForm.tsx';
import Particles from '../Home/Particles';
import axios from 'axios';


const Signwith42 = () => {

	const navigate = useNavigate();
	const location = useLocation();
	const [error, setError] = useState('');

	const [twoFactor, setTwoFactor] = useState(false);
	const [userMail, setUserMail] = useState('')

	
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
					if (response.data.user.twoFactorEnabled) {
						setTwoFactor(true);
						setUserMail(response.data.user.email);
					} else {
					console.log('CONNARD');
					console.log(response.data.user);
					navigate('/home');}
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

	return (
		<div>
			<Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={1000} />
			{twoFactor ? (
                <TwoFactorFormMod
                    title="Sign-In two-factor authentication"
                    modalID={'Signin-2FA-form'}
					mail={userMail}
                    closeModal={() => setTwoFactor(false)}
                />
            ) : null}
		</div>
	)
}
export default Signwith42