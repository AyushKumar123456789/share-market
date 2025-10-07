import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user'))
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                logout();
            }
        }
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.result));
        setAuth({ token: data.token, user: data.result });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth({ token: null, user: null });
    };
    // This function allows any component to update the global user state
    const updateUser = (newUserData) => {
        setAuth(prevAuth => {
            if (!prevAuth.user) return prevAuth; // Safety check
            // Merge new data with existing user data
            const updatedUser = { ...prevAuth.user, ...newUserData };
            // Update localStorage so the change persists
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return {
                ...prevAuth,
                user: updatedUser,
            };
        });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};