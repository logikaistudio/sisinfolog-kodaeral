-- Migration: Create Integration Tables for Master Asset BMN
-- Date: 2026-02-04
-- Description: Membuat tabel-tabel integrasi untuk menghubungkan Master Asset BMN
--              dengan modul Faslan, Fasharpan, DisBek, DisAng, Kerjasama, dan Peta

-- ============================================================================
-- 1. FASLAN (Fasilitas Angkutan Laut) - Child of Master Asset
-- ============================================================================
CREATE TABLE IF NOT EXISTS faslan_assets (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER,
    kode_asset VARCHAR(50),
    
    -- Faslan specific fields
    jenis_faslan VARCHAR(100), -- KRI, KAL, KAMLA, Dermaga, Gudang, dll
    nomor_lambung VARCHAR(50),
    tahun_pembuatan INTEGER,
    negara_pembuat VARCHAR(100),
    status_operasional VARCHAR(50), -- Operasional, Standby, Maintenance, Rusak
    lokasi_penyimpanan VARCHAR(255),
    koordinat_lat DECIMAL(10,8),
    koordinat_lng DECIMAL(11,8),
    
    -- Crew/Operator
    komandan_nama VARCHAR(255),
    komandan_pangkat VARCHAR(50),
    komandan_nrp VARCHAR(50),
    jumlah_abk INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign keys (will be activated after Master Asset table is ready)
    CONSTRAINT fk_faslan_bmn FOREIGN KEY (kode_asset) 
        REFERENCES assets_tanah(code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for Faslan
CREATE INDEX idx_faslan_kode_asset ON faslan_assets(kode_asset);
CREATE INDEX idx_faslan_jenis ON faslan_assets(jenis_faslan);
CREATE INDEX idx_faslan_status ON faslan_assets(status_operasional);
CREATE INDEX idx_faslan_koordinat ON faslan_assets(koordinat_lat, koordinat_lng);

-- ============================================================================
-- 2. FASHARPAN (Pemeliharaan & Perbaikan) - Maintenance Log
-- ============================================================================
CREATE TABLE IF NOT EXISTS fasharpan_maintenance (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER,
    kode_asset VARCHAR(50),
    
    -- Maintenance specific fields
    jenis_maintenance VARCHAR(100), -- Preventive, Corrective, Overhaul, Emergency
    tanggal_maintenance DATE NOT NULL,
    tanggal_selesai DATE,
    status VARCHAR(50), -- Scheduled, In Progress, Completed, Cancelled
    deskripsi TEXT,
    biaya BIGINT,
    teknisi_nama VARCHAR(255),
    teknisi_nrp VARCHAR(50),
    
    -- Parts used (JSON format)
    spare_parts JSONB, -- [{nama: "", qty: 0, harga: 0, satuan: ""}]
    
    -- Approval
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_fasharpan_bmn FOREIGN KEY (kode_asset) 
        REFERENCES assets_tanah(code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for Fasharpan
CREATE INDEX idx_fasharpan_kode_asset ON fasharpan_maintenance(kode_asset);
CREATE INDEX idx_fasharpan_tanggal ON fasharpan_maintenance(tanggal_maintenance);
CREATE INDEX idx_fasharpan_status ON fasharpan_maintenance(status);
CREATE INDEX idx_fasharpan_jenis ON fasharpan_maintenance(jenis_maintenance);

-- ============================================================================
-- 3. DISBEK (Perbekalan/Inventory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS disbek_inventory (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER,
    kode_asset VARCHAR(50),
    
    -- Inventory specific fields
    kategori VARCHAR(100), -- Logistik, Amunisi, BBM, Alat Tulis, dll
    satuan VARCHAR(50), -- Unit, Kg, Liter, Pcs, dll
    stok_minimum INTEGER DEFAULT 0,
    stok_maksimum INTEGER,
    stok_saat_ini INTEGER DEFAULT 0,
    lokasi_gudang VARCHAR(255),
    rak_posisi VARCHAR(100),
    
    -- Tracking
    last_restock_date DATE,
    last_usage_date DATE,
    reorder_point INTEGER, -- Titik pemesanan ulang
    
    -- Pricing
    harga_satuan BIGINT,
    total_nilai BIGINT GENERATED ALWAYS AS (stok_saat_ini * harga_satuan) STORED,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_disbek_bmn FOREIGN KEY (kode_asset) 
        REFERENCES assets_tanah(code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for DisBek
CREATE INDEX idx_disbek_kode_asset ON disbek_inventory(kode_asset);
CREATE INDEX idx_disbek_kategori ON disbek_inventory(kategori);
CREATE INDEX idx_disbek_stok ON disbek_inventory(stok_saat_ini);
CREATE INDEX idx_disbek_lokasi ON disbek_inventory(lokasi_gudang);

-- ============================================================================
-- 4. DISANG (Angkutan/Vehicles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS disang_vehicles (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER,
    kode_asset VARCHAR(50),
    
    -- Vehicle specific fields
    jenis_kendaraan VARCHAR(100), -- Truk, Bus, Sedan, Motor, Speedboat, dll
    nomor_polisi VARCHAR(50) UNIQUE,
    nomor_rangka VARCHAR(100),
    nomor_mesin VARCHAR(100),
    tahun_pembuatan INTEGER,
    merk VARCHAR(100),
    model VARCHAR(100),
    warna VARCHAR(50),
    kapasitas_penumpang INTEGER,
    kapasitas_muatan DECIMAL(10,2), -- dalam Kg atau Ton
    
    -- Operational
    status_kendaraan VARCHAR(50), -- Aktif, Standby, Maintenance, Rusak, Dihapuskan
    driver_nama VARCHAR(255),
    driver_nrp VARCHAR(50),
    driver_kontak VARCHAR(50),
    
    -- Fuel & Maintenance
    jenis_bbm VARCHAR(50), -- Bensin, Solar, Listrik
    konsumsi_bbm DECIMAL(5,2), -- Km/Liter
    last_service_date DATE,
    next_service_date DATE,
    odometer INTEGER, -- Km
    
    -- Insurance & Tax
    nomor_stnk VARCHAR(100),
    masa_berlaku_stnk DATE,
    nomor_asuransi VARCHAR(100),
    masa_berlaku_asuransi DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_disang_bmn FOREIGN KEY (kode_asset) 
        REFERENCES assets_tanah(code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for DisAng
CREATE INDEX idx_disang_kode_asset ON disang_vehicles(kode_asset);
CREATE INDEX idx_disang_nopol ON disang_vehicles(nomor_polisi);
CREATE INDEX idx_disang_jenis ON disang_vehicles(jenis_kendaraan);
CREATE INDEX idx_disang_status ON disang_vehicles(status_kendaraan);

-- ============================================================================
-- 5. PETA FASLAN (Geospatial/Location Mapping)
-- ============================================================================
CREATE TABLE IF NOT EXISTS peta_faslan_locations (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER,
    kode_asset VARCHAR(50),
    
    -- Geospatial data
    koordinat_lat DECIMAL(10,8) NOT NULL,
    koordinat_lng DECIMAL(11,8) NOT NULL,
    map_boundary JSONB, -- GeoJSON polygon/multipolygon
    area_name VARCHAR(255),
    area_size DECIMAL(15,2), -- m2
    
    -- Display settings
    marker_icon VARCHAR(100) DEFAULT 'default',
    marker_color VARCHAR(50) DEFAULT '#003366',
    popup_content TEXT,
    layer_group VARCHAR(100), -- Grouping for map layers
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_peta_bmn FOREIGN KEY (kode_asset) 
        REFERENCES assets_tanah(code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for Peta Faslan
CREATE INDEX idx_peta_kode_asset ON peta_faslan_locations(kode_asset);
CREATE INDEX idx_peta_koordinat ON peta_faslan_locations(koordinat_lat, koordinat_lng);
CREATE INDEX idx_peta_layer ON peta_faslan_locations(layer_group);

-- ============================================================================
-- 6. KERJASAMA (Partnership/Collaboration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS kerjasama_assets (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER,
    kode_asset VARCHAR(50),
    
    -- Partnership details
    jenis_kerjasama VARCHAR(100), -- Sewa, Pinjam Pakai, BOT, KSO, dll
    mitra_nama VARCHAR(255) NOT NULL,
    mitra_alamat TEXT,
    mitra_kontak VARCHAR(100),
    mitra_email VARCHAR(100),
    
    -- Agreement
    nomor_perjanjian VARCHAR(100) UNIQUE,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    nilai_kerjasama BIGINT,
    pembayaran_schedule VARCHAR(50), -- Bulanan, Tahunan, Sekali Bayar
    status VARCHAR(50), -- Active, Expired, Terminated, Pending
    
    -- Documents
    dokumen_perjanjian JSONB, -- [{nama: "", url: "", tanggal_upload: ""}]
    
    -- Contact person
    pic_internal VARCHAR(255),
    pic_internal_nrp VARCHAR(50),
    pic_mitra VARCHAR(255),
    pic_mitra_kontak VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_kerjasama_bmn FOREIGN KEY (kode_asset) 
        REFERENCES assets_tanah(code) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for Kerjasama
CREATE INDEX idx_kerjasama_kode_asset ON kerjasama_assets(kode_asset);
CREATE INDEX idx_kerjasama_status ON kerjasama_assets(status);
CREATE INDEX idx_kerjasama_tanggal ON kerjasama_assets(tanggal_mulai, tanggal_selesai);
CREATE INDEX idx_kerjasama_mitra ON kerjasama_assets(mitra_nama);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Asset Overview with Counts
CREATE OR REPLACE VIEW v_asset_overview AS
SELECT 
    a.id,
    a.code as kode_asset,
    a.name as nama_asset,
    a.category as jenis_bmn,
    a.status as kondisi,
    a.location as alamat,
    
    -- Count related records
    (SELECT COUNT(*) FROM faslan_assets WHERE kode_asset = a.code) as faslan_count,
    (SELECT COUNT(*) FROM fasharpan_maintenance WHERE kode_asset = a.code) as maintenance_count,
    (SELECT COUNT(*) FROM disbek_inventory WHERE kode_asset = a.code) as inventory_count,
    (SELECT COUNT(*) FROM disang_vehicles WHERE kode_asset = a.code) as vehicle_count,
    (SELECT COUNT(*) FROM kerjasama_assets WHERE kode_asset = a.code) as partnership_count,
    (SELECT COUNT(*) FROM peta_faslan_locations WHERE kode_asset = a.code) as location_count,
    
    a.created_at,
    a.updated_at
FROM assets_tanah a;

-- View: Assets with Locations
CREATE OR REPLACE VIEW v_asset_with_location AS
SELECT 
    a.code as kode_asset,
    a.name as nama_asset,
    a.category as jenis_bmn,
    a.location as alamat,
    p.koordinat_lat,
    p.koordinat_lng,
    p.area_name,
    p.marker_icon,
    p.marker_color
FROM assets_tanah a
LEFT JOIN peta_faslan_locations p ON a.code = p.kode_asset;

-- View: Maintenance Summary
CREATE OR REPLACE VIEW v_maintenance_summary AS
SELECT 
    a.code as kode_asset,
    a.name as nama_asset,
    COUNT(m.id) as total_maintenance,
    SUM(CASE WHEN m.status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN m.status = 'In Progress' THEN 1 ELSE 0 END) as inprogress_count,
    SUM(m.biaya) as total_biaya,
    MAX(m.tanggal_maintenance) as last_maintenance_date
FROM assets_tanah a
LEFT JOIN fasharpan_maintenance m ON a.code = m.kode_asset
GROUP BY a.code, a.name;

-- View: Inventory Summary
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT 
    kategori,
    COUNT(*) as jumlah_item,
    SUM(stok_saat_ini) as total_stok,
    SUM(total_nilai) as total_nilai,
    SUM(CASE WHEN stok_saat_ini <= stok_minimum THEN 1 ELSE 0 END) as low_stock_count
FROM disbek_inventory
GROUP BY kategori;

-- View: Vehicle Fleet Summary
CREATE OR REPLACE VIEW v_vehicle_fleet_summary AS
SELECT 
    jenis_kendaraan,
    status_kendaraan,
    COUNT(*) as jumlah,
    AVG(EXTRACT(YEAR FROM CURRENT_DATE) - tahun_pembuatan) as avg_age_years
FROM disang_vehicles
GROUP BY jenis_kendaraan, status_kendaraan;

-- View: Active Partnerships
CREATE OR REPLACE VIEW v_active_partnerships AS
SELECT 
    k.*,
    a.name as nama_asset,
    a.category as jenis_bmn,
    CASE 
        WHEN k.tanggal_selesai < CURRENT_DATE THEN 'Expired'
        WHEN k.tanggal_selesai <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Active'
    END as partnership_status
FROM kerjasama_assets k
INNER JOIN assets_tanah a ON k.kode_asset = a.code
WHERE k.status = 'Active';

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_faslan_updated_at BEFORE UPDATE ON faslan_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fasharpan_updated_at BEFORE UPDATE ON fasharpan_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disbek_updated_at BEFORE UPDATE ON disbek_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disang_updated_at BEFORE UPDATE ON disang_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peta_updated_at BEFORE UPDATE ON peta_faslan_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kerjasama_updated_at BEFORE UPDATE ON kerjasama_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE faslan_assets IS 'Fasilitas Angkutan Laut - KRI, KAL, KAMLA, Dermaga, dll';
COMMENT ON TABLE fasharpan_maintenance IS 'Log pemeliharaan dan perbaikan asset';
COMMENT ON TABLE disbek_inventory IS 'Inventory perbekalan dan logistik';
COMMENT ON TABLE disang_vehicles IS 'Kendaraan dinas dan angkutan';
COMMENT ON TABLE peta_faslan_locations IS 'Data geospasial untuk mapping asset';
COMMENT ON TABLE kerjasama_assets IS 'Kerjasama dan partnership terkait asset';

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Sample Faslan
-- INSERT INTO faslan_assets (kode_asset, jenis_faslan, nomor_lambung, status_operasional)
-- VALUES ('BMN-TN-001', 'KRI', '123', 'Operasional');

-- Sample Maintenance
-- INSERT INTO fasharpan_maintenance (kode_asset, jenis_maintenance, tanggal_maintenance, status)
-- VALUES ('BMN-TN-001', 'Preventive', CURRENT_DATE, 'Scheduled');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
