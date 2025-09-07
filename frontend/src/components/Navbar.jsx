import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import NotificationsDropdown from './NotificationsDropdown';

const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), delay); }; };

const NavIcon = ({ children }) => ( <div className="h-14 w-24 flex items-center justify-center cursor-pointer">{children}</div> );

const ProfileDropdown = ({ user, onLogout }) => {
     if (!user) {
       console.error("User data is not available for ProfileDropdown");
       return null;
    }
    return(
    <div className="absolute top-14 right-0 w-48 bg-white rounded-md shadow-xl z-50 py-1">
        <Link to={`/profile/${user._id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            View Profile
        </Link>
        <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Logout
        </button>
    </div>
    );
};

const Navbar = () => {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const dropdownRef = useRef(null);
    useClickOutside(dropdownRef, () => setOpenDropdown(null));

    useEffect(() => {
        const fetchNotifications = async () => {
            if(!auth.token) return;
            const res = await API.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        };
        fetchNotifications();
    }, [auth.token]);

    const handleNotificationsOpen = async () => {
        if (openDropdown === 'notifications') { setOpenDropdown(null); return; }
        setOpenDropdown('notifications');
        if (unreadCount > 0) {
            setUnreadCount(0);
            await API.post('/notifications/read');
        }
    };
    
    // eslint-disable-next-line
    const debouncedSearch = useCallback(debounce(async (query) => {
        if (query.trim() === '') { setSearchResults([]); return; }
        const res = await API.get(`/users/search?q=${query}`);
        setSearchResults(res.data);
    }, 300), [auth.token]);

    const onSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                    <Link to="/" className="text-2xl font-bold text-indigo-600 flex-shrink-0">S</Link>
                    <div className="relative">
                        <input type="text" placeholder="Search ShareMarket" className="bg-gray-100 rounded-full py-2 pl-4 pr-4 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={searchQuery} onChange={onSearchChange} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} />
                        {isSearchFocused && searchQuery && (
                            <div className="absolute top-12 w-full bg-white rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                <ul className="divide-y">{searchResults.map(user => (<li key={user._id}><Link to={`/profile/${user._id}`} className="block p-3 hover:bg-gray-100 font-semibold text-sm">{user.name}</Link></li>))}</ul>
                                ) : (<p className="p-3 text-sm text-gray-500">No results found.</p>)}
                            </div>
                        )}
                    </div>
                </div>
                <nav className="hidden md:flex items-center h-full">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}>
                        <NavIcon><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg></NavIcon>
                    </NavLink>
                    <NavLink to="/friends" className={({ isActive }) => isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}>
                        <NavIcon><svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></NavIcon>
                    </NavLink>
                    <NavLink to="/chat" className={({ isActive }) => isActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}>
                    <NavIcon>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </NavIcon>
                </NavLink>
                </nav>
                <div ref={dropdownRef} className="flex items-center space-x-2">
                    <div onClick={handleNotificationsOpen} className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 relative">
                        <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                        {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
                        {openDropdown === 'notifications' && <NotificationsDropdown notifications={notifications} />}
                    </div>
                    <div className="relative">
                        <div onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')} className="flex items-center space-x-2 p-1 pr-3 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold uppercase">{auth.user?.name?.charAt(0)}</div>
                            <span className="font-semibold text-sm hidden sm:block">{auth.user?.name}</span>
                        </div>
                        {openDropdown === 'profile' && <ProfileDropdown user={auth.user} onLogout={handleLogout} />}
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;