import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testQuery() {
    try {
        console.log('Testing Faslabuh query...');
        const result = await pool.query(`
            SELECT 
                f.*,
                a.jenis_bmn,
                a.nup,
                a.nama_barang as asset_nama_barang,
                a.kondisi as asset_kondisi,
                a.no_sertifikat as asset_no_sertifikat,
                a.tanggal_perolehan as asset_tanggal_perolehan,
                a.nilai_perolehan as asset_nilai_perolehan
            FROM faslabuh f
            LEFT JOIN assets_tanah a ON f.kode_barang = a.kode_barang
            ORDER BY f.created_at DESC
        `);
        console.log('Query successful! Rows:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('First row sample:', result.rows[0]);
        }
    } catch (err) {
        console.error('Query failed:', err.message);
        if (err.hint) console.error('Hint:', err.hint);
        if (err.position) console.error('Position:', err.position);
    } finally {
        await pool.end();
    }
}

testQuery();
