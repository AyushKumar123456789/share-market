const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth');
const User = require('../models/user');
const Watchlist = require('../models/watchlist');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Mock the sendEmail utility
jest.mock('../utils/sendEmail', () => jest.fn());

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

let token;

beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test-db';
  await mongoose.connect(url);
});

afterEach(async () => {
  await User.deleteMany({});
  await Watchlist.deleteMany({});
  jest.clearAllMocks(); // Clear mocks after each test
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  describe('OTP Signup Flow', () => {
    it('should send an OTP and return a signupToken', async () => {
      const res = await request(app)
        .post('/auth/send-otp')
        .send(testUser);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('signupToken');
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should verify OTP and create a new user', async () => {
      let otp;
      // Capture the OTP from the mocked email
      sendEmail.mockImplementation(async (options) => {
        otp = options.text.match(/(\d{6})/)[0];
      });

      const sendOtpRes = await request(app)
        .post('/auth/send-otp')
        .send(testUser);
      
      const { signupToken } = sendOtpRes.body;

      const verifyRes = await request(app)
        .post('/auth/verify-otp')
        .send({ signupToken, otp });

      expect(verifyRes.statusCode).toEqual(201);
      expect(verifyRes.body).toHaveProperty('token');
      token = verifyRes.body.token;

      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser.isEmailVerified).toBe(true);
    });

    it('should fail to verify with an invalid OTP', async () => {
        const sendOtpRes = await request(app)
            .post('/auth/send-otp')
            .send(testUser);
        
        const { signupToken } = sendOtpRes.body;

        const verifyRes = await request(app)
            .post('/auth/verify-otp')
            .send({ signupToken, otp: '000000' }); // Invalid OTP

        expect(verifyRes.statusCode).toEqual(400);
        expect(verifyRes.body.message).toBe('Invalid OTP');
    });

    it('should not send OTP if user is already verified', async () => {
        // First, create a verified user
        const user = new User({ ...testUser, isEmailVerified: true });
        await user.save();

        const res = await request(app)
            .post('/auth/send-otp')
            .send(testUser);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('User already exists');
        expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('Deprecated Signup', () => {
    it('should return an error for the old /signup route', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('deprecated');
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
        // Create a user to be used for login tests
        const hashedPassword = await bcrypt.hash(testUser.password, 12);
        const user = new User({
            name: testUser.name,
            email: testUser.email,
            password: hashedPassword,
            isEmailVerified: true,
        });
        await user.save();
    });

    it('should login an existing user and return a token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});