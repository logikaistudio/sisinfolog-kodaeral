# 📋 Panduan Import & Export Data Faslabuh

## 🎯 Ringkasan Fitur

Menu **Faslabuh** (Fasilitas Pelabuhan & Dermaga) dilengkapi dengan fitur **Import Excel** dan **Export Template** yang memudahkan pengelolaan data dalam jumlah besar.

---

## 📤 Export Template

### Cara Menggunakan:
1. Klik tombol **"📋 Export Template"** di halaman Faslabuh
2. File Excel `Template_Faslabuh.xlsx` akan otomatis terdownload
3. Template berisi:
   - **Baris 1**: Header kolom (JANGAN DIUBAH)
   - **Baris 2**: Contoh data lengkap sebagai referensi
   - **Baris 3+**: Kosong untuk input data Anda

### Struktur Template:

Template mencakup **37 kolom** yang terbagi dalam beberapa kategori:

#### 1. **Informasi Lokasi** (4 kolom)
- `Provinsi` - Nama provinsi (contoh: DKI Jakarta)
- `Wilayah` - Kota/Kabupaten (contoh: Jakarta Utara)
- `Lokasi` - Lokasi spesifik (contoh: Tanjung Priok)
- `Nama Dermaga` - Nama dermaga (WAJIB DIISI)

#### 2. **Informasi Konstruksi & Koordinat** (5 kolom)
- `Konstruksi` - Jenis konstruksi (contoh: Beton Bertulang)
- `Kode Barang` - Kode aset BMN
- `No Sertifikat` - Nomor sertifikat tanah
- `Tgl Sertifikat` - Tanggal sertifikat (format: YYYY-MM-DD)
- `Longitude` - Koordinat longitude (contoh: 106.8839)
- `Latitude` - Koordinat latitude (contoh: -6.1085)

#### 3. **Data Ukuran Dermaga** (5 kolom)
- `Panjang (m)` - Panjang dermaga dalam meter
- `Lebar (m)` - Lebar dermaga dalam meter
- `Draft LWL (m)` - Kedalaman saat Low Water Level
- `Pasut HWL-LWL (m)` - Selisih pasang surut
- `Kondisi (%)` - Persentase kondisi dermaga (0-100)

#### 4. **Kemampuan Sandar** (15 kolom)
Mendukung hingga **5 tipe kapal** yang bisa sandar:
- `Sandar Tipe 1` - Jenis kapal (contoh: Fregat)
- `Sandar Ton 1` - Displacement dalam ton (contoh: 5000)
- `Sandar Jumlah 1` - Jumlah kapal yang bisa sandar (contoh: 2)
- ... (hingga Tipe 5)

#### 5. **Kemampuan Plat Lantai** (3 kolom)
- `Plat MST (ton)` - Maximum Safe Tonnage
- `Plat Jenis Ranmor` - Jenis kendaraan (contoh: Truck)
- `Plat Berat Max (ton)` - Berat maksimum kendaraan

#### 6. **Dukungan Listrik** (8 kolom)
- `Listrik Jml Titik` - Jumlah titik sambung
- `Listrik Kap (Amp)` - Kapasitas dalam Ampere
- `Listrik Tegangan (Volt)` - Tegangan (220/380/440)
- `Listrik Frek (Hz)` - Frekuensi (50/60)
- `Listrik Sumber` - Sumber listrik (PLN/Genset/dll)
- `Listrik Daya (kVA)` - Daya dalam kVA

#### 7. **Dukungan Air Tawar** (3 kolom)
- `Air GWT (m³)` - Ground Water Tank capacity
- `Air Debit (m³/jam)` - Debit air per jam
- `Air Sumber` - Sumber air (PDAM/Sumur Bor/dll)

#### 8. **Fasilitas Lainnya** (3 kolom)
- `BBM` - Ketersediaan BBM (Solar/Pertamax/dll)
- `Hydrant` - Informasi hydrant
- `Keterangan` - Catatan tambahan

---

## 📥 Import Data Excel

### Cara Menggunakan:

1. **Siapkan File Excel**
   - Download template menggunakan tombol "📋 Export Template"
   - Isi data sesuai format template
   - Pastikan kolom header tidak diubah

2. **Upload File**
   - Klik tombol **"📂 Import Excel"**
   - Pilih file Excel yang sudah diisi
   - Sistem akan membaca dan menampilkan preview data

3. **Pilih Mode Import**
   
   Ada 3 mode import yang tersedia:
   
   - **Upsert (Tambah & Update)** ⭐ *Recommended*
     - Jika `Nama Dermaga` sudah ada → data akan di-UPDATE
     - Jika `Nama Dermaga` belum ada → data akan di-INSERT
     - Mode paling aman untuk import data
   
   - **Insert Only (Hanya Tambah Baru)**
     - Hanya menambah data baru
     - Jika `Nama Dermaga` sudah ada → akan error/skip
   
   - **Update Only (Hanya Update Existing)**
     - Hanya update data yang sudah ada
     - Jika `Nama Dermaga` belum ada → akan error/skip

