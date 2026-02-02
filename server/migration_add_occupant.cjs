const pool = require('./db.cjs');

const migrate = async () => {
    try {
        console.log("Adding occupant columns to assets_tanah...");

        await pool.query(`
            ALTER TABLE assets_tanah 
            ADD COLUMN IF NOT EXISTS occupant_name TEXT,
            ADD COLUMN IF NOT EXISTS occupant_rank TEXT,
            ADD COLUMN IF NOT EXISTS occupant_nrp TEXT,
            ADD COLUMN IF NOT EXISTS occupant_title TEXT;
        `);

        console.log("Migration successful: Added occupant columns.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
