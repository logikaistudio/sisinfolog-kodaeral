import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixColumnTypes() {
    try {
        console.log('Fixing column types for faslabuh...');

        // Change bbm to VARCHAR
        console.log('Altering bbm to VARCHAR...');
        await pool.query(`ALTER TABLE faslabuh ALTER COLUMN bbm TYPE VARCHAR(100) USING bbm::VARCHAR;`);

        // Change hydrant to VARCHAR (if it exists and is boolean)
        console.log('Altering hydrant to VARCHAR...');
        // We use USING to cast any existing boolean values to string 'true'/'false' just in case data exists
        await pool.query(`ALTER TABLE faslabuh ALTER COLUMN hydrant TYPE VARCHAR(100) USING hydrant::VARCHAR;`);

        console.log('Column type update complete.');
    } catch (err) {
        console.error('Error updating column types:', err);
    } finally {
        await pool.end();
    }
}

fixColumnTypes();
