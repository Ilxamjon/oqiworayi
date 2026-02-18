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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/profile-pictures', express.static(path.join(__dirname, '../profile-pictures')));

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const studentAuthRoutes = require('./routes/student-auth');
const studentRoutes = require('./routes/students');
const subjectRoutes = require('./routes/subjects');
const attendanceRoutes = require('./routes/attendance');
const paymentRoutes = require('./routes/payments');

const { User, Subject } = require('./models');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);

// Setup & Init (Create tables & Default data)
app.get('/api/init', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { force } = req.query;

    // Only force sync if explicitly requested via query param
    await sequelize.sync({ force: force === 'true' });

    // Check if admin already exists to avoid duplicates if not forcing
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const adminPass = await bcrypt.hash('adminpassword', 10);
      const teacherPass = await bcrypt.hash('password', 10);

      await User.create({ username: 'admin', password: adminPass, role: 'admin', fullName: 'Director' });
      await User.create({ username: 'math_teacher', password: teacherPass, role: 'teacher', fullName: 'Alisher Valiyev' });
      await User.create({ username: 'eng_teacher', password: teacherPass, role: 'teacher', fullName: 'Vali Aliyev' });

      const mathTeacher = await User.findOne({ where: { username: 'math_teacher' } });
      const engTeacher = await User.findOne({ where: { username: 'eng_teacher' } });

      const subjectsExist = await Subject.findOne();
      if (!subjectsExist) {
        await Subject.create({ name: 'Matematika', price: 500000, TeacherId: mathTeacher.id });
        await Subject.create({ name: 'Ingliz Tili', price: 600000, TeacherId: engTeacher.id });
      }
    }

    res.json({ message: 'Database initialized successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // Simple sync on start, no force
    await sequelize.sync();
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});
