import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import Hyperspace from '../assets/hyperspace.mp4';
import animationData from '../assets/animation.json';

import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

import TwoFactorFormMod from './TwoFactorForm.tsx';
import { Toaster, toast } from 'sonner';
import Lottie, {LottieRefCurrentProps}from 'lottie-react';
import { motion } from 'framer-motion';

const LoginSignup = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ username: '', email: '', password: '' });
	const [twoFactor, setTwoFactor] = useState(false);
	const [userMail, setUserMail] = useState('');
	const phoneRef = useRef<LottieRefCurrentProps>(null);

	const handleChange = (e) => {
		const newFormData = ({ ...formData, [e.target.name]: e.target.value });
		setFormData(newFormData)
	};

	const handleSignUp = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/signup`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		const data = await response.json();
		if (!response.ok) {
			toast.error(`Signup failed: ${data.message}`);
			throw new Error('Signup failed');
		}
		navigate('/home'); }
	catch (error) {
		console.error('Error during signup:', error); }
	};

	const handleSignIn = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/auth/signin`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		const data = await response.json();
		if (!response.ok) {
			toast.error(`Login failed: ${data.message}`);
			throw new Error('Signin failed');
		}
		if (data.user.twoFactorEnabled) {
			setUserMail(data.user.email);
			setTwoFactor(true);
		} else {
		navigate('/home');}}
	catch (error) {
		console.error('Error during signin:', error); }
	};

	const[action, setAction] = useState("Sign Up");

	const handleRedir42 = (event: React.FormEvent) => {
        event.preventDefault();
        window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-fefc1c5e4c70bebd2ed7324e9922eba3a64229d2bb0de7c6842cec51f3ee8f2b&redirect_uri=http%3A%2F%2F${process.env.REACT_APP_SERVER_ADDRESS}%3A3000%2Fsignwith42&response_type=code`;
    };

	return (
	<div>
		<Toaster richColors/>
		<div className ='container'>
			{/* <Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={1000} /> */}
			<video src= {Hyperspace} autoPlay loop muted className='video'></video>
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
			<motion.div className='submit-container' whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
				{action==="Login" ? <div></div>:
				<button 
					className="logsbutton"
					onClick={(e) =>{handleSignUp(e);}}
					>Sign Up</button> }
				{action==="Sign Up" ? <div></div>:
				<button 
					className="logsbutton"
					onClick={(e)=>{handleSignIn(e);}}
					>Login</button>}
			</motion.div>
			<div className='switch-button'>
    		{action === 'Login' ? (
    		  <div>
    		    <p>You don't have any account yet?{' '}
    		      <span className='signInLink' onClick={(e) => {setAction('Sign Up');}}>
    		        Sign Up
    		      </span>
    		    </p>
    		  </div>) : (
    		  <div>
    		    <p>
    		      You already have an account?{' '}
    		      <span className='signInLink' onClick={(e) => {setAction('Login');}}>
    		        Sign In
    		      </span>
    		    </p>
    		  </div>
    		)}
  			</div>
			<motion.div className="button42" onClick={handleRedir42} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}>
				<Lottie className='animation42' onMouseOver={() => {phoneRef.current?.play()}} lottieRef={phoneRef} animationData={animationData} style={{width: '50px', height: '50px'}} />
				<button className="buttonsubmit42"> Login with 42</button>
			</motion.div>
			{twoFactor ? (
    	            <TwoFactorFormMod
    	                title="Sign-In two-factor authentication"
    	                modalID={'Signin-2FA-form'}
						mail={userMail}
    	                closeModal={() => setTwoFactor(false)}
    	            />
    	        ) : null}
		</div>
	</div>
  )
}

export default LoginSignup