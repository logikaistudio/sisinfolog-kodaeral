const express = require('express');
const cors = require('cors');
const pool = require('./db.cjs');

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
    // --- PEMANFAATAN ASET API ---
    // Get All Pemanfaatan Assets
    app.get('/api/assets/pemanfaatan', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM assets_pemanfaatan ORDER BY id ASC');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Add Pemanfaatan Asset
    app.post('/api/assets/pemanfaatan', async (req, res) => {
        const { objek_pemanfaatan, luas, bentuk_pemanfaatan, pihak_pks, no_pks, tgl_pks, nilai_kompensasi, jangka_waktu, no_persetujuan, tgl_persetujuan, no_ntpn, tgl_ntpn } = req.body;
        try {
            const result = await pool.query(
                `INSERT INTO assets_pemanfaatan (objek_pemanfaatan, luas, bentuk_pemanfaatan, pihak_pks, no_pks, tgl_pks, nilai_kompensasi, jangka_waktu, no_persetujuan, tgl_persetujuan, no_ntpn, tgl_ntpn)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
                [objek_pemanfaatan, luas, bentuk_pemanfaatan, pihak_pks, no_pks, tgl_pks, nilai_kompensasi, jangka_waktu, no_persetujuan, tgl_persetujuan, no_ntpn, tgl_ntpn]
            );
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Bulk Add Pemanfaatan Asset
    app.post('/api/assets/pemanfaatan/bulk', async (req, res) => {
        const items = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const insertedItems = [];
            for (const item of items) {
                const { objek_pemanfaatan, luas, bentuk_pemanfaatan, pihak_pks, no_pks, tgl_pks, nilai_kompensasi, jangka_waktu, no_persetujuan, tgl_persetujuan, no_ntpn, tgl_ntpn } = item;
                const res = await client.query(
                    `INSERT INTO assets_pemanfaatan (objek_pemanfaatan, luas, bentuk_pemanfaatan, pihak_pks, no_pks, tgl_pks, nilai_kompensasi, jangka_waktu, no_persetujuan, tgl_persetujuan, no_ntpn, tgl_ntpn)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
                    [objek_pemanfaatan, luas, bentuk_pemanfaatan, pihak_pks, no_pks, tgl_pks, nilai_kompensasi, jangka_waktu, no_persetujuan, tgl_persetujuan, no_ntpn, tgl_ntpn]
                );
                insertedItems.push(res.rows[0]);
            }
            await client.query('COMMIT');
            res.json(insertedItems);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        } finally {
            client.release();
        }
    });

    // Delete Single Pemanfaatan Asset
    app.delete('/api/assets/pemanfaatan/:id', async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('DELETE FROM assets_pemanfaatan WHERE id = $1', [id]);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Delete All Pemanfaatan Assets
    app.delete('/api/assets/pemanfaatan', async (req, res) => {
        try {
            await pool.query('DELETE FROM assets_pemanfaatan');
            res.json({ message: 'All data deleted successfully' });
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
