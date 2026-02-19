const { sequelize } = require('./src/models');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync with alter to add missing columns
        await sequelize.sync({ alter: true });
        console.log('Database synchronized (alter: true).');

        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err.message);
        process.exit(1);
    }
}

fix();
