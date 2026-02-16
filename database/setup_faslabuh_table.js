const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupFaslabuhTable() {
    const client = await pool.connect();
    try {
        console.log('🔄 Memulai update tabel Faslabuh...');

        // Kita drop tabel lama untuk memastikan struktur baru benar-benar bersih
        // WARNING: Ini akan menghapus data lama. Pastikan backup jika perlu.
        await client.query('DROP TABLE IF EXISTS faslabuh');
        console.log('🗑️ Tabel lama dihapus (jika ada).');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS faslabuh (
                id SERIAL PRIMARY KEY,
                
                -- Lokasi & Identitas
                lokasi VARCHAR(255),
                wilayah VARCHAR(255),
                lon DECIMAL(10, 8),
                lat DECIMAL(10, 8),
                nama_dermaga VARCHAR(255) NOT NULL,
                
                -- Dimensi & Konstruksi
                konstruksi VARCHAR(255),
                panjang_m DECIMAL(10, 2),
                lebar_m DECIMAL(10, 2),
                luas_m2 DECIMAL(12, 2), -- Calculated or Input
                draft_lwl_m DECIMAL(10, 2),
                pasut_hwl_lwl_m DECIMAL(10, 2),
                kondisi_percent INTEGER,
                
                -- Kemampuan Sandar & Kapal
                displacement_kri TEXT,
                berat_sandar_maks_ton DECIMAL(10, 2),
                tipe_kapal VARCHAR(255),
                jumlah_maks INTEGER,
                
                -- Fasilitas Darat / Plat
                kemampuan_plat_lantai_ton DECIMAL(10, 2),
                jenis_ranmor VARCHAR(255),
                berat_ranmor_ton DECIMAL(10, 2),
                
                -- Listrik
                titik_sambung_listrik INTEGER,
                kapasitas_a DECIMAL(10, 2),
                tegangan_v DECIMAL(10, 2),
                frek_hz DECIMAL(10, 2),
                sumber_listrik VARCHAR(255),
                daya_kva DECIMAL(10, 2),
                
                -- Air
                kapasitas_air_gwt_m3 DECIMAL(10, 2),
                debit_air_m3_jam DECIMAL(10, 2),
                sumber_air VARCHAR(255),
                
                -- Lainnya
                kapasitas_bbm VARCHAR(255), -- Bisa angka atau teks deskriptif
                hydrant VARCHAR(255),
                keterangan TEXT,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Constraint unik untuk mencegah duplikat nama dermaga di wilayah yang sama
                UNIQUE(nama_dermaga, wilayah)
            );
        `;

        await client.query(createTableQuery);
        console.log('✅ Tabel Faslabuh berhasil dibuat dengan 30+ kolom baru.');

    } catch (err) {
        console.error('❌ Error setup tabel:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

setupFaslabuhTable();
