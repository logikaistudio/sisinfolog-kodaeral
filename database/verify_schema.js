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

async function verifySchema() {
    const client = await pool.connect();
    console.log('🔗 Connecting to Neon Database for Schema Verification...');

    const issues = [];
    const successes = [];

    try {
        // 1. Check master_asset_folders table
        const foldersTable = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'master_asset_folders'
            );
        `);
        if (foldersTable.rows[0].exists) {
            successes.push("Table 'master_asset_folders' exists.");
        } else {
            issues.push("MISSING Table: 'master_asset_folders'");
        }

        // 2. Check columns in assets_tanah
        const tanahColumnsReq = ['folder_id', 'source_file', 'jenis_bmn', 'kode_barang', 'nup'];
        for (const col of tanahColumnsReq) {
            const check = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'assets_tanah' 
                    AND column_name = $1
                );
            `, [col]);
            if (check.rows[0].exists) {
                successes.push(`Column 'assets_tanah.${col}' exists.`);
            } else {
                issues.push(`MISSING Column: 'assets_tanah.${col}'`);
            }
        }

        // 3. Check columns in assets_bangunan
        const bangunanColumnsReq = ['folder_id', 'source_file'];
        for (const col of bangunanColumnsReq) {
            const check = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'assets_bangunan' 
                    AND column_name = $1
                );
            `, [col]);
            if (check.rows[0].exists) {
                successes.push(`Column 'assets_bangunan.${col}' exists.`);
            } else {
                issues.push(`MISSING Column: 'assets_bangunan.${col}'`);
            }
        }

        console.log('\n--- Verification Results ---');
        successes.forEach(s => console.log('✅ ' + s));

        if (issues.length > 0) {
            console.log('\n❌ FOUND ISSUES:');
            issues.forEach(i => console.log(i));
            console.log('\n⚠️ Database structure is NOT in sync with the latest features.');
        } else {
            console.log('\n✨ Database structure is FULLY SYNCED with all new features (Folders, Source File, BMN).');
        }

    } catch (error) {
        console.error('Error verifying schema:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

verifySchema();
