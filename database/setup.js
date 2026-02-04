/**
 * Script untuk setup/verify database structure
 * Jalankan dengan: node database/setup.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    const client = await pool.connect();

    try {
        console.log('🔗 Connecting to Neon Database...');

        // Test connection
        const testResult = await client.query('SELECT NOW()');
        console.log('✅ Connected at:', testResult.rows[0].now);

        console.log('\n📦 Creating/verifying tables...\n');

        // 1. Create assets_tanah table
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets_tanah (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100) UNIQUE,
                name TEXT,
                category VARCHAR(100),
                luas VARCHAR(50),
                status TEXT,
                location TEXT,
                coordinates TEXT,
                map_boundary TEXT,
                area VARCHAR(100),
                occupant_name VARCHAR(255),
                occupant_rank VARCHAR(100),
                occupant_nrp VARCHAR(100),
                occupant_title VARCHAR(255),
                
                -- Field BMN
                jenis_bmn VARCHAR(100),
                kode_barang VARCHAR(100),
                nup VARCHAR(50),
                nama_barang TEXT,
                kondisi VARCHAR(50),
                luas_tanah_seluruhnya NUMERIC(15, 2),
                tanah_yg_telah_bersertifikat NUMERIC(15, 2),
                tanah_yg_belum_bersertifikat NUMERIC(15, 2),
                tanggal_perolehan DATE,
                nilai_perolehan NUMERIC(20, 2),
                no_sertifikat VARCHAR(100),
                tgl_sertifikat DATE,
                standar_satuan VARCHAR(50),
                alamat_detail TEXT,
                kecamatan VARCHAR(100),
                kabupaten VARCHAR(100),
                provinsi VARCHAR(100),
                keterangan_bmn TEXT,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table assets_tanah ready');

        // 2. Add missing BMN columns to existing table
        const bmnColumns = [
            { name: 'jenis_bmn', type: 'VARCHAR(100)' },
            { name: 'kode_barang', type: 'VARCHAR(100)' },
            { name: 'nup', type: 'VARCHAR(50)' },
            { name: 'nama_barang', type: 'TEXT' },
            { name: 'kondisi', type: 'VARCHAR(50)' },
            { name: 'luas_tanah_seluruhnya', type: 'NUMERIC(15, 2)' },
            { name: 'tanah_yg_telah_bersertifikat', type: 'NUMERIC(15, 2)' },
            { name: 'tanah_yg_belum_bersertifikat', type: 'NUMERIC(15, 2)' },
            { name: 'tanggal_perolehan', type: 'DATE' },
            { name: 'nilai_perolehan', type: 'NUMERIC(20, 2)' },
            { name: 'no_sertifikat', type: 'VARCHAR(100)' },
            { name: 'tgl_sertifikat', type: 'DATE' },
            { name: 'standar_satuan', type: 'VARCHAR(50)' },
            { name: 'alamat_detail', type: 'TEXT' },
            { name: 'kecamatan', type: 'VARCHAR(100)' },
            { name: 'kabupaten', type: 'VARCHAR(100)' },
            { name: 'provinsi', type: 'VARCHAR(100)' },
            { name: 'keterangan_bmn', type: 'TEXT' }
        ];

        for (const col of bmnColumns) {
            try {
                await client.query(`ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
            } catch (e) {
                // Column might already exist, ignore
            }
        }
        console.log('✅ BMN columns verified');

        // 3. Create assets_bangunan table
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets_bangunan (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100) UNIQUE,
                name TEXT,
                category VARCHAR(100),
                luas VARCHAR(50),
                status TEXT,
                location TEXT,
                coordinates TEXT,
                map_boundary TEXT,
                area VARCHAR(100),
                occupant_name VARCHAR(255),
                occupant_rank VARCHAR(100),
                occupant_nrp VARCHAR(100),
                occupant_title VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table assets_bangunan ready');

        // 4. Create supplies table
        await client.query(`
            CREATE TABLE IF NOT EXISTS supplies (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100) UNIQUE,
                name TEXT NOT NULL,
                category VARCHAR(100),
                quantity INTEGER DEFAULT 0,
                unit VARCHAR(50),
                condition VARCHAR(50),
                location TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table supplies ready');

        // 5. Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_tanah_code ON assets_tanah(code)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_tanah_area ON assets_tanah(area)`);
        console.log('✅ Indexes created');

        // 6. Count existing data
        const countResult = await client.query('SELECT COUNT(*) FROM assets_tanah');
        console.log(`\n📊 Current data in assets_tanah: ${countResult.rows[0].count} records`);

        // 7. Show columns
        const columnsResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'assets_tanah' 
            ORDER BY ordinal_position
        `);
        console.log('\n📋 Columns in assets_tanah:');
        columnsResult.rows.forEach(row => {
            console.log(`   - ${row.column_name} (${row.data_type})`);
        });

        console.log('\n✅ Database setup complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase().catch(console.error);
