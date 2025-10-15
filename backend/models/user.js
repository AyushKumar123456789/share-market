const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Add name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  googleId: { type: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profilePhoto: { type: String, default: '' }, // <-- Added
  coverPhoto: { type: String, default: '' },   // <-- Added
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });



module.exports = mongoose.model('User', UserSchema);