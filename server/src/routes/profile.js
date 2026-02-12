const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Profil rasmlari uchun multer konfiguratsiyasi
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../profile-pictures'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Faqat rasm fayllari (JPEG, PNG, GIF) qabul qilinadi'));
        }
    }
});

// Joriy foydalanuvchi profilini olish
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Profil ma'lumotlarini yangilash
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { fullName, username } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        // Username o'zgartirilayotgan bo'lsa, unikal ekanligini tekshirish
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ error: 'Bu foydalanuvchi nomi band' });
            }
        }

        await user.update({
            fullName: fullName || user.fullName,
            username: username || user.username
        });

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            message: 'Profil muvaffaqiyatli yangilandi',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Parolni o'zgartirish
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Eski va yangi parol talab qilinadi' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        // Eski parolni tekshirish
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Eski parol noto\'g\'ri' });
        }

        // Yangi parolni hashlash va saqlash
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Profil rasmini yuklash
router.post('/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Rasm yuklanmadi' });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        // Eski rasmni o'chirish (ixtiyoriy)
        // const fs = require('fs');
        // if (user.profilePicture) {
        //     const oldPath = path.join(__dirname, '../../profile-pictures', user.profilePicture);
        //     if (fs.existsSync(oldPath)) {
        //         fs.unlinkSync(oldPath);
        //     }
        // }

        await user.update({ profilePicture: req.file.filename });

        res.json({
            message: 'Profil rasmi muvaffaqiyatli yuklandi',
            profilePicture: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
