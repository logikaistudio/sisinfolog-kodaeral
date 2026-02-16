# Database Schema Documentation

Dokumentasi lengkap struktur database untuk aplikasi SisInfoLog Kodaeral.

**Database:** PostgreSQL (Neon Serverless)  
**Last Updated:** 2026-02-17

---

## Tabel: `data_harkan`

Tabel untuk menyimpan data Harkan (Harta Karun/Aset Kapal dan Peralatan).

### Struktur Kolom

| Kolom | Tipe | Nullable | Default | Deskripsi |
|-------|------|----------|---------|-----------|
| `id` | SERIAL | NO | AUTO | Primary key |
| `unsur` | VARCHAR(50) | YES | NULL | Jenis unsur (KRI, KAL, dll) |
| `nama` | VARCHAR(255) | YES | NULL | Nama kapal/aset |
| `bahan` | VARCHAR(100) | YES | NULL | Bahan konstruksi |
| `panjang_max_loa` | NUMERIC | YES | NULL | Panjang maksimal (LOA) dalam meter |
| `panjang` | NUMERIC | YES | NULL | Panjang dalam meter |
| `panjang_lwl` | NUMERIC | YES | NULL | Panjang LWL dalam meter |
| `lebar_max` | NUMERIC | YES | NULL | Lebar maksimal dalam meter |
| `lebar_garis_air` | NUMERIC | YES | NULL | Lebar garis air dalam meter |
| `tinggi_max` | NUMERIC | YES | NULL | Tinggi maksimal dalam meter |
| `draft_max` | NUMERIC | YES | NULL | Draft maksimal dalam meter |
| `dwt` | NUMERIC | YES | NULL | Deadweight tonnage |
| `merk_mesin` | VARCHAR(100) | YES | NULL | Merk mesin |
| `type_mesin` | VARCHAR(100) | YES | NULL | Tipe mesin |
| `latitude` | VARCHAR(50) | YES | NULL | Koordinat latitude |
| `longitude` | VARCHAR(50) | YES | NULL | Koordinat longitude |
| `bb` | VARCHAR(100) | YES | NULL | Bahan bakar |
| `tahun_pembuatan` | INTEGER | YES | NULL | Tahun pembuatan |
| `tahun_operasi` | INTEGER | YES | NULL | Tahun mulai operasi |
| `status_kelaikan` | VARCHAR(50) | YES | NULL | Status kelaikan (Laik/Tidak Laik) |
| `sertifikasi` | JSONB | YES | '[]' | Array sertifikasi (lihat struktur di bawah) |
| `pesawat` | JSONB | YES | '[]' | Array pesawat/peralatan (lihat struktur di bawah) |
| `kondisi` | VARCHAR(50) | YES | NULL | Kondisi (Siap/Tidak Siap) |
| `status` | VARCHAR(50) | YES | NULL | Status (Operasi/Tidak Operasi) |
| `status_pemeliharaan` | TEXT | YES | NULL | Status pemeliharaan |
| `persentasi` | NUMERIC | YES | NULL | Persentase kondisi |
| `permasalahan_teknis` | TEXT | YES | NULL | Permasalahan teknis |
| `tds` | VARCHAR(100) | YES | NULL | TDS (Technical Data Sheet) |
| `keterangan` | TEXT | YES | NULL | Keterangan tambahan |
| `fotos` | JSONB | YES | '[]' | Array foto (lihat struktur di bawah) |
| `created_at` | TIMESTAMP | NO | NOW() | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | NO | NOW() | Waktu update terakhir |

### Struktur JSON

#### `sertifikasi` (JSONB Array)
```json
[
  {
    "nama": "Sertifikat Kelaikan",
    "nomor": "123/KL/2025",
    "berlaku": "2026-12-31",
    "catatan": "Perlu perpanjangan"
  }
]
```

#### `pesawat` (JSONB Array)
```json
[
  {
    "nama_group": "Mesin Utama",
    "items": [
      { "nama_item": "Piston Ring" },
      { "nama_item": "Cylinder Head" }
    ]
  },
  {
    "nama_group": "Generator",
    "items": [
      { "nama_item": "AVR" }
    ]
  }
]
```

#### `fotos` (JSONB Array)
```json
[
  {
    "name": "foto1.jpg",
    "url": "data:image/jpeg;base64,...",
    "type": "image/jpeg"
  }
]
```

### Indexes

| Index Name | Kolom | Tipe | Deskripsi |
|------------|-------|------|-----------|
| `data_harkan_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_harkan_unsur` | `unsur` | BTREE | Index untuk query berdasarkan unsur |
| `idx_harkan_nama` | `nama` | BTREE | Index untuk query berdasarkan nama |
| `idx_harkan_kondisi` | `kondisi` | BTREE | Index untuk query berdasarkan kondisi |
| `idx_harkan_status` | `status` | BTREE | Index untuk query berdasarkan status |
| `idx_harkan_created_at` | `created_at DESC` | BTREE | Index untuk sorting berdasarkan tanggal |

### API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/harkan` | Mengambil semua data harkan |
| GET | `/api/harkan/:id` | Mengambil data harkan berdasarkan ID |
| POST | `/api/harkan` | Menambah data harkan baru |
| PUT | `/api/harkan/:id` | Mengupdate data harkan |
| DELETE | `/api/harkan/:id` | Menghapus data harkan |

### Migration

Migration file: `migrations/create_data_harkan_table.sql`

Untuk menjalankan migration:
```bash
# Via Node.js script
node migrations/run-migration.js

# Via psql
psql $DATABASE_URL -f migrations/create_data_harkan_table.sql
```

### Catatan

1. Tabel ini dibuat untuk menggantikan penyimpanan data Harkan di `localStorage`
2. Data sekarang persisten di database PostgreSQL (Neon)
3. Auto-create: Tabel akan otomatis dibuat saat endpoint `/api/harkan` pertama kali diakses jika belum ada
4. Semua field JSONB menggunakan default `'[]'` untuk menghindari null values

---

## Tabel Lainnya

### `faslabuh`
Dokumentasi tabel Faslabuh (Fasilitas Labuh/Dermaga) - sudah ada sebelumnya.

### `assets_tanah`
Dokumentasi tabel Aset Tanah - sudah ada sebelumnya.

### `assets_bangunan`
Dokumentasi tabel Aset Bangunan - sudah ada sebelumnya.

### `assets_kapling`
Dokumentasi tabel Aset Kapling - sudah ada sebelumnya.

### `assets_pemanfaatan`
Dokumentasi tabel Aset Pemanfaatan - sudah ada sebelumnya.

---

**Catatan:** Untuk dokumentasi lengkap tabel lainnya, silakan lihat file `STRUKTUR_DATA_BMN.md` dan `PANDUAN_IMPLEMENTASI.md`.
