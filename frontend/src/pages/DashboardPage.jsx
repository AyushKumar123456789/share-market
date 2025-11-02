import React, { useContext, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';
import Watchlist from '../components/Watchlist';
import Suggestions from '../components/Suggestions';
import ErrorBoundary from '../components/ErrorBoundary';
import FriendList from '../components/FriendList';
import API from '../api';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { auth } = useContext(AuthContext);
    const [refreshFeed, setRefreshFeed] = useState(false);
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await API.get('/users/friends');
                setFriends(res.data);
            } catch (error) {
                console.error("Failed to fetch friends", error);
            }
        };

        if (auth.token) {
            fetchFriends();
        }
    }, [auth.token]);

    const navigate = useNavigate();

    
    const handlePostCreated = () => {
      // This function will be called by CreatePost
      // Toggling the state will cause Feed to re-render and fetch new data
      setRefreshFeed(prev => !prev);
    };

    const navigateToFriendProfile = (friend) => {
        navigate(`/profile/${friend._id}`);
    };

    if (!auth.token) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <main className="container mx-auto pt-6 px-4">
                <div className="grid grid-cols-12 gap-6">
                    <aside className="hidden lg:block lg:col-span-3">
                        <ErrorBoundary>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Friends
                                        <span className="text-gray-500 font-normal ml-2">({friends.length})</span>
                                    </h2>
                                    
                                        <Link 
                                        to={`/profile/${auth.user._id}?tab=friends`} 
                                        className="text-sm text-indigo-600 hover:underline"
                                    >
                                        See All
                                    </Link>
                                    
                                </div>
                                <div className="overflow-y-auto max-h-96">
                                    <FriendList friends={friends.slice(0, 8)} onSelectFriend={navigateToFriendProfile} />
                                </div>
                            </div>
                        </ErrorBoundary>
                          
                    </aside>
                    <div className="col-span-12 lg:col-span-6">
                        <ErrorBoundary>
                            <CreatePost onPostCreated={handlePostCreated} />
                            <Feed key={refreshFeed} />
                        </ErrorBoundary>
                    </div>
                    <aside className="hidden lg:block lg:col-span-3">
                        <ErrorBoundary>
                            <Watchlist />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <Suggestions />
                        </ErrorBoundary>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;