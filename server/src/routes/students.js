const express = require('express');
const { Student, Subject } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// GET all students
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        let options = { include: Subject };

        if (user.role === 'teacher') {
            const teacherSubjects = await Subject.findAll({ where: { TeacherId: user.id } });
            const subjectIds = teacherSubjects.map(s => s.id);

            options = {
                include: [
                    {
                        model: Subject,
                        where: { id: subjectIds }
                    }
                ]
            };
        }

        const students = await Student.findAll(options);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create student
router.post('/', async (req, res) => {
    try {
        const { fullName, grade, phone, subjectIds } = req.body;

        let username = null;
        let password = null;

        if (phone) {
            const phoneDigits = phone.replace(/\D/g, '');
            const last4 = phoneDigits.slice(-4);
            username = `student_${last4}`;

            const last6 = phoneDigits.slice(-6);
            password = last6;

            const hashedPassword = await bcrypt.hash(password, 10);

            const student = await Student.create({
                fullName,
                grade,
                phone,
                username,
                password: hashedPassword
            });

            if (subjectIds && subjectIds.length > 0) {
                const subjects = await Subject.findAll({ where: { id: subjectIds } });
                await student.addSubjects(subjects);
            }

            res.json({
                student: {
                    id: student.id,
                    fullName: student.fullName,
                    grade: student.grade,
                    phone: student.phone
                },
                credentials: {
                    username,
                    password
                }
            });
        } else {
            const student = await Student.create({ fullName, grade, phone });

            if (subjectIds && subjectIds.length > 0) {
                const subjects = await Subject.findAll({ where: { id: subjectIds } });
                await student.addSubjects(subjects);
            }

            res.json({ student });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
