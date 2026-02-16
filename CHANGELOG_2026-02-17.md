# Changelog - 17 Februari 2026

## 🎯 Ringkasan Perubahan

Perbaikan kritis untuk modul Data Harkan dan visualisasi peta Faslabuh.

---

## 🐛 Bug Fixes

### 1. Data Harkan Tidak Terlihat Setelah Redeploy

**Masalah:**
- Data Harkan disimpan di `localStorage` browser
- Setelah redeploy, data hilang karena localStorage bersifat lokal

**Solusi:**
- ✅ Migrasi dari `localStorage` ke database PostgreSQL (Neon)
- ✅ Membuat tabel `data_harkan` dengan struktur lengkap
- ✅ Implementasi CRUD API endpoints
- ✅ Update frontend untuk menggunakan API

**File yang Diubah:**
- `api/index.js` - Menambahkan endpoints `/api/harkan`
- `src/pages/DataHarkan.jsx` - Update untuk menggunakan API
- `src/pages/PetaFaslan.jsx` - Fetch data dari API

### 2. Warna dan Bentuk Node Faslabuh Berubah

**Masalah:**
- Node Harkan di peta menggunakan icon dan warna yang sama dengan Faslabuh
- Sulit membedakan antara node Faslabuh dan Harkan

**Solusi:**
- ✅ Perbaiki icon Harkan menggunakan `harkanIcon` (hijau gelap #15803d)
- ✅ Update warna legend Harkan di header
- ✅ Update warna popup Harkan untuk konsistensi

**File yang Diubah:**
- `src/pages/PetaFaslan.jsx` - Line 683, 371, 688-693

---

## 🗄️ Database Changes

### Tabel Baru: `data_harkan`

**Migration File:** `migrations/create_data_harkan_table.sql`

**Struktur:**
```sql
CREATE TABLE data_harkan (
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
    -- JSON Fields
    sertifikasi JSONB DEFAULT '[]',
    pesawat JSONB DEFAULT '[]',
    fotos JSONB DEFAULT '[]',
    -- Status
    kondisi VARCHAR(50),
    status VARCHAR(50),
    status_pemeliharaan TEXT,
    persentasi NUMERIC,
    permasalahan_teknis TEXT,
    tds VARCHAR(100),
    keterangan TEXT,
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes:**
- `idx_harkan_unsur` - Index pada kolom unsur
- `idx_harkan_nama` - Index pada kolom nama
- `idx_harkan_kondisi` - Index pada kolom kondisi
- `idx_harkan_status` - Index pada kolom status
- `idx_harkan_created_at` - Index pada created_at (DESC)

---

## 🔌 API Changes

### New Endpoints: `/api/harkan`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/harkan` | Mengambil semua data harkan |
| GET | `/api/harkan/:id` | Mengambil data harkan berdasarkan ID |
| POST | `/api/harkan` | Menambah data harkan baru |
| PUT | `/api/harkan/:id` | Mengupdate data harkan |
| DELETE | `/api/harkan/:id` | Menghapus data harkan |

**Features:**
- Auto-create table jika belum ada (error code 42P01)
- Support untuk JSONB fields (sertifikasi, pesawat, fotos)
- Proper error handling dan logging

---

## 📝 File Changes

### Backend

#### `api/index.js`
**Lines Added:** 2188-2348 (161 lines)
- Menambahkan 5 endpoints untuk CRUD data harkan
- Auto-create table logic
- JSON field handling untuk sertifikasi, pesawat, dan fotos

### Frontend

#### `src/pages/DataHarkan.jsx`
**Changes:**
- Line 1: Import `useEffect` dari React
- Line 190-208: Mengganti localStorage dengan API fetch
- Line 341-399: Update `handleSubmit` dan `handleDelete` untuk menggunakan API

**Before:**
```javascript
const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('dataHarkan')
    return stored ? JSON.parse(stored) : [...]
})

React.useEffect(() => {
    localStorage.setItem('dataHarkan', JSON.stringify(items))
}, [items])
```

**After:**
```javascript
const [items, setItems] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
    fetchData()
}, [])

const fetchData = async () => {
    const response = await fetch('/api/harkan')
    const data = await response.json()
    setItems(data)
}
```

#### `src/pages/PetaFaslan.jsx`
**Changes:**
- Line 239-248: Update fetch Harkan dari localStorage ke API
- Line 371: Update warna legend Harkan (HARKAN_NODE_COLOR)
- Line 683: Fix icon Harkan dari `faslabuhIcon` ke `harkanIcon`
- Line 688-693: Update warna popup Harkan

---

## 📁 New Files

### Migration Scripts

1. **`migrations/create_data_harkan_table.sql`**
   - SQL script untuk membuat tabel data_harkan
   - Includes indexes dan comments

2. **`migrations/run-migration.js`**
   - Node.js script untuk menjalankan migration otomatis
   - Database connection testing
   - Migration summary report

3. **`migrations/verify-tables.js`**
   - Script untuk verifikasi struktur tabel
   - List semua tabel di database
   - Show columns dan indexes

4. **`migrations/README.md`**
   - Dokumentasi cara menjalankan migration
   - Manual via Neon Console
   - Via psql CLI
   - Via Node.js script

### Documentation

5. **`DATABASE_SCHEMA.md`**
   - Dokumentasi lengkap struktur database
   - Detail tabel data_harkan
   - Struktur JSON fields
   - API endpoints reference

6. **`CHANGELOG_2026-02-17.md`** (file ini)
   - Dokumentasi lengkap perubahan hari ini

---

## ✅ Testing Checklist

- [x] Migration script berhasil dijalankan
- [x] Tabel `data_harkan` berhasil dibuat di Neon DB
- [x] API endpoints `/api/harkan` berfungsi
- [x] Frontend DataHarkan dapat fetch data dari API
- [x] Frontend DataHarkan dapat create data baru
- [x] Frontend DataHarkan dapat update data
- [x] Frontend DataHarkan dapat delete data
- [x] Peta menampilkan node Harkan dengan warna hijau gelap
- [x] Peta menampilkan node Faslabuh dengan warna biru navy
- [x] Legend di header menampilkan warna yang benar
- [x] Popup Harkan menampilkan warna yang benar
- [x] Modul lain (Faslabuh, Tanah, Bangunan) tidak terpengaruh

---

## 🚀 Deployment Notes

### Database Migration

Migration sudah dijalankan ke Neon DB production:
```bash
✅ Migration completed successfully: create_data_harkan_table.sql
```

### Environment Variables

Pastikan `DATABASE_URL` sudah diset di:
- `.env` (local development)
- Vercel Environment Variables (production)

### Rollback Plan

Jika perlu rollback:
```sql
DROP TABLE IF EXISTS data_harkan CASCADE;
```

⚠️ **WARNING:** Ini akan menghapus semua data!

---

## 📊 Impact Analysis

### Affected Modules
- ✅ Data Harkan - **MAJOR UPDATE** (localStorage → API)
- ✅ Peta Faslan - **MINOR UPDATE** (fix icon colors)
- ⚪ Faslabuh - No changes
- ⚪ Tanah - No changes
- ⚪ Bangunan - No changes
- ⚪ Kapling - No changes

### Breaking Changes
- **NONE** - Backward compatible
- Data lama di localStorage tidak otomatis migrate (perlu manual import jika ada)

### Performance Impact
- ✅ **IMPROVED** - Data persisten di database
- ✅ **IMPROVED** - Indexes untuk query optimization
- ⚪ Network latency untuk API calls (minimal)

---

## 👥 Credits

**Developer:** Antigravity AI  
**Date:** 17 Februari 2026  
**Version:** 1.0.0

---

## 📞 Support

Jika ada masalah:
1. Check migration logs: `node migrations/verify-tables.js`
2. Check API logs di terminal
3. Check browser console untuk frontend errors
4. Verify DATABASE_URL di `.env`

---

**End of Changelog**
