const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/post');
const Comment = require('../models/comment');

// Create a Post (Protected)
router.post('/', auth, async (req, res) => {
  const { content, stockSymbol } = req.body;
  const newPost = new Post({ content, stockSymbol, user: req.userId, likes: [], commentsCount: 0 });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

// Get all Posts (for the feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name profilePhoto coverPhoto');
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Like a Post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        // Add user to likes array if not already there
        await Post.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.userId } });

        res.status(200).json({ message: "Post liked." });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Unlike a Post
router.post('/:id/unlike', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        // Remove user from likes array
        await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.userId } });

        res.status(200).json({ message: "Post unliked." });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add a comment to a Post
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required." });

        const newComment = new Comment({
            text,
            post: req.params.id,
            user: req.userId
        });

        await newComment.save();

        // Increment commentsCount in Post model
        await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
        
        // Fetch all comments for the post to return to the client
        const comments = await Comment.find({ post: req.params.id }).populate('user', 'name profilePhoto coverPhoto').sort({ createdAt: 'asc' });

        res.status(201).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all comments for a Post
router.get('/:id/comments', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id }).populate('user', 'name profilePhoto coverPhoto').sort({ createdAt: 'asc' });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;