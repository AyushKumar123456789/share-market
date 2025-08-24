import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import FriendRequestsDropdown from './FriendRequestsDropdown';
import NotificationsDropdown from './NotificationsDropdown';

// Debounce function to limit API calls
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const Navbar = () => {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [openDropdown, setOpenDropdown] = useState(null); // 'friends', 'notifications', or null
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const dropdownRef = useRef(null);
    useClickOutside(dropdownRef, () => setOpenDropdown(null));

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const res = await axios.get('http://localhost:5000/notifications', config);
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.read).length);
            } catch (error) { console.error("Could not fetch notifications", error); }
        };
        if (auth.token) fetchNotifications();
    }, [auth.token]);

    const handleNotificationsOpen = async () => {
        if (openDropdown === 'notifications') {
            setOpenDropdown(null);
            return;
        }
        setOpenDropdown('notifications');
        if (unreadCount > 0) {
            // Optimistically update UI
            const newNotifications = notifications.map(n => ({...n, read: true}));
            setNotifications(newNotifications);
            setUnreadCount(0);
            
            // Update backend
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.post('http://localhost:5000/notifications/read', {}, config);
        }
    };

    const handleSearch = async (query) => {
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`http://localhost:5000/users/search?q=${query}`, config);
            setSearchResults(res.data);
        } catch (error) {
            console.error("Search failed", error);
        }
    };
    
    // eslint-disable-next-line
    const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

    const onSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center h-16">
                {/* Left Section */}
                <div className="flex items-center space-x-2">
                    <Link to="/" className="text-2xl font-bold text-indigo-600 flex-shrink-0">S</Link>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search StockFolio" 
                            className="bg-gray-100 rounded-full py-2 pl-4 pr-4 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={onSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} // Delay to allow click on results
                        />
                        {isSearchFocused && searchResults.length > 0 && (
                            <div className="absolute top-12 w-full bg-white rounded-lg shadow-xl z-50">
                                <ul className="divide-y">
                                    {searchResults.map(user => (
                                        <li key={user._id} className="p-3 hover:bg-gray-100 cursor-pointer">
                                            <Link to={`/profile/${user._id}`} className="font-semibold text-sm">{user.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Section */}
                <div ref={dropdownRef} className="flex items-center space-x-2 relative">
                    <div onClick={() => setOpenDropdown(openDropdown === 'friends' ? null : 'friends')} className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 relative">
                        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        {openDropdown === 'friends' && <FriendRequestsDropdown />}
                    </div>

                    <div onClick={handleNotificationsOpen} className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 relative">
                        <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                        {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
                        {openDropdown === 'notifications' && <NotificationsDropdown notifications={notifications} />}
                    </div>
                    
                    <div onClick={handleLogout} className="flex items-center space-x-2 p-1 pr-3 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
                            {auth.user?.name?.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm hidden sm:block">{auth.user?.name}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;