# Penjelasan Menu Aplikasi SLA FE

Dokumen ini menjelaskan menu yang tersedia pada aplikasi SLA FE berdasarkan konfigurasi menu dan route yang ada di frontend. Menu yang tampil dapat berbeda tergantung role user.

## Ringkasan Hak Akses

Role yang digunakan aplikasi:

- `administrator` / `admin`: dapat mengakses seluruh menu utama dan menu admin.
- `tif ho`, `tif regional`, `mitra`: dapat mengakses menu utama operasional.
- `vice president`: dapat mengakses `Monday Monitoring` dan `One Visibility`.
- `tsel`: dapat mengakses `One Visibility`.
- `guest`: dapat mengakses `Monday Monitoring`.

Menu admin seperti `User` dan `Approve` hanya tersedia untuk role `administrator` / `admin`.

## Menu Utama

### 1. Executive Summary

- Route: `/executive`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `Executive Summary` menampilkan dashboard ringkasan eksekutif melalui iframe QOSMO. Menu ini digunakan untuk melihat gambaran performa layanan secara menyeluruh pada level manajemen, sehingga user dapat membaca kondisi utama tanpa masuk ke detail teknis satu per satu.

### 2. Monday Monitoring

- Route: `/monday`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`, `vice president`, `guest`

Menu `Monday Monitoring` menampilkan dashboard weekly monitoring dari QOSMO. Halaman ini digunakan untuk memantau kondisi mingguan, terutama ringkasan performa dan isu yang perlu menjadi perhatian pada periode monitoring berjalan.

### 3. SLA

- Route utama sub-menu: mengikuti pilihan dropdown
- Tipe menu: dropdown
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `SLA` berisi beberapa sub-menu yang berhubungan dengan pencapaian SLA, monitoring harian, rekonsiliasi, RCA, dan prediksi achievement.

#### 3.1 Achievement WISA

- Route: `/msa`

Sub-menu `Achievement WISA` menampilkan dashboard MSA untuk melihat pencapaian SLA. Halaman ini memuat data summary, history, dan trend berdasarkan parameter yang tersedia. User dapat memfilter data berdasarkan tipe pencapaian dan regional/TREG.

Fungsi utama:

- melihat summary achievement SLA MSA
- memantau trend parameter seperti packet loss, latency, jitter, dan MTTRQ
- melihat history pencapaian
- melakukan filter data berdasarkan achievement dan wilayah

#### 3.2 Daily Monitoring

- Route: `/daily-monitoring`

Sub-menu `Daily Monitoring` digunakan untuk pemantauan harian kualitas layanan CNOP. Halaman ini menampilkan data `Packet Loss` dan `MTTR Quality`, serta menyediakan fitur ekspor tampilan menjadi gambar.

Fungsi utama:

- melihat ringkasan monitoring harian
- melihat tabel packet loss dalam mode gabungan atau split
- melihat tabel MTTR Quality
- mengekspor tampilan monitoring menjadi file gambar

#### 3.3 Report Reconsilation

- Route: `/report-site`

Sub-menu `Report Reconsilation` menampilkan hasil assessment atau laporan rekonsiliasi. User dapat memilih parameter, bulan, dan tahun untuk melihat data laporan.

Parameter yang tersedia:

- Packetloss
- Jitter
- Latency
- MTTRQ Critical
- MTTRQ Major
- MTTRQ Minor

Fungsi utama:

- melihat summary assessment rekonsiliasi
- memfilter data berdasarkan parameter, bulan, dan tahun
- menampilkan tabel khusus MTTRQ saat parameter MTTRQ dipilih
- mengekspor data rekonsiliasi ke Excel melalui tombol `Export Recon`

#### 3.4 Resume RCA

- Route: `/resume-rca`

Sub-menu `Resume RCA` digunakan untuk melihat resume Root Cause Analysis. Halaman ini memuat ringkasan analisis gangguan, progress action plan, traffic, MTTR, dan data pendukung lainnya.

Fungsi utama:

- melihat resume RCA berdasarkan periode week/year
- memilih parameter analisis
- melihat progress action plan
- melihat detail traffic dan MTTR
- melakukan upload data pendukung untuk parameter tertentu

#### 3.5 Week-to-Date Achievement

- Route: `/access-prediction`

Sub-menu `Week-to-Date Achievement` digunakan untuk melihat prediksi atau tracking achievement berjalan dalam periode week-to-date. Halaman ini mengolah data access performance dan menyediakan fitur ekspor Excel.

Fungsi utama:

- memantau achievement berjalan berdasarkan periode minggu
- melihat data regional dan detail site
- membandingkan data minggu berjalan dengan data sebelumnya
- mengekspor data mentah atau hasil tracking ke Excel

### 4. Network Performance

- Route utama sub-menu: `/network/:menuId`
- Tipe menu: dropdown
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `Network Performance` berisi dashboard performa jaringan dan kualitas layanan.

#### 4.1 Core Perf

- Route: `/network/core-perf`

Sub-menu `Core Perf` menampilkan dashboard performa core network melalui iframe QOSMO. Menu ini digunakan untuk memantau kondisi dan performa jaringan core.

#### 4.2 CDN Perf

- Route: `/network/cdn-perf`

Sub-menu `CDN Perf` menampilkan dashboard performa CDN melalui iframe QOSMO. Menu ini digunakan untuk memantau kualitas dan performa layanan CDN.

#### 4.3 Quality Healthiness

- Route: `/network/quality-healthiness`

Sub-menu `Quality Healthiness` menampilkan peta dan ringkasan kesehatan kualitas jaringan. Halaman ini berfokus pada kategori kualitas seperti packet loss, latency, jitter, dan total site.

Fungsi utama:

- melihat peta quality healthiness per region
- memantau kategori kualitas jaringan
- melihat ringkasan metrik PL, LAT, JIT, dan total site
- memilih tampilan berdasarkan region

### 5. Reconsiliation

- Route: `/input-site`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `Reconsiliation` digunakan untuk input dan pengelolaan data rekonsiliasi site. User dapat memilih tipe site, status exclude, parameter, tahun, bulan, dan minggu sebelum mengunduh template atau mengimpor file Excel.

Fungsi utama:

- melihat tabel data rekonsiliasi site
- memfilter data berdasarkan `Site Type`, `Exclude`, parameter, tahun, bulan, dan minggu
- mengunduh template Excel
- mengimpor file Excel hasil pengisian template
- memperbarui data setelah proses upload berhasil

### 6. One Visibility

- Route: `/one`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`, `vice president`, `tsel`

