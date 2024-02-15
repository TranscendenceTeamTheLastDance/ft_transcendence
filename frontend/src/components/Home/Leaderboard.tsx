import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
  }

const Leaderboard = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [friendIds, setFriendIds] = useState<number[]>([]);

    useEffect(() => {
        // Function to fetch users
        const fetchUsers = async () => {
            try {
                // Adjust the URL to match your API endpoint
                const response = await axios.get('http://localhost:8080/users/all');
                console.log('response:', response.data)
                setUsers(response.data); // Assuming the API returns an array of users
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        const fetchFriends = async () => {
            try {
                // Adjust the URL to match your API endpoint
                const response = await axios.get('http://localhost:8080/users/friends');
                console.log('response:', response.data)
                setFriendIds(response.data.map(friend => friend.id)); // Assuming the API returns an array of friends
            } catch (error) {
                console.error('Failed to fetch friends:', error);
            }
        };

        fetchUsers();
        fetchFriends();
    }, []); // Empty dependency array means this effect runs once on mount

    const addFriend = async (friendId: number) => {
        try {
            // Adjust the URL to match your API endpoint
            const response = await axios.post('http://localhost:8080/users/add-friend', {friendId});
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
                {users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-white">{index + 1}</span> {/* Rank */}
                        <span className="text-white flex-grow pl-4">{user.username}</span> {/* Username */}
                        {!friendIds.includes(user.id) && (
                            <button onClick={() => addFriend(user.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded text-xs">
                                Add Friend
                            </button> 
                        )}
                        <span className={`h-3 w-3 bg-${index % 2 === 0 ? 'green' : 'red'}-500 rounded-full ml-4`}></span> {/* Online/Offline Dot */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;