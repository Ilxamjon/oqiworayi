const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded receipts)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// -----------------------------------------------------------------------------
// ROUTES (Simplistic implementation without separate files for brevity initially)
// -----------------------------------------------------------------------------

const authRoutes = require('./routes/auth');
const { User, Student, Subject, Attendance, Payment } = require('./models');

app.use('/api/auth', authRoutes);

// 1. Setup & Init (Create tables & Default data)
app.get('/api/init', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    await sequelize.sync({ force: true }); // Re-create tables

    // Hash passwords
    const adminPass = await bcrypt.hash('adminpassword', 8);
    const teacherPass = await bcrypt.hash('password', 8);

    // Create Default Admin and Teachers
    await User.create({ username: 'admin', password: adminPass, role: 'admin', fullName: 'Director' });
    await User.create({ username: 'math_teacher', password: teacherPass, role: 'teacher', fullName: 'Alisher Valiyev' });
    await User.create({ username: 'eng_teacher', password: teacherPass, role: 'teacher', fullName: 'Vali Aliyev' });

    // Create Subjects
    await Subject.create({ name: 'Matematika', price: 500000 });
    await Subject.create({ name: 'Ingliz Tili', price: 600000 });

    res.json({ message: 'Database initialized successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Students CRUD
app.get('/api/students', async (req, res) => {
  const students = await Student.findAll({ include: Subject });
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  try {
    const { fullName, grade, phone, subjectIds } = req.body; // subjectIds array [1, 2]
    const student = await Student.create({ fullName, grade, phone });

    if (subjectIds && subjectIds.length > 0) {
      const subjects = await Subject.findAll({ where: { id: subjectIds } });
      await student.addSubjects(subjects);
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Subjects
app.get('/api/subjects', async (req, res) => {
  const subjects = await Subject.findAll();
  res.json(subjects);
});

app.put('/api/subjects/:id', async (req, res) => {
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

// 4. Attendance
app.post('/api/attendance', async (req, res) => {
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

app.get('/api/attendance', async (req, res) => {
  const { date, subjectId } = req.query;
  const where = {};
  if (date) where.date = date;
  if (subjectId) where.SubjectId = subjectId;

  const records = await Attendance.findAll({
    where,
    include: [Student, Subject]
  });
  res.json(records);
});

// 5. Payments (Mock Click)
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

app.post('/api/payments/upload', upload.single('receipt'), async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const payment = await Payment.create({
      amount: parseFloat(amount),
      receiptImage: req.file ? req.file.filename : null, // Save filename
      StudentId: studentId,
      status: 'pending' // Wait for admin approval
    });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payments', async (req, res) => {
  const payments = await Payment.findAll({ include: Student });
  res.json(payments);
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // Don't force sync automatically on restart, user should hit /api/init once
    await sequelize.sync();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});
