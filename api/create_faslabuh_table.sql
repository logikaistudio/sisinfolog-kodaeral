-- Create Faslabuh (Dermaga) Table
-- Connected to assets_tanah via kode_barang

CREATE TABLE IF NOT EXISTS faslabuh (
    id SERIAL PRIMARY KEY,
    
    -- Identitas & Lokasi
    provinsi VARCHAR(100),
    lokasi VARCHAR(200),
    nama_dermaga VARCHAR(200) NOT NULL,
    konstruksi VARCHAR(100),
    lon DECIMAL(10, 7),
    lat DECIMAL(10, 7),
    
    -- Koneksi ke Master Aset Tanah
    kode_barang VARCHAR(50), -- Foreign key reference to assets_tanah.kode_barang
    no_sertifikat VARCHAR(100),
    tgl_sertifikat DATE,
    
    -- Dimensi & Kondisi
    panjang DECIMAL(10, 2),
    lebar DECIMAL(10, 2),
    luas DECIMAL(12, 2),
    draft_lwl DECIMAL(10, 2),
    pasut_hwl_lwl DECIMAL(10, 2),
    kondisi INTEGER CHECK (kondisi >= 0 AND kondisi <= 100),
    
    -- Kemampuan Sandar (JSON array)
    sandar_items JSONB, -- [{tipe: 'Fregat', ton: 5000, jumlah: 2}]
    
    -- Kemampuan Plat Lantai
    plat_mst_ton DECIMAL(10, 2),
    plat_jenis_ranmor VARCHAR(100),
    plat_berat_max_ton DECIMAL(10, 2),
    
    -- Dukungan Listrik
    listrik_jml_titik INTEGER,
    listrik_kap_amp DECIMAL(10, 2),
    listrik_tegangan_volt INTEGER,
    listrik_frek_hz INTEGER,
    listrik_sumber VARCHAR(100),
    listrik_daya_kva DECIMAL(10, 2),
    
    -- Dukungan Air Tawar
    air_gwt_m3 DECIMAL(10, 2),
    air_debit_m3_jam DECIMAL(10, 2),
    air_sumber VARCHAR(100),
    
    -- BBM & Hydrant
    bbm VARCHAR(200),
    hydrant VARCHAR(200),
    
    -- Keterangan & Dokumentasi
    keterangan TEXT,
    fotos JSONB, -- [{name: 'foto1.jpg', type: 'image/jpeg', url: 'base64...'}]
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on kode_barang for faster joins
CREATE INDEX IF NOT EXISTS idx_faslabuh_kode_barang ON faslabuh(kode_barang);

-- Create index on nama_dermaga for search
CREATE INDEX IF NOT EXISTS idx_faslabuh_nama_dermaga ON faslabuh(nama_dermaga);

-- Create index on provinsi for filtering
CREATE INDEX IF NOT EXISTS idx_faslabuh_provinsi ON faslabuh(provinsi);

COMMENT ON TABLE faslabuh IS 'Fasilitas Pelabuhan (Dermaga) - Connected to assets_tanah via kode_barang';
COMMENT ON COLUMN faslabuh.kode_barang IS 'Reference to assets_tanah.kode_barang for master data connection';
COMMENT ON COLUMN faslabuh.sandar_items IS 'JSON array of sandar capabilities: [{tipe, ton, jumlah}]';
COMMENT ON COLUMN faslabuh.fotos IS 'JSON array of photo documentation: [{name, type, url}]';
