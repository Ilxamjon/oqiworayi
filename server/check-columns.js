const sequelize = require('./src/db');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("PRAGMA table_info(Users);");
        console.log('--- Users Table Columns ---');
        results.forEach(c => console.log(c.name));

        const [sResults] = await sequelize.query("PRAGMA table_info(Students);");
        console.log('--- Students Table Columns ---');
        sResults.forEach(c => console.log(c.name));

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}
checkUsers();
