# Template Import Master Asset

## Format Kolom Excel

File Excel yang akan diimport harus memiliki kolom-kolom berikut (urutan bebas):

| Kolom Excel | Field Database | Wajib | Keterangan |
|-------------|----------------|-------|------------|
| Kode | code | ✅ Ya | Kode unik asset (digunakan untuk identifikasi update/insert) |
| Nama | name | ❌ Tidak | Nama asset |
| Kategori | category | ❌ Tidak | Kategori asset |
| Luas | luas | ❌ Tidak | Luas area |
| Status | status | ❌ Tidak | Status asset |
| Lokasi | location | ❌ Tidak | Lokasi asset |
| Koordinat | coordinates | ❌ Tidak | Koordinat geografis |
| Batas Peta | map_boundary | ❌ Tidak | Batas area di peta |
| Area | area | ❌ Tidak | Nama area |
| Nama Penghuni | occupant_name | ❌ Tidak | Nama penghuni |
| Pangkat Penghuni | occupant_rank | ❌ Tidak | Pangkat penghuni |
| NRP Penghuni | occupant_nrp | ❌ Tidak | NRP penghuni |
| Jabatan Penghuni | occupant_title | ❌ Tidak | Jabatan penghuni |

## Mode Import

### 1. **Tambah & Update Otomatis (Upsert)** - RECOMMENDED ✅
- **Cara Kerja**: 
  - Jika `Kode` sudah ada di database → Data akan **diupdate**
  - Jika `Kode` belum ada di database → Data akan **ditambahkan**
- **Keuntungan**: Paling fleksibel, tidak akan error
- **Gunakan Untuk**: Import rutin, update data berkala

### 2. **Hanya Tambah Data Baru (Insert Only)**
- **Cara Kerja**: 
  - Hanya menambahkan data baru
  - Jika `Kode` sudah ada → Akan **error/gagal**
- **Keuntungan**: Mencegah overwrite data existing
- **Gunakan Untuk**: Import data baru pertama kali

### 3. **Hanya Update Data Existing (Update Only)**
- **Cara Kerja**: 
  - Hanya mengupdate data yang sudah ada
  - Jika `Kode` tidak ditemukan → Data akan **diabaikan**
- **Keuntungan**: Tidak menambah data baru
- **Gunakan Untuk**: Update massal data yang sudah ada

## Contoh Data Excel

```
Kode    | Nama              | Kategori | Luas  | Status    | Lokasi
--------|-------------------|----------|-------|-----------|------------------
AST001  | Tanah Kantor A    | Tanah    | 500   | Aktif     | Jl. Sudirman No.1
AST002  | Gedung Perkantoran| Bangunan | 1200  | Aktif     | Jl. Thamrin No.5
AST003  | Gudang Logistik   | Bangunan | 800   | Maintenance| Jl. Gatot Subroto
```

## Tips Import yang Baik

1. ✅ **Pastikan kolom "Kode" selalu terisi** - Ini adalah identifier utama
2. ✅ **Gunakan format Excel (.xlsx atau .xls)** - Format lain tidak didukung
3. ✅ **Header harus di baris pertama** - Sistem akan membaca baris pertama sebagai header
4. ✅ **Gunakan Preview** sebelum import - Cek apakah data sudah benar
5. ✅ **Backup data** sebelum import besar - Untuk antisipasi
6. ⚠️ **Hindari karakter spesial** di kolom Kode - Gunakan huruf, angka, dan underscore saja
7. ⚠️ **Perhatikan mode import** - Pilih sesuai kebutuhan

## Troubleshooting

### ❌ Error: "Record not found for update"
- **Penyebab**: Mode "Update Only" tapi Kode tidak ada di database
- **Solusi**: Gunakan mode "Upsert" atau pastikan Kode sudah ada

### ❌ Error: "Duplicate key"
- **Penyebab**: Mode "Insert Only" tapi Kode sudah ada di database
- **Solusi**: Gunakan mode "Upsert" atau hapus data duplicate

### ❌ Data tidak muncul setelah import
- **Penyebab**: Kolom "Kode" kosong atau tidak sesuai format
- **Solusi**: Pastikan setiap baris memiliki Kode yang valid

## Alur Kerja Recommended

1. **Download template** atau export data existing sebagai referensi
2. **Isi data** di Excel sesuai format
3. **Upload file** ke sistem
4. **Pilih mode import** (recommended: Upsert)
5. **Klik Preview** untuk melihat data yang akan diimport
6. **Klik Import ke Database** untuk memulai proses
7. **Cek hasil** - Sistem akan menampilkan berapa data berhasil ditambah/diupdate

## Contoh Skenario

### Skenario 1: Import Data Baru Pertama Kali
- Mode: **Insert Only** atau **Upsert**
- File: 100 data baru
- Hasil: 100 data ditambahkan

### Skenario 2: Update Data Existing
- Mode: **Upsert**
- File: 50 data (30 existing, 20 baru)
- Hasil: 30 data diupdate, 20 data ditambahkan

### Skenario 3: Update Massal Tanpa Tambah Baru
- Mode: **Update Only**
- File: 50 data
- Hasil: Hanya data yang Kode-nya sudah ada yang akan diupdate
