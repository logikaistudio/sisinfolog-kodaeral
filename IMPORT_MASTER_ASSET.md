# 🚀 Fitur Import Master Asset - Panduan Lengkap

## 📋 Ringkasan

Fitur import master asset telah disempurnakan dengan kemampuan **UPSERT** (Update + Insert) yang cerdas. Sistem dapat secara otomatis mendeteksi apakah data sudah ada atau belum, lalu memutuskan untuk update atau insert.

## ✨ Fitur Utama

### 1. **Tiga Mode Import**
- ✅ **Upsert (Recommended)**: Otomatis tambah data baru atau update data existing
- ➕ **Insert Only**: Hanya tambah data baru, error jika duplikat
- 🔄 **Update Only**: Hanya update data existing, skip data baru

### 2. **Preview & Validasi**
- 👁️ Preview data sebelum import
- ✅ Validasi otomatis format data
- ⚠️ Deteksi error dengan detail lengkap
- 📊 Statistik data valid vs invalid

### 3. **Progress Tracking**
- 📈 Real-time import progress
- 📊 Detail hasil: berapa ditambah, diupdate, gagal
- 🔍 Error log untuk debugging

### 4. **Template Excel**
- 📥 Download template dengan format yang benar
- 📝 Panduan lengkap di sheet terpisah
- 💡 Contoh data untuk referensi

## 🎯 Cara Penggunaan

### Step 1: Download Template
1. Klik tombol **"📥 Download Template"**
2. Buka file Excel yang terdownload
3. Lihat sheet "Panduan" untuk instruksi lengkap
4. Lihat sheet "Template Master Asset" untuk contoh data

### Step 2: Isi Data
Isi data di Excel dengan kolom-kolom berikut:

| Kolom | Wajib | Keterangan |
|-------|-------|------------|
| **Kode** | ✅ | Identifier unik (alphanumeric, underscore, dash) |
| Nama | ❌ | Nama asset |
| Kategori | ❌ | Kategori (Tanah/Bangunan/dll) |
| Luas | ❌ | Luas area (angka) |
| Status | ❌ | Status asset |
| Lokasi | ❌ | Alamat lokasi |
| Koordinat | ❌ | Koordinat geografis |
| Batas Peta | ❌ | Boundary peta |
| Area | ❌ | Nama area |
| Nama Penghuni | ❌ | Nama penghuni |
| Pangkat Penghuni | ❌ | Pangkat |
| NRP Penghuni | ❌ | NRP |
| Jabatan Penghuni | ❌ | Jabatan |

**⚠️ PENTING**: Kolom **Kode** WAJIB diisi dan harus unik!

### Step 3: Upload & Preview
1. Klik **"📂 Import Excel"**
2. Pilih file Excel Anda
3. Pilih **Mode Import** sesuai kebutuhan
4. Klik **"👁️ Preview Data"** untuk melihat data yang akan diimport
5. Periksa apakah ada error validasi

### Step 4: Import ke Database
1. Jika tidak ada error, klik **"🚀 Import ke Database"**
2. Konfirmasi import
3. Tunggu proses selesai
4. Lihat hasil import (berapa data ditambah/diupdate/gagal)

## 🔧 Mode Import - Kapan Menggunakan?

### 🎯 Mode: Upsert (Tambah & Update Otomatis)
**Gunakan Untuk:**
- Import rutin/berkala
- Update data existing + tambah data baru sekaligus
- Sinkronisasi data dari sistem lain

**Cara Kerja:**
```
Jika Kode sudah ada → UPDATE data
Jika Kode belum ada → INSERT data baru
```

**Contoh Skenario:**
```
Database: AST001, AST002
Excel: AST001 (update), AST003 (baru)
Hasil: AST001 diupdate, AST003 ditambahkan
```

### ➕ Mode: Insert Only (Hanya Tambah Baru)
**Gunakan Untuk:**
- Import data baru pertama kali
- Mencegah overwrite data existing
- Memastikan tidak ada duplikasi

**Cara Kerja:**
```
Jika Kode sudah ada → ERROR (skip)
Jika Kode belum ada → INSERT data baru
```

**Contoh Skenario:**
```
Database: AST001, AST002
Excel: AST001 (error), AST003 (baru)
Hasil: AST001 gagal, AST003 ditambahkan
```

### 🔄 Mode: Update Only (Hanya Update Existing)
**Gunakan Untuk:**
- Update massal data yang sudah ada
- Tidak ingin menambah data baru
- Koreksi data existing

**Cara Kerja:**
```
Jika Kode sudah ada → UPDATE data
Jika Kode belum ada → SKIP (diabaikan)
```

**Contoh Skenario:**
```
Database: AST001, AST002
Excel: AST001 (update), AST003 (skip)
Hasil: AST001 diupdate, AST003 diabaikan
```

