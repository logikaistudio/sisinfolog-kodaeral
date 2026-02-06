// Script untuk fix roles table structure
import pool from './api/db.js';

async function fixRolesTable() {
    console.log('🔧 Fixing roles table structure...\n');

    try {
        // 1. Backup existing roles
        console.log('1. Backing up existing roles...');
        const backup = await pool.query('SELECT * FROM roles');
        console.log(`   Found ${backup.rows.length} roles to backup`);

        // 2. Drop and recreate table
        console.log('\n2. Dropping and recreating roles table...');
        await pool.query('DROP TABLE IF EXISTS roles CASCADE');
        await pool.query(`
            CREATE TABLE roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                permissions TEXT[],
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('   ✅ Table recreated with correct structure');

        // 3. Restore data
        console.log('\n3. Restoring roles...');
        if (backup.rows.length > 0) {
            for (const role of backup.rows) {
                // Handle both 'permission' and 'permissions' column names
                const perms = role.permissions || role.permission || [];
                await pool.query(
                    'INSERT INTO roles (name, description, permissions) VALUES ($1, $2, $3)',
                    [role.name, role.description, perms]
                );
                console.log(`   ✅ Restored: ${role.name}`);
            }
        } else {
            // Insert default roles
            await pool.query(`
                INSERT INTO roles (name, description, permissions) VALUES 
                ('Super Admin', 'Full access to all system features', ARRAY['all']),
                ('Admin', 'Administrative access', ARRAY['manage_users', 'manage_content']),
                ('User', 'Standard user access', ARRAY['read_content'])
            `);
            console.log('   ✅ Inserted default roles');
        }

        // 4. Verify
        console.log('\n4. Verifying...');
        const verify = await pool.query('SELECT * FROM roles ORDER BY id');
        console.log(`   ✅ Total roles: ${verify.rows.length}`);
        verify.rows.forEach(r => {
            console.log(`      - ${r.name}: ${r.permissions?.join(', ') || 'no permissions'}`);
        });

        console.log('\n✨ Roles table fixed successfully!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixRolesTable();
