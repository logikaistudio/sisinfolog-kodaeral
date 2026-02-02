const express = require('express');
const cors = require('cors');
const pool = require('./db.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
