const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  stockSymbol: { type: String, uppercase: true, trim: true }, // Optional: link post to a stock
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);