import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export const PostAction = ({ children }) => (
    <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-150">
        {children}
    </button>
);

export const PostItem = ({ post }) => (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3 uppercase">
                {post.user?.name?.charAt(0) || 'U'}
            </div>
            <div>
                <p className="font-semibold text-gray-800">{post.user?.name || 'Anonymous'}</p>
                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
            </div>
        </div>
        <p className="text-gray-800 mb-4">{post.content}</p>
        {post.stockSymbol && (
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">
                ${post.stockSymbol}
            </span>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-around">
            <PostAction>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.734V6a2 2 0 012-2h2a2 2 0 012 2v4z"></path></svg>
                <span className="text-sm font-semibold">Like</span>
            </PostAction>
            <PostAction>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span className="text-sm font-semibold">Comment</span>
            </PostAction>
        </div>
    </div>
);

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/posts', {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                setPosts(res.data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        if (auth.token) {
            fetchPosts();
        }
    }, [auth.token]);

    if (loading) return <div className="text-center p-4">Loading feed...</div>;
    return <div>{posts.map(post => <PostItem key={post._id} post={post} />)}</div>;
};

export default Feed;