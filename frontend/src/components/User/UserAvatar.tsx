import React, {useRef} from 'react';
import { useUserContext } from '../../context/UserContext';
import { Toaster, toast } from 'sonner';


const Avatar = ({ onFileSelect }) => {
	const { user, updateUser } = useUserContext();
	const fileInputRef = useRef(null);

	const handleImageChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const img = e.target.files[0];
			if (img.type === "image/jpeg" || img.type === "image/jpg" || img.type === "image/png") {
				const newAvatarUrl = URL.createObjectURL(img);
				updateUser({avatar: newAvatarUrl});
				onFileSelect(img);
			} else {
				toast.error("Incorrect file type: only .png, .jpg and .jpeg allowed.");
			}
		}
	};

	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="avatar-container">
		<Toaster richColors/>
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
