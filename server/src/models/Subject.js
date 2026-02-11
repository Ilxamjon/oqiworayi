const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Subject = sequelize.define('Subject', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
});

module.exports = Subject;
