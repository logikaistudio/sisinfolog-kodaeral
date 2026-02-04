/**
 * Script untuk verifikasi lengkap struktur dan data database
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verifyComplete() {
    const client = await pool.connect();

    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔍 VERIFIKASI LENGKAP DATABASE NEON DB');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Test Connection
        const testResult = await client.query('SELECT NOW(), current_database()');
        console.log('✅ Database Connection: OK');
        console.log(`   Database: ${testResult.rows[0].current_database}`);
        console.log(`   Time: ${testResult.rows[0].now}\n`);

        // 2. List all tables
        console.log('📋 TABLES IN DATABASE:');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        tablesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.table_name}`);
        });
        console.log('');

        // 3. Verify assets_tanah structure
        console.log('🏗️  STRUKTUR TABEL assets_tanah:');
        const columnsResult = await client.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'assets_tanah' 
            ORDER BY ordinal_position
        `);

        const requiredBMNColumns = [
            'jenis_bmn', 'kode_barang', 'nup', 'nama_barang', 'kondisi',
            'luas_tanah_seluruhnya', 'tanah_yg_telah_bersertifikat',
            'tanah_yg_belum_bersertifikat', 'tanggal_perolehan', 'nilai_perolehan',
            'no_sertifikat', 'tgl_sertifikat', 'standar_satuan', 'alamat_detail',
            'kecamatan', 'kabupaten', 'provinsi', 'keterangan_bmn'
        ];

        const existingColumns = columnsResult.rows.map(r => r.column_name);

        console.log(`   Total Columns: ${columnsResult.rows.length}`);
        console.log('\n   BMN Columns Status:');
        requiredBMNColumns.forEach(col => {
            const exists = existingColumns.includes(col);
            console.log(`   ${exists ? '✅' : '❌'} ${col}`);
        });

        // 4. Count data in each table
        console.log('\n📊 DATA COUNT:');

        const countTanah = await client.query('SELECT COUNT(*) as count FROM assets_tanah');
        console.log(`   assets_tanah: ${countTanah.rows[0].count} records`);

        const countBangunan = await client.query('SELECT COUNT(*) as count FROM assets_bangunan');
        console.log(`   assets_bangunan: ${countBangunan.rows[0].count} records`);

        const countSupplies = await client.query('SELECT COUNT(*) as count FROM supplies');
        console.log(`   supplies: ${countSupplies.rows[0].count} records`);

        // 5. Sample data from assets_tanah
        if (parseInt(countTanah.rows[0].count) > 0) {
            console.log('\n📝 SAMPLE DATA (assets_tanah):');
            const sample = await client.query(`
                SELECT 
                    id, code, name, area, 
                    jenis_bmn, kode_barang, nup, kondisi, 
                    nilai_perolehan, no_sertifikat,
                    luas_tanah_seluruhnya
                FROM assets_tanah 
                LIMIT 3
            `);

            sample.rows.forEach((row, idx) => {
                console.log(`\n   Record ${idx + 1}:`);
                console.log(`   ├─ ID: ${row.id}`);
                console.log(`   ├─ Code: ${row.code || '(belum ada)'}`);
                console.log(`   ├─ Name: ${row.name?.substring(0, 40) || '(belum ada)'}...`);
                console.log(`   ├─ Area: ${row.area || '(belum ada)'}`);
                console.log(`   ├─ Jenis BMN: ${row.jenis_bmn || '(belum ada)'}`);
                console.log(`   ├─ Kode Barang: ${row.kode_barang || '(belum ada)'}`);
                console.log(`   ├─ NUP: ${row.nup || '(belum ada)'}`);
                console.log(`   ├─ Kondisi: ${row.kondisi || '(belum ada)'}`);
                console.log(`   ├─ Nilai Perolehan: ${row.nilai_perolehan ? `Rp ${row.nilai_perolehan.toLocaleString('id-ID')}` : '(belum ada)'}`);
                console.log(`   ├─ No. Sertifikat: ${row.no_sertifikat || '(belum ada)'}`);
                console.log(`   └─ Luas Tanah: ${row.luas_tanah_seluruhnya || '(belum ada)'} m²`);
            });
        }

        // 6. Check for data with BMN fields filled
        console.log('\n\n🔍 DATA BMN STATUS:');
        const bmnFilledCount = await client.query(`
            SELECT COUNT(*) as count 
            FROM assets_tanah 
            WHERE jenis_bmn IS NOT NULL 
               OR kode_barang IS NOT NULL 
               OR nup IS NOT NULL
        `);
        console.log(`   Records with BMN data: ${bmnFilledCount.rows[0].count} / ${countTanah.rows[0].count}`);

        // 7. Check indexes
        console.log('\n🔑 INDEXES:');
        const indexesResult = await client.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'assets_tanah'
        `);
        indexesResult.rows.forEach(row => {
            console.log(`   ✓ ${row.indexname}`);
        });

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ VERIFIKASI SELESAI');
        console.log('═══════════════════════════════════════════════════════\n');

        // Summary
        const allBMNColumnsExist = requiredBMNColumns.every(col => existingColumns.includes(col));

        if (allBMNColumnsExist) {
            console.log('✅ Struktur database LENGKAP - Semua kolom BMN ada');
        } else {
            console.log('⚠️  Struktur database TIDAK LENGKAP - Ada kolom BMN yang hilang');
        }

        if (parseInt(countTanah.rows[0].count) > 0) {
            console.log(`✅ Data tersedia - ${countTanah.rows[0].count} records di assets_tanah`);
        } else {
            console.log('⚠️  Tidak ada data di assets_tanah');
        }

        if (parseInt(bmnFilledCount.rows[0].count) > 0) {
            console.log(`✅ Data BMN terisi - ${bmnFilledCount.rows[0].count} records memiliki data BMN`);
        } else {
            console.log('⚠️  Belum ada data BMN yang terisi - Perlu import dari Master Asset');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyComplete();
