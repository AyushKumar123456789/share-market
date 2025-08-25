import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';

const PostAction = ({ children, onClick }) => (
    <button onClick={onClick} className="flex-1 flex items-center justify-center space-x-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-150">
        {children}
    </button>
);

export const PostItem = ({ post, highlightedPost }) => {
    const { auth } = useContext(AuthContext);
    const [likesState, setLikesState] = useState(post.likes || []);
    const [hasLiked, setHasLiked] = useState(post.likes?.includes(auth.user._id));
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleLike = async () => {
        const newHasLiked = !hasLiked;
        setHasLiked(newHasLiked);
        if (newHasLiked) {
            setLikesState([...likesState, auth.user._id]);
        } else {
            setLikesState(likesState.filter(id => id !== auth.user._id));
        }
        try {
            const endpoint = newHasLiked ? 'like' : 'unlike';
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.post(`http://localhost:5000/posts/${post._id}/${endpoint}`, {}, config);
        } catch (error) {
            console.error("Failed to update like status", error);
            setHasLiked(!newHasLiked);
            setLikesState(post.likes || []);
        }
    };

    const toggleComments = async () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);
        if (newShowComments && comments.length === 0) {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const res = await axios.get(`http://localhost:5000/posts/${post._id}/comments`, config);
                setComments(res.data);
            } catch (error) { console.error("Failed to fetch comments", error); }
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/#post-${post._id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div id={`post-${post._id}`} className={`bg-white p-4 rounded-xl shadow mb-6 transition-all duration-1000 ${highlightedPost === post._id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
            <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3 uppercase">{post.user?.name?.charAt(0) || 'U'}</div>
                <div>
                    <Link to={`/profile/${post.user._id}`} className="font-semibold text-gray-800 hover:underline">{post.user?.name || 'Anonymous'}</Link>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <p className="text-gray-800 mb-4">{post.content}</p>
            {post.stockSymbol && (<span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-4">${post.stockSymbol}</span>)}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>{likesState.length} Likes</span>
                <span>{comments.length > 0 ? `${comments.length} Comments` : ''}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-around">
                <PostAction onClick={handleLike}>
                    <svg className={`h-5 w-5 ${hasLiked ? 'text-indigo-600' : ''}`} fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 18.734V6a2 2 0 012-2h2a2 2 0 012 2v4z"></path></svg>
                    <span className={`text-sm font-semibold ${hasLiked ? 'text-indigo-600' : ''}`}>Like</span>
                </PostAction>
                <PostAction onClick={toggleComments}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <span className="text-sm font-semibold">Comment</span>
                </PostAction>
                <PostAction onClick={handleShare}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                    <span className="text-sm font-semibold">{copied ? 'Copied!' : 'Share'}</span>
                </PostAction>
            </div>
            {showComments && <CommentSection post={post} comments={comments} setComments={setComments} />}
        </div>
    );
};

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [highlightedPost, setHighlightedPost] = useState(null);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#post-')) {
            const postId = hash.substring(6);
            setHighlightedPost(postId);
            setTimeout(() => {
                const element = document.getElementById(`post-${postId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => setHighlightedPost(null), 2500);
                }
            }, 500);
        }
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const res = await axios.get('http://localhost:5000/posts', config);
                setPosts(res.data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        if (auth.token) fetchPosts();
    }, [auth.token]);

    if (loading) return <div className="text-center p-4">Loading feed...</div>;
    return <div>{posts.map(post => <PostItem key={post._id} post={post} highlightedPost={highlightedPost} />)}</div>;
};

export default Feed;