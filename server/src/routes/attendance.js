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

const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { date, subjectId } = req.query;
        let where = {};
        if (date) where.date = date;
        if (subjectId) where.SubjectId = subjectId;

        // If teacher, further restrict by their owned subjects
        if (user.role === 'teacher') {
            const teacherSubjects = await Subject.findAll({ where: { TeacherId: user.id } });
            const teacherSubjectIds = teacherSubjects.map(s => s.id);

            if (subjectId) {
                if (!teacherSubjectIds.includes(parseInt(subjectId))) {
                    return res.json([]); // Requesting subject they don't own
                }
            } else {
                where.SubjectId = teacherSubjectIds;
            }
        }

        const records = await Attendance.findAll({
            where,
            include: [Student, Subject]
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET attendance for a specific student
router.get('/student/:id', async (req, res) => {
    try {
        const records = await Attendance.findAll({
            where: { StudentId: req.params.id },
            include: [Subject],
            order: [['date', 'DESC']]
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
