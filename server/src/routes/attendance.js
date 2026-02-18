const express = require('express');
const { Attendance, Student, Subject } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { studentId, subjectId, date, status } = req.body;
        const attendance = await Attendance.create({
            StudentId: studentId,
            SubjectId: subjectId,
            date,
            status
        });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { date, subjectId } = req.query;
        const where = {};
        if (date) where.date = date;
        if (subjectId) where.SubjectId = subjectId;

        const records = await Attendance.findAll({
            where,
            include: [Student, Subject]
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
