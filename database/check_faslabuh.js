
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const checkColumnsQuery = `
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'faslabuh';
`;

const run = async () => {
    try {
        console.log('Checking faslabuh columns...');
        const res = await pool.query(checkColumnsQuery);
        console.log('Columns:', res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('❌ Error checking columns:', err);
    } finally {
        await pool.end();
    }
};

run();
