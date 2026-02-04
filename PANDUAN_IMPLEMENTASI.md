# Panduan Implementasi Integrasi Master Asset BMN

## 📋 Overview

Dokumen ini menjelaskan cara mengintegrasikan Master Asset BMN dengan modul-modul lain di aplikasi Sisinfolog Kodaeral 3.

## 🎯 Konsep Dasar

Master Asset BMN adalah **single source of truth** untuk semua data asset. Setiap modul (Faslan, Fasharpan, DisBek, dll) akan **reference** ke Master Asset menggunakan `kode_asset` sebagai foreign key.

```
Master Asset BMN (Parent)
    ↓ (referenced by kode_asset)
    ├── Faslan
    ├── Fasharpan
    ├── DisBek
    ├── DisAng
    ├── Kerjasama
    └── Peta Faslan
```

## 🔧 Setup Database

### 1. Jalankan Migration

```bash
# Migration 1: Add BMN fields to Master Asset
psql -U your_user -d your_database -f migrations/001_add_bmn_fields.sql

# Migration 2: Create integration tables
psql -U your_user -d your_database -f migrations/002_create_integration_tables.sql
```

### 2. Verifikasi Tables

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'assets_tanah', 
    'faslan_assets', 
    'fasharpan_maintenance',
    'disbek_inventory',
    'disang_vehicles',
    'peta_faslan_locations',
    'kerjasama_assets'
);
```

## 📦 Component: AssetSelector

### Import Component

```javascript
import AssetSelector from '../components/AssetSelector';
```

### Basic Usage

```jsx
function MyComponent() {
    const [selectedAsset, setSelectedAsset] = useState(null);

    return (
        <AssetSelector
            onSelect={setSelectedAsset}
            selectedAsset={selectedAsset}
        />
    );
}
```

### With Filter

```jsx
<AssetSelector
    onSelect={setSelectedAsset}
    selectedAsset={selectedAsset}
    filter={{ 
        category: 'Tanah',
        kondisi: 'Baik'
    }}
    placeholder="Pilih tanah dengan kondisi baik..."
/>
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onSelect` | function | ✅ | - | Callback saat asset dipilih |
| `selectedAsset` | object | ❌ | null | Asset yang sedang dipilih |
| `filter` | object | ❌ | {} | Filter untuk API query |
| `placeholder` | string | ❌ | "Pilih Asset BMN..." | Placeholder text |
| `disabled` | boolean | ❌ | false | Disable selector |

## 🔌 API Endpoints

### 1. Get All Assets

```javascript
GET /api/assets/tanah

// With filters
GET /api/assets/tanah?category=Tanah&kondisi=Baik

// Response
[
    {
        "id": 1,
        "code": "BMN-TN-001",
        "nup": "12345678901234567890123",
        "name": "Tanah Kantor Pusat",
        "category": "Tanah",
        "kondisi": "Baik",
        ...
    }
]
```

### 2. Link Asset to Module (Create)

```javascript
POST /api/faslan

// Request Body
{
    "kode_asset": "BMN-TN-001",
    "bmn_id": 1,
    "jenis_faslan": "KRI",
    "nomor_lambung": "123",
    "status_operasional": "Operasional",
    ...
}

// Response
{
    "id": 1,
    "kode_asset": "BMN-TN-001",
    "jenis_faslan": "KRI",
    ...
}
```

### 3. Get Asset with Relations

```javascript
GET /api/assets/:kode_asset/complete

// Response
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

## 💻 Implementation Examples

### Example 1: Link Asset to Faslan

```jsx
import { useState } from 'react';
import AssetSelector from '../components/AssetSelector';

function FaslanForm() {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [formData, setFormData] = useState({
        jenis_faslan: '',
        nomor_lambung: '',
        status_operasional: 'Operasional'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            kode_asset: selectedAsset.code,
            bmn_id: selectedAsset.id,
            ...formData
        };

        const response = await fetch('/api/faslan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Berhasil link asset ke Faslan!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <AssetSelector
                onSelect={setSelectedAsset}
                selectedAsset={selectedAsset}
                filter={{ category: 'Tanah,Bangunan' }}
            />
            
            {selectedAsset && (
                <>
                    <input
                        type="text"
                        value={formData.jenis_faslan}
                        onChange={(e) => setFormData({
                            ...formData,
                            jenis_faslan: e.target.value
                        })}
                        placeholder="Jenis Faslan"
                    />
                    {/* More fields... */}
                    <button type="submit">Simpan</button>
                </>
            )}
        </form>
    );
}
```

### Example 2: Display Asset with Relations

```jsx
import { useState, useEffect } from 'react';

function AssetDetail({ kodeAsset }) {
    const [assetData, setAssetData] = useState(null);

    useEffect(() => {
        fetchAssetComplete();
    }, [kodeAsset]);

    const fetchAssetComplete = async () => {
        const response = await fetch(`/api/assets/${kodeAsset}/complete`);
        const data = await response.json();
        setAssetData(data);
    };

    if (!assetData) return <div>Loading...</div>;

    return (
        <div>
            <h2>{assetData.asset.name}</h2>
            
            {/* Faslan */}
            <section>
                <h3>Faslan ({assetData.faslan.length})</h3>
                {assetData.faslan.map(item => (
                    <div key={item.id}>
                        {item.jenis_faslan} - {item.nomor_lambung}
                    </div>
                ))}
            </section>

            {/* Maintenance */}
            <section>
                <h3>Maintenance ({assetData.maintenance.length})</h3>
                {assetData.maintenance.map(item => (
                    <div key={item.id}>
                        {item.tanggal_maintenance} - {item.jenis_maintenance}
                    </div>
                ))}
            </section>

            {/* More sections... */}
        </div>
    );
}
```

