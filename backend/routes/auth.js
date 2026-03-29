import express from 'express';
import bcrypt from 'bcryptjs';   // Using bcryptjs — pure JS, no C++ build tools needed
import User from '../models/User.js';

const router = express.Router();

// ────────────────────────────────────────────────────────────────────────────
// POST /api/signup
// ────────────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('[Signup] Request received for:', email);

        // 1. Field validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // 2. Check duplicate email
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // 3. Hash password with bcryptjs (pure JS — no node-gyp / C++ required)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save user to MongoDB
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });
        await newUser.save();
        console.log('[Signup] User saved:', newUser._id);

        // 5. Return user data so frontend can auto-login immediately
        return res.status(201).json({
            message: 'User registered successfully!',
            token: 'mock-jwt-' + newUser._id,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        console.error('[Signup] Error:', error.message);
        // Mongoose duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        return res.status(500).json({ message: 'Server error during signup: ' + error.message });
    }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/login
// ────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[Login] Request received for:', email);

        // 1. Validate inputs
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 2. Check user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        console.log('[Login] Successful for:', user.email);
        return res.status(200).json({
            message: 'Login successful!',
            token: 'mock-jwt-' + user._id,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('[Login] Error:', error.message);
        return res.status(500).json({ message: 'Server error during login: ' + error.message });
    }
});

export default router;
