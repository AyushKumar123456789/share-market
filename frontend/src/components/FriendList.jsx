import React from 'react';

const FriendList = ({ friends, onSelectFriend }) => {
    return (
        <ul className="overflow-y-auto flex-grow">
            {friends.length > 0 ? friends.map(friend => (
                <li key={friend._id} onClick={() => onSelectFriend(friend)} className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-100">
                    {friend.profilePhoto ? (
                        <img src={friend.profilePhoto} alt={friend.name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl uppercase">{friend.name.charAt(0)}</div>
                    )}
                    <div className="flex-grow overflow-hidden">
                        <p className="font-semibold truncate">{friend.name}</p>
                    </div>
                </li>
            )) : (
                <p className="p-4 text-sm text-gray-500">You have no friends to chat with yet.</p>
            )}
        </ul>
    );
};

export default FriendList;
