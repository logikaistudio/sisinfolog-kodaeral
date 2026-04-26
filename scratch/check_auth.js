
import pool from '../api/db.js';

async function check() {
    try {
        console.log("--- USERS ---");
        const users = await pool.query("SELECT id, username, role FROM users");
        console.table(users.rows);

        console.log("\n--- ROLES ---");
        const roles = await pool.query("SELECT id, name, permissions FROM roles");
        console.table(roles.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
