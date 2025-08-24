import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { PostItem } from '../components/Feed'; 

const ProfileHeader = ({ user, friendStatus, onFriendAction }) => {
    const renderButton = () => {
        switch (friendStatus) {
            case 'friends':
                return <button className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Friends</button>;
            case 'request_sent':
                return <button className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Request Sent</button>;
            case 'not_friends':
                return <button onClick={onFriendAction} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600">Add Friend</button>;
            default:
                return null;
        }
    };
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="relative h-48 bg-gray-200 rounded-t-lg"> {/* Cover Photo */} </div>
            <div className="flex items-end -mt-16 ml-6">
                <div className="w-32 h-32 bg-indigo-500 rounded-full border-4 border-white flex items-center justify-center text-5xl text-white font-bold">
                    {user.name.charAt(0)}
                </div>
                <div className="ml-4 flex-grow">
                    <h2 className="text-3xl font-bold">{user.name}</h2>
                </div>
                <div className="self-end mb-4"> {renderButton()} </div>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { userId } = useParams();
    const { auth } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!auth.token || !userId) return;
            try {
                setLoading(true);
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const res = await axios.get(`http://localhost:5000/users/profile/${userId}`, config);
                setProfileData(res.data);
            } catch (error) { console.error("Failed to fetch profile", error); } 
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [auth.token, userId]);

    const handleFriendAction = async () => {
        if (!auth.token || !userId) return;
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.post(`http://localhost:5000/users/friend-request/${userId}`, {}, config);
            setProfileData(prevData => ({ ...prevData, friendStatus: 'request_sent' }));
        } catch (error) {
            console.error("Failed to send friend request", error);
        }
    };

    if (loading || !profileData) return <div className="min-h-screen bg-slate-100"><Navbar /><div className="text-center mt-20">Loading...</div></div>;

    const { user, posts, friends, watchlist } = profileData;

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <div className="container mx-auto p-4 mt-4 max-w-4xl">
                <ProfileHeader user={user} friendStatus={profileData.friendStatus} onFriendAction={handleFriendAction} />
                
                <div className="bg-white rounded-lg shadow-md mt-6 p-4">
                    <div className="flex border-b">
                        <button onClick={() => setActiveTab('posts')} className={`py-2 px-4 font-semibold ${activeTab === 'posts' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 rounded-t-lg'}`}>Posts</button>
                        <button onClick={() => setActiveTab('friends')} className={`py-2 px-4 font-semibold ${activeTab === 'friends' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 rounded-t-lg'}`}>Friends</button>
                        <button onClick={() => setActiveTab('watchlist')} className={`py-2 px-4 font-semibold ${activeTab === 'watchlist' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 rounded-t-lg'}`}>Watchlist</button>
                    </div>

                    <div className="mt-4">
                        {activeTab === 'posts' && (
                            <div>
                                {posts.length > 0 ? posts.map(post => <PostItem key={post._id} post={post} />) : <p className="text-gray-500">No posts yet.</p>}
                            </div>
                        )}
                        {activeTab === 'friends' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {friends.map(friend => (
                                    <div key={friend._id} className="text-center border rounded-lg p-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-2xl">{friend.name.charAt(0)}</div>
                                        <Link to={`/profile/${friend._id}`} className="font-semibold hover:underline">{friend.name}</Link>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'watchlist' && (
                            <ul className="space-y-2">
                                {watchlist.map(stock => (
                                    <li key={stock} className="font-semibold p-2 bg-gray-100 rounded">${stock}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;