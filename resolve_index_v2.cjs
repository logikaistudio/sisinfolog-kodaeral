const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'api', 'index.js');
const backupPath = path.join(__dirname, 'api', 'index.js.bak');

// Restore from backup
if (fs.existsSync(backupPath)) {
    console.log('Restoring from backup...');
    fs.copyFileSync(backupPath, filePath);
} else {
    console.error('Backup file missing! Cannot restore.');
    process.exit(1);
}

// Correct Faslabuh Code
const faslabuhCode = `
// Get All Faslabuh/Dermaga
app.get('/api/faslabuh', async (req, res) => {
    try {
        const result = await pool.query(\`
            SELECT * FROM faslabuh
            ORDER BY created_at DESC
        \`);
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
        const result = await pool.query(\`
            SELECT * FROM faslabuh WHERE id = $1
        \`, [id]);

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
    try {
        // Map frontend fields to database columns with null safety
        const data = req.body;

        const values = [
            data.provinsi || null,
            data.wilayah || null,
            data.lokasi || null,
            data.nama_dermaga || null,
            data.konstruksi || null,
            data.lon || null,
            data.lat || null,
            data.kode_barang || null,
            data.no_sertifikat || null,
            data.tgl_sertifikat || null,

            // Dimensions - handle _m suffix from frontend
            data.panjang || data.panjang_m || null,
            data.lebar || data.lebar_m || null,
            data.luas || data.luas_m2 || null,
            data.draft_lwl || data.draft_lwl_m || null,
            data.pasut_hwl_lwl || data.pasut_hwl_lwl_m || null,
            data.kondisi || data.kondisi_percent || null,

            // JSON fields - ensure stringified and not undefined
            JSON.stringify(data.sandar_items || []),

            // Technical specs - handle mismatches
            data.plat_mst_ton || data.kemampuan_plat_lantai_ton || null,
            data.plat_jenis_ranmor || data.jenis_ranmor || null,
            data.plat_berat_max_ton || data.berat_ranmor_ton || null,

            // Electrical - handle mismatches
            data.listrik_jml_titik || data.titik_sambung_listrik || null,
            data.listrik_kap_amp || data.kapasitas_a || null,
            data.listrik_tegangan_volt || data.tegangan_v || null,
            data.listrik_frek_hz || data.frek_hz || null,
            data.listrik_sumber || data.sumber_listrik || null,
            data.listrik_daya_kva || data.daya_kva || null,

            // Water & Fuel - handle mismatches
            data.air_gwt_m3 || data.kapasitas_air_gwt_m3 || null,
            data.air_debit_m3_jam || data.debit_air_m3_jam || null,
            data.air_sumber || data.sumber_air || null,
            data.bbm || data.kapasitas_bbm || null,
            data.hydrant || null,

            data.keterangan || null,
            JSON.stringify(data.fotos || [])
        ];

        const result = await pool.query(\`
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
        \`, values);

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating faslabuh:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Update Faslabuh
app.put('/api/faslabuh/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Map frontend fields to database columns with null safety
        const data = req.body;

        const values = [
            data.provinsi || null,
            data.wilayah || null,
            data.lokasi || null,
            data.nama_dermaga || null,
            data.konstruksi || null,
            data.lon || null,
            data.lat || null,
            data.kode_barang || null,
            data.no_sertifikat || null,
            data.tgl_sertifikat || null,

            // Dimensions
            data.panjang || data.panjang_m || null,
            data.lebar || data.lebar_m || null,
            data.luas || data.luas_m2 || null,
            data.draft_lwl || data.draft_lwl_m || null,
            data.pasut_hwl_lwl || data.pasut_hwl_lwl_m || null,
            data.kondisi || data.kondisi_percent || null,

            // JSON fields
            JSON.stringify(data.sandar_items || []),

            // Technical specs
            data.plat_mst_ton || data.kemampuan_plat_lantai_ton || null,
            data.plat_jenis_ranmor || data.jenis_ranmor || null,
            data.plat_berat_max_ton || data.berat_ranmor_ton || null,

            // Electrical
            data.listrik_jml_titik || data.titik_sambung_listrik || null,
            data.listrik_kap_amp || data.kapasitas_a || null,
            data.listrik_tegangan_volt || data.tegangan_v || null,
            data.listrik_frek_hz || data.frek_hz || null,
            data.listrik_sumber || data.sumber_listrik || null,
            data.listrik_daya_kva || data.daya_kva || null,

            // Water & Fuel
            data.air_gwt_m3 || data.kapasitas_air_gwt_m3 || null,
            data.air_debit_m3_jam || data.debit_air_m3_jam || null,
            data.air_sumber || data.sumber_air || null,
            data.bbm || data.kapasitas_bbm || null,
            data.hydrant || null,

            data.keterangan || null,
            JSON.stringify(data.fotos || []),
            id
        ];

        const result = await pool.query(\`
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
        \`, values);

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

    console.log(\`[FASLABUH IMPORT] Starting: \${importData.length} records, mode=\${mode}\`);
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
                // Normalize item data
                const itemData = {
                    provinsi: item.provinsi || null,
                    wilayah: item.wilayah || null,
                    lokasi: item.lokasi || null,
                    nama_dermaga: item.nama_dermaga || null,
                    konstruksi: item.konstruksi || null,
                    lon: item.lon || null,
                    lat: item.lat || null,
                    kode_barang: item.kode_barang || null,
                    no_sertifikat: item.no_sertifikat || null,
                    tgl_sertifikat: item.tgl_sertifikat || null,

                    panjang: item.panjang ?? item.panjang_m ?? null,
                    lebar: item.lebar ?? item.lebar_m ?? null,
                    luas: item.luas ?? item.luas_m2 ??
                        ((item.panjang || item.panjang_m) && (item.lebar || item.lebar_m) ?
                            (item.panjang || item.panjang_m) * (item.lebar || item.lebar_m) : null),
                    draft_lwl: item.draft_lwl ?? item.draft_lwl_m ?? null,
                    pasut_hwl_lwl: item.pasut_hwl_lwl ?? item.pasut_hwl_lwl_m ?? null,
                    kondisi: item.kondisi ?? item.kondisi_percent ?? null,

                    sandar_items: JSON.stringify(item.sandar_items || []),

                    plat_mst_ton: item.plat_mst_ton ?? item.kemampuan_plat_lantai_ton ?? null,
                    plat_jenis_ranmor: item.plat_jenis_ranmor ?? item.jenis_ranmor ?? null,
                    plat_berat_max_ton: item.plat_berat_max_ton ?? item.berat_ranmor_ton ?? null,

                    listrik_jml_titik: item.listrik_jml_titik ?? item.titik_sambung_listrik ?? null,
                    listrik_kap_amp: item.listrik_kap_amp ?? item.kapasitas_a ?? null,
                    listrik_tegangan_volt: item.listrik_tegangan_volt ?? item.tegangan_v ?? null,
                    listrik_frek_hz: item.listrik_frek_hz ?? item.frek_hz ?? null,
                    listrik_sumber: item.listrik_sumber ?? item.sumber_listrik ?? null,
                    listrik_daya_kva: item.listrik_daya_kva ?? item.daya_kva ?? null,

                    air_gwt_m3: item.air_gwt_m3 ?? item.kapasitas_air_gwt_m3 ?? null,
                    air_debit_m3_jam: item.air_debit_m3_jam ?? item.debit_air_m3_jam ?? null,
                    air_sumber: item.air_sumber ?? item.sumber_air ?? null,
                    bbm: item.bbm ?? item.kapasitas_bbm ?? null,
                    hydrant: item.hydrant ?? null,
                    keterangan: item.keterangan ?? null
                };

                if (mode === 'upsert') {
                    // Check if exists by nama_dermaga
                    const existing = await pool.query(
                        'SELECT id FROM faslabuh WHERE nama_dermaga = $1',
                        [itemData.nama_dermaga]
                    );

                    if (existing.rows.length > 0) {
                        // Update existing
                        await pool.query(\`
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
                        \`, [
                            itemData.provinsi, itemData.wilayah, itemData.lokasi, itemData.konstruksi, itemData.lon, itemData.lat,
                            itemData.kode_barang, itemData.no_sertifikat, itemData.tgl_sertifikat,
                            itemData.panjang, itemData.lebar, itemData.luas, itemData.draft_lwl,
                            itemData.pasut_hwl_lwl, itemData.kondisi,
                            itemData.sandar_items, itemData.plat_mst_ton,
                            itemData.plat_jenis_ranmor, itemData.plat_berat_max_ton,
                            itemData.listrik_jml_titik, itemData.listrik_kap_amp,
                            itemData.listrik_tegangan_volt, itemData.listrik_frek_hz,
                            itemData.listrik_sumber, itemData.listrik_daya_kva,
                            itemData.air_gwt_m3, itemData.air_debit_m3_jam, itemData.air_sumber,
                            itemData.bbm, itemData.hydrant, itemData.keterangan,
                            existing.rows[0].id
                        ]);
                        results.updated++;
                    } else {
                        // Insert new
                        await pool.query(\`
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
                        \`, [
                            itemData.provinsi, itemData.wilayah, itemData.lokasi, itemData.nama_dermaga, itemData.konstruksi,
                            itemData.lon, itemData.lat,
                            itemData.kode_barang, itemData.no_sertifikat, itemData.tgl_sertifikat,
                            itemData.panjang, itemData.lebar, itemData.luas,
                            itemData.draft_lwl, itemData.pasut_hwl_lwl, itemData.kondisi,
                            itemData.sandar_items, itemData.plat_mst_ton,
                            itemData.plat_jenis_ranmor, itemData.plat_berat_max_ton,
                            itemData.listrik_jml_titik, itemData.listrik_kap_amp,
                            itemData.listrik_tegangan_volt, itemData.listrik_frek_hz,
                            itemData.listrik_sumber, itemData.listrik_daya_kva,
                            itemData.air_gwt_m3, itemData.air_debit_m3_jam, itemData.air_sumber,
                            itemData.bbm, itemData.hydrant, itemData.keterangan
                        ]);
                        results.inserted++;
                    }
                } else if (mode === 'insert-only') {
                    // Insert new
                    await pool.query(\`
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
                    \`, [
                        itemData.provinsi, itemData.wilayah, itemData.lokasi, itemData.nama_dermaga, itemData.konstruksi,
                        itemData.lon, itemData.lat,
                        itemData.kode_barang, itemData.no_sertifikat, itemData.tgl_sertifikat,
                        itemData.panjang, itemData.lebar, itemData.luas,
                        itemData.draft_lwl, itemData.pasut_hwl_lwl, itemData.kondisi,
                        itemData.sandar_items, itemData.plat_mst_ton,
                        itemData.plat_jenis_ranmor, itemData.plat_berat_max_ton,
                        itemData.listrik_jml_titik, itemData.listrik_kap_amp,
                        itemData.listrik_tegangan_volt, itemData.listrik_frek_hz,
                        itemData.listrik_sumber, itemData.listrik_daya_kva,
                        itemData.air_gwt_m3, itemData.air_debit_m3_jam, itemData.air_sumber,
                        itemData.bbm, itemData.hydrant, itemData.keterangan
                    ]);
                    results.inserted++;
                } else if (mode === 'update-only') {
                    // Update only - skip if not exists
                    const updateResult = await pool.query(\`
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
                    \`, [
                        itemData.provinsi, itemData.wilayah, itemData.lokasi, itemData.konstruksi, itemData.lon, itemData.lat,
                        itemData.kode_barang, itemData.no_sertifikat, itemData.tgl_sertifikat,
                        itemData.panjang, itemData.lebar, itemData.luas, itemData.draft_lwl,
                        itemData.pasut_hwl_lwl, itemData.kondisi,
                        itemData.sandar_items, itemData.plat_mst_ton,
                        itemData.plat_jenis_ranmor, itemData.plat_berat_max_ton,
                        itemData.listrik_jml_titik, itemData.listrik_kap_amp,
                        itemData.listrik_tegangan_volt, itemData.listrik_frek_hz,
                        itemData.listrik_sumber, itemData.listrik_daya_kva,
                        itemData.air_gwt_m3, itemData.air_debit_m3_jam, itemData.air_sumber,
                        itemData.bbm, itemData.hydrant, itemData.keterangan,
                        itemData.nama_dermaga
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
        console.log(\`[FASLABUH IMPORT] Done in \${elapsed}ms: inserted=\${results.inserted}, updated=\${results.updated}, failed=\${results.failed}\`);

        if (results.failed > 10) {
            results.errors.push({
                row: '-',
                nama_dermaga: '-',
                error: \`... dan \${results.failed - 10} error lainnya\`
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
`;

console.log('Reading file...');
let content = fs.readFileSync(filePath, 'utf8');

// Use string replacement
const startMarker = '// ==================== FASLABUH (DERMAGA) ENDPOINTS ====================';
const endMarker = '// ==================== END FASLABUH ENDPOINTS ====================';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error('Markers not found!');
    process.exit(1);
}

// Keep the markers, replace content BETWEEN them
const before = content.substring(0, startIndex + startMarker.length);
const after = content.substring(endIndex);

const newContent = before + '\\n' + faslabuhCode + '\\n' + after;

console.log('Writing file...');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Checking for conflict markers...');
const finalContent = fs.readFileSync(filePath, 'utf8');
if (finalContent.includes('<<<<<<< HEAD')) {
    console.error('FAILURE: Conflict markers still present!');
} else {
    console.log('SUCCESS: File restored and patched.');
}
