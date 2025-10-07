const express = require('express');
const router = express.Router();
const Watchlist = require('../models/watchlist');
const auth = require('../middleware/auth');

// Get my watchlist
router.get('/', auth, async (req, res) => {
    try {
        const watchlist = await Watchlist.findOne({ user: req.userId });
        res.json(watchlist);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Add a stock to my watchlist
router.post('/add', auth, async (req, res) => {
    const { stock } = req.body;
    try {
        const watchlist = await Watchlist.findOne({ user: req.userId });
        //If stock is already in watchlist
        console.log("userId:", req.userId);
        //First see if watchlist exists
        if (!watchlist) {
            const newWatchlist = new Watchlist({ user: req.userId, stocks: [stock.toUpperCase()] });
            await newWatchlist.save();
            return res.json(newWatchlist);
        }
        if (watchlist.stocks.includes(stock.toUpperCase())) {
            return res.status(400).json({ message: "Stock already in watchlist" });
        }
        //Add stock to watchlist
        watchlist.stocks.push(stock.toUpperCase());
        await watchlist.save();
        res.json(watchlist);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete a stock from my watchlist
router.delete('/delete/:symbol', auth, async (req, res) => {
    const { symbol } = req.params;
    try {
        const watchlist = await Watchlist.findOne({ user: req.userId });
        watchlist.stocks = watchlist.stocks.filter(s => s !== symbol.toUpperCase());
        await watchlist.save();
        res.json(watchlist);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;