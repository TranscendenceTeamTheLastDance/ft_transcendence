import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'
import Particles from '../Home/Particles';

import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

import TwoFactorFormMod from './TwoFactorForm.tsx';


const LoginSignup = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ username: '', email: '', password: '' });
	const [twoFactor, setTwoFactor] = useState(false);
	const [userMail, setUserMail] = useState('');

	const handleChange = (e) => {
		const newFormData = ({ ...formData, [e.target.name]: e.target.value });
		setFormData(newFormData)
		console.log(newFormData)
	};

	const handleSignUp = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch('http://localhost:8080/auth/signup', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		if (!response.ok) {
			throw new Error('Signup failed');
		}
		const data = await response.json();
		navigate('/home');
		console.log('Signup successful:', data); }
	catch (error) {
		console.error('Error during signup:', error); }
	};

	const handleSignIn = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch('http://localhost:8080/auth/signin', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		if (!response.ok) {
			throw new Error('Signin failed encule');
		}
		const data = await response.json();
		if (data.user.twoFactorEnabled) {
			setUserMail(data.user.email);
			setTwoFactor(true);
		} else {
		navigate('/home');}
		console.log('2FA value:', data.user.twoFactorEnabled);
		console.log('Signin successful:', data); }
	catch (error) {
		console.error('Error during signin:', error); }
	};

	const[action, setAction] = useState("Sign Up");

	const handleRedir42 = (event: React.FormEvent) => {
        event.preventDefault();
        window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fefc1c5e4c70bebd2ed7324e9922eba3a64229d2bb0de7c6842cec51f3ee8f2b&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fsignwith42&response_type=code`;
    };

	return (
	<div className ='container'>
		<Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={1000} />
		<div className='header'>
			<div className='text'>{action}</div>
			<div className='underline'></div>
		</div>
		
		<div className='inputs'>
			{/* USERNAME */}
			{action==="Login" ? <div></div>:
			<div className='input'>
				<img src={user_icon} alt='' />
				<input 
					type= "text" 
					name ="username"
					placeholder="username"
					value={formData.username}
					onChange={handleChange}
				/>
			</div>}
			{/* EMAIL INPUT */}
			<div className='input'>
				<img src={email_icon} alt='' />
				<input 
					type= 'email'
					name='email'
					placeholder='email'
					value={formData.email}
					onChange={handleChange}
				/>
			</div>
			{/* PASSWORD INPUT */}
			<div className='input'>
				<img src={password_icon} alt='' />
				<input 
					type= "password"
					name='password'
					placeholder='password'
					value={formData.password}
					onChange={handleChange}
				/>
			
			</div>
		</div>
		<div className='submit-container'>
			<div 
				className={action==="Login"?"bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2":"bg-gray-100 py-2 px-4 rounded-lg text-lg font-bold mx-2"} 
				onClick={(e) =>{setAction("Sign Up");}}
				>Sign Up</div>
			
			<div 
				className={action==="Sign Up"?"bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2":"bg-gray-100 py-2 px-4 rounded-lg text-lg font-bold mx-2"} 
				onClick={(e)=>{setAction("Login");}}
				>Login</div>	
		</div>
		<div className='submit-button'>
			<button
				className="bg-gray-500 text-white py-2 px-4 rounded-lg text-lg font-bold mx-2"
				onClick={(e) => {
					if (action === "Sign Up") {
					handleSignUp(e);
					} else {
					handleSignIn(e);
					}
				}}
				>
				Submit
			</button>
		</div>
		<div className='42button'>
			<button 
				className="42buttonsubmit" onClick={handleRedir42}
				> login with 42
			</button>
		</div>
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

export default LoginSignup