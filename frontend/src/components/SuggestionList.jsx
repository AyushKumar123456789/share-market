import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SuggestionList = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get('http://localhost:5000/users/suggestions', config);
            setSuggestions(res.data);
        };
        if (auth.token) fetchSuggestions();
    }, [auth.token]);

    const handleSendRequest = async (recipientId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.post(`http://localhost:5000/users/friend-request/${recipientId}`, {}, config);
            setSentRequests([...sentRequests, recipientId]);
        } catch (error) {
            console.error("Failed to send friend request", error);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Suggestions</h3>
            {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {suggestions.map(sugg => (
                        <div key={sugg.user._id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center font-bold text-2xl text-gray-500">{sugg.user.name.charAt(0)}</div>
                            <Link to={`/profile/${sugg.user._id}`} className="font-bold hover:underline">{sugg.user.name}</Link>
                            <p className="text-xs text-gray-500 mt-1">{sugg.commonStocks} common stock{sugg.commonStocks > 1 ? 's' : ''}</p>
                            <div className="mt-4 w-full">
                                <button
                                    onClick={() => handleSendRequest(sugg.user._id)}
                                    disabled={sentRequests.includes(sugg.user._id)}
                                    className="w-full bg-indigo-100 text-indigo-700 px-3 py-1.5 text-sm rounded-lg font-semibold hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                >
                                    {sentRequests.includes(sugg.user._id) ? 'Request Sent' : 'Add Friend'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (<p className="text-gray-500">No new suggestions at the moment.</p>)}
        </div>
    );
};

export default SuggestionList;
