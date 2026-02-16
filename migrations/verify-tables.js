/**
 * Verify Database Tables
 * Script untuk memverifikasi tabel yang ada di database
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verifyTables() {
    console.log('🔍 Verifying Database Tables\n');
    console.log('============================\n');

    try {
        // Check if data_harkan table exists
        const tableCheck = await pool.query(`
            SELECT table_name, table_type
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'data_harkan'
        `);

        if (tableCheck.rows.length > 0) {
            console.log('✅ Table "data_harkan" exists\n');

            // Get column information
            const columnsQuery = await pool.query(`
                SELECT 
                    column_name, 
                    data_type, 
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'data_harkan'
                ORDER BY ordinal_position
            `);

            console.log('📋 Columns:');
            console.log('─'.repeat(80));
            columnsQuery.rows.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
                const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
                console.log(`   ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable.padEnd(10)} ${defaultVal}`);
            });
            console.log('─'.repeat(80));

            // Get indexes
            const indexesQuery = await pool.query(`
                SELECT 
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE tablename = 'data_harkan'
                ORDER BY indexname
            `);

            console.log('\n📊 Indexes:');
            console.log('─'.repeat(80));
            indexesQuery.rows.forEach(idx => {
                console.log(`   ${idx.indexname}`);
                console.log(`   ${idx.indexdef}\n`);
            });
            console.log('─'.repeat(80));

            // Count records
            const countQuery = await pool.query('SELECT COUNT(*) as count FROM data_harkan');
            console.log(`\n📈 Total Records: ${countQuery.rows[0].count}\n`);

        } else {
            console.log('❌ Table "data_harkan" does not exist\n');
        }

        // List all tables
        const allTablesQuery = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        console.log('📚 All Tables in Database:');
        console.log('─'.repeat(80));
        allTablesQuery.rows.forEach(table => {
            console.log(`   ✓ ${table.table_name}`);
        });
        console.log('─'.repeat(80));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyTables();
