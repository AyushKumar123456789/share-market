const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');//change file name to user.js instead of User.js
const Watchlist = require('../models/watchlist');
const { OAuth2Client } = require('google-auth-library');

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Send OTP for signup
router.post('/send-otp', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isEmailVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await sendEmail({
            to: email,
            subject: 'Your OTP for Share Market App',
            text: `Your OTP is: ${otp}`,
        });

        const hashedPassword = await bcrypt.hash(password, 12);
        const signupDetails = { name, email, password: hashedPassword, otp };

        const signupToken = jwt.sign(signupDetails, process.env.JWT_SECRET, { expiresIn: '3m' });

        res.status(200).json({ message: 'OTP sent to your email.', signupToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
});

// Verify OTP and Signup
router.post('/verify-otp', async (req, res) => {
    try {
        const { signupToken, otp } = req.body;
        if (!signupToken) {
            console.error("Verification error: Signup token not provided.");
            return res.status(400).json({ message: "Signup token not provided." });
        }

        let decoded;
        try {
            decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
        } catch (err) {
            console.error("Verification error: Invalid or expired token.", err);
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        if (decoded.otp !== otp) {
            console.error("Verification error: Invalid OTP.");
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const { name, email, password } = decoded;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
             if (existingUser.isEmailVerified) {
                console.error(`Signup attempt for existing verified user: ${email}`);
                return res.status(400).json({ message: 'User already exists' });
             }
             console.error(`Signup attempt for existing unverified user: ${email}`);
             return res.status(400).json({ message: 'An account with this email is pending verification or already exists.' });
        }

        console.log("OTP verified. Creating new user...");
        const newUser = new User({
            name,
            email,
            password,
            isEmailVerified: true,
        });

        await newUser.save();
        console.log("New user saved successfully.");
        // Create an empty watchlist for the new user
        const watchlist = new Watchlist({ user: newUser._id, stocks: [] });
        await watchlist.save();
        console.log("Watchlist created for new user.");

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({ result: newUser, token });
    } catch (error) {
        console.error("FATAL: Error during OTP verification or user creation:", error);
        res.status(500).json({ message: 'Error verifying OTP or signing up' });
    }
});

// Signup - Deprecated, but kept for reference or future use
router.post('/signup', async (req, res) => {
  return res.status(400).json({ message: "This signup route is deprecated. Please use /send-otp and /verify-otp." });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("login route is hit!");//remove it later
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Error Logging In' });
  }
});


// POST /auth/google-login

router.post('/google-login', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        // If user exists, proceed to login
        if (!user) {
            // If user doesn't exist, create a new one
            user = new User({
                googleId: ticket.getPayload().sub,
                name,
                email,
                profilePhoto: picture,
                isEmailVerified: true,
                // No password needed for Google sign-ups
            });
            await user.save();
            // Create an empty watchlist for the new user
            const watchlist = new Watchlist({ user: user._id, stocks: [] });
            await watchlist.save();
            
            
        }

        // Create OUR OWN JWT for session management
        const appToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ result: user, token: appToken });

    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ message: "Google Sign-In failed. Please try again." });
    }
});

module.exports = router;