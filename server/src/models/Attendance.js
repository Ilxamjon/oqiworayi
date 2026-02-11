const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Student = require('./Student');
const Subject = require('./Subject');

const Attendance = sequelize.define('Attendance', {
    date: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('present', 'absent', 'late'),
        allowNull: false,
        defaultValue: 'present',
    },
});

// Relations defined in index.js usually, but here for clarity:
// Student.hasMany(Attendance);
// Attendance.belongsTo(Student);
// Subject.hasMany(Attendance);
// Attendance.belongsTo(Subject);

module.exports = Attendance;
