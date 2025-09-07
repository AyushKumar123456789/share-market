import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ConversationList = ({ conversations, onSelectConversation, selectedConversationId }) => {
    const { auth } = useContext(AuthContext);

    const getOtherParticipant = (participants) => {
        return participants.find(p => p._id !== auth.user._id);
    };

    return (
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
            <h2 className="text-xl font-bold p-4 border-b">Chats</h2>
            <ul className="overflow-y-auto flex-grow">
                {conversations.map(convo => {
                    const otherUser = getOtherParticipant(convo.participants);
                    return (
                        <li key={convo._id} onClick={() => onSelectConversation(convo)} className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 ${selectedConversationId === convo._id ? 'bg-indigo-50' : ''}`}>
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xl">{otherUser?.name.charAt(0)}</div>
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold truncate">{otherUser?.name}</p>
                                <p className="text-sm text-gray-500 truncate">{convo.lastMessage?.text}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
export default ConversationList;