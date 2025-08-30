import React, { useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
    const { auth } = useContext(AuthContext);
    const [content, setContent] = useState('');
    const [stockSymbol, setStockSymbol] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            setError('Post content cannot be empty.');
            return;
        }

        try {
            const body = { content, stockSymbol: stockSymbol.toUpperCase() };

            await API.post('/posts', body);

            // Clear inputs and call the parent's refresh function
            setContent('');
            setStockSymbol('');
            setError('');
            onPostCreated(); // This triggers the feed to refresh

        } catch (err) {
            setError('Failed to create post. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold uppercase flex-shrink-0">
                        {auth.user?.name?.charAt(0)}
                    </div>
                    <div className="w-full">
                        <textarea
                            className="w-full border-none rounded-lg p-2 text-gray-700 bg-gray-100 focus:ring-2 focus:ring-indigo-500"
                            rows="2"
                            placeholder={`What's on your mind, ${auth.user?.name}?`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                         <div className="flex justify-between items-center mt-3">
                            <input 
                                type="text"
                                placeholder="Stock Symbol (e.g. AAPL)"
                                className="border-gray-200 rounded-lg p-2 text-sm w-1/3 bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={stockSymbol}
                                onChange={(e) => setStockSymbol(e.target.value)}
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Post
                            </button>
                        </div>
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;