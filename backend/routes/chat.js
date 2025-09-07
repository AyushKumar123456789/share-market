const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

// Get all conversations for the logged-in user
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({ participants: req.userId })
            .populate('participants', 'name')
            .sort({ updatedAt: -1 });
        res.json(conversations);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// Get messages for a specific conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id })
            .populate('sender', 'name');
        res.json(messages);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

module.exports = router;