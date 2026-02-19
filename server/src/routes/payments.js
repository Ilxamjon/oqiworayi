const express = require('express');
const { Payment, Student } = require('../models');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('receipt'), async (req, res) => {
    try {
        const { studentId, amount, paymentType } = req.body;
        const payment = await Payment.create({
            amount: parseFloat(amount),
            receiptImage: req.file ? req.file.filename : null,
            StudentId: studentId,
            paymentType: paymentType || 'online',
            status: 'pending'
        });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const payments = await Payment.findAll({ include: Student });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
