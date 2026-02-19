const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        // In a real app, use bcrypt.compare here
        // But since our init script creates plain text passwords, we need to handle both cases or update init script
        // For now, let's keep it simple and check directly matching if not hashed, or create a helper
        // Since the previous code used plain text, let's check plain text first for simplicity with the init script

        // However, to do it properly, we should update the User creation to hash passwords.
        // Let's assume for this step we will check plain text if it matches, if not try bcrypt compare.

        let isMatch = await bcrypt.compare(password, user.password);

        // Agar bcrypt mos kelmasa va bazadagi parol xesh ko'rinishida bo'lmasa (migratsiya bosqichi uchun)
        if (!isMatch && !user.password.startsWith('$2')) {
            isMatch = (password === user.password);
        }

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        const jwtSecret = process.env.JWT_SECRET || 'your_fallback_secret_key_change_me';
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({ user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
