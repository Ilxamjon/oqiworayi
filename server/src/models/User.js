const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'teacher'),
        allowNull: false,
        defaultValue: 'teacher',
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = User;