### Example 3: Add Maintenance Log

```jsx
function MaintenanceForm() {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [maintenanceData, setMaintenanceData] = useState({
        jenis_maintenance: 'Preventive',
        tanggal_maintenance: '',
        deskripsi: '',
        biaya: 0
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            kode_asset: selectedAsset.code,
            bmn_id: selectedAsset.id,
            ...maintenanceData,
            status: 'Scheduled'
        };

        await fetch('/api/fasharpan/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <AssetSelector
                onSelect={setSelectedAsset}
                selectedAsset={selectedAsset}
            />
            
            {selectedAsset && (
                <>
                    <select
                        value={maintenanceData.jenis_maintenance}
                        onChange={(e) => setMaintenanceData({
                            ...maintenanceData,
                            jenis_maintenance: e.target.value
                        })}
                    >
                        <option value="Preventive">Preventive</option>
                        <option value="Corrective">Corrective</option>
                        <option value="Overhaul">Overhaul</option>
                    </select>

                    <input
                        type="date"
                        value={maintenanceData.tanggal_maintenance}
                        onChange={(e) => setMaintenanceData({
                            ...maintenanceData,
                            tanggal_maintenance: e.target.value
                        })}
                    />

                    <button type="submit">Schedule Maintenance</button>
                </>
            )}
        </form>
    );
}
```

## 🗺️ Geospatial Integration (Peta Faslan)

### Add Location to Asset

```jsx
function AssetLocationForm() {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [location, setLocation] = useState({
        koordinat_lat: '',
        koordinat_lng: '',
        area_name: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            kode_asset: selectedAsset.code,
            bmn_id: selectedAsset.id,
            ...location
        };

        await fetch('/api/peta-faslan/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <AssetSelector
                onSelect={setSelectedAsset}
                selectedAsset={selectedAsset}
            />
            
            {selectedAsset && (
                <>
                    <input
                        type="number"
                        step="0.000001"
                        placeholder="Latitude"
                        value={location.koordinat_lat}
                        onChange={(e) => setLocation({
                            ...location,
                            koordinat_lat: e.target.value
                        })}
                    />
                    <input
                        type="number"
                        step="0.000001"
                        placeholder="Longitude"
                        value={location.koordinat_lng}
                        onChange={(e) => setLocation({
                            ...location,
                            koordinat_lng: e.target.value
                        })}
                    />
                    <button type="submit">Set Location</button>
                </>
            )}
        </form>
    );
}
```

## 📊 Dashboard Widgets

### Asset Distribution Widget

```jsx
function AssetDistributionWidget() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const response = await fetch('/api/assets/stats/distribution');
        const data = await response.json();
        setStats(data);
    };

    if (!stats) return <div>Loading...</div>;

    return (
        <div className="card">
            <h3>Asset Distribution</h3>
            <div>Faslan: {stats.faslan_count} assets</div>
            <div>Maintenance: {stats.maintenance_count} logs</div>
            <div>Inventory: {stats.inventory_count} items</div>
            <div>Vehicles: {stats.vehicle_count} units</div>
            <div>Partnerships: {stats.partnership_count} active</div>
        </div>
    );
}
```

## 🔍 Search & Filter

### Global Asset Search

```jsx
function AssetSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
        const response = await fetch(`/api/assets/search?q=${searchTerm}`);
        const data = await response.json();
        setResults(data);
    };

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets..."
            />
            <button onClick={handleSearch}>Search</button>

            <div>
                {results.map(asset => (
                    <div key={asset.id}>
                        {asset.code} - {asset.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## 🔐 Access Control

### Role-based Component

```jsx
function ProtectedAssetForm({ userRole }) {
    const canEdit = ['admin', 'operator_faslan'].includes(userRole);

    return (
        <div>
            <AssetSelector
                disabled={!canEdit}
                onSelect={...}
            />
            
            {canEdit && (
                <button>Save</button>
            )}
        </div>
    );
}
```

## 📱 QR Code Integration

### Generate QR Code for Asset

```jsx
import QRCode from 'qrcode.react';

function AssetQRCode({ asset }) {
    const qrData = JSON.stringify({
        kode_asset: asset.code,
        nup: asset.nup,
        url: `${window.location.origin}/assets/${asset.code}`
    });

    return (
        <div>
            <QRCode value={qrData} size={200} />
            <p>Scan untuk detail asset</p>
        </div>
    );
}
```

## 🐛 Troubleshooting

### Issue: Foreign Key Constraint Error

```
ERROR: insert or update on table "faslan_assets" violates foreign key constraint
```

**Solution**: Pastikan `kode_asset` yang digunakan sudah ada di tabel `assets_tanah`.

```sql
-- Check if asset exists
SELECT code FROM assets_tanah WHERE code = 'BMN-TN-001';
```

### Issue: Asset Selector Not Loading

**Solution**: Periksa API endpoint dan CORS settings.

```javascript
// Check API response
fetch('http://localhost:3001/api/assets/tanah')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

## 📚 Best Practices

1. **Always validate** `kode_asset` exists before linking
2. **Use transactions** when creating multiple related records
3. **Add indexes** on foreign keys for better performance
4. **Implement soft delete** instead of hard delete for audit trail
5. **Log all changes** to asset relations
6. **Use views** for complex queries instead of joins in application code

## 🚀 Next Steps

1. Implement API endpoints for each module
2. Create UI components for each integration
3. Add validation and error handling
4. Implement access control
5. Add audit logging
6. Create reports and analytics

---

**Happy Coding! 🎉**
