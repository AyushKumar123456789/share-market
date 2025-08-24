import React from 'react';

const NotificationsDropdown = ({ notifications }) => {
    const getMessage = (notification) => {
        if (notification.type === 'friend_request') {
            return <><span className="font-bold">{notification.sender.name}</span> sent you a friend request.</>;
        }
        if (notification.type === 'request_accepted') {
            return <><span className="font-bold">{notification.sender.name}</span> accepted your friend request.</>;
        }
        return 'New notification.';
    };

    return (
        <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-xl z-50">
            <h4 className="font-bold text-gray-800 p-4 border-b">Notifications</h4>
            {notifications.length > 0 ? (
                <ul className="divide-y max-h-96 overflow-y-auto">
                    {notifications.map(notif => (
                        <li key={notif._id} className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-indigo-50' : ''}`}>
                            <p className="text-sm text-gray-700">{getMessage(notif)}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 p-4">No new notifications.</p>
            )}
        </div>
    );
};

export default NotificationsDropdown;