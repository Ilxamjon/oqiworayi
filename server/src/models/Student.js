const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Student = sequelize.define('Student', {
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    grade: { // Sinf, masalan "5-A"
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = Student;
