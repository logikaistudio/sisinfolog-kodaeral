# Penghapusan Menu Rumah Negara Lagoa & Aset Bangunan

## ✅ Perubahan yang Telah Dilakukan

### 1. **Frontend - Sidebar Navigation** (`src/components/Sidebar.jsx`)
- ✅ Menghapus menu "Aset Bangunan" dari Master Data
- ✅ Menghapus menu parent "Aset Bangunan" beserta child "Rumah Negara Lagoa" dari Fastanah

### 2. **Frontend - Routing** (`src/App.jsx`)
- ✅ Menghapus routing `faslan-bangunan`
- ✅ Menghapus routing `faslan-bangunan-rumneg-lagoa`

### 3. **Frontend - Dashboard** (`src/pages/DashboardPimpinan.jsx`)
- ✅ Menghapus `totalBangunan` dari state
- ✅ Menghapus fetch API untuk bangunan
- ✅ Menghapus card "Total Aset Bangunan" dari main stats
- ✅ Menghapus "Aset Bangunan" dari detail cards
- ✅ Menghapus "Aset Bangunan" dari quick actions

## ⚠️ Yang Perlu Dilakukan Manual

### 1. **Database - Hapus Tabel** 
Script sudah dibuat di: `database/drop_bangunan.js`

**Cara menjalankan:**
```bash
# Pastikan PostgreSQL berjalan
node database/drop_bangunan.js
```

**Atau manual via psql:**
```sql
DROP TABLE IF EXISTS assets_bangunan CASCADE;
```

### 2. **Backend API - Hapus Endpoints** (`api/index.js`)
Endpoints berikut perlu dihapus manual (baris 137-694):

- `GET /api/assets/bangunan` (baris 137-157)
- `GET /api/assets/bangunan/:code` (baris 431-444)
- `POST /api/assets/bangunan` (baris 446-480)
- `PUT /api/assets/bangunan/:id` (baris 482-516)
- `POST /api/assets/bangunan/bulk-upsert` (baris 518-666)
- `DELETE /api/assets/bangunan/bulk` (baris 668-681)
- `DELETE /api/assets/bangunan/:id` (baris 683-694)

### 3. **Database Scripts - Update References**
File-file berikut masih mereferensi `assets_bangunan`:

- `database/setup.js` - Hapus pembuatan tabel assets_bangunan
- `database/setup_folders.js` - Hapus penambahan folder_id ke assets_bangunan
- `database/check_data.js` - Hapus pengecekan count assets_bangunan
- `database/debug_folders.js` - Hapus query count assets_bangunan
- `database/verify_schema.js` - Hapus verifikasi schema assets_bangunan

### 4. **Frontend - File Lainnya**
- `src/pages/Faslan.jsx` - Hapus handling untuk type "bangunan" dan "rumneg-lagoa"
- `src/pages/PetaFaslan.jsx` - Hapus fetch dan markers untuk aset bangunan
- `src/utils/importHelpers.js` - Hapus template download untuk bangunan (sudah diupdate sebelumnya)

## 📋 Checklist Pembersihan

- [x] Hapus menu dari Sidebar
- [x] Hapus routing dari App.jsx
- [x] Hapus referensi dari Dashboard
- [ ] Jalankan script drop_bangunan.js (tunggu PostgreSQL aktif)
- [ ] Hapus API endpoints dari api/index.js
- [ ] Update database setup scripts
- [ ] Bersihkan referensi di Faslan.jsx
- [ ] Bersihkan referensi di PetaFaslan.jsx

## 🎯 Hasil Akhir

Setelah semua langkah selesai:
- Menu "Aset Bangunan" dan "Rumah Negara Lagoa" tidak akan muncul di sidebar
- Tabel `assets_bangunan` dan semua datanya terhapus dari database
- API endpoints untuk bangunan tidak lagi tersedia
- Dashboard tidak lagi menampilkan statistik bangunan
