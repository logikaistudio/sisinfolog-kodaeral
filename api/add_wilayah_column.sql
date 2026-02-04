-- Add wilayah column to faslabuh table
ALTER TABLE faslabuh ADD COLUMN IF NOT EXISTS wilayah VARCHAR(100);

-- Create index on wilayah for filtering
CREATE INDEX IF NOT EXISTS idx_faslabuh_wilayah ON faslabuh(wilayah);

COMMENT ON COLUMN faslabuh.wilayah IS 'Wilayah/Kota/Kabupaten sesuai provinsi';