4. **Konfirmasi & Proses**
   - Review preview data
   - Klik tombol import sesuai mode yang dipilih
   - Tunggu proses selesai
   - Sistem akan menampilkan hasil import:
     - ✅ Jumlah data berhasil ditambah
     - 🔄 Jumlah data berhasil diupdate
     - ❌ Jumlah data gagal (dengan detail error)

---

## 📤 Export Data Existing

### Cara Menggunakan:
1. Klik tombol **"📤 Export"** di halaman Faslabuh
2. File Excel `Data_Faslabuh.xlsx` akan otomatis terdownload
3. File berisi semua data dermaga yang ada di database

**Gunakan untuk:**
- Backup data
- Analisis data di Excel
- Sharing data dengan tim
- Migrasi data

---

## ⚠️ Tips & Best Practices

### ✅ DO (Lakukan):
1. **Selalu gunakan template resmi** - Download template terbaru sebelum import
2. **Isi Nama Dermaga** - Kolom ini WAJIB dan digunakan sebagai unique identifier
3. **Gunakan format tanggal yang benar** - Format: YYYY-MM-DD (contoh: 2024-01-15)
4. **Gunakan angka desimal dengan titik** - Contoh: 8.5 (bukan 8,5)
5. **Backup data sebelum import** - Export data existing sebelum melakukan bulk import
6. **Gunakan mode Upsert** - Untuk update data yang sudah ada

### ❌ DON'T (Jangan):
1. **Jangan ubah nama kolom header** - Sistem tidak akan mengenali kolom yang diubah
2. **Jangan hapus kolom** - Meski tidak diisi, kolom harus tetap ada
3. **Jangan gunakan koma untuk desimal** - Gunakan titik (.) bukan koma (,)
4. **Jangan kosongkan Nama Dermaga** - Kolom ini wajib diisi
5. **Jangan import file yang corrupt** - Pastikan file Excel valid

---

## 🔍 Troubleshooting

### Problem: "File Excel kosong!"
**Solusi**: Pastikan file Excel memiliki data di sheet pertama

### Problem: "Import gagal - error pada baris X"
**Solusi**: 
- Periksa format data di baris tersebut
- Pastikan tipe data sesuai (angka untuk kolom numerik, teks untuk kolom teks)
- Periksa apakah ada karakter khusus yang tidak valid

### Problem: "Nama Dermaga sudah ada" (saat mode Insert Only)
**Solusi**: 
- Gunakan mode **Upsert** untuk update data existing
- Atau ubah nama dermaga menjadi unik

### Problem: "Data tidak muncul setelah import"
**Solusi**:
- Refresh halaman (F5)
- Periksa hasil import untuk memastikan tidak ada error
- Cek database menggunakan script debug

---

## 📊 Contoh Data Template

```
Provinsi: DKI Jakarta
Wilayah: Jakarta Utara
Lokasi: Tanjung Priok
Nama Dermaga: Dermaga Contoh 1
Konstruksi: Beton Bertulang
Kode Barang: 03.01.01.01.001
No Sertifikat: SHM-12345/2020
Tgl Sertifikat: 2020-05-15
Longitude: 106.8839
Latitude: -6.1085
Panjang (m): 150
Lebar (m): 20
Draft LWL (m): 8.5
Pasut HWL-LWL (m): 1.5
Kondisi (%): 90
Sandar Tipe 1: Fregat
Sandar Ton 1: 5000
Sandar Jumlah 1: 2
... (dan seterusnya)
```

---

## 🛠️ Technical Details

### Database Table: `faslabuh`
- **Primary Key**: `id` (auto-increment)
- **Unique Identifier**: `nama_dermaga` (untuk upsert logic)
- **JSON Fields**: 
  - `sandar_items` - Array of {tipe, ton, jumlah}
  - `fotos` - Array of photo URLs
- **Timestamps**: `created_at`, `updated_at`

### API Endpoints:
- `GET /api/faslabuh` - Fetch all data
- `POST /api/faslabuh` - Create new
- `PUT /api/faslabuh/:id` - Update existing
- `DELETE /api/faslabuh/:id` - Delete single
- `POST /api/faslabuh/bulk-import` - Bulk import
- `DELETE /api/faslabuh/delete-all` - Delete all

---

## 📞 Support

Jika mengalami masalah atau membutuhkan bantuan:
1. Periksa console browser (F12) untuk error details
2. Periksa server logs untuk backend errors
3. Gunakan script debug: `node database/debug_faslabuh_query.js`

---

**Versi**: 1.0  
**Terakhir Diupdate**: 11 Februari 2026  
**Aplikasi**: Sisinfolog Kodaeral
