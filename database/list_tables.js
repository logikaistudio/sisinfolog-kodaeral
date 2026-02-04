import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function listTables() {
    const client = await pool.connect();
    try {
        console.log('Listing all tables in public schema...');
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error listing tables:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

listTables();
