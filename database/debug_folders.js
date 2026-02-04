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

async function checkFolders() {
    const client = await pool.connect();
    try {
        console.log('Checking master_asset_folders table...');
        const result = await client.query(`
            SELECT f.*, 
            (SELECT COUNT(*) FROM assets_tanah WHERE folder_id = f.id) + 
            (SELECT COUNT(*) FROM assets_bangunan WHERE folder_id = f.id) as item_count 
            FROM master_asset_folders f 
            ORDER BY created_at DESC
        `);
        console.log('✅ Query success! Row count:', result.rows.length);
        console.log('Rows:', result.rows);
    } catch (error) {
        console.error('❌ Query failed:', error.message);
        if (error.message.includes('relation "master_asset_folders" does not exist')) {
            console.log('Attempting to create table...');
            await client.query(`
                CREATE TABLE IF NOT EXISTS master_asset_folders (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
             `);
            console.log('✅ Created master_asset_folders table.');
        }
    } finally {
        client.release();
        await pool.end();
    }
}

checkFolders();
