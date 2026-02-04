# Dokumentasi Struktur Data Master Asset BMN

## Struktur Data BMN (Barang Milik Negara)

Sistem telah disesuaikan untuk mendukung struktur data BMN yang lengkap dengan 19 field:

### Field Wajib (Required)
1. **Jenis BMN** - Jenis Barang Milik Negara (Tanah/Bangunan/Peralatan/dll)
2. **Kode Asset** - Kode unik asset (identifier untuk update/insert)
3. **NUP** - Nomor Urut Pendaftaran (23 digit)
4. **Nama Asset** - Nama lengkap asset

### Field Opsional
5. **No Sertifikat** - Nomor sertifikat (SHM/SHGB/IMB/dll)
6. **Kondisi** - Kondisi asset (Baik/Rusak Ringan/Rusak Berat)
7. **Tanggal Perolehan** - Format: YYYY-MM-DD
8. **Nilai Perolehan** - Nilai dalam Rupiah (angka)
9. **Luas Tanah (m2)** - Luas dalam meter persegi
10. **No. PSP** - Nomor Penetapan Status Penggunaan
11. **Tanggal PSP** - Format: YYYY-MM-DD
12. **Alamat** - Alamat lengkap lokasi asset
13. **RT/RW** - Format: 001/002
14. **Desa/Kelurahan** - Nama desa atau kelurahan
15. **Kecamatan** - Nama kecamatan
16. **Kota/Kabupaten** - Nama kota atau kabupaten
17. **Kode Kota/Kabupaten** - Kode wilayah (4 digit)
18. **Provinsi** - Nama provinsi
19. **Keterangan** - Catatan tambahan

## Mapping ke Database

Karena database masih menggunakan struktur lama, sistem akan otomatis memetakan field BMN ke field database yang ada:

| Field BMN | Field Database | Keterangan |
|-----------|----------------|------------|
| Jenis BMN | category | Jenis asset |
| Kode Asset | code | Identifier unik |
| NUP | (extended field) | Disimpan sebagai field tambahan |
| Nama Asset | name | Nama asset |
| Kondisi | status | Status/kondisi |
| Luas Tanah (m2) | luas | Luas area |
| Alamat | location | Lokasi |
| No Sertifikat | (extended field) | Field tambahan |
| Tanggal Perolehan | (extended field) | Field tambahan |
| Nilai Perolehan | (extended field) | Field tambahan |
| No. PSP | (extended field) | Field tambahan |
| Tanggal PSP | (extended field) | Field tambahan |
| RT/RW | (extended field) | Field tambahan |
| Desa/Kelurahan | (extended field) | Field tambahan |
| Kecamatan | (extended field) | Field tambahan |
| Kota/Kabupaten | (extended field) | Field tambahan |
| Kode Kota/Kabupaten | (extended field) | Field tambahan |
| Provinsi | (extended field) | Field tambahan |
| Keterangan | (extended field) | Field tambahan |

## Validasi Data

### Validasi Wajib
- ✅ **Kode Asset** tidak boleh kosong
- ✅ **NUP** tidak boleh kosong dan harus 23 digit
- ✅ **Nama Asset** tidak boleh kosong
- ✅ **Jenis BMN** tidak boleh kosong

### Validasi Format
- ✅ **Kode Asset**: Hanya alphanumeric, underscore, dan dash
- ✅ **NUP**: Harus 23 digit angka
- ✅ **Tanggal Perolehan**: Format YYYY-MM-DD
- ✅ **Tanggal PSP**: Format YYYY-MM-DD
- ✅ **Nilai Perolehan**: Harus angka
- ✅ **Luas Tanah**: Harus angka
- ✅ **Kode Kota/Kabupaten**: Harus 4 digit angka

## Contoh Data

