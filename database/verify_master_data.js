
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    const client = await pool.connect();
    try {
        console.log('🔍 Verifying Master Data Tables...');
        const tables = ['users', 'roles', 'master_categories', 'master_locations', 'master_officers', 'master_units', 'assets_harpan'];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT count(*) FROM ${table}`);
                console.log(`✅ ${table}: ${res.rows[0].count} records`);
            } catch (err) {
                console.log(`❌ ${table}: ERROR - ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

verify();
