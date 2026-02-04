# Sisinfolog - Sistem Informasi Logistik Kodaeral 3 Jakarta

![Sisinfolog](https://img.shields.io/badge/Version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18.3.1-61dafb) ![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff)

Aplikasi modern untuk manajemen aset dan logistik Kodaeral 3 Jakarta dengan tampilan responsif dan mobile-first.

## 🚀 Fitur Utama

### 📦 Faslan (Fasilitas Angkutan Laut)
- Manajemen aset dan fasilitas angkutan laut
- Tracking status aset (Tersedia, Operasional, Maintenance)
- Pencatatan lokasi penyimpanan
- Dashboard statistik real-time

### 🔐 Autentikasi & Keamanan (New)
- **Login UI Modern**: Tampilan Glassmorphism yang elegan.
- **User Profiles**: Integrasi profil pengguna di sidebar.
- **Role Management**: Placeholder untuk pengaturan hak akses.

### 🗺️ Peta Faslan
- Peta interaktif fasilitas pangkalan.
- Marker aset aset tanah dan bangunan.

### 🛠️ Fasharpan (ex-Harpan)
- Fasilitas Pemeliharaan & Perbaikan.
- Monitoring status KRI/KAL/KAMLA.

### 📦 DisBek (ex-Bekang)
- Dinas Perbekalan.
- Manajemen stok logistik.

### 🚛 DisAng (New)
- Dinas Angkutan.
- Manajemen kendaraan dan operasional angkutan.

### ⚙️ Master Data
- Manajemen kategori aset
- Data lokasi penyimpanan
- Database petugas
- Satuan pengukuran

### 📥 Master Asset Import (NEW) ⭐
- **Smart Import**: Upload Excel dengan auto-detect update/insert
- **3 Mode Import**: Upsert, Insert Only, Update Only
- **Preview & Validasi**: Lihat dan validasi data sebelum import
- **Progress Tracking**: Monitor real-time import progress
- **Error Handling**: Detail error untuk setiap baris yang gagal
- **Template Excel**: Download template dengan panduan lengkap
- **Batch Processing**: Import ribuan data sekaligus dengan cepat

📖 **[Panduan Lengkap Import Master Asset](./IMPORT_MASTER_ASSET.md)**

## 🎨 Design Features

- **Modern UI/UX**: Desain clean dan premium seperti aplikasi tahun 2025
- **Navy Blue Theme**: Menggunakan warna biru angkatan laut Indonesia (#003366)
- **Mobile-First**: Responsif sempurna di semua ukuran layar
- **Smooth Animations**: Transisi halus dan micro-interactions
- **Typography**: Inter font untuk keterbacaan optimal
- **Accessibility**: Semantic HTML dan ARIA labels

## 🛠️ Teknologi

- **React 18.3.1** - UI Framework
- **Vite 7.3.1** - Build Tool & Dev Server
- **Vanilla CSS** - Styling dengan design system komprehensif
- **Google Fonts (Inter)** - Modern typography

## 📦 Instalasi

```bash
# Clone repository
git clone [repository-url]

# Masuk ke direktori
cd sisinfolog

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🏗️ Struktur Proyek

```
sisinfolog/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx          # Komponen sidebar navigasi
│   ├── pages/
│   │   ├── Faslan.jsx           # Halaman Faslan
│   │   ├── Bekang.jsx           # Halaman Bekang
│   │   ├── Harpan.jsx           # Halaman Harpan
│   │   └── MasterData.jsx       # Halaman Master Data
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Design system & global styles
├── index.html
├── package.json
└── README.md
```

## 🎯 Design System

### Color Palette
- **Navy Primary**: `#003366` - Warna utama sidebar dan elemen penting
- **Navy Dark**: `#001f3f` - Gradient sidebar
- **Navy Accent**: `#0066cc` - Links dan highlights
- **Success**: `#10b981` - Status positif
- **Warning**: `#f59e0b` - Peringatan
- **Error**: `#ef4444` - Error dan kritis

### Typography Scale
- **3xl**: 2rem (32px) - Page titles
- **2xl**: 1.5rem (24px) - Section headers
- **xl**: 1.25rem (20px) - Card titles
- **lg**: 1.125rem (18px) - Subheadings
- **base**: 1rem (16px) - Body text
- **sm**: 0.875rem (14px) - Secondary text
- **xs**: 0.75rem (12px) - Labels

### Spacing System
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

## 📱 Responsive Breakpoints

- **Desktop**: > 768px - Full sidebar visible
- **Mobile**: ≤ 768px - Collapsible sidebar with overlay

## 🔧 Development

### Build untuk Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Status Aplikasi

✅ Sidebar navigasi dengan 4 menu utama  
✅ Halaman Faslan dengan tabel aset  
✅ Halaman Bekang dengan manajemen stok  
✅ Halaman Harpan dengan laporan harian  
✅ Halaman Master Data dengan tabs  
✅ Responsive design (Desktop & Mobile)  
✅ Modern UI dengan Indonesian Navy blue theme  
✅ Statistics cards dan dashboards  
✅ Action buttons dan forms  

## 🎨 Screenshots

### Desktop View
![Desktop View](./screenshots/desktop.png)

### Mobile View
![Mobile View](./screenshots/mobile.png)

## 👥 Target Users

- Petugas Logistik Kodaeral 3 Jakarta
- Kepala Gudang
- Supervisor Operasional
- Admin Bekal
- Management

## 📝 License

Copyright © 2026 Kodaeral 3 Jakarta

## 🤝 Contributing

Untuk kontribusi dan pengembangan lebih lanjut, silakan hubungi tim IT Kodaeral 3 Jakarta.

---

**Dibuat dengan ❤️ untuk Kodaeral 3 Jakarta**
