import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await API.get('/users/suggestions');
                setSuggestions(res.data);
                // Initialize sentRequests based on the status from the backend
                const alreadySent = res.data
                    .filter(s => s.friendStatus === 'request_sent')
                    .map(s => s.user._id);
                setSentRequests(alreadySent);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            }
        };

        if (auth.token) {
            fetchSuggestions();
        }
    }, [auth.token]);

    const handleSendRequest = async (recipientId) => {
        try {
            await API.post(`/users/friend-request/${recipientId}`);
            
            // Add the user ID to a list of users we've sent a request to for UI feedback
            setSentRequests(prev => [...prev, recipientId]);
        } catch (error) {
            console.error("Failed to send friend request", error);
        }
    };

    const handleAcceptRequest = async (senderId) => {
        try {
            await API.post(`/users/friend-request/accept/${senderId}`);
            // Remove the suggestion from the list
            setSuggestions(prev => prev.filter(s => s.user._id !== senderId));
        } catch (error) {
            console.error("Failed to accept friend request", error);
        }
    };

    const handleDeclineRequest = async (senderId) => {
        try {
            await API.post(`/users/friend-request/decline/${senderId}`);
            // Remove the suggestion from the list
            setSuggestions(prev => prev.filter(s => s.user._id !== senderId));
        } catch (error) {
            console.error("Failed to decline friend request", error);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Who to Follow</h3>
            {suggestions.length > 0 ? (
                <ul className="space-y-4">
                    {suggestions.map(sugg => (
                        <li key={sugg.user._id} className="flex items-center justify-between">
                            <Link to={`/profile/${sugg.user._id}`} className="flex items-center">
                                {sugg.user.profilePhoto ? (
                                    <img src={sugg.user.profilePhoto} alt={sugg.user.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center font-bold text-gray-600 uppercase">
                                        {sugg.user.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">{sugg.user.name}</p>
                                    <p className="text-xs text-gray-500">{sugg.commonStocks} common stock{sugg.commonStocks > 1 ? 's' : ''}</p>
                                </div>
                            </Link>
                            
                            {sugg.friendStatus === 'request_received' ? (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleAcceptRequest(sugg.user._id)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200">Accept</button>
                                    <button onClick={() => handleDeclineRequest(sugg.user._id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">Decline</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleSendRequest(sugg.user._id)}
                                    disabled={sentRequests.includes(sugg.user._id)}
                                    className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-200 focus:outline-none transition-colors disabled:bg-gray-200 disabled:text-gray-500"
                                >
                                    {sentRequests.includes(sugg.user._id) ? 'Sent' : 'Follow'}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No suggestions right now.</p>
            )}
        </div>
    );
};

export default Suggestions;