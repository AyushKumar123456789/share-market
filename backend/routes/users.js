const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Watchlist = require('../models/watchlist');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');
const Post = require('../models/post');


// Send a friend request
router.post('/friend-request/:recipientId', auth, async (req, res) => {
    try {
        const recipient = await User.findById(req.params.recipientId);
        if (!recipient) return res.status(404).json({ message: "User not found." });

        // Add sender to recipient's friend requests if not already there
        console.log("recipient : ", recipient);
        if (!recipient.friendRequests.includes(req.userId)) {
            recipient.friendRequests.push(req.userId);
            await recipient.save();

            // Create a notification
            const newNotification = new Notification({
                recipient: req.params.recipientId,
                sender: req.userId,
                type: 'friend_request',
            });
            await newNotification.save();
        }
        res.status(200).json({ message: "Friend request sent." });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// Accept a friend request
router.post('/friend-request/accept/:senderId', auth, async (req, res) => {
    try {
        const sender = await User.findById(req.params.senderId);
        const currentUser = await User.findById(req.userId);

        // Add each other as friends
        currentUser.friends.push(req.params.senderId);
        sender.friends.push(req.userId);

        // Remove request from current user's list
        currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== req.params.senderId);

        await currentUser.save();
        await sender.save();

        // Create notification for the sender that their request was accepted
        const newNotification = new Notification({
            recipient: req.params.senderId,
            sender: req.userId,
            type: 'request_accepted',
        });
        await newNotification.save();

        res.status(200).json({ message: "Friend request accepted." });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// Decline a friend request
router.post('/friend-request/decline/:senderId', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        // Just remove the request
        currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== req.params.senderId);
        await currentUser.save();
        res.status(200).json({ message: "Friend request declined." });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// Get friend requests for current user
router.get('/friend-requests', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('friendRequests', 'name');
        res.json(user.friendRequests);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// Search for users
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        const users = await User.find({
            name: { $regex: query, $options: 'i' },
            _id: { $ne: req.userId } // Exclude self from search results
        }).limit(10);

        res.json(users);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});


// Get Friend Suggestions
router.get('/suggestions', auth, async (req, res) => { // This method complexity is very high (O(n^2)), So need to be depricated in future.
    try {
        const currentUserWatchlist = await Watchlist.findOne({ user: req.userId });
        const currentUser = await User.findById(req.userId);

        if (!currentUserWatchlist) return res.json([]);

        // Find all other users
        const otherUsers = await User.find({ _id: { $ne: req.userId } });

        let suggestions = [];

        for (let otherUser of otherUsers) {
            // Check if they are already friends
            if (currentUser.friends.includes(otherUser._id)) continue;

            const otherUserWatchlist = await Watchlist.findOne({ user: otherUser._id });
            if (!otherUserWatchlist) continue;

            // Find common stocks
            const commonStocks = currentUserWatchlist.stocks.filter(stock => otherUserWatchlist.stocks.includes(stock));

            if (commonStocks.length > 0) {
                suggestions.push({
                    user: { _id: otherUser._id, name: otherUser.name },
                    commonStocks: commonStocks.length
                });
            }
        }

        // Sort by most common stocks
        suggestions.sort((a, b) => b.commonStocks - a.commonStocks);

        res.json(suggestions); //return all suggestions

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET A USER'S COMPLETE PROFILE
router.get('/profile/:userId', auth, async (req, res) => {
    try {
        const profileUser = await User.findById(req.params.userId).select('-password');
        if (!profileUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const posts = await Post.find({ user: req.params.userId }).sort({ createdAt: -1 }).populate('user', 'name');
        const friends = await User.findById(req.params.userId).populate('friends', 'name');
        const watchlist = await Watchlist.findOne({ user: req.params.userId });

        // Determine friend status with the logged-in user
        const currentUser = await User.findById(req.userId);
        let friendStatus = 'not_friends';
        if (currentUser.friends.includes(req.params.userId)) {
            friendStatus = 'friends';
        } else if (profileUser.friendRequests.includes(req.userId)) {
            friendStatus = 'request_sent';
        } else if (currentUser.friendRequests.includes(req.params.userId)) {
            friendStatus = 'request_received';
        }

        res.json({
            user: profileUser,
            posts,
            friends: friends.friends,
            watchlist: watchlist ? watchlist.stocks : [],
            friendStatus,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get all friends for the logged-in user
router.get('/friends', auth, async (req, res) => {
    try {
        // Find the logged-in user and populate their friends list
        const user = await User.findById(req.userId).populate('friends', 'name');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json(user.friends);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;