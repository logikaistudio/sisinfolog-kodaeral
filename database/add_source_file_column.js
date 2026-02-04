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

async function addSourceFileColumn() {
    const client = await pool.connect();

    try {
        console.log('🔗 Connecting to Neon Database...');

        console.log('\n📦 Adding source_file column...');

        // 1. Add source_file to assets_tanah
        await client.query(`
            ALTER TABLE assets_tanah 
            ADD COLUMN IF NOT EXISTS source_file VARCHAR(255)
        `);
        console.log('✅ Column source_file added to assets_tanah');

        // 2. Add source_file to assets_bangunan
        await client.query(`
            ALTER TABLE assets_bangunan 
            ADD COLUMN IF NOT EXISTS source_file VARCHAR(255)
        `);
        console.log('✅ Column source_file added to assets_bangunan');

        // 3. Create Index on source_file for faster filtering/grouping
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_tanah_source_file ON assets_tanah(source_file)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_bangunan_source_file ON assets_bangunan(source_file)`);
        console.log('✅ Indexes created');

        console.log('\n✅ Migration complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addSourceFileColumn().catch(console.error);
