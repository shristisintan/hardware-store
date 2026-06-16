const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function createUser() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await db.execute(
            `INSERT INTO users (name, username, password, role)
             VALUES (?, ?, ?, ?)`,
            ['Admin', 'admin', hashedPassword, 'owner']
        );

        console.log('User created successfully');
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

createUser();