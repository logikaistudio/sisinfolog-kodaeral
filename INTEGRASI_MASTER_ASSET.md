# Arsitektur Integrasi Master Asset BMN dengan Fasilitas Pangkalan

## 🎯 Konsep Integrasi

Master Asset BMN akan menjadi **data referensi utama** yang terintegrasi dengan semua modul fasilitas pangkalan:

```
┌─────────────────────────────────────────────────────────────┐
│              MASTER ASSET BMN (Core Reference)              │
│  - Jenis BMN, Kode Asset, NUP, Nama Asset                  │
│  - Lokasi, Kondisi, Nilai, Luas                            │
│  - Sertifikat, PSP, Alamat Lengkap                         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   FASLAN      │  │   FASHARPAN   │  │    DISBEK     │
│ (Fasilitas    │  │ (Pemeliharaan │  │ (Perbekalan)  │
│  Angkutan)    │  │  & Perbaikan) │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  PETA FASLAN  │  │   KERJASAMA   │  │    DISANG     │
│ (Mapping)     │  │               │  │  (Angkutan)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

## 📊 Struktur Relasi Database

### 1. Master Asset BMN (Parent/Reference)
```sql
CREATE TABLE assets_bmn (
    id SERIAL PRIMARY KEY,
    jenis_bmn VARCHAR(100) NOT NULL,
    kode_asset VARCHAR(50) UNIQUE NOT NULL,
    nup VARCHAR(23) UNIQUE NOT NULL,
    nama_asset VARCHAR(255) NOT NULL,
    no_sertifikat VARCHAR(100),
    kondisi VARCHAR(50),
    tanggal_perolehan DATE,
    nilai_perolehan BIGINT,
    luas_tanah DECIMAL(15,2),
    no_psp VARCHAR(100),
    tanggal_psp DATE,
    alamat TEXT,
    rt_rw VARCHAR(20),
    desa_kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100),
    kode_kota VARCHAR(4),
    provinsi VARCHAR(100),
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Faslan (Fasilitas Angkutan Laut) - Child
```sql
CREATE TABLE faslan_assets (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER REFERENCES assets_bmn(id) ON DELETE CASCADE,
    kode_asset VARCHAR(50) REFERENCES assets_bmn(kode_asset),
    
    -- Faslan specific fields
    jenis_faslan VARCHAR(100), -- KRI, KAL, KAMLA, Dermaga, dll
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
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Fasharpan (Pemeliharaan & Perbaikan) - Child
```sql
CREATE TABLE fasharpan_maintenance (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER REFERENCES assets_bmn(id),
    kode_asset VARCHAR(50) REFERENCES assets_bmn(kode_asset),
    
    -- Maintenance specific fields
    jenis_maintenance VARCHAR(100), -- Preventive, Corrective, Overhaul
    tanggal_maintenance DATE NOT NULL,
    tanggal_selesai DATE,
    status VARCHAR(50), -- Scheduled, In Progress, Completed, Cancelled
    deskripsi TEXT,
    biaya BIGINT,
    teknisi_nama VARCHAR(255),
    teknisi_nrp VARCHAR(50),
    
    -- Parts used
    spare_parts JSONB, -- [{nama: "", qty: 0, harga: 0}]
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. DisBek (Perbekalan) - Child
```sql
CREATE TABLE disbek_inventory (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER REFERENCES assets_bmn(id),
    kode_asset VARCHAR(50) REFERENCES assets_bmn(kode_asset),
    
    -- Inventory specific fields
    kategori VARCHAR(100), -- Logistik, Amunisi, BBM, dll
    satuan VARCHAR(50),
    stok_minimum INTEGER,
    stok_maksimum INTEGER,
    stok_saat_ini INTEGER,
    lokasi_gudang VARCHAR(255),
    
    -- Tracking
    last_restock_date DATE,
    last_usage_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. DisAng (Angkutan) - Child
```sql
CREATE TABLE disang_vehicles (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER REFERENCES assets_bmn(id),
    kode_asset VARCHAR(50) REFERENCES assets_bmn(kode_asset),
    
    -- Vehicle specific fields
    jenis_kendaraan VARCHAR(100), -- Truk, Bus, Sedan, Motor, dll
    nomor_polisi VARCHAR(50),
    nomor_rangka VARCHAR(100),
    nomor_mesin VARCHAR(100),
    tahun_pembuatan INTEGER,
    merk VARCHAR(100),
    warna VARCHAR(50),
    kapasitas_penumpang INTEGER,
    kapasitas_muatan DECIMAL(10,2),
    
    -- Operational
    status_kendaraan VARCHAR(50), -- Aktif, Standby, Maintenance, Rusak
    driver_nama VARCHAR(255),
    driver_nrp VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Peta Faslan (Mapping) - Child
```sql
CREATE TABLE peta_faslan_locations (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER REFERENCES assets_bmn(id),
    kode_asset VARCHAR(50) REFERENCES assets_bmn(kode_asset),
    
    -- Geospatial data
    koordinat_lat DECIMAL(10,8) NOT NULL,
    koordinat_lng DECIMAL(11,8) NOT NULL,
    map_boundary JSONB, -- GeoJSON polygon
    area_name VARCHAR(255),
    
    -- Display settings
    marker_icon VARCHAR(100),
    marker_color VARCHAR(50),
    popup_content TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Kerjasama (Partnership) - Child
```sql
CREATE TABLE kerjasama_assets (
    id SERIAL PRIMARY KEY,
    bmn_id INTEGER REFERENCES assets_bmn(id),
    kode_asset VARCHAR(50) REFERENCES assets_bmn(kode_asset),
    
    -- Partnership details
    jenis_kerjasama VARCHAR(100), -- Sewa, Pinjam Pakai, BOT, dll
    mitra_nama VARCHAR(255),
    mitra_alamat TEXT,
    mitra_kontak VARCHAR(100),
    
    -- Agreement
    nomor_perjanjian VARCHAR(100),
    tanggal_mulai DATE,
    tanggal_selesai DATE,
    nilai_kerjasama BIGINT,
    status VARCHAR(50), -- Active, Expired, Terminated
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔗 Relasi & Foreign Keys

### Primary Key: `kode_asset`
Semua tabel child menggunakan `kode_asset` sebagai foreign key ke Master Asset BMN.

### Cascade Rules:
- **ON DELETE CASCADE**: Jika Master Asset dihapus, semua data terkait ikut terhapus
- **ON UPDATE CASCADE**: Jika kode_asset diupdate, semua referensi ikut terupdate

## 📋 Views untuk Reporting

### 1. View: Asset Overview
```sql
CREATE OR REPLACE VIEW v_asset_overview AS
SELECT 
    a.id,
    a.kode_asset,
    a.nup,
    a.nama_asset,
    a.jenis_bmn,
    a.kondisi,
    a.nilai_perolehan,
    a.alamat,
    
    -- Count related records
    (SELECT COUNT(*) FROM faslan_assets WHERE kode_asset = a.kode_asset) as faslan_count,
    (SELECT COUNT(*) FROM fasharpan_maintenance WHERE kode_asset = a.kode_asset) as maintenance_count,
    (SELECT COUNT(*) FROM disbek_inventory WHERE kode_asset = a.kode_asset) as inventory_count,
    (SELECT COUNT(*) FROM disang_vehicles WHERE kode_asset = a.kode_asset) as vehicle_count,
    (SELECT COUNT(*) FROM kerjasama_assets WHERE kode_asset = a.kode_asset) as partnership_count
    
FROM assets_bmn a;
```

### 2. View: Asset with Location
```sql
CREATE OR REPLACE VIEW v_asset_with_location AS
SELECT 
    a.*,
    p.koordinat_lat,
    p.koordinat_lng,
    p.area_name,
    p.map_boundary
FROM assets_bmn a
LEFT JOIN peta_faslan_locations p ON a.kode_asset = p.kode_asset;
```

### 3. View: Asset Maintenance History
```sql
CREATE OR REPLACE VIEW v_asset_maintenance_history AS
SELECT 
    a.kode_asset,
    a.nama_asset,
    a.jenis_bmn,
    m.tanggal_maintenance,
    m.jenis_maintenance,
    m.status,
    m.biaya,
    m.teknisi_nama
FROM assets_bmn a
INNER JOIN fasharpan_maintenance m ON a.kode_asset = m.kode_asset
ORDER BY m.tanggal_maintenance DESC;
```

## 🔄 API Endpoints untuk Integrasi

### 1. Get Asset with All Relations
```javascript
// GET /api/assets/:kode_asset/complete
{
    "asset": {...},
    "faslan": [...],
    "maintenance": [...],
    "inventory": [...],
    "vehicles": [...],
    "partnerships": [...],
    "location": {...}
}
```

### 2. Link Asset to Module
```javascript
// POST /api/assets/:kode_asset/link/:module
{
    "module": "faslan", // faslan, fasharpan, disbek, disang, kerjasama
    "data": {...}
}
```

### 3. Get Assets by Module
```javascript
// GET /api/modules/:module/assets
// Returns all assets linked to specific module
```

## 📊 Dashboard Integrasi

### Widget: Asset Distribution
```
┌─────────────────────────────────────┐
│   Asset Distribution by Module      │
├─────────────────────────────────────┤
│ Faslan:      45 assets              │
│ Fasharpan:   120 maintenance logs   │
│ DisBek:      78 inventory items     │
│ DisAng:      32 vehicles            │
│ Kerjasama:   12 partnerships        │
└─────────────────────────────────────┘
```

### Widget: Asset Value Summary
```
┌─────────────────────────────────────┐
│   Total Asset Value by Type         │
├─────────────────────────────────────┤
│ Tanah:      Rp 50.000.000.000       │
│ Bangunan:   Rp 150.000.000.000      │
│ Peralatan:  Rp 25.000.000.000       │
│ TOTAL:      Rp 225.000.000.000      │
└─────────────────────────────────────┘
```

## 🎨 UI Components

### 1. Asset Detail Page
```
┌─────────────────────────────────────────────────────────┐
│ [← Back] Asset Detail: BMN-TN-001                       │
├─────────────────────────────────────────────────────────┤
│ Informasi BMN                                           │
│ • NUP: 12345678901234567890123                         │
│ • Nama: Tanah Kantor Pusat Kodaeral 3                  │
│ • Jenis: Tanah                                          │
│ • Kondisi: Baik                                         │
│ • Nilai: Rp 5.000.000.000                              │
├─────────────────────────────────────────────────────────┤
│ Tabs: [Faslan] [Maintenance] [Inventory] [Vehicles]    │
│       [Partnerships] [Location]                         │
├─────────────────────────────────────────────────────────┤
│ (Tab content here)                                      │
└─────────────────────────────────────────────────────────┘
```

### 2. Asset Selector Component
```jsx
<AssetSelector 
    module="faslan"
    onSelect={(asset) => linkAssetToFaslan(asset)}
    filter={{ jenis_bmn: 'Tanah' }}
/>
```

## 🔍 Search & Filter

### Global Asset Search
```javascript
// Search across all fields
GET /api/assets/search?q=kantor

// Filter by multiple criteria
GET /api/assets?jenis_bmn=Tanah&kondisi=Baik&provinsi=DKI Jakarta

// Filter by value range
GET /api/assets?nilai_min=1000000000&nilai_max=10000000000
```

## 📱 Mobile Integration

### QR Code untuk Asset
Setiap asset BMN memiliki QR Code yang berisi:
- Kode Asset
- NUP
- Link ke detail page
- Quick actions (maintenance, update location, dll)

## 🔐 Access Control

### Role-based Access
```javascript
const permissions = {
    'admin': ['create', 'read', 'update', 'delete'],
    'operator_faslan': ['read', 'update_faslan'],
    'operator_fasharpan': ['read', 'update_maintenance'],
    'operator_disbek': ['read', 'update_inventory'],
    'viewer': ['read']
};
```

## 📈 Reporting & Analytics

### 1. Asset Utilization Report
- Asset yang sedang digunakan vs idle
- Tingkat utilisasi per kategori
- Trend penggunaan

### 2. Maintenance Cost Report
- Total biaya maintenance per asset
- Biaya maintenance per kategori
- Trend biaya maintenance

### 3. Asset Depreciation
- Nilai perolehan vs nilai saat ini
- Depresiasi per tahun
- Proyeksi nilai asset

## 🚀 Implementation Roadmap

### Phase 1: Database Setup (Week 1)
- ✅ Create Master Asset BMN table
- ✅ Create child tables (Faslan, Fasharpan, dll)
- ✅ Create views
- ✅ Create indexes

### Phase 2: API Development (Week 2)
- ✅ CRUD endpoints for Master Asset
- ✅ Integration endpoints
- ✅ Search & filter endpoints

### Phase 3: UI Development (Week 3-4)
- ✅ Asset detail page
- ✅ Asset selector component
- ✅ Integration forms
- ✅ Dashboard widgets

### Phase 4: Testing & Deployment (Week 5)
- ✅ Unit tests
- ✅ Integration tests
- ✅ User acceptance testing
- ✅ Production deployment

## 📚 Documentation

### For Developers
- API documentation (Swagger/OpenAPI)
- Database schema documentation
- Component library documentation

### For Users
- User manual
- Video tutorials
- FAQ

---

**Dibuat untuk integrasi seamless antara Master Asset BMN dengan semua modul Fasilitas Pangkalan Kodaeral 3 Jakarta**
