# DOKUMENTASI TABEL FASLABUH (DERMAGA)

## 📋 Struktur Tabel Database

### Tabel: `faslabuh`

Tabel ini menyimpan data lengkap fasilitas labuh (dermaga) di lingkungan Kodaeral 3 Jakarta.

---

## 🗂️ Mapping Kolom Excel ke Database

### A. INFORMASI LOKASI (Kolom A-C)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| A: Lantamal | `lantamal` | VARCHAR(100) | Nama Lantamal yang membawahi |
| B: Lanal/Faslan | `lanal_faslan` | VARCHAR(100) | Nama Lanal atau Faslan |
| C: Lokasi Dermaga | `lokasi_dermaga` | TEXT | Alamat lengkap lokasi dermaga |

**Contoh:**
- Lantamal: `Lantamal III`
- Lanal/Faslan: `Lanal Jakarta`
- Lokasi Dermaga: `Jl. Gunung Sahari, Jakarta Utara`

---

### B. IDENTIFIKASI DERMAGA (Kolom D-E)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| D: Nama Dermaga | `nama_dermaga` | VARCHAR(200) | Nama dermaga (WAJIB DIISI) |
| E: Jenis Dermaga | `jenis_dermaga` | VARCHAR(100) | Jenis dermaga |

**Contoh:**
- Nama Dermaga: `Dermaga Utama A`, `Dermaga B`
- Jenis Dermaga: `Dermaga Umum`, `Dermaga Khusus`, `Dermaga Ponton`

---

### C. SPESIFIKASI TEKNIS (Kolom F-K)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| F: Panjang (m) | `panjang_m` | DECIMAL(10,2) | Panjang dermaga dalam meter |
| G: Lebar (m) | `lebar_m` | DECIMAL(10,2) | Lebar dermaga dalam meter |
| H: Kedalaman (m) | `kedalaman_m` | DECIMAL(10,2) | Kedalaman air di dermaga |
| I: Luas (m²) | `luas_m2` | DECIMAL(10,2) | Luas total dermaga |
| J: Konstruksi | `konstruksi` | VARCHAR(100) | Jenis konstruksi |
| K: Tahun Pembangunan | `tahun_pembangunan` | INTEGER | Tahun dermaga dibangun |

**Contoh:**
- Panjang: `150.5`
- Lebar: `20.0`
- Kedalaman: `8.5`
- Luas: `3010.0`
- Konstruksi: `Beton Bertulang`, `Beton`, `Kayu`, `Baja`
- Tahun: `2015`

---

### D. KAPASITAS (Kolom L-O)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| L: Kapasitas Kapal | `kapasitas_kapal` | VARCHAR(200) | Jenis kapal yang dapat ditampung |
| M: Tonase Max (ton) | `tonase_max` | DECIMAL(10,2) | Tonase maksimal kapal |
| N: Jumlah Tambat | `jumlah_tambat` | INTEGER | Jumlah titik tambat |
| O: Panjang Tambat (m) | `panjang_tambat_m` | DECIMAL(10,2) | Panjang area tambat |

**Contoh:**
- Kapasitas Kapal: `Kapal Patroli, KRI`, `Kapal Kecil`
- Tonase Max: `5000`
- Jumlah Tambat: `4`
- Panjang Tambat: `35.0`

---

### E. KONDISI FISIK (Kolom P-S)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| P: Kondisi Dermaga | `kondisi_dermaga` | VARCHAR(50) | Kondisi umum dermaga (WAJIB DIISI) |
| Q: Kondisi Lantai | `kondisi_lantai` | VARCHAR(50) | Kondisi lantai dermaga |
| R: Kondisi Dinding | `kondisi_dinding` | VARCHAR(50) | Kondisi dinding dermaga |
| S: Kondisi Fender | `kondisi_fender` | VARCHAR(50) | Kondisi fender |

**Nilai yang diperbolehkan:**
- `Baik`
- `Rusak Ringan`
- `Rusak Berat`

**Contoh:**
- Kondisi Dermaga: `Baik`
- Kondisi Lantai: `Baik`
- Kondisi Dinding: `Rusak Ringan`
- Kondisi Fender: `Baik`

---

### F. FASILITAS PENDUKUNG (Kolom T-W)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| T: Bollard (unit) | `bollard` | INTEGER | Jumlah bollard |
| U: Fender (unit) | `fender` | INTEGER | Jumlah fender |
| V: Tangga Kapal (unit) | `tangga_kapal` | INTEGER | Jumlah tangga kapal |
| W: Lampu Dermaga (unit) | `lampu_dermaga` | INTEGER | Jumlah lampu |

**Contoh:**
- Bollard: `12`
- Fender: `24`
- Tangga Kapal: `4`
- Lampu Dermaga: `16`

---

### G. UTILITAS (Kolom X-AA)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| X: Air Bersih | `air_bersih` | BOOLEAN | Tersedia air bersih? |
| Y: Listrik | `listrik` | BOOLEAN | Tersedia listrik? |
| Z: BBM | `bbm` | BOOLEAN | Tersedia BBM? |
| AA: Crane | `crane` | BOOLEAN | Tersedia crane? |

