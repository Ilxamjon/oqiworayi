const sequelize = require('../db');
const User = require('./User');
const Student = require('./Student');
const Subject = require('./Subject');
const Attendance = require('./Attendance');
const Payment = require('./Payment');

// Associations

// Student - Subject (Many-to-Many: O'quvchi ko'p fanga yozilishi mumkin)
const StudentSubjects = sequelize.define('StudentSubjects', {});
Student.belongsToMany(Subject, { through: StudentSubjects });
Subject.belongsToMany(Student, { through: StudentSubjects });

// Attendance
Student.hasMany(Attendance);
Attendance.belongsTo(Student);
Subject.hasMany(Attendance);
Attendance.belongsTo(Subject);

// Payment
Student.hasMany(Payment);
Payment.belongsTo(Student);

module.exports = {
    sequelize,
    User,
    Student,
    Subject,
    Attendance,
    Payment
};
