const pg = require('pg');
const { Pool } = pg;
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    console.log('Starting Timestamp Migration for assets_bangunan...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Add created_at column
        await client.query(`ALTER TABLE assets_bangunan ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`);

        // 2. Add updated_at column
        await client.query(`ALTER TABLE assets_bangunan ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);

        await client.query('COMMIT');
        console.log('Timestamp Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
