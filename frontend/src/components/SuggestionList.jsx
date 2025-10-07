import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SuggestionList = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchSuggestions = async () => {
            const res = await API.get('/users/suggestions');
            setSuggestions(res.data);
            const alreadySent = res.data
                .filter(s => s.friendStatus === 'request_sent')
                .map(s => s.user._id);
            setSentRequests(alreadySent);
        };
        if (auth.token) fetchSuggestions();
    }, [auth.token]);

    const handleSendRequest = async (recipientId) => {
        try {
            await API.post(`/users/friend-request/${recipientId}`);
            setSentRequests([...sentRequests, recipientId]);
        } catch (error) {
            console.error("Failed to send friend request", error);
        }
    };

    const handleAcceptRequest = async (senderId) => {
        try {
            await API.post(`/users/friend-request/accept/${senderId}`);
            setSuggestions(prev => prev.filter(s => s.user._id !== senderId));
        } catch (error) {
            console.error("Failed to accept friend request", error);
        }
    };

    const handleDeclineRequest = async (senderId) => {
        try {
            await API.post(`/users/friend-request/decline/${senderId}`);
            setSuggestions(prev => prev.filter(s => s.user._id !== senderId));
        } catch (error) {
            console.error("Failed to decline friend request", error);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Suggestions</h3>
            {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {suggestions.map(sugg => (
                        <div key={sugg.user._id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                            {sugg.user.profilePhoto ? (
                                <img src={sugg.user.profilePhoto} alt={sugg.user.name} className="w-20 h-20 rounded-full mb-3 object-cover" />
                            ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center font-bold text-2xl text-gray-500">{sugg.user.name.charAt(0)}</div>
                            )}
                            <Link to={`/profile/${sugg.user._id}`} className="font-bold hover:underline">{sugg.user.name}</Link>
                            <p className="text-xs text-gray-500 mt-1">{sugg.commonStocks} common stock{sugg.commonStocks > 1 ? 's' : ''}</p>
                            <div className="mt-4 w-full">
                                {sugg.friendStatus === 'request_received' ? (
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleAcceptRequest(sugg.user._id)} className="w-full bg-green-100 text-green-700 px-3 py-1.5 text-sm rounded-lg font-semibold hover:bg-green-200">Accept</button>
                                        <button onClick={() => handleDeclineRequest(sugg.user._id)} className="w-full bg-red-100 text-red-700 px-3 py-1.5 text-sm rounded-lg font-semibold hover:bg-red-200">Decline</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSendRequest(sugg.user._id)}
                                        disabled={sentRequests.includes(sugg.user._id)}
                                        className="w-full bg-indigo-100 text-indigo-700 px-3 py-1.5 text-sm rounded-lg font-semibold hover:bg-indigo-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    >
                                        {sentRequests.includes(sugg.user._id) ? 'Request Sent' : 'Add Friend'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (<p className="text-gray-500">No new suggestions at the moment.</p>)}
        </div>
    );
};

export default SuggestionList;
