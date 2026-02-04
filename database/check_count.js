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

async function checkDataCount() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT COUNT(*) FROM assets_tanah');
        console.log(`Total rows in assets_tanah: ${res.rows[0].count}`);

        const folderRes = await client.query('SELECT folder_id, COUNT(*) as count FROM assets_tanah GROUP BY folder_id');
        console.log('Counts by folder:', folderRes.rows);

        const sourceRes = await client.query('SELECT source_file, COUNT(*) as count FROM assets_tanah GROUP BY source_file');
        console.log('Counts by source_file:', sourceRes.rows);

        // Check columns of a random row
        const sample = await client.query('SELECT * FROM assets_tanah LIMIT 1');
        if (sample.rows.length > 0) {
            console.log('Sample row keys:', Object.keys(sample.rows[0]));
            // console.log('Sample row data:', sample.rows[0]);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkDataCount();