```
Jenis BMN: Tanah
Kode Asset: BMN-TN-001
NUP: 12345678901234567890123
Nama Asset: Tanah Kantor Pusat Kodaeral 3
No Sertifikat: SHM-001/2020
Kondisi: Baik
Tanggal Perolehan: 2020-01-15
Nilai Perolehan: 5000000000
Luas Tanah (m2): 1500
No. PSP: PSP-001/2020
Tanggal PSP: 2020-02-01
Alamat: Jl. Gunung Sahari No. 67
RT/RW: 005/008
Desa/Kelurahan: Gunung Sahari Selatan
Kecamatan: Kemayoran
Kota/Kabupaten: Jakarta Pusat
Kode Kota/Kabupaten: 3171
Provinsi: DKI Jakarta
Keterangan: Tanah untuk kantor pusat
```

## Template Excel

Template Excel sudah disesuaikan dengan struktur BMN lengkap. Download template dengan klik tombol "📥 Download Template" di halaman Master Asset.

Template includes:
- Sheet 1: Template Master Asset BMN (dengan 3 contoh data)
- Sheet 2: Panduan (instruksi lengkap)

## Upgrade Database (Opsional)

Jika ingin menyimpan semua field BMN secara native di database, jalankan migration berikut:

```sql
ALTER TABLE assets_tanah 
ADD COLUMN IF NOT EXISTS jenis_bmn VARCHAR(100),
ADD COLUMN IF NOT EXISTS nup VARCHAR(23),
ADD COLUMN IF NOT EXISTS no_sertifikat VARCHAR(100),
ADD COLUMN IF NOT EXISTS kondisi VARCHAR(50),
ADD COLUMN IF NOT EXISTS tanggal_perolehan DATE,
ADD COLUMN IF NOT EXISTS nilai_perolehan BIGINT,
ADD COLUMN IF NOT EXISTS no_psp VARCHAR(100),
ADD COLUMN IF NOT EXISTS tanggal_psp DATE,
ADD COLUMN IF NOT EXISTS rt_rw VARCHAR(20),
ADD COLUMN IF NOT EXISTS desa_kelurahan VARCHAR(100),
ADD COLUMN IF NOT EXISTS kecamatan VARCHAR(100),
ADD COLUMN IF NOT EXISTS kota_kabupaten VARCHAR(100),
ADD COLUMN IF NOT EXISTS kode_kota VARCHAR(4),
ADD COLUMN IF NOT EXISTS provinsi VARCHAR(100),
ADD COLUMN IF NOT EXISTS keterangan TEXT;

-- Add index for NUP (unique identifier)
CREATE INDEX IF NOT EXISTS idx_assets_tanah_nup ON assets_tanah(nup);

-- Add index for kode_kota
CREATE INDEX IF NOT EXISTS idx_assets_tanah_kode_kota ON assets_tanah(kode_kota);
```

Setelah migration, update API endpoint untuk menggunakan field BMN secara native.

## Jenis BMN yang Umum

1. **Tanah**
2. **Bangunan**
3. **Peralatan dan Mesin**
4. **Jalan, Irigasi, dan Jaringan**
5. **Aset Tetap Lainnya**
6. **Konstruksi Dalam Pengerjaan**

## Kondisi Asset

1. **Baik** - Asset dalam kondisi baik dan berfungsi normal
2. **Rusak Ringan** - Asset masih bisa digunakan dengan perbaikan kecil
3. **Rusak Berat** - Asset tidak bisa digunakan, perlu perbaikan besar

## Tips Import Data BMN

1. ✅ **Pastikan NUP benar** - NUP adalah identifier penting untuk BMN
2. ✅ **Gunakan format tanggal yang benar** - YYYY-MM-DD (contoh: 2020-01-15)
3. ✅ **Nilai Perolehan tanpa pemisah** - Gunakan angka murni (contoh: 5000000000, bukan 5.000.000.000)
4. ✅ **Kode Kota/Kabupaten** - Gunakan kode resmi Kemendagri (4 digit)
5. ✅ **Konsistensi Jenis BMN** - Gunakan nama yang sama untuk jenis yang sama
6. ✅ **Backup data** sebelum import besar
7. ✅ **Test dengan data kecil** dulu (5-10 baris)

## Support

Untuk pertanyaan atau bantuan terkait import data BMN, silakan hubungi tim IT Kodaeral 3 Jakarta.
