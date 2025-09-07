import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.user) {
            // FIX: Hardcode the backend URL. The environment variable was not working.
            const socketUrl = "http://localhost:5000"; 
            const newSocket = io(socketUrl, {
                query: { userId: auth.user._id }
            });
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log(`✅ Socket connected: ${newSocket.id}`);
            });

            newSocket.on('disconnect', () => {
                console.log(`❌ Socket disconnected`);
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [auth.user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};