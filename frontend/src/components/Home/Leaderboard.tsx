import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    status:number;
    totalPoints: number;
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
              const sortedUsers = response.data.sort((a, b) => b.totalPoints - a.totalPoints);
              setUsersList(sortedUsers);
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
        {usersList.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between py-2">
                <div className="w-12 text-center text-white">{index + 1}</div> {/* Rank with fixed width */}
                <div className="flex-grow px-4 text-white">{user.username}</div> {/* Username with padding */}
                <div className="w-24 text-center text-white">{user.totalPoints}</div> {/* Total Points with fixed width */}
                {!friendIds.includes(user.id) && userId !== user.id ? (
                    <button onClick={() => addFriend(userId, user.id)} style={{ width: '100px' /* Example fixed width */, margin: '0 4px' /* Example margins */ }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded text-xs">
                        Add Friend
                    </button>
                ) : (
                    <div style={{ width: '100px', margin: '0 4px', visibility: 'hidden' }}>Placeholder</div>
                )}
                {/* offline / online status dot */}
                <span className={`h-3 w-3 ${
                    user.status === 1 ? 'bg-green-500' : 
                    user.status === 2 ? 'bg-orange-500' : 'bg-red'
                    } rounded-full ml-4`}></span>
                </div>
             ))}
            </div>
        </div>
    );
};

export default Leaderboard;
