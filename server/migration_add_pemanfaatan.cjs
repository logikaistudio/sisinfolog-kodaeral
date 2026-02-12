const pool = require('./db.cjs');

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS assets_pemanfaatan (
        id SERIAL PRIMARY KEY,
        objek_pemanfaatan TEXT,
        luas TEXT,
        bentuk_pemanfaatan TEXT,
        pihak_pks TEXT,
        no_pks TEXT,
        tgl_pks TEXT,
        nilai_kompensasi TEXT,
        jangka_waktu TEXT,
        no_persetujuan TEXT,
        tgl_persetujuan TEXT,
        no_ntpn TEXT,
        tgl_ntpn TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
`;

const runMigration = async () => {
    try {
        console.log('Creating assets_pemanfaatan table...');
        await pool.query(createTableQuery);
        console.log('Table assets_pemanfaatan created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
};

runMigration();
