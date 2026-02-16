import pool from './db.js';

async function testEnsureUsersTable() {
    try {
        console.log('Testing ensureUsersTable...');

        // Create table if not exists (Simplified for test)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                role VARCHAR(50),
                status VARCHAR(20) DEFAULT 'Active',
                avatar TEXT,
                username VARCHAR(50) UNIQUE,
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Step 1 (CREATE TABLE) success');

        // Add missing columns if table already exists
        await pool.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE users ADD COLUMN password VARCHAR(255);
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
            END $$;
        `);
        console.log('Step 2 (ALTER TABLE) success');

        // Ensure default admin exists
        const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'kodaeral'");
        console.log('Step 3 (Select Admin) success. Count:', adminCheck.rowCount);

        if (adminCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO users (name, email, role, status, username, password) 
                VALUES ('Administrator', 'admin@kodaeral.com', 'Super Admin', 'Active', 'kodaeral', 'kodaeral')
            `);
            console.log('Step 4 (Insert Admin) success');
        } else {
            console.log('Step 4 (Admin exists) skipped');
        }

        return true;
    } catch (error) {
        console.error('Error ensuring users table:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

testEnsureUsersTable();
