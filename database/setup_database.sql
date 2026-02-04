-- ============================================
-- SISINFOLOG DATABASE SCHEMA
-- Jalankan script ini di Neon DB Console
-- ============================================

-- 1. Create assets_tanah table (jika belum ada)
CREATE TABLE IF NOT EXISTS assets_tanah (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE,
    name TEXT,
    category VARCHAR(100),
    luas VARCHAR(50),
    status TEXT,
    location TEXT,
    coordinates TEXT,
    map_boundary TEXT,
    area VARCHAR(100),
    occupant_name VARCHAR(255),
    occupant_rank VARCHAR(100),
    occupant_nrp VARCHAR(100),
    occupant_title VARCHAR(255),
    
    -- Field BMN (Barang Milik Negara)
    jenis_bmn VARCHAR(100),
    kode_barang VARCHAR(100),
    nup VARCHAR(50),
    nama_barang TEXT,
    kondisi VARCHAR(50),
    luas_tanah_seluruhnya NUMERIC(15, 2),
    tanah_yg_telah_bersertifikat NUMERIC(15, 2),
    tanah_yg_belum_bersertifikat NUMERIC(15, 2),
    tanggal_perolehan DATE,
    nilai_perolehan NUMERIC(20, 2),
    no_sertifikat VARCHAR(100),
    tgl_sertifikat DATE,
    standar_satuan VARCHAR(50),
    alamat_detail TEXT,
    kecamatan VARCHAR(100),
    kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    keterangan_bmn TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create assets_bangunan table (jika belum ada)
CREATE TABLE IF NOT EXISTS assets_bangunan (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE,
    name TEXT,
    category VARCHAR(100),
    luas VARCHAR(50),
    status TEXT,
    location TEXT,
    coordinates TEXT,
    map_boundary TEXT,
    area VARCHAR(100),
    occupant_name VARCHAR(255),
    occupant_rank VARCHAR(100),
    occupant_nrp VARCHAR(100),
    occupant_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create supplies table (untuk Bekang)
CREATE TABLE IF NOT EXISTS supplies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE,
    name TEXT NOT NULL,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(50),
    condition VARCHAR(50),
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add BMN columns to existing assets_tanah (jika tabel sudah ada tapi belum ada kolom BMN)
DO $$
BEGIN
    -- Jenis BMN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='jenis_bmn') THEN
        ALTER TABLE assets_tanah ADD COLUMN jenis_bmn VARCHAR(100);
    END IF;
    
    -- Kode Barang
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='kode_barang') THEN
        ALTER TABLE assets_tanah ADD COLUMN kode_barang VARCHAR(100);
    END IF;
    
    -- NUP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='nup') THEN
        ALTER TABLE assets_tanah ADD COLUMN nup VARCHAR(50);
    END IF;
    
    -- Nama Barang
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='nama_barang') THEN
        ALTER TABLE assets_tanah ADD COLUMN nama_barang TEXT;
    END IF;
    
    -- Kondisi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='kondisi') THEN
        ALTER TABLE assets_tanah ADD COLUMN kondisi VARCHAR(50);
    END IF;
    
    -- Luas Tanah Seluruhnya
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='luas_tanah_seluruhnya') THEN
        ALTER TABLE assets_tanah ADD COLUMN luas_tanah_seluruhnya NUMERIC(15, 2);
    END IF;
    
    -- Tanah Bersertifikat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='tanah_yg_telah_bersertifikat') THEN
        ALTER TABLE assets_tanah ADD COLUMN tanah_yg_telah_bersertifikat NUMERIC(15, 2);
    END IF;
    
    -- Tanah Belum Bersertifikat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='tanah_yg_belum_bersertifikat') THEN
        ALTER TABLE assets_tanah ADD COLUMN tanah_yg_belum_bersertifikat NUMERIC(15, 2);
    END IF;
    
    -- Tanggal Perolehan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='tanggal_perolehan') THEN
        ALTER TABLE assets_tanah ADD COLUMN tanggal_perolehan DATE;
    END IF;
    
    -- Nilai Perolehan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='nilai_perolehan') THEN
        ALTER TABLE assets_tanah ADD COLUMN nilai_perolehan NUMERIC(20, 2);
    END IF;
    
    -- No Sertifikat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='no_sertifikat') THEN
        ALTER TABLE assets_tanah ADD COLUMN no_sertifikat VARCHAR(100);
    END IF;
    
    -- Tanggal Sertifikat
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='tgl_sertifikat') THEN
        ALTER TABLE assets_tanah ADD COLUMN tgl_sertifikat DATE;
    END IF;
    
    -- Standar Satuan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='standar_satuan') THEN
        ALTER TABLE assets_tanah ADD COLUMN standar_satuan VARCHAR(50);
    END IF;
    
    -- Alamat Detail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='alamat_detail') THEN
        ALTER TABLE assets_tanah ADD COLUMN alamat_detail TEXT;
    END IF;
    
    -- Kecamatan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='kecamatan') THEN
        ALTER TABLE assets_tanah ADD COLUMN kecamatan VARCHAR(100);
    END IF;
    
    -- Kabupaten
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='kabupaten') THEN
        ALTER TABLE assets_tanah ADD COLUMN kabupaten VARCHAR(100);
    END IF;
    
    -- Provinsi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='provinsi') THEN
        ALTER TABLE assets_tanah ADD COLUMN provinsi VARCHAR(100);
    END IF;
    
    -- Keterangan BMN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assets_tanah' AND column_name='keterangan_bmn') THEN
        ALTER TABLE assets_tanah ADD COLUMN keterangan_bmn TEXT;
    END IF;
END $$;

-- 5. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_tanah_code ON assets_tanah(code);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_area ON assets_tanah(area);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_kode_barang ON assets_tanah(kode_barang);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_nup ON assets_tanah(nup);

-- 6. Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 7. Verify columns in assets_tanah
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assets_tanah' 
ORDER BY ordinal_position;
