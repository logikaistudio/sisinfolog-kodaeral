const pool = require('./db.cjs');

const createTables = async () => {
    try {
        // Create Asset Tanah Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assets_tanah (
                id SERIAL PRIMARY KEY,
                name TEXT,
                code TEXT,
                category TEXT,
                luas TEXT,
                status TEXT,
                location TEXT,
                coordinates TEXT,
                map_boundary TEXT,
                area TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create Asset Bangunan Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assets_bangunan (
                id SERIAL PRIMARY KEY,
                name TEXT,
                code TEXT,
                category TEXT,
                luas TEXT,
                status TEXT,
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Tables created successfully.");

        // Check if data exists, if not seed it (simple check)
        const tanahCheck = await pool.query('SELECT COUNT(*) FROM assets_tanah');
        if (parseInt(tanahCheck.rows[0].count) === 0) {
            console.log("Seeding Tanah Data...");
            const tanahValues = [
                ['Lahan Dermaga A', 'TNH-001', 'Tanah Operasional', '5000 m²', 'Aktif', 'Area Utama', '-6.123, 106.123', '-', 'Jakarta Utara'],
                ['Lahan Gudang Logistik', 'TNH-002', 'Tanah Bangunan', '2500 m²', 'Aktif', 'Sektor B', '-6.124, 106.124', '-', 'Jakarta Utara'],
                ['Lahan Kosong Sektor C', 'TNH-003', 'Tanah Cadangan', '1500 m²', 'Siap Bangun', 'Sektor C', '-6.125, 106.125', '-', 'Jakarta Barat']
            ];

            for (const row of tanahValues) {
                await pool.query(
                    'INSERT INTO assets_tanah (name, code, category, luas, status, location, coordinates, map_boundary, area) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                    row
                );
            }
        }

        const bangunanCheck = await pool.query('SELECT COUNT(*) FROM assets_bangunan');
        if (parseInt(bangunanCheck.rows[0].count) === 0) {
            console.log("Seeding Bangunan Data...");
            const bangunanValues = [
                ['Gedung Markas Komando', 'BGN-001', 'Perkantoran', '1200 m²', 'Baik', 'Area Utama'],
                ['Gudang Logistik A', 'BGN-002', 'Gudang', '800 m²', 'Baik', 'Sektor B'],
                ['Pos Penjagaan Utama', 'BGN-003', 'Pos Jaga', '45 m²', 'Perlu Rehab', 'Gerbang Depan'],
                ['Mess Perwira', 'BGN-004', 'Hunian', '600 m²', 'Baik', 'Sektor A']
            ];

            for (const row of bangunanValues) {
                await pool.query(
                    'INSERT INTO assets_bangunan (name, code, category, luas, status, location) VALUES ($1, $2, $3, $4, $5, $6)',
                    row
                );
            }
        }

        console.log("Database setup complete.");
        process.exit(0);
    } catch (err) {
        console.error("Error setting up database:", err);
        process.exit(1);
    }
};

createTables();
