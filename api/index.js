import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check / DB Connection Test
app.get('/api/health', async (req, res) => {
    try {
        if (!pool) {
            throw new Error("Database pool not initialized. Check DATABASE_URL.");
        }
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            message: 'Database connected',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: err.message,
            env_check: process.env.DATABASE_URL ? "Variable Present" : "Variable Missing"
        });
    }
});

// Get Tanah Assets
app.get('/api/assets/tanah', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assets_tanah ORDER BY created_at ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Bangunan Assets
app.get('/api/assets/bangunan', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assets_bangunan ORDER BY created_at ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Import Tanah Asset
app.post('/api/assets/tanah', async (req, res) => {
    const { name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO assets_tanah (name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Tanah Asset
app.put('/api/assets/tanah/:id', async (req, res) => {
    const { id } = req.params;
    const { name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title } = req.body;
    try {
        const result = await pool.query(
            `UPDATE assets_tanah SET name=$1, code=$2, category=$3, luas=$4, status=$5, location=$6, coordinates=$7, map_boundary=$8, area=$9, occupant_name=$10, occupant_rank=$11, occupant_nrp=$12, occupant_title=$13 WHERE id=$14 RETURNING *`,
            [name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Tanah Asset
app.delete('/api/assets/tanah/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM assets_tanah WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json({ message: 'Asset deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- BEKANG API ---
// Get All Supplies
app.get('/api/supplies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM supplies ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Supply
app.post('/api/supplies', async (req, res) => {
    const { name, code, category, stock, unit, status, last_update } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO supplies (name, code, category, stock, unit, status, last_update) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, code, category, stock, unit, status, last_update]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- HARPAN API ---
// Get All Harpan Assets
app.get('/api/harpan', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assets_harpan ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Harpan Asset
app.post('/api/harpan', async (req, res) => {
    const { type, code, name, category, status, condition, location } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO assets_harpan (type, code, name, category, status, condition, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [type, code, name, category, status, condition, location]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// For local dev
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Export app for Vercel
export default app;
