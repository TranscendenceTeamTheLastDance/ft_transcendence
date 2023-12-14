import React, { useState } from 'react'
import './LoginSignup.css'

import user_icon from '../assets/person.png'
import email_icon from '../assets/email.png'
import password_icon from '../assets/password.png'

const LoginSignup = () => {

	const [formData, setFormData] = useState({ name: '', email: '', password: '' });

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
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		if (!response.ok) {
			throw new Error('Signup failed');
		}
		const data = await response.json();
		console.log('Signup successful:', data); }
	catch (error) {
		console.error('Error during signup:', error); }
	};

	const handleSignIn = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch('http://localhost:8080/auth/signin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formData),
		});
		if (!response.ok) {
			throw new Error('Signin failed');
		}
		const data = await response.json();
		console.log('Signin successful:', data); }
	catch (error) {
		console.error('Error during signin:', error); }
	};

	const[action, setAction] = useState("Sign Up");

	return (
	<div className ='container'>
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
					name ="name"
					placeholder="name"
					value={formData.name}
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
		{action==="Sign Up" ? <div></div>:
		<div className='forgot-password'>Lost Password ? <span>Click Here</span></div> }
		<div className='submit-container'>
			<div 
				className={action==="Login"?"submit grey":"submit"} 
				onClick={(e) =>{setAction("Sign Up"); handleSignUp(e);}}
				>Sign Up</div>
			
			<div 
				className={action==="Sign Up"?"submit grey":"submit"} 
				onClick={(e)=>{setAction("Login"); handleSignIn(e);}}
				>Login</div>	
		</div>`
	</div>
  )
}

export default LoginSignup