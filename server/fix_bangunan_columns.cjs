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
    console.log('Starting FIX migration for assets_bangunan...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Ensure table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets_bangunan (
                id SERIAL PRIMARY KEY,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // List of all columns that MUST exist
        const columns = [
            'name VARCHAR(255)',
            'code VARCHAR(100) UNIQUE',
            'category VARCHAR(100)',
            'luas VARCHAR(50)',
            'status VARCHAR(50)',
            'location TEXT',
            'coordinates VARCHAR(100)',
            'map_boundary TEXT',
            'area VARCHAR(100)',
            'folder_id INTEGER',
            'occupant_name VARCHAR(100)',
            'occupant_rank VARCHAR(50)',
            'occupant_nrp VARCHAR(50)',
            'occupant_title VARCHAR(100)',
            'status_penghuni VARCHAR(100)',
            'no_sip VARCHAR(100)',
            'tgl_sip VARCHAR(50)',
            'tipe_rumah VARCHAR(50)',
            'golongan VARCHAR(50)',
            'tahun_buat VARCHAR(50)',
            'asal_perolehan VARCHAR(100)',
            'mendapat_fasdin VARCHAR(50)',
            'kondisi VARCHAR(50)',
            'keterangan TEXT',
            'alamat_detail TEXT',
            'nup VARCHAR(50)',
            'kode_barang VARCHAR(50)',
            'nama_barang VARCHAR(255)',
            'source_file TEXT'
        ];

        for (const colDef of columns) {
            // Extract column name to check existence
            const colName = colDef.split(' ')[0];
            const checkCol = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='assets_bangunan' AND column_name=$1
            `, [colName]);

            if (checkCol.rows.length === 0) {
                await client.query(`ALTER TABLE assets_bangunan ADD COLUMN ${colDef}`);
                console.log(`Added missing column: ${colName}`);
            } else {
                console.log(`Column already exists: ${colName}`);
            }
        }

        // Alter existing columns to be TEXT to prevent overflow
        const alterCols = [
            'occupant_rank', 'occupant_nrp', 'occupant_title', 'status_penghuni',
            'no_sip', 'tgl_sip', 'tipe_rumah', 'golongan', 'tahun_buat',
            'asal_perolehan', 'mendapat_fasdin', 'kondisi', 'nup', 'kode_barang'
        ];

        for (const col of alterCols) {
            try {
                await client.query(`ALTER TABLE assets_bangunan ALTER COLUMN ${col} TYPE TEXT`);
                console.log(`Altered column to TEXT: ${col}`);
            } catch (e) {
                console.log(`Failed to alter ${col}:`, e.message);
            }
        }

        await client.query('COMMIT');
        console.log('FIX Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('FIX Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
