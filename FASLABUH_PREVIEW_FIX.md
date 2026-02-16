# Perbaikan Modal Preview Import Faslabuh

## Masalah:
Modal preview import hanya menampilkan beberapa kolom (Provinsi, Nama Dermaga, Lokasi, Konstruksi, P x L, Draft, Kondisi, Sandar), sedangkan data yang diimport memiliki banyak kolom lainnya seperti:
- Wilayah
- Pasut HWL-LWL
- Plat MST, Plat Jenis Ranmor, Plat Berat Max
- Listrik (Jumlah Titik, Kapasitas, Tegangan, Frekuensi, Sumber, Daya)
- Air (GWT, Debit, Sumber)
- BBM
- Hydrant

## Solusi:
Tambahkan kolom-kolom penting di modal preview agar user bisa memverifikasi semua data sebelum import.

## Kolom yang perlu ditambahkan di preview:
1. **Wilayah** - setelah Provinsi
2. **Pasut** - setelah Draft
3. **Plat MST** - setelah Sandar
4. **Listrik** - ringkasan (Sumber + Daya kVA)
5. **Air** - ringkasan (Sumber + GWT m³)
6. **BBM** - jenis BBM

## File yang perlu diubah:
`src/pages/Faslabuh.jsx` - baris 1514-1558

## Perubahan Header (baris 1515-1525):
Tambahkan kolom:
- Wilayah (setelah Provinsi)
- Pasut (setelah Draft)
- Plat MST (setelah Sandar)
- Listrik (setelah Plat MST)
- Air (setelah Listrik)
- BBM (setelah Air)

## Perubahan Body (baris 1536-1557):
Tambahkan cell untuk setiap kolom baru dengan data yang sesuai.

## Catatan:
Karena file terlalu besar dan kompleks, perbaikan ini perlu dilakukan secara manual atau dengan pendekatan yang lebih hati-hati.

## Alternatif Solusi:
Tambahkan ringkasan data di bawah tabel preview yang menampilkan:
- Total baris
- Jumlah data dengan Sandar Items
- Jumlah data dengan Listrik
- Jumlah data dengan Air
- Jumlah data dengan BBM

Ini akan membantu user memverifikasi bahwa semua data ter-parse dengan benar sebelum import.
