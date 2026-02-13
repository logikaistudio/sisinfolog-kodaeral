const pool = require('./db.cjs');

async function migrate() {
    console.log('Starting migration to add sarana column to assets_diskes...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Add sarana column as JSONB
        await client.query(`
            ALTER TABLE assets_diskes 
            ADD COLUMN IF NOT EXISTS sarana JSONB DEFAULT '[]'::jsonb;
        `);
        console.log('Added column: sarana (JSONB)');

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
