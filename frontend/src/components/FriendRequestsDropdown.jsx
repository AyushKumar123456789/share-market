import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FriendRequestsDropdown = () => {
    const [requests, setRequests] = useState([]);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchRequests = async () => {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get('http://localhost:5000/users/friend-requests', config);
            setRequests(res.data);
        };
        if (auth.token) fetchRequests();
    }, [auth.token]);

    const handleResponse = async (senderId, action) => {
        const config = { headers: { Authorization: `Bearer ${auth.token}` } };
        await axios.post(`http://localhost:5000/users/friend-request/${action}/${senderId}`, {}, config);
        // Remove the request from the list for instant UI feedback
        setRequests(requests.filter(req => req._id !== senderId));
    };

    return (
        <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-xl p-4 z-50">
            <h4 className="font-bold text-gray-800 mb-3">Friend Requests</h4>
            {requests.length > 0 ? (
                <ul className="space-y-3">
                    {requests.map(req => (
                        <li key={req._id} className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{req.name}</span>
                            <div className="flex space-x-2">
                                <button onClick={() => handleResponse(req._id, 'accept')} className="bg-indigo-500 text-white px-2 py-1 text-xs rounded hover:bg-indigo-600">Accept</button>
                                <button onClick={() => handleResponse(req._id, 'decline')} className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded hover:bg-gray-300">Decline</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">No new requests.</p>
            )}
        </div>
    );
};

export default FriendRequestsDropdown;