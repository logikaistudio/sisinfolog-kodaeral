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
    console.log('Starting migration for assets_bangunan...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create table if not exists (fallback)
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets_bangunan (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                code VARCHAR(50),
                category VARCHAR(100),
                luas VARCHAR(50),
                status VARCHAR(50),
                location TEXT,
                coordinates VARCHAR(100),
                map_boundary TEXT,
                area VARCHAR(100),
                folder_id INTEGER,
                occupant_name VARCHAR(100),
                occupant_rank VARCHAR(50),
                occupant_nrp VARCHAR(50),
                occupant_title VARCHAR(100),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Add new columns
        const columns = [
            'ADD COLUMN IF NOT EXISTS status_penghuni VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS no_sip VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS tgl_sip VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS tipe_rumah VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS golongan VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS tahun_buat VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS asal_perolehan VARCHAR(100)',
            'ADD COLUMN IF NOT EXISTS mendapat_fasdin VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS kondisi VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS keterangan TEXT',
            'ADD COLUMN IF NOT EXISTS alamat_detail TEXT',
            'ADD COLUMN IF NOT EXISTS nup VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS kode_barang VARCHAR(50)',
            'ADD COLUMN IF NOT EXISTS nama_barang VARCHAR(255)'
        ];

        for (const col of columns) {
            await client.query(`ALTER TABLE assets_bangunan ${col}`);
            console.log(`Executed: ALTER TABLE assets_bangunan ${col}`);
        }

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
