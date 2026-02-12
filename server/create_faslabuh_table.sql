-- Create Faslabuh (Dermaga) Table
-- Based on Excel structure from user's photo

DROP TABLE IF EXISTS faslabuh CASCADE;

CREATE TABLE faslabuh (
    id SERIAL PRIMARY KEY,
    
    -- Kolom A-C: Informasi Lokasi
    lantamal VARCHAR(100),
    lanal_faslan VARCHAR(100),
    lokasi_dermaga TEXT,
    
    -- Kolom D-E: Identifikasi Dermaga
    nama_dermaga VARCHAR(200),
    jenis_dermaga VARCHAR(100),
    
    -- Kolom F-K: Spesifikasi Teknis Dermaga
    panjang_m DECIMAL(10, 2),
    lebar_m DECIMAL(10, 2),
    kedalaman_m DECIMAL(10, 2),
    luas_m2 DECIMAL(10, 2),
    konstruksi VARCHAR(100),
    tahun_pembangunan INTEGER,
    
    -- Kolom L-O: Kapasitas
    kapasitas_kapal VARCHAR(200),
    tonase_max DECIMAL(10, 2),
    jumlah_tambat INTEGER,
    panjang_tambat_m DECIMAL(10, 2),
    
    -- Kolom P-S: Kondisi Fisik
    kondisi_dermaga VARCHAR(50), -- Baik/Rusak Ringan/Rusak Berat
    kondisi_lantai VARCHAR(50),
    kondisi_dinding VARCHAR(50),
    kondisi_fender VARCHAR(50),
    
    -- Kolom T-W: Fasilitas Pendukung
    bollard INTEGER,
    fender INTEGER,
    tangga_kapal INTEGER,
    lampu_dermaga INTEGER,
    
    -- Kolom X-AA: Utilitas
    air_bersih BOOLEAN DEFAULT false,
    listrik BOOLEAN DEFAULT false,
    bbm BOOLEAN DEFAULT false,
    crane BOOLEAN DEFAULT false,
    
    -- Kolom AB-AE: Dimensi Tambahan
    elevasi_m DECIMAL(10, 2),
    draft_m DECIMAL(10, 2),
    lebar_apron_m DECIMAL(10, 2),
    panjang_apron_m DECIMAL(10, 2),
    
    -- Kolom AF-AH: Informasi Tambahan
    fungsi_dermaga TEXT,
    keterangan TEXT,
    status_operasional VARCHAR(50), -- Aktif/Tidak Aktif/Dalam Perbaikan
    
    -- Kolom AI-AK: Koordinat (untuk integrasi peta)
    longitude DECIMAL(10, 7),
    latitude DECIMAL(10, 7),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_faslabuh_lantamal ON faslabuh(lantamal);
CREATE INDEX idx_faslabuh_lanal ON faslabuh(lanal_faslan);
CREATE INDEX idx_faslabuh_kondisi ON faslabuh(kondisi_dermaga);
CREATE INDEX idx_faslabuh_status ON faslabuh(status_operasional);

-- Add comments to columns
COMMENT ON TABLE faslabuh IS 'Data Fasilitas Labuh (Dermaga) Kodaeral 3 Jakarta';
COMMENT ON COLUMN faslabuh.lantamal IS 'Lantamal yang membawahi';
COMMENT ON COLUMN faslabuh.lanal_faslan IS 'Lanal atau Faslan lokasi dermaga';
COMMENT ON COLUMN faslabuh.lokasi_dermaga IS 'Alamat lengkap lokasi dermaga';
COMMENT ON COLUMN faslabuh.nama_dermaga IS 'Nama dermaga';
COMMENT ON COLUMN faslabuh.jenis_dermaga IS 'Jenis dermaga (Dermaga Umum, Dermaga Khusus, dll)';
COMMENT ON COLUMN faslabuh.kondisi_dermaga IS 'Kondisi umum dermaga (Baik/Rusak Ringan/Rusak Berat)';
COMMENT ON COLUMN faslabuh.status_operasional IS 'Status operasional (Aktif/Tidak Aktif/Dalam Perbaikan)';
COMMENT ON COLUMN faslabuh.longitude IS 'Koordinat longitude untuk peta';
COMMENT ON COLUMN faslabuh.latitude IS 'Koordinat latitude untuk peta';
