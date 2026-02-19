const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { User, Student } = require('../models');
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
        let user;
        if (req.user.role === 'student') {
            user = await Student.findByPk(req.user.id, {
                attributes: { exclude: ['password'] }
            });
        } else {
            user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password'] }
            });
        }

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        res.json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Profil ma'lumotlarini yangilash
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { fullName, username } = req.body;
        let user;
        let Model = req.user.role === 'student' ? Student : User;

        user = await Model.findByPk(req.user.id);

        if (!user) {
            console.error(`User not found for ID: ${req.user.id}, Role: ${req.user.role}`);
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        console.log(`Updating profile for ${req.user.role}: ${user.username}`);

        // Username o'zgartirilayotgan bo'lsa, unikal ekanligini tekshirish
        if (username && username !== user.username) {
            const existingInSame = await Model.findOne({ where: { username } });
            if (existingInSame) {
                return res.status(400).json({ error: 'Bu foydalanuvchi nomi band' });
            }
        }

        await user.update({
            fullName: fullName || user.fullName,
            username: username || user.username
        });

        const updatedUser = await Model.findByPk(user.id, {
            attributes: { exclude: ['password'] }
        });

        console.log(`Profile updated successfully for: ${updatedUser.username}`);

        res.json({
            message: 'Profil muvaffaqiyatli yangilandi',
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile update error details:', error);
        res.status(500).json({ error: error.message || 'Server xatoligi' });
    }
});

// Parolni o'zgartirish
router.put('/password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        let Model = req.user.role === 'student' ? Student : User;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Eski va yangi parol talab qilinadi' });
        }

        const user = await Model.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Eski parol noto\'g\'ri' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Profil rasmini yuklash
router.post('/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Rasm yuklanmadi' });
        }

        let Model = req.user.role === 'student' ? Student : User;
        const user = await Model.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

        await user.update({ profilePicture: req.file.filename });

        res.json({
            message: 'Profil rasmi muvaffaqiyatli yuklandi',
            profilePicture: req.file.filename
        });
    } catch (error) {
        console.error('Picture upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
