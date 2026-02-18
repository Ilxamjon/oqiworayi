const express = require('express');
const { Subject } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.findAll();
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { price, name } = req.body;
        const subject = await Subject.findByPk(req.params.id);
        if (!subject) return res.status(404).json({ error: 'Fan topilmadi' });

        await subject.update({ price, name });
        res.json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