## 📊 Validasi Data

Sistem akan otomatis memvalidasi:

### ✅ Validasi Wajib
- **Kode tidak boleh kosong**
- **Kode hanya boleh alphanumeric + underscore + dash**

### ⚠️ Validasi Opsional
- **Luas harus angka** (jika diisi)

### 🔍 Error yang Mungkin Muncul

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Kode wajib diisi" | Kolom Kode kosong | Isi kolom Kode |
| "Kode hanya boleh berisi huruf, angka..." | Kode mengandung karakter spesial | Gunakan A-Z, 0-9, _, - saja |
| "Luas harus berupa angka" | Luas diisi teks | Isi dengan angka |
| "Record not found for update" | Mode Update Only, tapi Kode tidak ada | Gunakan mode Upsert atau pastikan Kode ada |
| "Duplicate key" | Mode Insert Only, tapi Kode sudah ada | Gunakan mode Upsert atau hapus duplikat |

## 💡 Tips & Best Practices

### ✅ DO (Lakukan)
1. ✅ **Selalu gunakan Preview** sebelum import
2. ✅ **Backup data** sebelum import besar
3. ✅ **Gunakan mode Upsert** untuk fleksibilitas maksimal
4. ✅ **Pastikan Kode konsisten** (format yang sama)
5. ✅ **Test dengan data kecil** dulu (5-10 baris)
6. ✅ **Cek hasil import** setelah selesai

### ❌ DON'T (Hindari)
1. ❌ **Jangan skip Preview** - bisa menyebabkan data salah
2. ❌ **Jangan gunakan karakter spesial** di Kode (@, #, $, %, dll)
3. ❌ **Jangan import tanpa backup** untuk data penting
4. ❌ **Jangan ubah header kolom** di template
5. ❌ **Jangan kosongkan kolom Kode**

## 🔄 Workflow Recommended

```
1. Download Template
   ↓
2. Isi Data di Excel
   ↓
3. Upload File
   ↓
4. Pilih Mode Import (Upsert recommended)
   ↓
5. Preview & Validasi
   ↓
6. Perbaiki Error (jika ada)
   ↓
7. Import ke Database
   ↓
8. Cek Hasil Import
   ↓
9. Verifikasi Data di Aplikasi
```

## 🎬 Contoh Skenario Real

### Skenario 1: Import Awal 100 Data Baru
```
Mode: Insert Only atau Upsert
File: 100 baris data baru
Hasil: 100 data ditambahkan
```

### Skenario 2: Update Bulanan
```
Mode: Upsert
File: 150 baris (100 existing + 50 baru)
Hasil: 100 data diupdate, 50 data ditambahkan
```

### Skenario 3: Koreksi Data Massal
```
Mode: Update Only
File: 75 baris data existing
Hasil: 75 data diupdate, data baru diabaikan
```

### Skenario 4: Import dengan Error
```
Mode: Upsert
File: 50 baris (5 error validasi)
Hasil: 45 data berhasil, 5 gagal
Error ditampilkan dengan detail baris dan penyebab
```

## 🛠️ Troubleshooting

### Problem: Import Gagal Semua
**Kemungkinan Penyebab:**
- Database tidak terhubung
- Format Excel salah
- Semua data tidak valid

**Solusi:**
1. Cek koneksi database (lihat console)
2. Download ulang template
3. Cek preview untuk melihat error

### Problem: Sebagian Data Gagal
**Kemungkinan Penyebab:**
- Validasi gagal untuk beberapa baris
- Duplikat di mode Insert Only

**Solusi:**
1. Lihat detail error di hasil import
2. Perbaiki data yang error
3. Import ulang hanya data yang gagal

### Problem: Data Tidak Muncul Setelah Import
**Kemungkinan Penyebab:**
- Kolom Kode kosong
- Data masuk tapi tidak ter-refresh

**Solusi:**
1. Pastikan kolom Kode terisi
2. Refresh halaman
3. Cek di menu lain yang menampilkan data

## 📞 Support

Jika mengalami masalah:
1. Cek dokumentasi ini
2. Lihat file `IMPORT_GUIDE.md` untuk detail teknis
3. Cek console browser untuk error log
4. Hubungi admin sistem

## 🔐 Keamanan

- ✅ Semua import menggunakan **transaction** - jika ada error, semua rollback
- ✅ Validasi di frontend dan backend
- ✅ Tidak ada SQL injection risk (menggunakan prepared statements)
- ✅ Log semua aktivitas import

## 📈 Performance

- ⚡ Batch processing untuk import cepat
- 📊 Optimized untuk ribuan data
- 🔄 Transaction untuk konsistensi data
- 💾 Minimal memory footprint

---

**Dibuat dengan ❤️ untuk kemudahan import data master asset**
