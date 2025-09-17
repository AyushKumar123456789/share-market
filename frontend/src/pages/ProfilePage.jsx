import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { PostItem } from '../components/Feed'; 
import Watchlist from '../components/Watchlist';

const ProfileHeader = ({ user, friendStatus, onFriendAction, isOwnProfile }) => {
    const renderButton = () => {
        if (isOwnProfile) return null;
        switch (friendStatus) {
            case 'friends':
                return <button className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Friends</button>;
            case 'request_sent':
                return <button className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Request Sent</button>;
            case 'request_received':
                return <button onClick={onFriendAction} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 cursor-pointer">Accept Request</button>;
            case 'not_friends':
                return <button onClick={onFriendAction} className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 cursor-pointer">Add Friend</button>;
            default:
                return null;
        }
    };
    return (
        <div className="bg-white rounded-lg shadow-md p-4 relative ">
            <div className="relative h-48 bg-gray-200 rounded-t-lg"> {/* Cover Photo */} </div>
            <div className="flex items-end -mt-16 ml-6 relative ">
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

const OtherUserWatchlist = ({ symbols }) => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-500';
        if (change < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const fetchStockPrices = useCallback(async (stockSymbols) => {
        if (stockSymbols.length === 0) {
            setStocks([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const pricePromises = stockSymbols.map(symbol =>
                API.get(`/stocks/price/${symbol}`).then(res => ({ symbol, ...res.data }))
            );
            const stocksWithPrices = await Promise.all(pricePromises);
            setStocks(stocksWithPrices);
        } catch (error) {
            console.error("Failed to fetch stock prices", error);
            setStocks(stockSymbols.map(symbol => ({ symbol, price: '--.--', change: 0, changePercent: 0 })));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStockPrices(symbols);
    }, [symbols, fetchStockPrices]);

    if (loading) return <p className="text-sm text-gray-500">Loading watchlist...</p>;

    return (
        <ul className="space-y-3">
            {stocks.length > 0 ? (
                stocks.map(stock => (
                    <li key={stock.symbol} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                        <div>
                            <span className="font-bold text-gray-700">{stock.symbol}</span>
                            <p className={`text-xs ${getChangeColor(stock.change)}`}>
                                {stock.change ? stock.change.toFixed(2) : '0.00'} ({stock.changePercent ? (stock.changePercent * 100).toFixed(2) : '0.00'}%)
                            </p>
                        </div>
                        <span className="font-semibold text-gray-800">${stock.price ? stock.price.toFixed(2) : '--.--'}</span>
                    </li>
                ))
            ) : (
                <p className="text-sm text-gray-500">This user's watchlist is empty.</p>
            )}
        </ul>
    );
};


const ProfilePage = () => {
    const { userId } = useParams();
    const { auth } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const isOwnProfile = auth.user?._id === userId;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!auth.token || !userId) return;
            try {
                setLoading(true);
                const res = await API.get(`/users/profile/${userId}`);
                setProfileData(res.data);
            } catch (error) { console.error("Failed to fetch profile", error); } 
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [auth.token, userId]);

    const handleFriendAction = async () => {
        if (!auth.token || !userId) return;
        try {
            await API.post(`/users/friend-request/${userId}`);
            // After sending a request, the status will be 'request_sent'
            // If we were accepting a request, the status would become 'friends'
            const newStatus = profileData.friendStatus === 'request_received' ? 'friends' : 'request_sent';
            setProfileData(prevData => ({ ...prevData, friendStatus: newStatus }));
        } catch (error) {
            console.error("Failed to send/accept friend request", error);
        }
    };

    if (loading || !profileData) return <div className="min-h-screen bg-slate-100"><Navbar /><div className="text-center mt-20">Loading...</div></div>;

    const { user, posts, friends, watchlist } = profileData;

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <div className="container mx-auto p-4 mt-4 max-w-4xl">
                <ProfileHeader user={user} friendStatus={profileData.friendStatus} onFriendAction={handleFriendAction} isOwnProfile={isOwnProfile} />
                
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
                            isOwnProfile ? <Watchlist /> : <OtherUserWatchlist symbols={watchlist} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;