# 🔧 Troubleshooting: Data Import Faslabuh Tidak Masuk

## 📋 Tanggal: 11 Februari 2026

## ❌ Masalah:
Saat import Excel, preview menampilkan banyak kolom dengan nilai `-` (kosong) dan angka `0`, padahal file Excel sudah diisi dengan data lengkap.

## 🔍 Penyebab yang Mungkin:

### 1. **Nama Kolom Excel Tidak Sesuai**
Sistem membaca Excel berdasarkan **nama kolom yang EXACT MATCH**. Jika ada perbedaan sedikit saja (spasi, huruf besar/kecil, karakter khusus), data tidak akan terbaca.

**Nama Kolom yang Benar:**
```
Provinsi
Wilayah
Lokasi
Nama Dermaga
Konstruksi
Kode Barang
No Sertifikat
Tgl Sertifikat
Longitude
Latitude
Panjang (m)
Lebar (m)
Draft LWL (m)
Pasut HWL-LWL (m)
Kondisi (%)
Sandar Tipe 1
Sandar Ton 1
Sandar Jumlah 1
Sandar Tipe 2
Sandar Ton 2
Sandar Jumlah 2
... (hingga Sandar 5)
Plat MST (ton)
Plat Jenis Ranmor
Plat Berat Max (ton)
Listrik Jml Titik
Listrik Kap (Amp)
Listrik Tegangan (Volt)
Listrik Frek (Hz)
Listrik Sumber
Listrik Daya (kVA)
Air GWT (m³)
Air Debit (m³/jam)
Air Sumber
BBM
Hydrant
Keterangan
```

### 2. **Data di Baris yang Salah**
- **Baris 1** HARUS berisi header (nama kolom)
- **Baris 2+** berisi data
- Jangan ada baris kosong di antara header dan data

### 3. **Format Excel Tidak Didukung**
- Gunakan format `.xlsx` atau `.xls`
- Jangan gunakan `.csv` atau format lain

### 4. **Karakter Khusus di Nama Kolom**
Perhatikan karakter khusus:
- `(m)` - harus ada kurung
- `(%)` - harus ada kurung
- `(m³)` - harus ada superscript 3 atau m3
- `(kVA)` - huruf besar/kecil harus sama

## ✅ Perbaikan yang Sudah Dilakukan:

### 1. **Menghapus Default Values yang Salah**
**Sebelum:**
```javascript
listrik_sumber: row['Listrik Sumber'] || 'PLN',  // ❌ Salah
air_sumber: row['Air Sumber'] || 'PDAM',          // ❌ Salah
bbm: row['BBM'] || 'Solar',                       // ❌ Salah
```

**Sesudah:**
```javascript
listrik_sumber: row['Listrik Sumber'] || '',  // ✅ Benar
air_sumber: row['Air Sumber'] || '',           // ✅ Benar
bbm: row['BBM'] || '',                         // ✅ Benar
```

### 2. **Menambahkan Debug Console Log**
Sekarang saat upload Excel, browser console akan menampilkan:
- 📊 Raw Excel Data (semua data yang dibaca)
- 📋 Excel Headers (nama kolom yang terdeteksi)
- 📝 First Row Sample (contoh baris pertama)

## 🔍 Cara Debug:

### Langkah 1: Buka Browser Console
1. Buka aplikasi di `http://localhost:5173`
2. Tekan **F12** untuk membuka Developer Tools
3. Klik tab **Console**

### Langkah 2: Upload File Excel
1. Klik "📂 Import Excel"
2. Pilih file Excel Anda
3. Lihat console log

### Langkah 3: Periksa Console Output
Anda akan melihat output seperti ini:

```javascript
📊 Raw Excel Data: Array(446) [...]
📋 Excel Headers: ['Provinsi', 'Wilayah', 'Lokasi', ...]
📝 First Row Sample: {
  'Provinsi': 'DKI Jakarta',
  'Wilayah': 'Jakarta Utara',
  'Nama Dermaga': 'Dermaga A',
  ...
}
```

### Langkah 4: Verifikasi Nama Kolom
**Periksa apakah nama kolom di console sama persis dengan yang diharapkan:**

✅ **Benar:**
```
'Provinsi', 'Wilayah', 'Lokasi', 'Nama Dermaga'
```

❌ **Salah:**
```
'provinsi', 'wilayah', 'lokasi', 'nama dermaga'  // huruf kecil
'Provinsi ', 'Wilayah ', 'Lokasi '               // ada spasi di akhir
'Propinsi', 'Wilayah', 'Lokasi'                  // typo
```

## 🛠️ Solusi Berdasarkan Hasil Debug:

### Jika Nama Kolom Salah:
1. **Download template baru** dengan klik "📋 Export Template"
2. **Copy-paste data** dari Excel lama ke template baru
3. **Pastikan tidak mengubah nama kolom** di baris header
4. **Upload ulang**

### Jika Data Kosong:
1. Pastikan data ada di **sheet pertama** Excel
2. Pastikan data dimulai dari **baris 2** (baris 1 = header)
3. Pastikan tidak ada **baris kosong** di antara header dan data

### Jika Format Angka Salah:
1. Pastikan angka tidak menggunakan **koma** sebagai desimal (gunakan **titik**)
   - ✅ Benar: `8.5`
   - ❌ Salah: `8,5`
2. Pastikan tidak ada **format currency** atau **format khusus** lainnya

## 📝 Checklist Sebelum Import:

- [ ] File format `.xlsx` atau `.xls`
- [ ] Baris 1 berisi header (nama kolom)
- [ ] Nama kolom EXACT MATCH dengan template
- [ ] Tidak ada spasi ekstra di nama kolom
- [ ] Data dimulai dari baris 2
- [ ] Tidak ada baris kosong
- [ ] Angka menggunakan titik (.) bukan koma (,)
- [ ] Kolom "Nama Dermaga" wajib diisi
- [ ] Sheet pertama yang digunakan

## 🎯 Langkah Selanjutnya:

1. **Buka browser console** (F12)
2. **Upload file Excel** lagi
3. **Screenshot console output** (📊 Raw Excel Data, 📋 Excel Headers, 📝 First Row Sample)
4. **Kirim screenshot** untuk analisis lebih lanjut

Atau:

1. **Download template baru** dari aplikasi
2. **Isi ulang data** di template baru
3. **Upload template yang sudah diisi**

## 📞 Informasi Tambahan:

Jika masih bermasalah, periksa:
- Apakah Excel dibuka dengan aplikasi yang benar (Microsoft Excel, LibreOffice, Google Sheets)
- Apakah ada formula di cell (harus dikonversi ke value)
- Apakah ada merged cells (harus di-unmerge)
- Apakah ada filter aktif di Excel

---

**File yang Diubah:**
- `src/pages/Faslabuh.jsx` (baris 423-430, 455-460)

**Status:** ✅ Debugging tools sudah ditambahkan, siap untuk troubleshooting
