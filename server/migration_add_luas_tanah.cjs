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
    console.log('Starting Update Migration for assets_bangunan...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Add luas_tanah column
        await client.query(`ALTER TABLE assets_bangunan ADD COLUMN IF NOT EXISTS luas_tanah VARCHAR(50)`);

        // 2. Ensure everything is TEXT to avoid overflow
        // User reported error with "Sri Wibowo Sulaksono ...", likely length issue.
        const textCols = [
            'name', 'occupant_name', 'occupant_rank', 'occupant_nrp',
            'no_sip', 'alamat_detail', 'location', 'keterangan'
        ];

        for (const col of textCols) {
            try {
                await client.query(`ALTER TABLE assets_bangunan ALTER COLUMN ${col} TYPE TEXT`);
                console.log(`Converted ${col} to TEXT`);
            } catch (e) {
                console.log(`Skipping ${col}: ${e.message}`);
            }
        }

        await client.query('COMMIT');
        console.log('Update Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
