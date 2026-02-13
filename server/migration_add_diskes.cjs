const pool = require('./db.cjs');

async function migrate() {
    console.log('Starting migration for DisKes tables...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create assets_diskes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets_diskes (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100),
                location TEXT,
                capacity VARCHAR(100),
                staff INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Operasional',
                description TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Created assets_diskes table.');

        // Insert initial mock data if table is empty
        const res = await client.query('SELECT count(*) FROM assets_diskes');
        if (parseInt(res.rows[0].count) === 0) {
            console.log('Seeding initial data for assets_diskes...');
            await client.query(`
                INSERT INTO assets_diskes (name, type, location, capacity, staff, status) VALUES 
                ('Rumah Sakit TNI AL Dr. Mintohardjo', 'Rumah Sakit', 'Bendungan Hilir', '300 Bed', 450, 'Operasional'),
                ('Balai Pengobatan Kodaeral', 'Balai Pengobatan', 'Kodaeral 3', '10 Bed', 15, 'Operasional'),
                ('Poliklinik Gigi', 'Klinik Spesialis', 'Gedung B', '5 Kursi', 8, 'Renovasi');
            `);
        }

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
