# Database Migrations

Folder ini berisi migration scripts untuk database Neon PostgreSQL.

## Cara Menjalankan Migration

### 1. Manual via Neon Console
1. Login ke [Neon Console](https://console.neon.tech)
2. Pilih project Anda
3. Buka SQL Editor
4. Copy paste isi file `.sql` dari folder ini
5. Execute

### 2. Via psql CLI
```bash
psql "postgresql://[username]:[password]@[host]/[database]?sslmode=require" -f migrations/create_data_harkan_table.sql
```

### 3. Via Node.js Script
```bash
node migrations/run-migration.js
```

## Migration Files

### `create_data_harkan_table.sql`
**Tanggal:** 2026-02-17  
**Deskripsi:** Membuat tabel `data_harkan` untuk menyimpan data Harkan (Harta Karun/Aset Kapal)

**Struktur Tabel:**
- `id` - Primary key (auto increment)
- `unsur` - Jenis unsur (KRI, KAL, dll)
- `nama` - Nama kapal/aset
- `bahan` - Bahan konstruksi
- Dimensi: `panjang_max_loa`, `panjang`, `panjang_lwl`, `lebar_max`, `lebar_garis_air`, `tinggi_max`, `draft_max`, `dwt`
- Mesin: `merk_mesin`, `type_mesin`
- Lokasi: `latitude`, `longitude`
- Spesifikasi: `bb`, `tahun_pembuatan`, `tahun_operasi`, `status_kelaikan`
- Data JSON: `sertifikasi`, `pesawat`, `fotos`
- Status: `kondisi`, `status`, `status_pemeliharaan`, `persentasi`, `permasalahan_teknis`, `tds`, `keterangan`
- Timestamps: `created_at`, `updated_at`

**Indexes:**
- `idx_harkan_unsur` - Index pada kolom unsur
- `idx_harkan_nama` - Index pada kolom nama
- `idx_harkan_kondisi` - Index pada kolom kondisi
- `idx_harkan_status` - Index pada kolom status
- `idx_harkan_created_at` - Index pada kolom created_at (descending)

## Catatan Penting

1. **Auto-create di API**: Tabel `data_harkan` akan otomatis dibuat saat pertama kali endpoint `/api/harkan` diakses jika tabel belum ada.
2. **Manual Migration**: Untuk production, disarankan menjalankan migration secara manual via Neon Console untuk kontrol yang lebih baik.
3. **Backup**: Selalu backup database sebelum menjalankan migration di production.

## Rollback

Jika perlu rollback tabel `data_harkan`:
```sql
DROP TABLE IF EXISTS data_harkan CASCADE;
```

**⚠️ WARNING:** Perintah di atas akan menghapus semua data di tabel `data_harkan`!
