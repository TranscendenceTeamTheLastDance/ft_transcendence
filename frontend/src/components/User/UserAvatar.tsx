import React, {useRef} from 'react';
import { useUserContext } from '../../context/UserContext';


const Avatar = ({ onFileSelect }) => {
	const { user, updateUser } = useUserContext();
	const fileInputRef = useRef(null);

	const handleImageChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const img = e.target.files[0];
			const newAvatarUrl = URL.createObjectURL(img);
			updateUser({avatar: newAvatarUrl});
			onFileSelect(img);
		}
	};

	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="avatar-container">
		<img 
			 src={user.avatar} 
			 alt="User Avatar" 
			 className="w-20 h-20 object-cover rounded-full cursor-pointer mb-2" 
			 onClick={handleImageClick} 
		 />
		<input 
			 type="file" 
			 ref={fileInputRef} 
			 onChange={handleImageChange} 
			 className="hidden" 
		 />
		</div>
	);
};

export default Avatar;
