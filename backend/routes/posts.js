const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const auth = require('../middleware/auth');

// Create a Post (Protected)
router.post('/', auth, async (req, res) => {
  const { content, stockSymbol } = req.body;
  const newPost = new Post({ content, stockSymbol, user: req.userId });

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
    const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;