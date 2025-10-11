import React, { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';

const Watchlist = () => {
    const [stocks, setStocks] = useState([]);
    const [newStock, setNewStock] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useContext(AuthContext);
    const debouncedSearchTerm = useDebounce(newStock, 300);

    const fetchStockPrices = useCallback(async (stockSymbols) => {
        if (stockSymbols.length === 0) {
            setStocks([]);
            return;
        }
        try {
            const pricePromises = stockSymbols.map(symbol =>
                API.get(`/stocks/price/${symbol}`).then(res => ({ symbol, ...res.data }))
            );
            const stocksWithPrices = await Promise.all(pricePromises);
            setStocks(stocksWithPrices);
        } catch (error) {
            console.error("Failed to fetch stock prices", error);
            setStocks(stockSymbols.map(symbol => ({ symbol, price: '--NA--', change: 0, changePercent: 0 })));
        }
    }, []);

    useEffect(() => {
        const fetchWatchlist = async () => {
            setLoading(true);
            try {
                const res = await API.get('/watchlist');
                const stockSymbols = res.data.stocks || [];
                if (stockSymbols.length > 0) {
                    await fetchStockPrices(stockSymbols);
                } else {
                    setStocks([]);
                }
            } catch (error) {
                console.error("Failed to fetch watchlist", error);
                setStocks([]);
            } finally {
                setLoading(false);
            }
        };

        if (auth.token) {
            fetchWatchlist();
        }
    }, [auth.token, fetchStockPrices]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearchTerm) {
                try {
                    const res = await API.get(`/stocks/search?q=${debouncedSearchTerm}`);
                    setSuggestions(res.data.results || []);
                } catch (error) {
                    console.error("Failed to fetch stock suggestions", error);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [debouncedSearchTerm]);

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!newStock.trim()) return;

        try {
            const body = { stock: newStock.toUpperCase() };
            const res = await API.post('/watchlist/add', body);
            await fetchStockPrices(res.data.stocks);
            setNewStock('');
            setSuggestions([]);
        } catch (error) {
            console.error("Failed to add stock", error);
        }
    };

    const handleDeleteStock = async (symbol) => {
        try {
            const res = await API.delete(`/watchlist/delete/${symbol}`);
            await fetchStockPrices(res.data.stocks);
        } catch (error) {
            console.error("Failed to delete stock", error);
        }
    };

    const handleSuggestionClick = (symbol) => {
        setNewStock(symbol);
        setSuggestions([]);
    };

    const getChangeColor = (change) => {
        if (change > 0) return 'text-green-500';
        if (change < 0) return 'text-red-500';
        return 'text-gray-500';
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
                            <li key={stock.symbol} className="flex justify-between items-center text-sm">
                                <div>
                                    <span className="font-bold text-gray-700">{stock.symbol}</span>
                                    <p className={`text-xs ${getChangeColor(stock.change)}`}>
                                        {stock.change ? stock.change.toFixed(2) : '0.00'} ({stock.changePercent ? (stock.changePercent ).toFixed(2) : '0.00'}%)
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-800 mr-4">₹{stock.price ? stock.price : 'Error fetching price'}</span>
                                    <button onClick={() => handleDeleteStock(stock.symbol)} className="text-red-500 hover:text-red-700">
                                        &times;
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Your watchlist is empty.</p>
                    )}
                </ul>
            )}
            <form onSubmit={handleAddStock} className="flex flex-col space-y-2 border-t pt-4 relative">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        placeholder="Add stock (e.g. Reliance)"
                        className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-transparent"
                        autoComplete="off"
                    />
                    <button type="submit" className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-200 focus:outline-none transition-colors">
                        Add
                    </button>
                </div>
                {suggestions.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {suggestions.map(suggestion => (
                            <li 
                                key={suggestion.symbol} 
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                                onClick={() => handleSuggestionClick(suggestion.symbol)}
                            >
                                {suggestion.symbol} - <span className="text-gray-500">{suggestion.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </form>
        </div>
    );
};

export default Watchlist;