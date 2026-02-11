const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Student = require('./Student');

const Payment = sequelize.define('Payment', {
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    receiptImage: {
        type: DataTypes.STRING, // Path to image
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
});

// Student.hasMany(Payment);
// Payment.belongsTo(Student);

module.exports = Payment;
