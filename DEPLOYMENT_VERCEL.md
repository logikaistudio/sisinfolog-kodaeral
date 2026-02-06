# 🚀 Deployment Guide - Vercel

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Neon Database** - PostgreSQL database URL
3. **GitHub Repository** - Code pushed to GitHub

---

## 🔧 Step-by-Step Deployment

### 1. **Setup Environment Variables di Vercel**

Setelah deploy, tambahkan environment variable:

1. Buka project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Tambahkan variable berikut:

```
Name: DATABASE_URL
Value: postgresql://user:password@host.neon.tech/database?sslmode=require
```

**Penting:** Ganti dengan Neon Database URL Anda yang sebenarnya!

### 2. **Deploy ke Vercel**

#### Option A: Via Vercel Dashboard
1. Login ke [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import repository dari GitHub
4. Vercel akan auto-detect Vite project
5. Click **"Deploy"**

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### 3. **Setup Database (PENTING!)**

Setelah deployment berhasil, **WAJIB** jalankan setup database:

1. Buka browser
2. Akses: `https://your-app.vercel.app/api/setup`
3. Tunggu hingga muncul response:
   ```json
   {
     "status": "success",
     "message": "Database setup completed",
     "results": [...],
     "credentials": {
       "username": "kodaeral",
       "password": "kodaeral"
     }
   }
   ```

**Endpoint `/api/setup` akan:**
- ✅ Membuat tabel `users` dan `roles`
- ✅ Membuat user admin default: `kodaeral` / `kodaeral`
- ✅ Membuat 3 role default (Super Admin, Admin, User)

### 4. **Test Login**

1. Buka aplikasi: `https://your-app.vercel.app`
2. Login dengan:
   - **Username:** `kodaeral`
   - **Password:** `kodaeral`

---

## 🔍 Troubleshooting

### ❌ Error: "Username atau Password salah"

**Penyebab:** Database belum di-setup

**Solusi:**
1. Akses `https://your-app.vercel.app/api/setup`
2. Pastikan response `"status": "success"`
3. Coba login lagi

### ❌ Error: "Database connection failed"

**Penyebab:** Environment variable `DATABASE_URL` belum di-set

**Solusi:**
1. Buka Vercel Dashboard → Settings → Environment Variables
2. Tambahkan `DATABASE_URL` dengan Neon DB URL
3. Redeploy aplikasi (Settings → Deployments → Redeploy)

### ❌ Error: "Internal Server Error"

**Penyebab:** Ada error di backend

**Solusi:**
1. Buka Vercel Dashboard → Deployments → View Function Logs
2. Lihat error message di logs
3. Biasanya terkait DATABASE_URL atau SQL syntax

### ❌ Halaman blank / tidak muncul

**Penyebab:** Build error atau routing issue

**Solusi:**
1. Check build logs di Vercel
2. Pastikan `vercel.json` sudah benar
3. Pastikan `dist` folder ter-generate dengan benar

---

## 📝 Vercel Configuration

File `vercel.json` sudah dikonfigurasi dengan:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🔒 Security Notes

### ⚠️ PENTING untuk Production:

1. **Ganti Password Default**
   - Setelah login pertama kali
   - Buka menu Pengaturan → Users
   - Edit user `kodaeral` dan ganti password

2. **Disable /api/setup Endpoint**
   - Setelah setup selesai, comment out endpoint ini
   - Atau tambahkan authentication

3. **Hash Password**
   - Saat ini password disimpan plain text
   - Untuk production, gunakan `bcrypt`

4. **Environment Variables**
   - Jangan commit `.env` ke Git
   - Gunakan Vercel Environment Variables

---

## 🎯 Checklist Deployment

- [ ] Push code ke GitHub
- [ ] Deploy ke Vercel
- [ ] Set environment variable `DATABASE_URL`
- [ ] Akses `/api/setup` untuk setup database
- [ ] Test login dengan `kodaeral` / `kodaeral`
- [ ] Ganti password default
- [ ] Test semua fitur (CRUD users, roles, assets)
- [ ] Monitor logs di Vercel Dashboard

---

## 📞 Support

Jika ada masalah:
1. Check Vercel Function Logs
2. Check Neon Database Logs
3. Test endpoint `/api/health` untuk cek koneksi DB

---

**Last Updated:** 2026-02-06
**Status:** Ready for Production ✅
