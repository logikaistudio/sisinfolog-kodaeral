
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setupMasterData() {
    const client = await pool.connect();

    try {
        console.log('🔗 Connecting to Neon Database for Master Data Setup...');

        // 1. Users & Roles
        console.log('📦 Setting up Users & Roles...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                permissions JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255), -- For future auth
                role VARCHAR(50) DEFAULT 'Viewer',
                status VARCHAR(20) DEFAULT 'Active',
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Users if empty
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCount.rows[0].count) === 0) {
            console.log('🌱 Seeding Users...');
            await client.query(`
                INSERT INTO users (name, email, role, status) VALUES
                ('Admin Utama', 'admin@kodaeral.mil.id', 'Super Admin', 'Active'),
                ('Operator Faslan', 'faslan@kodaeral.mil.id', 'Operator', 'Active'),
                ('Komandan Satgas', 'dansatgas@kodaeral.mil.id', 'Viewer', 'Inactive');
            `);
        }

        // 2. Master Data Tables
        console.log('📦 Setting up Master Data Tables...');

        // Categories
        await client.query(`
            CREATE TABLE IF NOT EXISTS master_categories (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                item_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Categories
        const catCount = await client.query('SELECT COUNT(*) FROM master_categories');
        if (parseInt(catCount.rows[0].count) === 0) {
            console.log('🌱 Seeding Master Categories...');
            await client.query(`
                INSERT INTO master_categories (code, name, description, item_count) VALUES
                ('CNT', 'Container', 'Kontainer pengangkutan', 15),
                ('BBM', 'Bahan Bakar', 'Bahan bakar dan pelumas', 8),
                ('ALB', 'Alat Berat', 'Peralatan berat operasional', 12),
                ('KSM', 'Konsumsi', 'Bahan konsumsi dan makanan', 45);
            `);
        }

        // Locations
        await client.query(`
            CREATE TABLE IF NOT EXISTS master_locations (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50),
                capacity VARCHAR(50),
                status VARCHAR(20) DEFAULT 'Aktif',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Locations
        const locCount = await client.query('SELECT COUNT(*) FROM master_locations');
        if (parseInt(locCount.rows[0].count) === 0) {
            console.log('🌱 Seeding Master Locations...');
            await client.query(`
                INSERT INTO master_locations (code, name, type, capacity, status) VALUES
                ('GDA', 'Gudang A', 'Gudang', '500 m²', 'Aktif'),
                ('GDB', 'Gudang B', 'Gudang', '350 m²', 'Aktif'),
                ('AOP', 'Area Operasi', 'Lapangan', '1000 m²', 'Aktif'),
                ('WKS', 'Workshop', 'Workshop', '200 m²', 'Aktif');
            `);
        }

        // Officers
        await client.query(`
            CREATE TABLE IF NOT EXISTS master_officers (
                id SERIAL PRIMARY KEY,
                nrp VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                position VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Officers
        const offCount = await client.query('SELECT COUNT(*) FROM master_officers');
        if (parseInt(offCount.rows[0].count) === 0) {
            console.log('🌱 Seeding Master Officers...');
            await client.query(`
                INSERT INTO master_officers (nrp, name, position, phone) VALUES
                ('11950234', 'Letda Budi Santoso', 'Kepala Gudang', '081234567890'),
                ('11960145', 'Letda Andi Wijaya', 'Supervisor Logistik', '081234567891'),
                ('11970089', 'Lettu Rudi Hartono', 'Petugas Lapangan', '081234567892'),
                ('11980123', 'Serda Ahmad Yani', 'Admin Bekal', '081234567893');
            `);
        }

        // Units
        await client.query(`
            CREATE TABLE IF NOT EXISTS master_units (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(50) NOT NULL,
                type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Units
        const unitCount = await client.query('SELECT COUNT(*) FROM master_units');
        if (parseInt(unitCount.rows[0].count) === 0) {
            console.log('🌱 Seeding Master Units...');
            await client.query(`
                INSERT INTO master_units (code, name, type) VALUES
                ('KG', 'Kilogram', 'Berat'),
                ('LTR', 'Liter', 'Volume'),
                ('UNIT', 'Unit', 'Satuan'),
                ('M3', 'Meter Kubik', 'Volume');
            `);
        }

        // 3. Ensure other tables exist

        // Assets Harpan
        await client.query(`
            CREATE TABLE IF NOT EXISTS assets_harpan (
                id SERIAL PRIMARY KEY,
                type VARCHAR(50),
                code VARCHAR(100),
                name VARCHAR(255),
                category VARCHAR(100),
                status VARCHAR(50),
                condition VARCHAR(50),
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Table assets_harpan verified');

        // Fix Supplies table (rename quantity to stock if needed to match API)
        // Check if stock column exists
        const checkStock = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'supplies' AND column_name = 'stock'
        `);
        if (checkStock.rows.length === 0) {
            // Check if quantity exists
            const checkQty = await client.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'supplies' AND column_name = 'quantity'
            `);
            if (checkQty.rows.length > 0) {
                console.log('🔧 Renaming supplies.quantity to stock...');
                await client.query('ALTER TABLE supplies RENAME COLUMN quantity TO stock');
            } else {
                console.log('🔧 Adding stock column to supplies...');
                await client.query('ALTER TABLE supplies ADD COLUMN stock INTEGER DEFAULT 0');
            }
        }

        // Also ensure 'unit', 'last_update' columns in supplies match API
        await client.query(`
            ALTER TABLE supplies 
            ADD COLUMN IF NOT EXISTS unit VARCHAR(50),
            ADD COLUMN IF NOT EXISTS last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);
        console.log('✅ Table supplies verified');


        console.log('\n✅ Master Data Setup Complete!');

    } catch (error) {
        console.error('❌ Error in setupMasterData:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

setupMasterData();
