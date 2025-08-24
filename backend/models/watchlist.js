const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  stocks: [{ type: String, uppercase: true, trim: true }],
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);