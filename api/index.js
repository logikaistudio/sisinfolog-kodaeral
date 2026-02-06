import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
        const { folder_id } = req.query;
        let query = 'SELECT * FROM assets_tanah';
        let params = [];

        if (folder_id) {
            query += ' WHERE folder_id = $1';
            params.push(folder_id);
        }

        query += ' ORDER BY created_at ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Bangunan Assets
app.get('/api/assets/bangunan', async (req, res) => {
    try {
        const { folder_id } = req.query;
        let query = 'SELECT * FROM assets_bangunan';
        let params = [];

        if (folder_id) {
            query += ' WHERE folder_id = $1';
            params.push(folder_id);
        }

        query += ' ORDER BY created_at ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- KAPLING ENDPOINTS ---

// Get Kapling Assets
app.get('/api/assets/kapling', async (req, res) => {
    try {
        const { folder_id } = req.query;
        let query = 'SELECT * FROM assets_kapling';
        let params = [];
        if (folder_id) {
            query += ' WHERE folder_id = $1';
            params.push(folder_id);
        }
        query += ' ORDER BY created_at ASC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        // Auto-create table if missing (for Neon/Prod)
        if (err.code === '42P01') {
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS assets_kapling (
                        id SERIAL PRIMARY KEY, name VARCHAR(255), code VARCHAR(50), category VARCHAR(100), luas VARCHAR(50), status VARCHAR(50), location TEXT, coordinates VARCHAR(100), map_boundary TEXT, area VARCHAR(100), folder_id INTEGER,
                        occupant_name VARCHAR(100), occupant_rank VARCHAR(50), occupant_nrp VARCHAR(50), occupant_title VARCHAR(100),
                        jenis_bmn VARCHAR(100), kode_barang VARCHAR(50), nup VARCHAR(50), nama_barang VARCHAR(255), kondisi VARCHAR(50),
                        luas_tanah_seluruhnya VARCHAR(50), tanah_yg_telah_bersertifikat VARCHAR(50), tanah_yg_belum_bersertifikat VARCHAR(50),
                        tanggal_perolehan VARCHAR(50), nilai_perolehan NUMERIC, no_sertifikat VARCHAR(100), tgl_sertifikat VARCHAR(50),
                        standar_satuan VARCHAR(50), alamat_detail TEXT, kecamatan VARCHAR(100), kabupaten VARCHAR(100), provinsi VARCHAR(100), keterangan_bmn TEXT,
                        kode_kota VARCHAR(50), no_psp VARCHAR(100), tgl_psp VARCHAR(50), rt_rw VARCHAR(50), kelurahan_desa VARCHAR(100),
                        created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
                    )
                 `);
                res.json([]);
            } catch (e) { console.error(e); res.status(500).json({ error: 'DB Error' }); }
        } else {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Get Single Kapling Asset
app.get('/api/assets/kapling/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('SELECT * FROM assets_kapling WHERE code = $1', [code]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// Import Kapling Asset (Single)
app.post('/api/assets/kapling', async (req, res) => {
    const { name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO assets_kapling (name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [name, code, category, luas, status, location, coordinates, map_boundary, area, occupant_name, occupant_rank, occupant_nrp, occupant_title]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// Update Kapling Asset
app.put('/api/assets/kapling/:id', async (req, res) => {
    const { id } = req.params;
    const {
        name, code, category, luas, status, location, coordinates, map_boundary, area,
        occupant_name, occupant_rank, occupant_nrp, occupant_title,
        jenis_bmn, kode_barang, nup, nama_barang, kondisi,
        luas_tanah_seluruhnya, tanah_yg_telah_bersertifikat, tanah_yg_belum_bersertifikat,
        tanggal_perolehan, nilai_perolehan, no_sertifikat, tgl_sertifikat,
        standar_satuan, alamat_detail, kecamatan, kabupaten, provinsi, keterangan_bmn,
        kode_kota, no_psp, tgl_psp, rt_rw, kelurahan_desa
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE assets_kapling SET 
                name=$1, code=$2, category=$3, luas=$4, status=$5, location=$6, 
                coordinates=$7, map_boundary=$8, area=$9, 
                occupant_name=$10, occupant_rank=$11, occupant_nrp=$12, occupant_title=$13,
                jenis_bmn=$14, kode_barang=$15, nup=$16, nama_barang=$17, kondisi=$18,
                luas_tanah_seluruhnya=$19, tanah_yg_telah_bersertifikat=$20, tanah_yg_belum_bersertifikat=$21,
                tanggal_perolehan=$22, nilai_perolehan=$23, no_sertifikat=$24, tgl_sertifikat=$25,
                standar_satuan=$26, alamat_detail=$27, kecamatan=$28, kabupaten=$29, provinsi=$30, keterangan_bmn=$31,
                kode_kota=$32, no_psp=$33, tgl_psp=$34, rt_rw=$35, kelurahan_desa=$36,
                updated_at=NOW()
             WHERE id=$37 RETURNING *`,
            [
                name, code, category, luas, status, location, coordinates, map_boundary, area,
                occupant_name, occupant_rank, occupant_nrp, occupant_title,
                jenis_bmn, kode_barang, nup, nama_barang, kondisi,
                luas_tanah_seluruhnya, tanah_yg_telah_bersertifikat, tanah_yg_belum_bersertifikat,
                tanggal_perolehan, nilai_perolehan, no_sertifikat, tgl_sertifikat,
                standar_satuan, alamat_detail, kecamatan, kabupaten, provinsi, keterangan_bmn,
                kode_kota, no_psp, tgl_psp, rt_rw, kelurahan_desa,
                id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error', details: err.message }); }
});

// Delete Kapling Asset
app.delete('/api/assets/kapling/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM assets_kapling WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json({ message: 'Asset deleted successfully' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// Delete All Kapling Assets
app.delete('/api/assets/kapling', async (req, res) => {
    try {
        await pool.query('DELETE FROM assets_kapling');
        res.json({ message: 'All kapling assets deleted successfully' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// Get Single Tanah Asset by Code
app.get('/api/assets/tanah/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('SELECT * FROM assets_tanah WHERE code = $1', [code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Single Bangunan Asset by Code
app.get('/api/assets/bangunan/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const result = await pool.query('SELECT * FROM assets_bangunan WHERE code = $1', [code]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Import Tanah Asset (Single)
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
    const {
        name, code, category, luas, status, location, coordinates, map_boundary, area,
        occupant_name, occupant_rank, occupant_nrp, occupant_title,
        jenis_bmn, kode_barang, nup, nama_barang, kondisi,
        luas_tanah_seluruhnya, tanah_yg_telah_bersertifikat, tanah_yg_belum_bersertifikat,
        tanggal_perolehan, nilai_perolehan, no_sertifikat, tgl_sertifikat,
        standar_satuan, alamat_detail, kecamatan, kabupaten, provinsi, keterangan_bmn,
        kode_kota, no_psp, tgl_psp, rt_rw, kelurahan_desa
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE assets_tanah SET 
                name=$1, code=$2, category=$3, luas=$4, status=$5, location=$6, 
                coordinates=$7, map_boundary=$8, area=$9, 
                occupant_name=$10, occupant_rank=$11, occupant_nrp=$12, occupant_title=$13,
                jenis_bmn=$14, kode_barang=$15, nup=$16, nama_barang=$17, kondisi=$18,
                luas_tanah_seluruhnya=$19, tanah_yg_telah_bersertifikat=$20, tanah_yg_belum_bersertifikat=$21,
                tanggal_perolehan=$22, nilai_perolehan=$23, no_sertifikat=$24, tgl_sertifikat=$25,
                standar_satuan=$26, alamat_detail=$27, kecamatan=$28, kabupaten=$29, provinsi=$30, keterangan_bmn=$31,
                kode_kota=$32, no_psp=$33, tgl_psp=$34, rt_rw=$35, kelurahan_desa=$36,
                updated_at=NOW()
             WHERE id=$37 RETURNING *`,
            [
                name, code, category, luas, status, location, coordinates, map_boundary, area,
                occupant_name, occupant_rank, occupant_nrp, occupant_title,
                jenis_bmn, kode_barang, nup, nama_barang, kondisi,
                luas_tanah_seluruhnya, tanah_yg_telah_bersertifikat, tanah_yg_belum_bersertifikat,
                tanggal_perolehan, nilai_perolehan, no_sertifikat, tgl_sertifikat,
                standar_satuan, alamat_detail, kecamatan, kabupaten, provinsi, keterangan_bmn,
                kode_kota, no_psp, tgl_psp, rt_rw, kelurahan_desa,
                id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Asset not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
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

// =============================================================================
// BULK IMPORT - SIMPLE & FAST VERSION
// =============================================================================
app.post('/api/assets/tanah/bulk-upsert', async (req, res) => {
    const { assets, mode = 'upsert', folder_id = null, source_file = null } = req.body;

    if (!Array.isArray(assets) || assets.length === 0) {
        return res.status(400).json({ error: 'Assets array is required' });
    }

    console.log(`[IMPORT] Starting: ${assets.length} records, mode=${mode}`);
    const startTime = Date.now();

    const results = {
        total: assets.length,
        inserted: 0,
        updated: 0,
        failed: 0,
        errors: []
    };

    try {
        // First, drop constraints that might cause issues
        try {
            await pool.query('ALTER TABLE assets_tanah DROP CONSTRAINT IF EXISTS chk_nup_length');
            await pool.query('ALTER TABLE assets_tanah DROP CONSTRAINT IF EXISTS chk_kode_kota_length');
            await pool.query('ALTER TABLE assets_tanah DROP CONSTRAINT IF EXISTS chk_nilai_perolehan_positive');
        } catch (e) {
            // Ignore errors - constraints might not exist
        }

        // Add folder_id and other new columns if not exists
        try {
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS folder_id INTEGER');
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS source_file TEXT');
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS kode_kota VARCHAR(50)');
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS no_psp VARCHAR(100)');
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS tgl_psp DATE');
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS rt_rw VARCHAR(50)');
            await pool.query('ALTER TABLE assets_tanah ADD COLUMN IF NOT EXISTS kelurahan_desa VARCHAR(100)');
            // Ensure compatibility (rename or alias if needed, but for now just ensure existence)
        } catch (e) {
            // Ignore
        }

        // Process each asset individually with simple error handling
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];

            // Generate code if not present
            let code = asset.code;
            if (!code || String(code).trim() === '') {
                // Try to create code from kode_barang + nup
                if (asset.kode_barang && asset.nup) {
                    code = `${asset.kode_barang}-${asset.nup}`;
                } else if (asset.kode_barang) {
                    code = `${asset.kode_barang}-${i + 1}`;
                } else if (asset.nup) {
                    code = asset.nup;
                } else {
                    code = `IMPORT-${Date.now()}-${i + 1}`;
                }
            }

            try {
                if (mode === 'upsert') {
                    // Simple UPSERT - store everything as TEXT to avoid type errors
                    const upsertResult = await pool.query(
                        `INSERT INTO assets_tanah 
                         (code, name, category, status, location, 
                          jenis_bmn, kode_barang, nup, nama_barang, kondisi,
                          luas_tanah_seluruhnya, nilai_perolehan, no_sertifikat,
                          alamat_detail, kecamatan, kabupaten, provinsi, keterangan_bmn,
                          folder_id, source_file,
                          kode_kota, no_psp, tgl_psp, rt_rw, kelurahan_desa, tanggal_perolehan, tgl_sertifikat)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
                         ON CONFLICT (code) DO UPDATE SET
                             name = COALESCE(EXCLUDED.name, assets_tanah.name),
                             category = COALESCE(EXCLUDED.category, assets_tanah.category),
                             status = COALESCE(EXCLUDED.status, assets_tanah.status),
                             location = COALESCE(EXCLUDED.location, assets_tanah.location),
                             jenis_bmn = COALESCE(EXCLUDED.jenis_bmn, assets_tanah.jenis_bmn),
                             kode_barang = COALESCE(EXCLUDED.kode_barang, assets_tanah.kode_barang),
                             nup = COALESCE(EXCLUDED.nup, assets_tanah.nup),
                             nama_barang = COALESCE(EXCLUDED.nama_barang, assets_tanah.nama_barang),
                             kondisi = COALESCE(EXCLUDED.kondisi, assets_tanah.kondisi),
                             luas_tanah_seluruhnya = COALESCE(EXCLUDED.luas_tanah_seluruhnya, assets_tanah.luas_tanah_seluruhnya),
                             nilai_perolehan = COALESCE(EXCLUDED.nilai_perolehan, assets_tanah.nilai_perolehan),
                             no_sertifikat = COALESCE(EXCLUDED.no_sertifikat, assets_tanah.no_sertifikat),
                             alamat_detail = COALESCE(EXCLUDED.alamat_detail, assets_tanah.alamat_detail),
                             kecamatan = COALESCE(EXCLUDED.kecamatan, assets_tanah.kecamatan),
                             kabupaten = COALESCE(EXCLUDED.kabupaten, assets_tanah.kabupaten),
                             provinsi = COALESCE(EXCLUDED.provinsi, assets_tanah.provinsi),
                             keterangan_bmn = COALESCE(EXCLUDED.keterangan_bmn, assets_tanah.keterangan_bmn),
                             folder_id = COALESCE(EXCLUDED.folder_id, assets_tanah.folder_id),
                             source_file = COALESCE(EXCLUDED.source_file, assets_tanah.source_file),
                             kode_kota = COALESCE(EXCLUDED.kode_kota, assets_tanah.kode_kota),
                             no_psp = COALESCE(EXCLUDED.no_psp, assets_tanah.no_psp),
                             tgl_psp = COALESCE(EXCLUDED.tgl_psp, assets_tanah.tgl_psp),
                             rt_rw = COALESCE(EXCLUDED.rt_rw, assets_tanah.rt_rw),
                             kelurahan_desa = COALESCE(EXCLUDED.kelurahan_desa, assets_tanah.kelurahan_desa),
                             tanggal_perolehan = COALESCE(EXCLUDED.tanggal_perolehan, assets_tanah.tanggal_perolehan),
                             tgl_sertifikat = COALESCE(EXCLUDED.tgl_sertifikat, assets_tanah.tgl_sertifikat),
                             updated_at = NOW()
                         RETURNING (xmax = 0) AS inserted`,
                        [
                            code,
                            asset.name || asset.nama_barang || null,
                            asset.category || asset.jenis_bmn || 'Tanah',
                            asset.status || 'Aktif',
                            asset.location || asset.alamat_detail || null,
                            asset.jenis_bmn || null,
                            asset.kode_barang || null,
                            asset.nup ? String(asset.nup) : null,
                            asset.nama_barang || asset.name || null,
                            asset.kondisi || 'Baik',
                            asset.luas_tanah_seluruhnya ? parseFloat(asset.luas_tanah_seluruhnya) || null : null,
                            asset.nilai_perolehan ? parseFloat(String(asset.nilai_perolehan).replace(/[^0-9.-]/g, '')) || null : null,
                            asset.no_sertifikat || null,
                            asset.alamat_detail || asset.location || null,
                            asset.kecamatan || null,
                            asset.kabupaten || null,
                            asset.provinsi || null,
                            asset.keterangan_bmn || null,
                            folder_id,
                            source_file,
                            asset.kode_kota || null,
                            asset.no_psp || null,
                            asset.tgl_psp || null,
                            asset.rt_rw || null,
                            asset.kelurahan_desa || null,
                            asset.tanggal_perolehan || null,
                            asset.tgl_sertifikat || null
                        ]
                    );

                    if (upsertResult.rows[0]?.inserted) {
                        results.inserted++;
                    } else {
                        results.updated++;
                    }
                } else if (mode === 'insert-only') {
                    await pool.query(
                        `INSERT INTO assets_tanah (code, name, category, status, jenis_bmn, kode_barang, nup, nama_barang, kondisi, folder_id, source_file)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                        [code, asset.name || asset.nama_barang, asset.category || 'Tanah', asset.status || 'Aktif',
                            asset.jenis_bmn, asset.kode_barang, asset.nup, asset.nama_barang, asset.kondisi || 'Baik',
                            folder_id, source_file]
                    );
                    results.inserted++;
                } else if (mode === 'update-only') {
                    const updateResult = await pool.query(
                        `UPDATE assets_tanah SET name=$1, category=$2, status=$3, updated_at=NOW() WHERE code=$4`,
                        [asset.name || asset.nama_barang, asset.category || 'Tanah', asset.status || 'Aktif', code]
                    );
                    if (updateResult.rowCount > 0) {
                        results.updated++;
                    } else {
                        results.failed++;
                        results.errors.push({ row: i + 1, code, error: 'Data tidak ditemukan' });
                    }
                }
            } catch (err) {
                results.failed++;
                // Only log first 10 errors to avoid spam
                if (results.errors.length < 10) {
                    results.errors.push({
                        row: i + 1,
                        code: code || 'N/A',
                        error: err.message.substring(0, 100)
                    });
                }
            }
        }

        const elapsed = Date.now() - startTime;
        console.log(`[IMPORT] Done in ${elapsed}ms: inserted=${results.inserted}, updated=${results.updated}, failed=${results.failed}`);

        // Add summary if there are more errors
        if (results.failed > 10) {
            results.errors.push({ row: '-', code: '-', error: `... dan ${results.failed - 10} error lainnya` });
        }

        res.json(results);
    } catch (err) {
        console.error('[IMPORT] Fatal error:', err);
        res.status(500).json({ error: 'Import gagal', details: err.message });
    }
});

// Delete All Tanah Assets
app.delete('/api/assets/tanah', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE assets_tanah RESTART IDENTITY');
        res.json({ message: 'All tanah assets deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete All Bangunan Assets
app.delete('/api/assets/bangunan', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE assets_bangunan RESTART IDENTITY');
        res.json({ message: 'All bangunan assets deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- BEKANG API ---
app.get('/api/supplies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM supplies ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
app.get('/api/harpan', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assets_harpan ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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

// --- MASTER DATA API ---
app.get('/api/master/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM master_categories ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/master/categories', async (req, res) => {
    const { code, name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO master_categories (code, name, description) VALUES ($1, $2, $3) RETURNING *',
            [code, name, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/master/locations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM master_locations ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/master/locations', async (req, res) => {
    const { code, name, type, capacity, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO master_locations (code, name, type, capacity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [code, name, type, capacity, status]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/master/officers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM master_officers ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/master/officers', async (req, res) => {
    const { nrp, name, position, phone } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO master_officers (nrp, name, position, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [nrp, name, position, phone]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/master/units', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM master_units ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/master/units', async (req, res) => {
    const { code, name, type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO master_units (code, name, type) VALUES ($1, $2, $3) RETURNING *',
            [code, name, type]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// AUTHENTICATION & USER MANAGEMENT ENDPOINTS
// ============================================

// Helper function to ensure users table exists with all required columns
async function ensureUsersTable() {
    try {
        // Create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                role VARCHAR(50),
                status VARCHAR(20) DEFAULT 'Active',
                avatar TEXT,
                username VARCHAR(50) UNIQUE,
                password VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Add missing columns if table already exists
        await pool.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE users ADD COLUMN password VARCHAR(255);
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
                BEGIN
                    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
            END $$;
        `);

        // Ensure default admin exists
        const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'kodaeral'");
        if (adminCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO users (name, email, role, status, username, password) 
                VALUES ('Administrator', 'admin@kodaeral.com', 'Super Admin', 'Active', 'kodaeral', 'kodaeral')
            `);
        }

        return true;
    } catch (error) {
        console.error('Error ensuring users table:', error);
        throw error;
    }
}

// Helper function to ensure roles table exists
async function ensureRolesTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY, 
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                permissions TEXT[],
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Fix column name if it's wrong (permission vs permissions)
        await pool.query(`
            DO $$ 
            BEGIN 
                -- Check if old column 'permission' exists and rename it
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='roles' AND column_name='permission'
                ) THEN
                    ALTER TABLE roles RENAME COLUMN permission TO permissions;
                END IF;
                
                -- Ensure permissions column exists
                BEGIN
                    ALTER TABLE roles ADD COLUMN permissions TEXT[];
                EXCEPTION
                    WHEN duplicate_column THEN NULL;
                END;
            END $$;
        `);

        // Check if default roles exist
        const rolesCheck = await pool.query("SELECT COUNT(*) FROM roles");
        if (parseInt(rolesCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO roles (name, description, permissions) VALUES 
                ('Super Admin', 'Full access to all system features', ARRAY['all']),
                ('Admin', 'Administrative access', ARRAY['manage_users', 'manage_content']),
                ('User', 'Standard user access', ARRAY['read_content']);
            `);
        }

        return true;
    } catch (error) {
        console.error('Error ensuring roles table:', error);
        throw error;
    }
}

// GET /api/users - Fetch all users
app.get('/api/users', async (req, res) => {
    try {
        await ensureUsersTable();
        const result = await pool.query('SELECT id, name, email, role, status, avatar, username FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/users error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
    const { name, email, role, status, username, password } = req.body;

    // Validation
    if (!name || !username || !password) {
        return res.status(400).json({ error: 'Name, username, and password are required' });
    }

    try {
        await ensureUsersTable();

        const result = await pool.query(
            'INSERT INTO users (name, email, role, status, username, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, status, username',
            [name, email, role || 'User', status || 'Active', username, password]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('POST /api/users error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email atau Username sudah digunakan' });
        }
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, status, username, password } = req.body;

    // Validation
    if (!name || !username) {
        return res.status(400).json({ error: 'Name and username are required' });
    }

    try {
        await ensureUsersTable();

        let query = '';
        let params = [];

        if (password && password.trim() !== '') {
            // Update with password
            query = `UPDATE users SET name=$1, email=$2, role=$3, status=$4, username=$5, password=$6, updated_at=NOW() WHERE id=$7 RETURNING id, name, email, role, status, username`;
            params = [name, email, role, status, username, password, id];
        } else {
            // Update without password
            query = `UPDATE users SET name=$1, email=$2, role=$3, status=$4, username=$5, updated_at=NOW() WHERE id=$6 RETURNING id, name, email, role, status, username`;
            params = [name, email, role, status, username, id];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('PUT /api/users/:id error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email atau Username sudah digunakan' });
        }
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('DELETE /api/users/:id error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// POST /api/auth/login - User login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    try {
        await ensureUsersTable();

        // Verify User
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Username tidak ditemukan' });
        }

        // Simple password check (In production, use bcrypt.compare)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Password salah' });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({ error: 'Akun dinonaktifkan' });
        }

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            user: userWithoutPassword
        });

    } catch (err) {
        console.error('POST /api/auth/login error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// ============================================
// ROLES MANAGEMENT ENDPOINTS
// ============================================

// GET /api/roles - Fetch all roles
app.get('/api/roles', async (req, res) => {
    try {
        await ensureRolesTable();
        const result = await pool.query('SELECT * FROM roles ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('GET /api/roles error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// POST /api/roles - Create new role
app.post('/api/roles', async (req, res) => {
    const { name, description, permissions } = req.body;

    // Validation
    if (!name) {
        return res.status(400).json({ error: 'Role name is required' });
    }

    try {
        await ensureRolesTable();

        const result = await pool.query(
            'INSERT INTO roles (name, description, permissions) VALUES ($1, $2, $3) RETURNING *',
            [name, description || '', permissions || []]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('POST /api/roles error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Role name already exists' });
        }
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// PUT /api/roles/:id - Update role
app.put('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Validation
    if (!name) {
        return res.status(400).json({ error: 'Role name is required' });
    }

    try {
        await ensureRolesTable();

        const result = await pool.query(
            'UPDATE roles SET name = $1, description = $2, permissions = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [name, description || '', permissions || [], id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('PUT /api/roles/:id error:', err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Role name already exists' });
        }
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// DELETE /api/roles/:id - Delete role
app.delete('/api/roles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM roles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        console.error('DELETE /api/roles/:id error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// --- FOLDER STRUCTURE API ---
app.get('/api/structure/folders', async (req, res) => {
    try {
        // Check if table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'master_asset_folders'
            )
        `);

        if (!tableCheck.rows[0].exists) {
            // Create table if not exists
            await pool.query(`
                CREATE TABLE IF NOT EXISTS master_asset_folders (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            return res.json([]);
        }

        const result = await pool.query(`
            SELECT f.*, 
            (SELECT COUNT(*) FROM assets_tanah WHERE folder_id = f.id) as item_count 
            FROM master_asset_folders f 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

app.post('/api/structure/folders', async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO master_asset_folders (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/structure/folders/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE master_asset_folders SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Folder not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/structure/folders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE assets_tanah SET folder_id = NULL WHERE folder_id = $1', [id]);
        await pool.query('UPDATE assets_bangunan SET folder_id = NULL WHERE folder_id = $1', [id]);
        const result = await pool.query('DELETE FROM master_asset_folders WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Folder not found' });
        res.json({ message: 'Folder deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== FASLABUH (DERMAGA) ENDPOINTS ====================

// Get All Faslabuh/Dermaga
app.get('/api/faslabuh', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                f.*,
                a.jenis_bmn,
                a.nup,
                a.nama_barang as asset_nama_barang,
                a.kondisi as asset_kondisi,
                a.no_sertifikat as asset_no_sertifikat,
                a.tanggal_perolehan as asset_tanggal_perolehan,
                a.nilai_perolehan as asset_nilai_perolehan
            FROM faslabuh f
            LEFT JOIN assets_tanah a ON f.kode_barang = a.kode_barang
            ORDER BY f.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Get Single Faslabuh by ID
app.get('/api/faslabuh/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                f.*,
                a.jenis_bmn,
                a.nup,
                a.nama_barang as asset_nama_barang,
                a.kondisi as asset_kondisi,
                a.no_sertifikat as asset_no_sertifikat,
                a.tanggal_perolehan as asset_tanggal_perolehan,
                a.nilai_perolehan as asset_nilai_perolehan
            FROM faslabuh f
            LEFT JOIN assets_tanah a ON f.kode_barang = a.kode_barang
            WHERE f.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dermaga not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Create Faslabuh
app.post('/api/faslabuh', async (req, res) => {
    const {
        provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
        kode_barang, no_sertifikat, tgl_sertifikat,
        panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
        sandar_items, plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
        listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, listrik_frek_hz,
        listrik_sumber, listrik_daya_kva,
        air_gwt_m3, air_debit_m3_jam, air_sumber,
        bbm, hydrant, keterangan, fotos
    } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO faslabuh (
                provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
                kode_barang, no_sertifikat, tgl_sertifikat,
                panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
                sandar_items, plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
                listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, listrik_frek_hz,
                listrik_sumber, listrik_daya_kva,
                air_gwt_m3, air_debit_m3_jam, air_sumber,
                bbm, hydrant, keterangan, fotos
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
            ) RETURNING *
        `, [
            provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
            kode_barang, no_sertifikat, tgl_sertifikat,
            panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
            JSON.stringify(sandar_items), plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
            listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, listrik_frek_hz,
            listrik_sumber, listrik_daya_kva,
            air_gwt_m3, air_debit_m3_jam, air_sumber,
            bbm, hydrant, keterangan, JSON.stringify(fotos)
        ]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Update Faslabuh
app.put('/api/faslabuh/:id', async (req, res) => {
    const { id } = req.params;
    const {
        provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
        kode_barang, no_sertifikat, tgl_sertifikat,
        panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
        sandar_items, plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
        listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, listrik_frek_hz,
        listrik_sumber, listrik_daya_kva,
        air_gwt_m3, air_debit_m3_jam, air_sumber,
        bbm, hydrant, keterangan, fotos
    } = req.body;

    try {
        const result = await pool.query(`
            UPDATE faslabuh SET
                provinsi = $1, wilayah = $2, lokasi = $3, nama_dermaga = $4, konstruksi = $5, lon = $6, lat = $7,
                kode_barang = $8, no_sertifikat = $9, tgl_sertifikat = $10,
                panjang = $11, lebar = $12, luas = $13, draft_lwl = $14, pasut_hwl_lwl = $15, kondisi = $16,
                sandar_items = $17, plat_mst_ton = $18, plat_jenis_ranmor = $19, plat_berat_max_ton = $20,
                listrik_jml_titik = $21, listrik_kap_amp = $22, listrik_tegangan_volt = $23, listrik_frek_hz = $24,
                listrik_sumber = $25, listrik_daya_kva = $26,
                air_gwt_m3 = $27, air_debit_m3_jam = $28, air_sumber = $29,
                bbm = $30, hydrant = $31, keterangan = $32, fotos = $33,
                updated_at = NOW()
            WHERE id = $34
            RETURNING *
        `, [
            provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
            kode_barang, no_sertifikat, tgl_sertifikat,
            panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
            JSON.stringify(sandar_items), plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
            listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, listrik_frek_hz,
            listrik_sumber, listrik_daya_kva,
            air_gwt_m3, air_debit_m3_jam, air_sumber,
            bbm, hydrant, keterangan, JSON.stringify(fotos),
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dermaga not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Delete Faslabuh
app.delete('/api/faslabuh/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM faslabuh WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Dermaga not found' });
        }
        res.json({ message: 'Dermaga deleted successfully' });
    } catch (err) {
        console.error('Error deleting faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Bulk Import Faslabuh
app.post('/api/faslabuh/bulk-import', async (req, res) => {
    const { data: importData, mode = 'upsert' } = req.body;

    if (!Array.isArray(importData) || importData.length === 0) {
        return res.status(400).json({ error: 'Data array is required' });
    }

    console.log(`[FASLABUH IMPORT] Starting: ${importData.length} records, mode=${mode}`);
    const startTime = Date.now();

    const results = {
        total: importData.length,
        inserted: 0,
        updated: 0,
        failed: 0,
        errors: []
    };

    try {
        // Process each item individually
        for (let i = 0; i < importData.length; i++) {
            const item = importData[i];

            try {
                if (mode === 'upsert') {
                    // Check if exists by nama_dermaga
                    const existing = await pool.query(
                        'SELECT id FROM faslabuh WHERE nama_dermaga = $1',
                        [item.nama_dermaga]
                    );

                    if (existing.rows.length > 0) {
                        // Update existing
                        await pool.query(`
                            UPDATE faslabuh SET
                                provinsi = $1, wilayah = $2, lokasi = $3, konstruksi = $4, lon = $5, lat = $6,
                                kode_barang = $7, no_sertifikat = $8, tgl_sertifikat = $9,
                                panjang = $10, lebar = $11, luas = $12, draft_lwl = $13, 
                                pasut_hwl_lwl = $14, kondisi = $15,
                                sandar_items = $16, plat_mst_ton = $17, plat_jenis_ranmor = $18, 
                                plat_berat_max_ton = $19,
                                listrik_jml_titik = $20, listrik_kap_amp = $21, 
                                listrik_tegangan_volt = $22, listrik_frek_hz = $23,
                                listrik_sumber = $24, listrik_daya_kva = $25,
                                air_gwt_m3 = $26, air_debit_m3_jam = $27, air_sumber = $28,
                                bbm = $29, hydrant = $30, keterangan = $31,
                                updated_at = NOW()
                            WHERE id = $32
                        `, [
                            item.provinsi, item.wilayah, item.lokasi, item.konstruksi, item.lon, item.lat,
                            item.kode_barang, item.no_sertifikat, item.tgl_sertifikat,
                            item.panjang, item.lebar, item.panjang * item.lebar, item.draft_lwl,
                            item.pasut_hwl_lwl, item.kondisi,
                            JSON.stringify(item.sandar_items || []), item.plat_mst_ton,
                            item.plat_jenis_ranmor, item.plat_berat_max_ton,
                            item.listrik_jml_titik, item.listrik_kap_amp,
                            item.listrik_tegangan_volt, item.listrik_frek_hz,
                            item.listrik_sumber, item.listrik_daya_kva,
                            item.air_gwt_m3, item.air_debit_m3_jam, item.air_sumber,
                            item.bbm, item.hydrant, item.keterangan,
                            existing.rows[0].id
                        ]);
                        results.updated++;
                    } else {
                        // Insert new
                        await pool.query(`
                            INSERT INTO faslabuh (
                                provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
                                kode_barang, no_sertifikat, tgl_sertifikat,
                                panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
                                sandar_items, plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
                                listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, 
                                listrik_frek_hz, listrik_sumber, listrik_daya_kva,
                                air_gwt_m3, air_debit_m3_jam, air_sumber,
                                bbm, hydrant, keterangan
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
                            )
                        `, [
                            item.provinsi, item.wilayah, item.lokasi, item.nama_dermaga, item.konstruksi,
                            item.lon, item.lat,
                            item.kode_barang, item.no_sertifikat, item.tgl_sertifikat,
                            item.panjang, item.lebar, item.panjang * item.lebar,
                            item.draft_lwl, item.pasut_hwl_lwl, item.kondisi,
                            JSON.stringify(item.sandar_items || []), item.plat_mst_ton,
                            item.plat_jenis_ranmor, item.plat_berat_max_ton,
                            item.listrik_jml_titik, item.listrik_kap_amp,
                            item.listrik_tegangan_volt, item.listrik_frek_hz,
                            item.listrik_sumber, item.listrik_daya_kva,
                            item.air_gwt_m3, item.air_debit_m3_jam, item.air_sumber,
                            item.bbm, item.hydrant, item.keterangan
                        ]);
                        results.inserted++;
                    }
                } else if (mode === 'insert-only') {
                    // Insert only - will fail if duplicate
                    await pool.query(`
                        INSERT INTO faslabuh (
                            provinsi, wilayah, lokasi, nama_dermaga, konstruksi, lon, lat,
                            kode_barang, no_sertifikat, tgl_sertifikat,
                            panjang, lebar, luas, draft_lwl, pasut_hwl_lwl, kondisi,
                            sandar_items, plat_mst_ton, plat_jenis_ranmor, plat_berat_max_ton,
                            listrik_jml_titik, listrik_kap_amp, listrik_tegangan_volt, 
                            listrik_frek_hz, listrik_sumber, listrik_daya_kva,
                            air_gwt_m3, air_debit_m3_jam, air_sumber,
                            bbm, hydrant, keterangan
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
                        )
                    `, [
                        item.provinsi, item.wilayah, item.lokasi, item.nama_dermaga, item.konstruksi,
                        item.lon, item.lat,
                        item.kode_barang, item.no_sertifikat, item.tgl_sertifikat,
                        item.panjang, item.lebar, item.panjang * item.lebar,
                        item.draft_lwl, item.pasut_hwl_lwl, item.kondisi,
                        JSON.stringify(item.sandar_items || []), item.plat_mst_ton,
                        item.plat_jenis_ranmor, item.plat_berat_max_ton,
                        item.listrik_jml_titik, item.listrik_kap_amp,
                        item.listrik_tegangan_volt, item.listrik_frek_hz,
                        item.listrik_sumber, item.listrik_daya_kva,
                        item.air_gwt_m3, item.air_debit_m3_jam, item.air_sumber,
                        item.bbm, item.hydrant, item.keterangan
                    ]);
                    results.inserted++;
                } else if (mode === 'update-only') {
                    // Update only - skip if not exists
                    const updateResult = await pool.query(`
                        UPDATE faslabuh SET
                            provinsi = $1, wilayah = $2, lokasi = $3, konstruksi = $4, lon = $5, lat = $6,
                            kode_barang = $7, no_sertifikat = $8, tgl_sertifikat = $9,
                            panjang = $10, lebar = $11, luas = $12, draft_lwl = $13, 
                            pasut_hwl_lwl = $14, kondisi = $15,
                            sandar_items = $16, plat_mst_ton = $17, plat_jenis_ranmor = $18, 
                            plat_berat_max_ton = $19,
                            listrik_jml_titik = $20, listrik_kap_amp = $21, 
                            listrik_tegangan_volt = $22, listrik_frek_hz = $23,
                            listrik_sumber = $24, listrik_daya_kva = $25,
                            air_gwt_m3 = $26, air_debit_m3_jam = $27, air_sumber = $28,
                            bbm = $29, hydrant = $30, keterangan = $31,
                            updated_at = NOW()
                        WHERE nama_dermaga = $32
                    `, [
                        item.provinsi, item.wilayah, item.lokasi, item.konstruksi, item.lon, item.lat,
                        item.kode_barang, item.no_sertifikat, item.tgl_sertifikat,
                        item.panjang, item.lebar, item.panjang * item.lebar, item.draft_lwl,
                        item.pasut_hwl_lwl, item.kondisi,
                        JSON.stringify(item.sandar_items || []), item.plat_mst_ton,
                        item.plat_jenis_ranmor, item.plat_berat_max_ton,
                        item.listrik_jml_titik, item.listrik_kap_amp,
                        item.listrik_tegangan_volt, item.listrik_frek_hz,
                        item.listrik_sumber, item.listrik_daya_kva,
                        item.air_gwt_m3, item.air_debit_m3_jam, item.air_sumber,
                        item.bbm, item.hydrant, item.keterangan,
                        item.nama_dermaga
                    ]);

                    if (updateResult.rowCount > 0) {
                        results.updated++;
                    } else {
                        results.failed++;
                        results.errors.push({
                            row: i + 1,
                            nama_dermaga: item.nama_dermaga,
                            error: 'Data tidak ditemukan'
                        });
                    }
                }
            } catch (err) {
                results.failed++;
                if (results.errors.length < 10) {
                    results.errors.push({
                        row: i + 1,
                        nama_dermaga: item.nama_dermaga || 'N/A',
                        error: err.message.substring(0, 100)
                    });
                }
            }
        }

        const elapsed = Date.now() - startTime;
        console.log(`[FASLABUH IMPORT] Done in ${elapsed}ms: inserted=${results.inserted}, updated=${results.updated}, failed=${results.failed}`);

        if (results.failed > 10) {
            results.errors.push({
                row: '-',
                nama_dermaga: '-',
                error: `... dan ${results.failed - 10} error lainnya`
            });
        }

        res.json(results);
    } catch (err) {
        console.error('[FASLABUH IMPORT] Fatal error:', err);
        res.status(500).json({ error: 'Import gagal', details: err.message });
    }
});

// Delete All Faslabuh
app.delete('/api/faslabuh/delete-all', async (req, res) => {
    try {
        await pool.query('TRUNCATE TABLE faslabuh RESTART IDENTITY');
        res.json({ message: 'All faslabuh data deleted successfully' });
    } catch (err) {
        console.error('Error deleting all faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// ==================== END FASLABUH ENDPOINTS ====================

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

export default app;
