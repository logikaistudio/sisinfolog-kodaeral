import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Create a pool instance only if DATABASE_URL is provided, otherwise log error
// This prevents immediate crash on module load if env var is missing, 
// allowing the health check to report the specific error instead.
let pool;

try {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is undefined!");
    }

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} catch (error) {
    console.error("Failed to create DB pool:", error);
}

export default pool;
