import pool from './db.js';

const checkUsers = async () => {
    try {
        console.log('Checking USERS...');
        const users = await pool.query('SELECT * FROM users');
        console.log(`Users count: ${users.rowCount}`);
        if (users.rowCount > 0) {
            console.log('Sample user:', users.rows[0]);
        } else {
            console.log('NO USERS FOUND.');
        }

        console.log('\nChecking ROLES...');
        const roles = await pool.query('SELECT * FROM roles');
        console.log(`Roles count: ${roles.rowCount}`);
        if (roles.rowCount > 0) {
            console.log('Sample role:', roles.rows[0]);
        } else {
            console.log('NO ROLES FOUND.');
        }

    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        // We use pool directly, might hang unless ended (but it's pooled)
        // For node process, we force exit or explicitly end
        // Assuming implementation of db.js exports pool.
        process.exit(0);
    }
};

checkUsers();
