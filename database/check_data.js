/**
 * Script untuk check data di database
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkData() {
    const client = await pool.connect();

    try {
        console.log('📊 Checking database data...\n');

        // Count assets_tanah
        const countTanah = await client.query('SELECT COUNT(*) as count FROM assets_tanah');
        console.log(`📍 assets_tanah: ${countTanah.rows[0].count} records`);

        // Show sample data
        if (parseInt(countTanah.rows[0].count) > 0) {
            const sample = await client.query('SELECT id, code, name, area, nup, nilai_perolehan FROM assets_tanah LIMIT 5');
            console.log('\n📋 Sample data:');
            sample.rows.forEach(row => {
                console.log(`   ID: ${row.id}, Code: ${row.code || '-'}, Name: ${row.name?.substring(0, 30) || '-'}...`);
                console.log(`      Area: ${row.area || '-'}, NUP: ${row.nup || '-'}, Nilai: ${row.nilai_perolehan || '-'}`);
            });
        }

        // Count assets_bangunan
        const countBangunan = await client.query('SELECT COUNT(*) as count FROM assets_bangunan');
        console.log(`\n🏢 assets_bangunan: ${countBangunan.rows[0].count} records`);

        // Count supplies
        const countSupplies = await client.query('SELECT COUNT(*) as count FROM supplies');
        console.log(`📦 supplies: ${countSupplies.rows[0].count} records`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkData();
