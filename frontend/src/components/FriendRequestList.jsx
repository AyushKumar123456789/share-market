import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FriendRequestList = () => {
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
        setRequests(requests.filter(req => req._id !== senderId));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Friend Requests</h3>
            {requests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {requests.map(req => (
                        <div key={req._id} className="border rounded-lg p-4 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mb-3 flex items-center justify-center font-bold text-2xl text-gray-500">{req.name.charAt(0)}</div>
                            <Link to={`/profile/${req._id}`} className="font-bold hover:underline">{req.name}</Link>
                            <div className="flex space-x-2 mt-4 w-full">
                                <button onClick={() => handleResponse(req._id, 'accept')} className="flex-1 bg-indigo-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-indigo-600">Accept</button>
                                <button onClick={() => handleResponse(req._id, 'decline')} className="flex-1 bg-gray-200 text-gray-700 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-300">Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (<p className="text-gray-500">No pending friend requests.</p>)}
        </div>
    );
};

export default FriendRequestList;