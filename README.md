## 🌀 Flowly Backend – API untuk Produktivitas Tanpa Gangguan

Ini adalah **layanan backend** untuk aplikasi **Flowly**, sebuah aplikasi todo-list modern yang membantu pengguna tetap fokus dan produktif. Backend ini dibangun menggunakan **NestJS**, dan menyediakan berbagai API untuk manajemen tugas, tracking kebiasaan, notifikasi, dan lainnya.

---

### 🚧 Status Proyek

> 🚀 Masih dalam tahap pengembangan aktif – kontribusi dan feedback sangat diterima!

---

### 🔥 Fitur Utama

#### ✅ **Manajemen Tugas (To-Do)**

* API untuk membuat, membaca, memperbarui, dan menghapus tugas (CRUD)
* Dukungan untuk **kategori**, **tag**, **prioritas**, dan **subtask**

#### 📅 **Integrasi Kalender**

* Tugas dapat dikaitkan dengan tanggal
* Endpoint untuk mengambil daftar tugas per hari, minggu, atau bulan

#### 🔔 **Pengingat & Notifikasi**

* Jadwalkan pengingat untuk tugas mendatang atau yang terlambat
* (Opsional) Siap untuk integrasi dengan layanan seperti Firebase Cloud Messaging

#### 📈 **Statistik Produktivitas**

* Endpoint untuk melihat:

  * Jumlah tugas yang diselesaikan
  * Produktivitas mingguan/bulanan
  * Konsistensi habit (kebiasaan)

#### 🧠 **Tracking Kebiasaan (Habit Tracker)**

* Lacak aktivitas harian/mingguan seperti olahraga, minum air, dll.
* Bisa disinkronkan dengan tugas harian

#### 🕐 **Dukungan Pomodoro (Opsional)**

* Endpoint untuk menyimpan sesi pomodoro
* Hitung total waktu fokus pengguna

#### 👤 **Autentikasi & Otorisasi**

* Login aman menggunakan JWT
* Sistem peran untuk mendukung fitur kolaborasi ke depan

#### ☁️ **Offline Sync Support**

* API mendukung konsep offline-first, termasuk strategi sinkronisasi data

---

### 🛠️ Teknologi yang Digunakan

* **Framework:** [NestJS](https://nestjs.com/) – modular, scalable, dan berbasis TypeScript
* **Database:** PostgreSQL (menggunakan TypeORM / Prisma)
* **Autentikasi:** JWT + Passport.js
* **Validasi:** class-validator + DTO
* **Dokumentasi API:** Swagger (`@nestjs/swagger`)

---

### 📁 Struktur Folder (Sederhana)

```
src/
├── auth/          → Modul login dan autentikasi (JWT)
├── tasks/         → Logika CRUD tugas
├── habits/        → Logika pelacakan kebiasaan
├── stats/         → Statistik produktivitas
├── users/         → Data dan profil pengguna
├── common/        → DTO, exception handler, interceptor
├── config/        → Konfigurasi environment global
```

---

### 📦 Cara Menjalankan Project

```bash
# Clone repo
git clone https://github.com/username/flowly-backend.git
cd flowly-backend

# Install dependencies
npm install

# Salin file .env contoh
cp .env.example .env

# Jalankan migrasi database (jika pakai TypeORM)
npm run typeorm:migration:run

# Start server development
npm run start:dev
```

---

### 🤝 Kontribusi

Ingin membantu pengembangan Flowly? Silakan open issue atau buat pull request! Proyek ini dibuat modular dan scalable agar mudah dikembangkan bersama.