Menu `One Visibility` menampilkan dashboard One melalui iframe. Menu ini digunakan sebagai akses terintegrasi ke dashboard visibility lain di dalam ekosistem aplikasi.

Pada local development, halaman dapat menampilkan fallback shell jika iframe dashboard tidak tersedia.

### 7. Ticket Quality

- Route: `/ticket`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `Ticket Quality` menampilkan dashboard kualitas tiket melalui iframe. Menu ini digunakan untuk melihat informasi terkait kualitas ticketing dan pemantauan kualitas penanganan.

Pada local development, halaman dapat menampilkan fallback shell jika iframe dashboard tidak tersedia.

### 8. E-Library

- Route: `/elibrary`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `E-Library` membuka halaman dokumen NetQ melalui iframe. Menu ini digunakan sebagai pusat referensi dokumen, panduan, atau materi umum yang berkaitan dengan kebutuhan operasional.

### 9. Onx

- Route: `/onx`
- Alias route: `/tutela` diarahkan ke `/onx`
- Tipe menu: tombol utama
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `Onx` menampilkan aplikasi Tutela/ONX melalui iframe internal. Halaman ini mendukung beberapa path internal seperti dashboard, mobile experience, dan ISP provider experience.

Fungsi utama:

- membuka dashboard ONX
- menampilkan mobile experience
- menampilkan ISP provider experience
- menerima perpindahan route dari iframe melalui message event

### 10. Telkom Akses

- URL eksternal: `http://10.60.174.188:8008/`
- Tipe menu: external link
- Hak akses: `administrator`, `admin`, `tif ho`, `tif regional`, `mitra`

Menu `Telkom Akses` membuka aplikasi eksternal pada tab baru. Menu ini tidak dirender sebagai halaman internal React, tetapi langsung menjalankan `window.open` ke URL Telkom Akses.

## Menu Profile dan Admin

Menu berikut muncul dari dropdown profile di kanan atas.

### 1. Profile

- Route: `/profile`
- Hak akses: user yang sudah login

Menu `Profile` digunakan untuk melihat dan mengubah data profil user. Form yang tersedia mencakup NIK, nama, email, region, dan ID Telegram.

Fungsi utama:

- melihat data user dari local storage
- memperbarui data profil
- menyimpan kembali data terbaru ke local storage
- membuka link Telegram berdasarkan ID Telegram user

### 2. User

- Route: `/user`
- Hak akses: `administrator` / `admin`

Menu `User` digunakan untuk manajemen data user. Halaman ini menyediakan tabel user dan tombol `Tambah User` untuk membuka modal penambahan user baru.

Fungsi utama:

- melihat daftar user
- menambah user baru
- melihat detail user
- menghapus atau mengelola data user melalui komponen tabel dan modal

### 3. Approve

- Route: `/approver`
- Hak akses: `administrator` / `admin`

Menu `Approve` digunakan untuk proses approval data. User admin dapat memfilter data berdasarkan bulan, minggu, dan tahun.

Fungsi utama:

- melihat daftar data yang membutuhkan approval
- memfilter data berdasarkan periode
- melakukan proses approval melalui tabel approver

### 4. Logout

- Aksi: memanggil proses logout dan mengarahkan user ke `/login`

Menu `Logout` digunakan untuk keluar dari aplikasi. Saat logout berhasil, aplikasi menampilkan notifikasi sukses dan mengarahkan user ke halaman login.

## Route Pendukung

Selain menu yang tampil di navbar dan dropdown profile, terdapat route pendukung:

- `/login`: halaman login.
- `/dashboard/:menuId/:detailParameter`: halaman detail parameter dari dashboard MSA/CNOP.
- `/report-support-needed`: route report support needed yang masuk dalam active path SLA.
- `/report-support-needed/detail/:breakdown/:issue/:monthnow/:parameter`: halaman detail breakdown report support.
- `/dashboard-ta`: route internal dashboard Telkom Akses, meskipun menu navbar saat ini membuka URL eksternal.
- `/access-denied`: route placeholder untuk akses ditolak.
- `/no-connection`: route placeholder untuk kondisi tidak ada koneksi.

## Catatan Implementasi

- Sumber konfigurasi menu utama berada di `src/app/config/menuConfig.ts`.
- Rendering menu navbar berada di `src/app/layout/AppLayoutDefault/index.tsx`.
- Route aplikasi dikumpulkan di `src/plugins/router/index.tsx`.
- Sebagian halaman menggunakan iframe ke dashboard eksternal atau internal, sehingga konten detailnya bergantung pada aplikasi tujuan iframe.
- Menu yang tampil ditentukan oleh role user melalui fungsi `getVisibleMenus`.
