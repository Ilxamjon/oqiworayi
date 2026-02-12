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
app.use('/profile-pictures', express.static(path.join(__dirname, '../profile-pictures')));

// -----------------------------------------------------------------------------
// ROUTES (Simplistic implementation without separate files for brevity initially)
// -----------------------------------------------------------------------------

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const studentAuthRoutes = require('./routes/student-auth');
const { User, Student, Subject, Attendance, Payment } = require('./models');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student-auth', studentAuthRoutes);

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

    // Create Subjects with Teachers
    const mathTeacher = await User.findOne({ where: { username: 'math_teacher' } });
    const engTeacher = await User.findOne({ where: { username: 'eng_teacher' } });

    await Subject.create({ name: 'Matematika', price: 500000, TeacherId: mathTeacher.id });
    await Subject.create({ name: 'Ingliz Tili', price: 600000, TeacherId: engTeacher.id });

    res.json({ message: 'Database initialized successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Students CRUD
const { authenticateToken } = require('./middleware/auth');

// 2. Students CRUD
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let options = { include: Subject };

    if (user.role === 'teacher') {
      // Find subjects assigned to this teacher
      const teacherSubjects = await Subject.findAll({ where: { TeacherId: user.id } });
      const subjectIds = teacherSubjects.map(s => s.id);

      // Filter students who have at least one of these subjects
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

app.post('/api/students', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { fullName, grade, phone, subjectIds } = req.body; // subjectIds array [1, 2]

    // Telefon raqamidan login yaratish
    let username = null;
    let password = null;

    if (phone) {
      // Telefon raqamidan faqat raqamlarni olish
      const phoneDigits = phone.replace(/\D/g, '');
      // Oxirgi 4 ta raqam username uchun
      const last4 = phoneDigits.slice(-4);
      username = `student_${last4}`;

      // Oxirgi 6 ta raqam parol uchun
      const last6 = phoneDigits.slice(-6);
      password = last6;

      // Parolni hashlash
      const hashedPassword = await bcrypt.hash(password, 10);

      // O'quvchini yaratish
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

      // Login ma'lumotlarini qaytarish (faqat bir marta)
      res.json({
        student: {
          id: student.id,
          fullName: student.fullName,
          grade: student.grade,
          phone: student.phone
        },
        credentials: {
          username,
          password // Faqat bir marta ko'rsatish uchun
        }
      });
    } else {
      // Telefon raqam bo'lmasa, oddiy yaratish
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
app.listen(PORT, '0.0.0.0', async () => {
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
