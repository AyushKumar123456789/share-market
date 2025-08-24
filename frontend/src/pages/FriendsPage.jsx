// File: frontend/src/pages/FriendsPage.jsx

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
// We will create these two new components below
import FriendRequestList from '../components/FriendRequestList';
import SuggestionList from '../components/SuggestionList';

const FriendsPage = () => {
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'suggestions'

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <div className="container mx-auto p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Left Sidebar for Navigation */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4">Friends</h2>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => setActiveTab('requests')} className={`w-full text-left p-2 rounded-md font-semibold ${activeTab === 'requests' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}>
                                        Friend Requests
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => setActiveTab('suggestions')} className={`w-full text-left p-2 rounded-md font-semibold ${activeTab === 'suggestions' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}>
                                        Suggestions
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="md:col-span-3">
                        {activeTab === 'requests' && <FriendRequestList />}
                        {activeTab === 'suggestions' && <SuggestionList />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendsPage;