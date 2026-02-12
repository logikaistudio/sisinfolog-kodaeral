-- Add longitude and latitude columns to assets_pemanfaatan table
ALTER TABLE assets_pemanfaatan 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);

-- Add comment to columns
COMMENT ON COLUMN assets_pemanfaatan.longitude IS 'Longitude coordinate for map integration';
COMMENT ON COLUMN assets_pemanfaatan.latitude IS 'Latitude coordinate for map integration';
