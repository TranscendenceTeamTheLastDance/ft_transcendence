import React, { useState} from 'react';
import Avatar from './UserAvatar';
import ToggleSwitch from '../2FAToggle.tsx';
import { useUserContext } from '../../context/UserContext';
import EditButton from '../EditButton.tsx';


const UserDetail = ({ label, value }) => (
  <div className="flex justify-between mb-2">
    <span className="font-bold">{label}:</span>
    <span>{value}</span>
  </div>
);

const EditableUserDetail = ({ label, value, onChange, isEditMode, editableUser }) => (
  <div className="flex justify-between mb-2">
    <span className="font-bold">{label}:</span>
    {isEditMode ? (
      <input
        type="text"
        value={editableUser[label] || '' }
        onChange={(e) => onChange(e, label)}
        className="border border-gray-300 rounded p-2"
        style={{ width: '150px', height: '30px' }}
      />
    ) : (
      <span>{value}</span>
    )}
  </div>
);

const UserInformation = ({ handle2FAToggle, handleUpdateProfile, onAvatarFileSelect }) => {
  const { user, updateUser } = useUserContext();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableUser, setEditableUser] = useState({
    username: user?.username || '', // Default to an empty string
    firstName: user?.firstName ||'', // Default to an empty string
    lastName: user?.lastName ||'', // Default to an empty string
    email: user?.email || '' , // Use the user's email as the default value
    password: user?.password || '*****', // Default to an empty string
  });

  const toggleEditMode = () => {
    if (isEditMode) {
      updateUser(editableUser)
    }
    setIsEditMode(!isEditMode); 
  };

  const handleChange = (e, field) => {
    setEditableUser({ ...editableUser, [field]: e.target.value });
  };

  const handleUpdateClick = () => {
    handleUpdateProfile(user);
  };

  return (
    <div className="bg-white w-[600px] pb-[30px] rounded-lg z-10">
      <h1 className="text-black text-2xl font-bold mx-auto mt-8 text-center">USER INFORMATION</h1>
      <div className="flex mt-8 mx-auto w-3/4">
        {/* Left side - Avatar and Nickname */}
        <div className="flex flex-col items-center justify-center w-1/4 bg-gray-100 p-4 rounded-lg mr-4">
          <Avatar onFileSelect={onAvatarFileSelect} />
        </div>

        {/* Right side - User Details */}
        <div className="w-3/4 bg-gray-100 p-4 rounded-lg">
          {isEditMode ? (
            /* Render EditableUserDetails in edit mode */
            <>
              <EditableUserDetail label="username" value={editableUser.username} onChange={handleChange} isEditMode={isEditMode} editableUser={editableUser}/>
              <EditableUserDetail label="firstName" value={editableUser.firstName} onChange={handleChange} isEditMode={isEditMode} editableUser={editableUser}/>
              <EditableUserDetail label="lastName" value={editableUser.lastName} onChange={handleChange} isEditMode={isEditMode} editableUser={editableUser}/>
              <EditableUserDetail label="email" value={editableUser.email} onChange={handleChange} isEditMode={isEditMode} editableUser={editableUser}/>
              <EditableUserDetail label="password" value={editableUser.password} onChange={handleChange} isEditMode={isEditMode} editableUser={editableUser}/>
            </>
          ) : (
            /* Render UserDetails in view mode */
            <>
              <UserDetail label="Username" value={editableUser.username} />
              <UserDetail label="First Name" value={editableUser.firstName} />
              <UserDetail label="Last Name" value={editableUser.lastName} />
              <UserDetail label="Email" value={editableUser.email} />
              <UserDetail label="Password" value="*******" />
            </>
          )}

          <div className="flex justify-between">
            <span className="font-bold">2FA:</span>
            <ToggleSwitch isOn={user.twoFactorEnabled} handleToggle={handle2FAToggle} />
          </div>
        </div>
      </div>

      {/* Update Profile Button */}
    	<div className="flex justify-center mt-4">
      {!isEditMode ? (<EditButton 
					text="Update Profile"
					onClick={handleUpdateClick} /> ) : null }
      {isEditMode ? (
        <EditButton text="✅" onClick={toggleEditMode} />	
          ) : (
        <EditButton text="✏️" onClick={toggleEditMode} />
          )}
      </div>
    </div>
  );
}

export default UserInformation;
