const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth');
const User = require('../models/user'); 
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Runs ONCE before all tests
beforeAll(async () => {
  // It's crucial to use a separate database for testing
  const url = process.env.MONGO_URI_TEST;
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Runs ONCE after all tests are finished
afterAll(async () => {
  // Clean up the database by deleting all users
  await User.deleteMany({});
  // Close the database connection
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  // Test user credentials
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
  };

  it('should signup a new user and return a token', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send(testUser);
      
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not signup an existing user', async () => {
    // This test now relies on the user created in the previous test
    const res = await request(app)
        .post('/auth/signup')
        .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User already exists');
  });

  it('should login an existing user and return a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send(testUser);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});