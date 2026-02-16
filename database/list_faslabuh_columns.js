
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
WHERE table_name = 'faslabuh'
ORDER BY ordinal_position;
`;

const run = async () => {
    try {
        const res = await pool.query(checkColumnsQuery);
        console.log('--- Faslabuh Columns ---');
        res.rows.forEach(r => console.log(r.column_name));
        console.log('------------------------');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
};

run();
