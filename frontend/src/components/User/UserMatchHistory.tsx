import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import axios from 'axios';

const MatchHistory = () => {
    const [matches, setMatches] = useState([]);
    const { user } = useUserContext();

    useEffect(() => {
        const fetchUserMatchHistory = async () => {
            try {
                const response = await axios.get(`http://${process.env.REACT_APP_SERVER_ADDRESS}:8080/users/match-history`, {
                    withCredentials: true,
                });
                setMatches(response.data);
            } catch (error) {
                console.error("Failed to fetch match history:", error);
            }
        };

        if (user) {
            fetchUserMatchHistory();
        }
    }, [user]);

    return (
        <div className="mt-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 w-full overflow-auto">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">MATCH HISTORY</h2>
            <table className="w-full text-white">
                <thead>
                    <tr className="border-b border-white">
                        <th className="px-4 py-2 text-left">GAME</th>
                        <th className="px-4 py-2 text-left">OPPONENT</th>
                        <th className="px-4 py-2 text-center">SCORE</th>
                        <th className="px-4 py-2 text-center">STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((match, index) => (
                        <tr key={index} className="even:bg-white even:bg-opacity-10 odd:bg-opacity-0">
                            <td className="px-4 py-2 text-left">{index + 1}</td>
                            <td className="px-4 py-2 text-left">{match.opponentUsername}</td> 
                            <td className="px-4 py-2 text-center">{`${match.userScore} - ${match.opponentScore}`}</td>
                            <td className="px-4 py-2 text-center">
                                {match.userScore > match.opponentScore ? "🏅" : "😭"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
};

export default MatchHistory;
