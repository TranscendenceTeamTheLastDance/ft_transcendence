import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
  }

const Leaderboard = () => {

    const [usersList, setUsersList] = useState<User[]>([]); // List of all users
    const [userId, setUserId] = useState<number>([]); // User is the current user
    const [friendIds, setFriendIds] = useState<number[]>([]); // List of friend IDs

    useEffect(() => {
        const fetchUsersList = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users/all', {
                    withCredentials: true,
                });
                console.log('response:', response.data)
                setUsersList(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        const fetchFriends = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users/friends', {
                    withCredentials: true,
                });
                console.log('response:', response.data)
                setFriendIds(response.data.map(friend => friend.id));
            } catch (error) {
                console.error('Failed to fetch friends:', error);
            }
        };

        const fetchUserId = async () => {
            try {
                // We could just use the user context here
                const response = await axios.get('http://localhost:8080/users/my-id', {
                    withCredentials: true,
                });
                console.log('response:', response.data)
                setUserId(response.data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        }

        fetchUsersList();
        fetchFriends();
        fetchUserId();
    }, []); 

    const addFriend = async (userId: number, friendId: number) => {
        try {
            const response = await axios.post('http://localhost:8080/users/add-friend', {userId, friendId}, {
                withCredentials: true,
            });
            console.log('response:', response.data);
            setFriendIds(prevFriendIds => [...prevFriendIds, friendId]);
        }
        catch (error) {
            console.error('Failed to add friend:', error);
        }
    };


    return (
        <div className="overflow-auto">
            <div className="flex justify-center w-full">
                <h2 className="text-xl font-semibold text-white mb-4">👑 LEADERBOARD 👑</h2>
            </div>
            <div className="divide-y divide-gray-200">
                {usersList.map((userList, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-white">{index + 1}</span> {/* Rank */}
                        <span className="text-white flex-grow pl-4">{userList.username}</span> {/* Username */}
                        {!friendIds.includes(userList.id) && userId !== userList.id && (
                            <button onClick={() => addFriend(userId, userList.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded text-xs">
                                Add Friend
                            </button> 
                        )}
                        {/* // @@@TODO amend to online or not  */}
                        {/* // <span className={`h-3 w-3 bg-${index % 2 === 0 ? 'green' : 'red'}-500 rounded-full ml-4`}></span> Online/Offline Dot */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
