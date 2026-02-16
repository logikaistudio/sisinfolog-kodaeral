/**
 * Migration Runner Script
 * Menjalankan migration SQL ke Neon Database
 * 
 * Usage: node migrations/run-migration.js
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration(filename) {
    const filePath = path.join(__dirname, filename);

    console.log(`\n📄 Reading migration file: ${filename}`);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return false;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`🚀 Executing migration...`);

    try {
        await pool.query(sql);
        console.log(`✅ Migration completed successfully: ${filename}`);
        return true;
    } catch (error) {
        console.error(`❌ Migration failed: ${filename}`);
        console.error(`Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🔧 Database Migration Runner');
    console.log('============================\n');

    // Test database connection
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`✅ Database connected successfully`);
        console.log(`   Timestamp: ${result.rows[0].now}\n`);
    } catch (error) {
        console.error(`❌ Database connection failed`);
        console.error(`   Error: ${error.message}`);
        process.exit(1);
    }

    // Run migrations
    const migrations = [
        'create_data_harkan_table.sql'
    ];

    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
        const success = await runMigration(migration);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log('\n============================');
    console.log(`📊 Migration Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${migrations.length}`);

    // Close pool
    await pool.end();

    process.exit(failCount > 0 ? 1 : 0);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
