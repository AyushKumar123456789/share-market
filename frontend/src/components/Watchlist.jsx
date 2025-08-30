// File: frontend/src/components/Watchlist.jsx

import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const Watchlist = () => {
    const [stocks, setStocks] = useState([]);
    const [newStock, setNewStock] = useState('');
    const [loading, setLoading] = useState(true);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const res = await API.get('/watchlist');
                setStocks(res.data.stocks || []);
            } catch (error) {
                console.error("Failed to fetch watchlist", error);
            } finally {
                setLoading(false);
            }
        };

        if (auth.token) {
            fetchWatchlist();
        }
    }, [auth.token]);

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!newStock.trim()) return;

        try {
            const body = { stock: newStock.toUpperCase() };
            const res = await API.post('/watchlist/add', body);
            
            setStocks(res.data.stocks); // Update state with the new list from the backend
            setNewStock(''); // Clear the input
        } catch (error) {
            console.error("Failed to add stock", error);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Watchlist</h3>
            {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : (
                <ul className="space-y-3 mb-4">
                    {stocks.length > 0 ? (
                        stocks.map(stock => (
                            <li key={stock} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-700">${stock}</span>
                                {/* In a real app, you'd fetch live price data here */}
                                <span className="font-semibold text-gray-500">--.--</span>
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Your watchlist is empty.</p>
                    )}
                </ul>
            )}
            <form onSubmit={handleAddStock} className="flex space-x-2 border-t pt-4">
                <input
                    type="text"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="Add stock (e.g. MSFT)"
                    className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-transparent"
                />
                <button type="submit" className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-200 focus:outline-none transition-colors">
                    Add
                </button>
            </form>
        </div>
    );
};

export default Watchlist;