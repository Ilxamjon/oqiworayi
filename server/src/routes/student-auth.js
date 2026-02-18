const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, Subject } = require('../models');

const router = express.Router();

// O'quvchi login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Login va parol talab qilinadi' });
        }

        const student = await Student.findOne({
            where: { username },
            include: Subject
        });

        if (!student) {
            return res.status(400).json({ error: 'Login yoki parol noto\'g\'ri' });
        }

        if (!student.isActive) {
            return res.status(403).json({ error: 'Hisobingiz faol emas. Administratorga murojaat qiling' });
        }

        // Parolni tekshirish
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Login yoki parol noto\'g\'ri' });
        }

        // Token yaratish
        const jwtSecret = process.env.JWT_SECRET || 'your_fallback_secret_key_change_me';
        const token = jwt.sign(
            {
                id: student.id,
                username: student.username,
                role: 'student',
                fullName: student.fullName
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({
            user: {
                id: student.id,
                username: student.username,
                role: 'student',
                fullName: student.fullName,
                grade: student.grade,
                phone: student.phone
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
