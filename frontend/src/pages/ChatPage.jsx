import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import FriendList from '../components/FriendList';

const ChatPage = () => {
    const { auth } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);

    const [conversations, setConversations] = useState([]);
    const [friends, setFriends] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [view, setView] = useState('chats'); // 'chats' or 'friends'

    useEffect(() => {
        if (!auth.token) return;
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const [convosRes, friendsRes] = await Promise.all([
                    API.get('/chat/conversations', config),
                    API.get('/users/friends', config)
                ]);
                setConversations(convosRes.data);
                setFriends(friendsRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, [auth.token]);

    useEffect(() => {
        if (!socket) return;
        socket.on('newMessage', ({ message, conversation }) => {
            if (selectedConversation?._id === message.conversationId) {
                setMessages(prev => [...prev, message]);
            }
            setConversations(prevConvos => {
                const existingConvoIndex = prevConvos.findIndex(c => c._id === conversation._id);
                if (existingConvoIndex > -1) {
                    const updatedConvos = [...prevConvos];
                    updatedConvos[existingConvoIndex] = conversation;
                    return updatedConvos.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                }
                return [conversation, ...prevConvos];
            });
        });
        return () => socket.off('newMessage');
    }, [socket, selectedConversation]);

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        if (!conversation._id) {
            setMessages([]);
            return;
        }
        try {
            const res = await API.get(`/chat/conversations/${conversation._id}/messages`);
            setMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };
    
    const handleSelectFriend = (friend) => {
        const existingConversation = conversations.find(convo => 
            convo.participants.length === 2 && convo.participants.some(p => p._id === friend._id)
        );

        if (existingConversation) {
            handleSelectConversation(existingConversation);
        } else {
            const tempConversation = {
                participants: [auth.user, friend],
                lastMessage: { text: `Start a conversation with ${friend.name}` }
            };
            handleSelectConversation(tempConversation);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow flex container mx-auto p-4 gap-4 overflow-hidden">
                <div className="w-1/3 flex-shrink-0 flex flex-col">
                    <div className="bg-white rounded-lg shadow flex-grow flex flex-col">
                         <div className="flex border-b">
                            <button onClick={() => setView('chats')} className={`flex-1 p-3 font-semibold text-sm ${view === 'chats' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Recent Chats</button>
                            <button onClick={() => setView('friends')} className={`flex-1 p-3 font-semibold text-sm ${view === 'friends' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Friends ({friends.length})</button>
                        </div>
                        {view === 'chats' ? (
                            <ConversationList conversations={conversations} onSelectConversation={handleSelectConversation} selectedConversationId={selectedConversation?._id} />
                        ) : (
                            <FriendList friends={friends} onSelectFriend={handleSelectFriend} />
                        )}
                    </div>
                </div>
                <div className="w-2/3 flex flex-col">
                    <ChatWindow 
                        conversation={selectedConversation} 
                        messages={messages} 
                        setMessages={setMessages} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;