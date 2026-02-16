-- Migration: Create data_harkan table
-- Date: 2026-02-17
-- Description: Tabel untuk menyimpan data Harkan (Harta Karun/Aset Kapal)

CREATE TABLE IF NOT EXISTS data_harkan (
    id SERIAL PRIMARY KEY,
    
    -- Data General
    unsur VARCHAR(50),
    nama VARCHAR(255),
    bahan VARCHAR(100),
    panjang_max_loa NUMERIC,
    panjang NUMERIC,
    panjang_lwl NUMERIC,
    lebar_max NUMERIC,
    lebar_garis_air NUMERIC,
    tinggi_max NUMERIC,
    draft_max NUMERIC,
    dwt NUMERIC,
    merk_mesin VARCHAR(100),
    type_mesin VARCHAR(100),
    
    -- Lokasi
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    
    -- Spesifikasi
    bb VARCHAR(100),
    tahun_pembuatan INTEGER,
    tahun_operasi INTEGER,
    status_kelaikan VARCHAR(50),
    
    -- Arrays/JSON fields
    sertifikasi JSONB DEFAULT '[]'::jsonb,
    pesawat JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    kondisi VARCHAR(50),
    status VARCHAR(50),
    status_pemeliharaan TEXT,
    persentasi NUMERIC,
    permasalahan_teknis TEXT,
    tds VARCHAR(100),
    keterangan TEXT,
    
    -- Files
    fotos JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_harkan_unsur ON data_harkan(unsur);
CREATE INDEX IF NOT EXISTS idx_harkan_nama ON data_harkan(nama);
CREATE INDEX IF NOT EXISTS idx_harkan_kondisi ON data_harkan(kondisi);
CREATE INDEX IF NOT EXISTS idx_harkan_status ON data_harkan(status);
CREATE INDEX IF NOT EXISTS idx_harkan_created_at ON data_harkan(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE data_harkan IS 'Tabel untuk menyimpan data Harkan (Harta Karun/Aset Kapal dan Peralatan)';
COMMENT ON COLUMN data_harkan.unsur IS 'Jenis unsur: KRI, KAL, dll';
COMMENT ON COLUMN data_harkan.nama IS 'Nama kapal/aset';
COMMENT ON COLUMN data_harkan.sertifikasi IS 'Array JSON berisi data sertifikasi: [{nama, nomor, berlaku, catatan}]';
COMMENT ON COLUMN data_harkan.pesawat IS 'Array JSON berisi data pesawat/peralatan: [{nama_group, items: [{nama_item}]}]';
COMMENT ON COLUMN data_harkan.fotos IS 'Array JSON berisi data foto: [{name, url, type}]';
