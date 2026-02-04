-- Migration: Add BMN (Barang Milik Negara) Fields to assets_tanah table
-- Date: 2026-02-04
-- Description: Menambahkan field-field BMN untuk mendukung struktur data lengkap

-- Add BMN specific columns
ALTER TABLE assets_tanah 
ADD COLUMN IF NOT EXISTS jenis_bmn VARCHAR(100),
ADD COLUMN IF NOT EXISTS nup VARCHAR(23),
ADD COLUMN IF NOT EXISTS no_sertifikat VARCHAR(100),
ADD COLUMN IF NOT EXISTS kondisi VARCHAR(50),
ADD COLUMN IF NOT EXISTS tanggal_perolehan DATE,
ADD COLUMN IF NOT EXISTS nilai_perolehan BIGINT,
ADD COLUMN IF NOT EXISTS no_psp VARCHAR(100),
ADD COLUMN IF NOT EXISTS tanggal_psp DATE,
ADD COLUMN IF NOT EXISTS rt_rw VARCHAR(20),
ADD COLUMN IF NOT EXISTS desa_kelurahan VARCHAR(100),
ADD COLUMN IF NOT EXISTS kecamatan VARCHAR(100),
ADD COLUMN IF NOT EXISTS kota_kabupaten VARCHAR(100),
ADD COLUMN IF NOT EXISTS kode_kota VARCHAR(4),
ADD COLUMN IF NOT EXISTS provinsi VARCHAR(100),
ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_tanah_nup ON assets_tanah(nup);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_jenis_bmn ON assets_tanah(jenis_bmn);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_kode_kota ON assets_tanah(kode_kota);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_kondisi ON assets_tanah(kondisi);
CREATE INDEX IF NOT EXISTS idx_assets_tanah_tanggal_perolehan ON assets_tanah(tanggal_perolehan);

-- Add comments to columns for documentation
COMMENT ON COLUMN assets_tanah.jenis_bmn IS 'Jenis Barang Milik Negara (Tanah/Bangunan/Peralatan/dll)';
COMMENT ON COLUMN assets_tanah.nup IS 'Nomor Urut Pendaftaran (23 digit)';
COMMENT ON COLUMN assets_tanah.no_sertifikat IS 'Nomor sertifikat (SHM/SHGB/IMB/dll)';
COMMENT ON COLUMN assets_tanah.kondisi IS 'Kondisi asset (Baik/Rusak Ringan/Rusak Berat)';
COMMENT ON COLUMN assets_tanah.tanggal_perolehan IS 'Tanggal perolehan asset';
COMMENT ON COLUMN assets_tanah.nilai_perolehan IS 'Nilai perolehan dalam Rupiah';
COMMENT ON COLUMN assets_tanah.no_psp IS 'Nomor Penetapan Status Penggunaan';
COMMENT ON COLUMN assets_tanah.tanggal_psp IS 'Tanggal Penetapan Status Penggunaan';
COMMENT ON COLUMN assets_tanah.rt_rw IS 'RT/RW lokasi asset';
COMMENT ON COLUMN assets_tanah.desa_kelurahan IS 'Desa atau Kelurahan';
COMMENT ON COLUMN assets_tanah.kecamatan IS 'Kecamatan';
COMMENT ON COLUMN assets_tanah.kota_kabupaten IS 'Kota atau Kabupaten';
COMMENT ON COLUMN assets_tanah.kode_kota IS 'Kode Kota/Kabupaten (4 digit)';
COMMENT ON COLUMN assets_tanah.provinsi IS 'Provinsi';
COMMENT ON COLUMN assets_tanah.keterangan IS 'Keterangan atau catatan tambahan';

-- Optional: Add check constraints for data integrity
ALTER TABLE assets_tanah 
ADD CONSTRAINT chk_nup_length CHECK (nup IS NULL OR LENGTH(nup) = 23),
ADD CONSTRAINT chk_kode_kota_length CHECK (kode_kota IS NULL OR LENGTH(kode_kota) = 4),
ADD CONSTRAINT chk_nilai_perolehan_positive CHECK (nilai_perolehan IS NULL OR nilai_perolehan >= 0);

-- Optional: Create view for BMN reporting
CREATE OR REPLACE VIEW v_bmn_assets AS
SELECT 
    id,
    jenis_bmn,
    code AS kode_asset,
    nup,
    name AS nama_asset,
    no_sertifikat,
    kondisi,
    tanggal_perolehan,
    nilai_perolehan,
    luas AS luas_tanah,
    no_psp,
    tanggal_psp,
    location AS alamat,
    rt_rw,
    desa_kelurahan,
    kecamatan,
    kota_kabupaten,
    kode_kota,
    provinsi,
    keterangan,
    created_at,
    updated_at
FROM assets_tanah
WHERE jenis_bmn IS NOT NULL;

COMMENT ON VIEW v_bmn_assets IS 'View untuk reporting BMN dengan field yang sudah disesuaikan';

-- Create summary view for BMN statistics
CREATE OR REPLACE VIEW v_bmn_summary AS
SELECT 
    jenis_bmn,
    kondisi,
    COUNT(*) as jumlah_asset,
    SUM(nilai_perolehan) as total_nilai,
    SUM(luas) as total_luas,
    provinsi,
    kota_kabupaten
FROM assets_tanah
WHERE jenis_bmn IS NOT NULL
GROUP BY jenis_bmn, kondisi, provinsi, kota_kabupaten
ORDER BY jenis_bmn, kondisi;

COMMENT ON VIEW v_bmn_summary IS 'Summary statistik BMN berdasarkan jenis, kondisi, dan lokasi';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON assets_tanah TO your_app_user;
-- GRANT SELECT ON v_bmn_assets TO your_app_user;
-- GRANT SELECT ON v_bmn_summary TO your_app_user;

-- Verification queries
-- SELECT column_name, data_type, character_maximum_length 
-- FROM information_schema.columns 
-- WHERE table_name = 'assets_tanah' 
-- ORDER BY ordinal_position;
