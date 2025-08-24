const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth');
const postRoutes = require('../routes/posts');
const User = require('../models/user');
const watchlist = require('../models/watchlist');
const post = require('../models/post');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);


const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

let token;
// Runs ONCE before all tests
beforeAll(async () => {
  // It's crucial to use a separate database for testing
  const url = process.env.MONGO_URI_TEST;
  await mongoose.connect(url);
});

// Runs before each test
beforeEach(async () => {
  // Clean up the database by deleting all users
  await User.deleteMany({});
});

// Runs ONCE after all tests are finished
afterAll(async () => {0
  // Close the database connection
  await User.deleteMany({});
  await watchlist.deleteMany({});
  await post.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  it('should signup a new user and return a token', async () => {
    const res = await request(app)
    .post('/auth/signup')
    .send(testUser);
    token = res.body.token; // Save the token
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });
  
  it('should not signup an existing user', async () => {
    await request(app).post('/auth/signup').send(testUser);
    // This test now relies on the user created in the previous test
    const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User already exists');
  });
  
  it('should login an existing user and return a token', async () => {
    await request(app).post('/auth/signup').send(testUser);
    const res = await request(app)
      .post('/auth/login')
      .send({email: testUser.email, password: testUser.password});

    token = res.body.token;
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});

//test for creating post
describe('Post Routes', () => {
    beforeEach(async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send(testUser);
        token = res.body.token;
    });

    it('should not allow a user to create a post without a token', async () => {
        const res = await request(app)
            .post('/posts')
            .send({ content: 'This should fail' });
        expect(res.statusCode).toEqual(401);
    });

    it('should allow a logged-in user to create a post', async () => {
        const res = await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`) // Use the saved token
            .send({ content: 'Hello from the test!', stockSymbol: 'GOOGL' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.content).toBe('Hello from the test!');
    });
});