
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkData() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM assets_tanah');
        console.log('Total Tanah Assets in DB:', res.rows[0].count);

        const sample = await pool.query('SELECT code, name, created_at FROM assets_tanah ORDER BY created_at DESC LIMIT 5');
        console.log('Recent entries:', sample.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
checkData();
