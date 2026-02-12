const pkg = require('pg');
const { Pool } = pkg;
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    try {
        console.log('Dropping old assets_pemanfaatan table...');
        await pool.query('DROP TABLE IF EXISTS assets_pemanfaatan CASCADE');

        console.log('Creating new assets_pemanfaatan table with separate objek and pemanfaatan columns...');
        await pool.query(`
            CREATE TABLE assets_pemanfaatan (
                id SERIAL PRIMARY KEY,
                objek TEXT,
                pemanfaatan TEXT,
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
        `);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