**Nilai yang diperbolehkan:**
- `Ya` atau `Tidak`
- `TRUE` atau `FALSE`
- `1` atau `0`

**Contoh:**
- Air Bersih: `Ya`
- Listrik: `Ya`
- BBM: `Ya`
- Crane: `Tidak`

---

### H. DIMENSI TAMBAHAN (Kolom AB-AE)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| AB: Elevasi (m) | `elevasi_m` | DECIMAL(10,2) | Elevasi dermaga |
| AC: Draft (m) | `draft_m` | DECIMAL(10,2) | Draft maksimal |
| AD: Lebar Apron (m) | `lebar_apron_m` | DECIMAL(10,2) | Lebar apron |
| AE: Panjang Apron (m) | `panjang_apron_m` | DECIMAL(10,2) | Panjang apron |

**Contoh:**
- Elevasi: `2.5`
- Draft: `7.0`
- Lebar Apron: `15.0`
- Panjang Apron: `140.0`

---

### I. INFORMASI TAMBAHAN (Kolom AF-AH)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| AF: Fungsi Dermaga | `fungsi_dermaga` | TEXT | Fungsi/kegunaan dermaga |
| AG: Keterangan | `keterangan` | TEXT | Catatan tambahan |
| AH: Status Operasional | `status_operasional` | VARCHAR(50) | Status operasional |

**Nilai Status Operasional:**
- `Aktif`
- `Tidak Aktif`
- `Dalam Perbaikan`

**Contoh:**
- Fungsi: `Dermaga sandar kapal patroli dan KRI`
- Keterangan: `Dilengkapi fasilitas lengkap`
- Status: `Aktif`

---

### J. KOORDINAT (Kolom AI-AJ)

| Kolom Excel | Nama Kolom DB | Tipe Data | Keterangan |
|-------------|---------------|-----------|------------|
| AI: Longitude | `longitude` | DECIMAL(10,7) | Koordinat longitude |
| AJ: Latitude | `latitude` | DECIMAL(10,7) | Koordinat latitude |

**Contoh:**
- Longitude: `106.8456`
- Latitude: `-6.1234`

**Catatan:** Koordinat diperlukan untuk menampilkan dermaga di peta

---

## 📊 Ringkasan Kolom

### Total: 37 Kolom

| Kategori | Jumlah Kolom | Range Kolom |
|----------|--------------|-------------|
| Informasi Lokasi | 3 | A-C |
| Identifikasi Dermaga | 2 | D-E |
| Spesifikasi Teknis | 6 | F-K |
| Kapasitas | 4 | L-O |
| Kondisi Fisik | 4 | P-S |
| Fasilitas Pendukung | 4 | T-W |
| Utilitas | 4 | X-AA |
| Dimensi Tambahan | 4 | AB-AE |
| Informasi Tambahan | 3 | AF-AH |
| Koordinat | 2 | AI-AJ |
| **TOTAL** | **37** | **A-AJ** |

---

## ⚠️ Kolom Wajib Diisi

1. **Nama Dermaga** (Kolom D)
2. **Lokasi Dermaga** (Kolom C)
3. **Kondisi Dermaga** (Kolom P)

---

## 📝 Catatan Penting

1. **Format Angka:**
   - Gunakan titik (.) untuk desimal, bukan koma
   - Contoh: `150.5` bukan `150,5`

2. **Format Boolean (Ya/Tidak):**
   - Gunakan: `Ya` atau `Tidak`
   - Alternatif: `TRUE`/`FALSE` atau `1`/`0`

3. **Kondisi:**
   - Hanya gunakan: `Baik`, `Rusak Ringan`, atau `Rusak Berat`

4. **Status Operasional:**
   - Hanya gunakan: `Aktif`, `Tidak Aktif`, atau `Dalam Perbaikan`

5. **Koordinat:**
   - Opsional, tapi diperlukan untuk integrasi peta
   - Format: Longitude (106.xxxx), Latitude (-6.xxxx)

---

## 🚀 Cara Menggunakan Template

1. **Download Template:**
   - File: `Template_Import_Faslabuh.xlsx`
   - Lokasi: Root folder project

2. **Isi Data:**
   - Buka file Excel
   - Isi data mulai baris ke-2 (baris 1 adalah header)
   - Lihat contoh data di baris 2-3

3. **Validasi:**
   - Pastikan kolom wajib terisi
   - Cek format angka dan boolean
   - Verifikasi nilai kondisi dan status

4. **Upload:**
   - Simpan file dalam format `.xlsx`
   - Upload melalui halaman Faslabuh di aplikasi
   - Klik tombol "Import Excel"

---

## 🗄️ Metadata Tambahan

Setiap record akan otomatis mendapat:
- `id`: Auto-increment primary key
- `created_at`: Timestamp saat data dibuat
- `updated_at`: Timestamp saat data diupdate

---

## 📞 Support

Jika ada pertanyaan tentang struktur data atau import, hubungi admin sistem.
