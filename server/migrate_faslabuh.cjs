const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function createFaslabuhTable() {
    try {
        console.log('🚀 Creating Faslabuh table...');

        // Read SQL file
        const sqlPath = path.join(__dirname, 'create_faslabuh_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await pool.query(sql);

        console.log('✅ Faslabuh table created successfully!');
        console.log('📋 Table structure:');
        console.log('   - Informasi Lokasi: lantamal, lanal_faslan, lokasi_dermaga');
        console.log('   - Identifikasi: nama_dermaga, jenis_dermaga');
        console.log('   - Spesifikasi Teknis: panjang, lebar, kedalaman, luas, konstruksi, tahun');
        console.log('   - Kapasitas: kapasitas_kapal, tonase_max, jumlah_tambat');
        console.log('   - Kondisi: kondisi_dermaga, kondisi_lantai, kondisi_dinding, kondisi_fender');
        console.log('   - Fasilitas: bollard, fender, tangga_kapal, lampu_dermaga');
        console.log('   - Utilitas: air_bersih, listrik, bbm, crane');
        console.log('   - Koordinat: longitude, latitude');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. Use the Excel template to import your data');
        console.log('   2. Upload Excel file through the Faslabuh page');
        console.log('   3. Data will be automatically imported to database');

    } catch (error) {
        console.error('❌ Error creating Faslabuh table:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

createFaslabuhTable();
