const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const watchlistRoutes = require('./routes/watchlist');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);
app.use('/posts', postRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/users', userRoutes);
const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});