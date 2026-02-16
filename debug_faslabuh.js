require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        const res = await pool.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
            WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name='faslabuh';
        `);
        console.log('Referencing tables:', JSON.stringify(res.rows, null, 2));

        // Check sequence name
        const resSeq = await pool.query(`
            SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name LIKE '%faslabuh%';
        `);
        console.log('Sequences:', JSON.stringify(resSeq.rows, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
