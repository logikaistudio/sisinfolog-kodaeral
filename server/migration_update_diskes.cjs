const pool = require('./db.cjs');

async function migrate() {
    console.log('Starting migration to add columns to assets_diskes...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Add longitude column
        await client.query(`
            ALTER TABLE assets_diskes 
            ADD COLUMN IF NOT EXISTS longitude VARCHAR(50),
            ADD COLUMN IF NOT EXISTS latitude VARCHAR(50),
            ADD COLUMN IF NOT EXISTS tahun_beroperasi VARCHAR(20),
            ADD COLUMN IF NOT EXISTS no_izin_operasional VARCHAR(100);
        `);
        console.log('Added columns: longitude, latitude, tahun_beroperasi, no_izin_operasional');

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
