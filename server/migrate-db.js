const sequelize = require('./src/db');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const queryInterface = sequelize.getQueryInterface();

        // Add columns one by one
        try {
            await queryInterface.addColumn('Students', 'username', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
            console.log('Added username column');
        } catch (e) {
            console.log('Username column might already exist or error:', e.message);
        }

        try {
            await queryInterface.addColumn('Students', 'password', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
            console.log('Added password column');
        } catch (e) {
            console.log('Password column might already exist or error:', e.message);
        }

        try {
            await queryInterface.addColumn('Students', 'isActive', {
                type: 'TINYINT(1)',
                defaultValue: 1
            });
            console.log('Added isActive column');
        } catch (e) {
            console.log('IsActive column might already exist or error:', e.message);
        }

        console.log('Migration finished.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
