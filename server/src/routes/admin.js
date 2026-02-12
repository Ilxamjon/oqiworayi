const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Admin middleware - faqat adminlar kirishi mumkin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Ruxsat yo\'q. Faqat adminlar kirishi mumkin' });
    }
    next();
};

// Barcha o'qituvchilar ro'yxati
router.get('/teachers', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const teachers = await User.findAll({
            where: { role: 'teacher' },
            attributes: { exclude: ['password'] },
            order: [['fullName', 'ASC']]
        });

        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// O'qituvchi parolini tiklash
router.put('/reset-password/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'Yangi parol talab qilinadi' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        if (user.role !== 'teacher') {
            return res.status(400).json({ error: 'Faqat o\'qituvchilar parolini tiklash mumkin' });
        }

        // Parolni hashlash va saqlash
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({
            message: `${user.fullName} uchun parol muvaffaqiyatli tiklandi`,
            username: user.username,
            newPassword: newPassword // Faqat bir marta ko'rsatish uchun
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
