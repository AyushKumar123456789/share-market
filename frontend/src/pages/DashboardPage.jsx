import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';
import Watchlist from '../components/Watchlist';
import Suggestions from '../components/Suggestions';

const DashboardPage = () => {
    const { auth } = useContext(AuthContext);
    const [refreshFeed, setRefreshFeed] = useState(false); 

     const handlePostCreated = () => {
      // This function will be called by CreatePost
      // Toggling the state will cause Feed to re-render and fetch new data
      setRefreshFeed(prev => !prev);
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
                       {/* Future Left Sidebar for navigation links */}
                    </aside>
                    <div className="col-span-12 lg:col-span-6">
                        <CreatePost onPostCreated={handlePostCreated} />
                        <Feed key={refreshFeed} />
                    </div>
                    <aside className="hidden lg:block lg:col-span-3">
                        <Watchlist />
                        <Suggestions />
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;