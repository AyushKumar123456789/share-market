import React, { useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const CommentSection = ({ post, comments, setComments }) => {
    const [newComment, setNewComment] = useState('');
    const { auth } = useContext(AuthContext);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await API.post(`/posts/${post._id}/comment`, { text: newComment });
            setComments(res.data); // Update comments with the fresh list from the backend
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    return (
        <div className="pt-4 mt-4 border-t">
            {/* Display existing comments */}
            <div className="space-y-3 mb-4">
                {comments.map(comment => (
                    <div key={comment._id} className="flex items-start space-x-3 text-sm">
                        {comment.user.profilePhoto ? (
                            <img src={comment.user.profilePhoto} alt={comment.user.name} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold">
                                {comment.user.name.charAt(0)}
                            </div>
                        )}
                        <div className="bg-gray-100 rounded-lg p-2 flex-grow">
                            <Link to={`/profile/${comment.user._id}`} className="font-semibold hover:underline">{comment.user.name}</Link>
                            <p className="text-gray-700">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment input form with Send button */}
            <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
                {auth.user.profilePhoto ? (
                    <img src={auth.user.profilePhoto} alt={auth.user.name} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                ) : (
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white">
                        {auth.user.name.charAt(0)}
                    </div>
                )}
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-gray-100 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                    type="submit"
                    disabled={!newComment.trim()}
                    className="p-2 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.826L11.25 9.25v1.5l-7.14 1.785a.75.75 0 00-.95.826l1.414 4.949a.75.75 0 00.95.826l12.228-5.435a.75.75 0 000-1.392L3.105 2.289z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default CommentSection;