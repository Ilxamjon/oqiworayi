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
        validate: {
            is: {
                args: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
                msg: 'Telefon raqam +998 XX XXX XX XX formatida bo\'lishi kerak'
            }
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
});

module.exports = Student;
