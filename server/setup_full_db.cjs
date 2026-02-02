const pool = require('./db.cjs');

const setupFullDatabase = async () => {
    try {
        console.log("Starting full database setup...");

        // 1. BEKANG Table (Supplies)
        console.log("Creating/Updating 'supplies' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS supplies (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT,
                category TEXT,
                stock NUMERIC DEFAULT 0,
                unit TEXT,
                status TEXT,
                last_update DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Bekang Data if empty
        const suppliesCheck = await pool.query('SELECT COUNT(*) FROM supplies');
        if (parseInt(suppliesCheck.rows[0].count) === 0) {
            console.log("Seeding Supplies Data...");
            const suppliesValues = [
                ['Bahan Bakar Solar', 'BBM-001', 'BBM', 15000, 'Liter', 'Normal', '2026-01-28'],
                ['Oli Mesin', 'OLI-001', 'Pelumas', 500, 'Liter', 'Normal', '2026-01-27'],
                ['Air Tawar', 'AIR-001', 'Konsumsi', 8000, 'Liter', 'Normal', '2026-01-28'],
                ['Makanan Kering', 'MKN-001', 'Konsumsi', 250, 'Kg', 'Low', '2026-01-26'],
                ['Suku Cadang Mesin', 'SPR-001', 'Sparepart', 45, 'Unit', 'Normal', '2026-01-25']
            ];

            for (const row of suppliesValues) {
                await pool.query(
                    'INSERT INTO supplies (name, code, category, stock, unit, status, last_update) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    row
                );
            }
        }

        // 2. HARPAN Table (Maintenance/Assets) - KRI, KAL, KAMLA, Ranops
        console.log("Creating/Updating 'assets_harpan' table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assets_harpan (
                id SERIAL PRIMARY KEY,
                type TEXT NOT NULL,
                code TEXT,
                name TEXT NOT NULL,
                category TEXT,
                status TEXT,
                condition TEXT,
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Harpan Data if empty
        const harpanCheck = await pool.query('SELECT COUNT(*) FROM assets_harpan');
        if (parseInt(harpanCheck.rows[0].count) === 0) {
            console.log("Seeding Harpan Data...");
            const harpanValues = [
                ['KRI', '359', 'KRI Usman Harun', 'Korvet', 'Siap Operasi', 'Baik', 'Dermaga A'],
                ['KRI', '502', 'KRI Teluk Penyu', 'LST', 'Docking', 'Perbaikan Rutin', 'Docking Surabaya'],
                ['KAL', 'KAL-01', 'KAL Cobra', 'Patroli', 'Siap Operasi', 'Baik', 'Dermaga B'],
                ['KAL', 'KAL-02', 'KAL Viper', 'Patroli', 'Perbaikan', 'Rusak Ringan', 'Dermaga B'],
                ['KAMLA', 'P-001', 'Patkamla Bali', 'Patkamla', 'Siap Operasi', 'Baik', 'Posal A'],
                ['Ranops', '9001-03', 'Truk Reo Isuzu', 'Angkut Personel', 'Siap Operasi', 'Baik', 'Garasi Utama'],
                ['Ranops', '9002-03', 'Ambulance Ford', 'Medis', 'Siaga', 'Baik', 'Rumkital'],
                ['Ranops', '9003-03', 'Ford Ranger Kawal', 'Pengawalan', 'Perbaikan', 'Rusak Berat', 'Bengkel Pusat']
            ];

            for (const row of harpanValues) {
                await pool.query(
                    'INSERT INTO assets_harpan (type, code, name, category, status, condition, location) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    row
                );
            }
        }

        console.log("Full Database Setup Complete!");
        process.exit(0);

    } catch (err) {
        console.error("Database setup failed:", err);
        process.exit(1);
    }
};

setupFullDatabase();
