
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function dropAssetsTanah() {
    try {
        console.log('Dropping table assets_tanah...');
        await pool.query('DROP TABLE IF EXISTS assets_tanah CASCADE');
        console.log('Table assets_tanah dropped successfully.');
    } catch (e) {
        console.error('Error dropping table:', e);
    } finally {
        pool.end();
    }
}

dropAssetsTanah();
