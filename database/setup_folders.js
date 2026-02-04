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

async function setupFolders() {
    const client = await pool.connect();

    try {
        console.log('🔗 Connecting to Neon Database...');

        console.log('\n📦 Setting up Folders...');

        // 1. Create master_asset_folders table
        await client.query(`
            CREATE TABLE IF NOT EXISTS master_asset_folders (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table master_asset_folders ready');

        // 2. Add folder_id to assets_tanah
        await client.query(`
            ALTER TABLE assets_tanah 
            ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES master_asset_folders(id) ON DELETE SET NULL
        `);
        console.log('✅ Column folder_id added to assets_tanah');

        // 3. Add folder_id to assets_bangunan
        await client.query(`
            ALTER TABLE assets_bangunan 
            ADD COLUMN IF NOT EXISTS folder_id INTEGER REFERENCES master_asset_folders(id) ON DELETE SET NULL
        `);
        console.log('✅ Column folder_id added to assets_bangunan');

        // 4. Create Index on folder_id
        await client.query(`CREATE INDEX IF NOT EXISTS idx_assets_tanah_folder_id ON assets_tanah(folder_id)`);
        console.log('✅ Indexes created');

        console.log('\n✅ Folder setup complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

setupFolders().catch(console.error);
