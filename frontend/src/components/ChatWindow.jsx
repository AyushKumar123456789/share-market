// File: frontend/src/components/ChatWindow.jsx (FINAL, CORRECTED)
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const ChatWindow = ({ conversation, messages, setMessages }) => {
    const [newMessage, setNewMessage] = useState('');
    const { auth } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const messagesEndRef = useRef(null);
    
    // --- ADD A CONNECTION STATUS CHECK ---
    const isConnected = socket?.connected;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!conversation) return <div className="bg-white rounded-lg shadow h-full flex items-center justify-center text-gray-500">Select a conversation to start chatting.</div>;

    const otherUser = conversation.participants.find(p => p._id !== auth.user._id);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !isConnected) return; // Added isConnected check
        
        socket.emit('sendMessage', {
            conversationId: conversation._id,
            sender: auth.user._id,
            text: newMessage,
            recipient: otherUser._id,
        });
        
        setNewMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow h-full flex flex-col">
            <div className="p-4 border-b font-bold text-lg flex items-center gap-2">
                {otherUser.name}
                {/* --- ADD A VISUAL CONNECTION INDICATOR --- */}
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <ul className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <li key={msg._id || `msg-${index}`} className={`flex ${msg.sender === auth.user._id || msg.sender._id === auth.user._id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === auth.user._id || msg.sender._id === auth.user._id ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>
                            {msg.text}
                        </div>
                    </li>
                ))}
                <div ref={messagesEndRef} />
            </ul>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
                <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder={isConnected ? "Type a message..." : "Connecting to chat..."}
                    className="w-full bg-gray-100 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200"
                    // --- DISABLE FORM IF NOT CONNECTED ---
                    disabled={!isConnected}
                />
                <button 
                    type="submit" 
                    className="p-2 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    // --- DISABLE BUTTON IF NOT CONNECTED ---
                    disabled={!isConnected || !newMessage.trim()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5l-7.14 1.785a.75.75 0 00-.95.826l1.414 4.949a.75.75 0 00.95.826l12.228-5.435a.75.75 0 000-1.392L3.105 2.289z" /></svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;