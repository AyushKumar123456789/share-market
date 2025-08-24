const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

// Get unread notifications for a user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .populate('sender', 'name')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// Mark notifications as read
router.post('/read', auth, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.userId, read: false }, { read: true });
        res.status(200).json({ message: "Notifications marked as read." });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

module.exports = router;