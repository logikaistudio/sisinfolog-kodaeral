// API Endpoints untuk Asset Detail dan Integrasi
// Tambahkan ke api/index.js

// ============================================================================
// ASSET DETAIL ENDPOINTS
// ============================================================================

// Get Single Asset by Kode
app.get('/api/assets/tanah/:kode', async (req, res) => {
    const { kode } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM assets_tanah WHERE code = $1',
            [kode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Asset with All Relations (Complete Detail)
app.get('/api/assets/:kode/complete', async (req, res) => {
    const { kode } = req.params;
    try {
        // Get asset
        const assetResult = await pool.query(
            'SELECT * FROM assets_tanah WHERE code = $1',
            [kode]
        );

        if (assetResult.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const asset = assetResult.rows[0];

        // Get all relations
        const [faslan, maintenance, inventory, vehicles, partnerships, locations] = await Promise.all([
            pool.query('SELECT * FROM faslan_assets WHERE kode_asset = $1', [kode]),
            pool.query('SELECT * FROM fasharpan_maintenance WHERE kode_asset = $1 ORDER BY tanggal_maintenance DESC', [kode]),
            pool.query('SELECT * FROM disbek_inventory WHERE kode_asset = $1', [kode]),
            pool.query('SELECT * FROM disang_vehicles WHERE kode_asset = $1', [kode]),
            pool.query('SELECT * FROM kerjasama_assets WHERE kode_asset = $1', [kode]),
            pool.query('SELECT * FROM peta_faslan_locations WHERE kode_asset = $1', [kode])
        ]);

        res.json({
            asset,
            faslan: faslan.rows,
            maintenance: maintenance.rows,
            inventory: inventory.rows,
            vehicles: vehicles.rows,
            partnerships: partnerships.rows,
            locations: locations.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// FASLAN ENDPOINTS
// ============================================================================

// Get All Faslan (with optional filter by kode_asset)
app.get('/api/faslan', async (req, res) => {
    const { kode_asset } = req.query;
    try {
        let query = 'SELECT * FROM faslan_assets';
        let params = [];

        if (kode_asset) {
            query += ' WHERE kode_asset = $1';
            params.push(kode_asset);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Faslan
app.post('/api/faslan', async (req, res) => {
    const {
        kode_asset, bmn_id, jenis_faslan, nomor_lambung, tahun_pembuatan,
        negara_pembuat, status_operasional, lokasi_penyimpanan,
        koordinat_lat, koordinat_lng, komandan_nama, komandan_pangkat,
        komandan_nrp, jumlah_abk
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO faslan_assets 
             (kode_asset, bmn_id, jenis_faslan, nomor_lambung, tahun_pembuatan,
              negara_pembuat, status_operasional, lokasi_penyimpanan,
              koordinat_lat, koordinat_lng, komandan_nama, komandan_pangkat,
              komandan_nrp, jumlah_abk)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING *`,
            [kode_asset, bmn_id, jenis_faslan, nomor_lambung, tahun_pembuatan,
                negara_pembuat, status_operasional, lokasi_penyimpanan,
                koordinat_lat, koordinat_lng, komandan_nama, komandan_pangkat,
                komandan_nrp, jumlah_abk]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// FASHARPAN (MAINTENANCE) ENDPOINTS
// ============================================================================

// Get All Maintenance (with optional filter by kode_asset)
app.get('/api/fasharpan/maintenance', async (req, res) => {
    const { kode_asset } = req.query;
    try {
        let query = 'SELECT * FROM fasharpan_maintenance';
        let params = [];

        if (kode_asset) {
            query += ' WHERE kode_asset = $1';
            params.push(kode_asset);
        }

        query += ' ORDER BY tanggal_maintenance DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Maintenance
app.post('/api/fasharpan/maintenance', async (req, res) => {
    const {
        kode_asset, bmn_id, jenis_maintenance, tanggal_maintenance,
        tanggal_selesai, status, deskripsi, biaya, teknisi_nama,
        teknisi_nrp, spare_parts
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO fasharpan_maintenance 
             (kode_asset, bmn_id, jenis_maintenance, tanggal_maintenance,
              tanggal_selesai, status, deskripsi, biaya, teknisi_nama,
              teknisi_nrp, spare_parts)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [kode_asset, bmn_id, jenis_maintenance, tanggal_maintenance,
                tanggal_selesai, status, deskripsi, biaya, teknisi_nama,
                teknisi_nrp, spare_parts]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// DISBEK (INVENTORY) ENDPOINTS
// ============================================================================

// Get All Inventory (with optional filter by kode_asset)
app.get('/api/disbek/inventory', async (req, res) => {
    const { kode_asset } = req.query;
    try {
        let query = 'SELECT * FROM disbek_inventory';
        let params = [];

        if (kode_asset) {
            query += ' WHERE kode_asset = $1';
            params.push(kode_asset);
        }

        query += ' ORDER BY kategori, created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Inventory
app.post('/api/disbek/inventory', async (req, res) => {
    const {
        kode_asset, bmn_id, kategori, satuan, stok_minimum,
        stok_maksimum, stok_saat_ini, lokasi_gudang, rak_posisi,
        harga_satuan
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO disbek_inventory 
             (kode_asset, bmn_id, kategori, satuan, stok_minimum,
              stok_maksimum, stok_saat_ini, lokasi_gudang, rak_posisi,
              harga_satuan)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [kode_asset, bmn_id, kategori, satuan, stok_minimum,
                stok_maksimum, stok_saat_ini, lokasi_gudang, rak_posisi,
                harga_satuan]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// DISANG (VEHICLES) ENDPOINTS
// ============================================================================

// Get All Vehicles (with optional filter by kode_asset)
app.get('/api/disang/vehicles', async (req, res) => {
    const { kode_asset } = req.query;
    try {
        let query = 'SELECT * FROM disang_vehicles';
        let params = [];

        if (kode_asset) {
            query += ' WHERE kode_asset = $1';
            params.push(kode_asset);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Vehicle
app.post('/api/disang/vehicles', async (req, res) => {
    const {
        kode_asset, bmn_id, jenis_kendaraan, nomor_polisi, nomor_rangka,
        nomor_mesin, tahun_pembuatan, merk, model, warna,
        kapasitas_penumpang, kapasitas_muatan, status_kendaraan,
        driver_nama, driver_nrp, jenis_bbm, konsumsi_bbm
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO disang_vehicles 
             (kode_asset, bmn_id, jenis_kendaraan, nomor_polisi, nomor_rangka,
              nomor_mesin, tahun_pembuatan, merk, model, warna,
              kapasitas_penumpang, kapasitas_muatan, status_kendaraan,
              driver_nama, driver_nrp, jenis_bbm, konsumsi_bbm)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
             RETURNING *`,
            [kode_asset, bmn_id, jenis_kendaraan, nomor_polisi, nomor_rangka,
                nomor_mesin, tahun_pembuatan, merk, model, warna,
                kapasitas_penumpang, kapasitas_muatan, status_kendaraan,
                driver_nama, driver_nrp, jenis_bbm, konsumsi_bbm]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// KERJASAMA (PARTNERSHIPS) ENDPOINTS
// ============================================================================

// Get All Partnerships (with optional filter by kode_asset)
app.get('/api/kerjasama', async (req, res) => {
    const { kode_asset } = req.query;
    try {
        let query = 'SELECT * FROM kerjasama_assets';
        let params = [];

        if (kode_asset) {
            query += ' WHERE kode_asset = $1';
            params.push(kode_asset);
        }

        query += ' ORDER BY tanggal_mulai DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Partnership
app.post('/api/kerjasama', async (req, res) => {
    const {
        kode_asset, bmn_id, jenis_kerjasama, mitra_nama, mitra_alamat,
        mitra_kontak, mitra_email, nomor_perjanjian, tanggal_mulai,
        tanggal_selesai, nilai_kerjasama, pembayaran_schedule, status,
        pic_internal, pic_internal_nrp, pic_mitra, pic_mitra_kontak
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO kerjasama_assets 
             (kode_asset, bmn_id, jenis_kerjasama, mitra_nama, mitra_alamat,
              mitra_kontak, mitra_email, nomor_perjanjian, tanggal_mulai,
              tanggal_selesai, nilai_kerjasama, pembayaran_schedule, status,
              pic_internal, pic_internal_nrp, pic_mitra, pic_mitra_kontak)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
             RETURNING *`,
            [kode_asset, bmn_id, jenis_kerjasama, mitra_nama, mitra_alamat,
                mitra_kontak, mitra_email, nomor_perjanjian, tanggal_mulai,
                tanggal_selesai, nilai_kerjasama, pembayaran_schedule, status,
                pic_internal, pic_internal_nrp, pic_mitra, pic_mitra_kontak]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// PETA FASLAN (LOCATIONS) ENDPOINTS
// ============================================================================

// Get All Locations (with optional filter by kode_asset)
app.get('/api/peta-faslan/locations', async (req, res) => {
    const { kode_asset } = req.query;
    try {
        let query = 'SELECT * FROM peta_faslan_locations';
        let params = [];

        if (kode_asset) {
            query += ' WHERE kode_asset = $1';
            params.push(kode_asset);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Location
app.post('/api/peta-faslan/locations', async (req, res) => {
    const {
        kode_asset, bmn_id, koordinat_lat, koordinat_lng, map_boundary,
        area_name, area_size, marker_icon, marker_color, popup_content,
        layer_group
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO peta_faslan_locations 
             (kode_asset, bmn_id, koordinat_lat, koordinat_lng, map_boundary,
              area_name, area_size, marker_icon, marker_color, popup_content,
              layer_group)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [kode_asset, bmn_id, koordinat_lat, koordinat_lng, map_boundary,
                area_name, area_size, marker_icon, marker_color, popup_content,
                layer_group]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================================================
// STATISTICS & REPORTING ENDPOINTS
// ============================================================================

// Get Asset Distribution Statistics
app.get('/api/assets/stats/distribution', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM faslan_assets) as faslan_count,
                (SELECT COUNT(*) FROM fasharpan_maintenance) as maintenance_count,
                (SELECT COUNT(*) FROM disbek_inventory) as inventory_count,
                (SELECT COUNT(*) FROM disang_vehicles) as vehicle_count,
                (SELECT COUNT(*) FROM kerjasama_assets WHERE status = 'Active') as partnership_count,
                (SELECT COUNT(*) FROM assets_tanah) as total_assets
        `);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Asset Value Summary
app.get('/api/assets/stats/value', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                jenis_bmn,
                COUNT(*) as jumlah,
                SUM(nilai_perolehan) as total_nilai,
                SUM(luas_tanah) as total_luas
            FROM assets_tanah
            WHERE jenis_bmn IS NOT NULL
            GROUP BY jenis_bmn
            ORDER BY total_nilai DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
