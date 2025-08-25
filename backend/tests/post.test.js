const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth');
const postRoutes = require('../routes/posts');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

const testUser = {
  name: 'Test User',
  email: 'testpost@example.com',
  password: 'password123',
};
let token;
let userId;
let postId;

beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST;
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

beforeEach(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  // Create user and get token
  const res = await request(app).post('/auth/signup').send(testUser);
  token = res.body.token;
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  userId = payload.id;

  // Create a post
  const postRes = await request(app)
    .post('/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'A test post', stockSymbol: 'TST' });
  postId = postRes.body._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await mongoose.connection.close();
});

describe('Post Routes', () => {
  it('should not allow a user to create a post without a token', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ content: 'This should fail' });
    expect(res.statusCode).toEqual(401);
  });

  it('should allow a logged-in user to create a post', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello from the test!', stockSymbol: 'GOOGL' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.content).toBe('Hello from the test!');
  });

  it('should get all posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('should like a post', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Post liked.');

    const post = await Post.findById(postId);
    expect(post.likes.map(id => id.toString())).toContain(userId);
  });

  it('should unlike a post', async () => {
    // First, like the post
    await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${token}`);

    // Then, unlike it
    const res = await request(app)
      .post(`/posts/${postId}/unlike`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Post unliked.');

    const post = await Post.findById(postId);
    expect(post.likes.map(id => id.toString())).not.toContain(userId);
  });

  it('should add a comment to a post', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'This is a test comment.' });
    expect(res.statusCode).toEqual(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].text).toBe('This is a test comment.');
  });

  it('should get all comments for a post', async () => {
    // Add a comment first
    await request(app)
      .post(`/posts/${postId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'This is a test comment.' });

    const res = await request(app)
      .get(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});
