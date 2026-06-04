# Dokumentasi Frontend SLA OM Quality

## Ringkasan Sistem
Project ini adalah frontend web admin untuk monitoring dan pengelolaan performa SLA/quality operasional.

Secara isi, sistem ini berfungsi sebagai portal internal untuk:
- memantau achievement SLA
- melihat dashboard MSA dan CNOP
- melakukan rekonsiliasi site
- memonitor ticket quality
- meninjau network quality
- mengelola approver, user, dan profil
- menampilkan ringkasan eksekutif dan dashboard pendukung lainnya

Berdasarkan label menu, judul halaman, dan data yang digunakan di kode, sistem ini tampaknya dipakai untuk operasi monitoring SLA dan quality management di lingkungan Qosmo/Telkom.

## Teknologi Utama
- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `Redux Toolkit` dan `RTK Query`
- `Ant Design`
- `Tailwind CSS`
- `Axios`
- `Chart.js`
- `Mapbox GL`
- `Toastify`

## Cara Aplikasi Dimulai
Alur bootstrap aplikasi:

1. `src/main.tsx` menjadi entry point runtime.
2. Aplikasi dibungkus `BrowserRouter`.
3. Redux `Provider` dipasang dari `src/plugins/redux`.
4. `AppEntryPoint` memuat konfigurasi Ant Design dan router utama.
5. Routing final dibangun oleh `useRouter()` di `src/plugins/router/index.tsx`.

Catatan:
- `src/App.tsx` masih berisi template bawaan Vite dan bukan entry utama aplikasi saat ini.

## Arsitektur Routing
Routing dibagi menjadi 3 lapisan utama:

### 1. Public/Auth Route
- `src/modules/auth/router/auth.router.tsx`
- Saat ini berisi route `login`

### 2. Protected Route
Route yang memerlukan autentikasi dibangun dari beberapa modul:
- dashboard
- site/reconciliation
- monday monitoring
- one visibility
- executive summary
- e-library
- network
- ticket
- dashboard-ta
- user
- approver
- profile
- access prediction
- resume rca

### 3. Fallback Route
- `*` diarahkan ke layout kosong
- placeholder halaman not found belum diaktifkan

## Layout Aplikasi

### `AppLayoutDefault`
Layout utama setelah login.
Karakteristiknya:
- header dengan branding Qosmo
- navigasi berbasis role/user level
- menu berbeda berdasarkan `level_user`
- dukungan logout

### `AppLayoutAuth`
Layout untuk halaman login.
Karakteristiknya:
- background image penuh
- card login di tengah layar

### `AppLayoutEmpty`
Layout kosong untuk halaman placeholder atau fallback route.

## Struktur Folder

### `src/app`
Berisi fondasi aplikasi:
- routing
- layout
- komponen umum
- UI bootstrap
- utilitas umum
- redux slice global

### `src/modules`
Berisi fitur per domain bisnis.
Setiap modul biasanya punya struktur:
- `router/`
- `pages/`
- `components/`
- `rtk/`
- `hooks/`

### `src/plugins`
Berisi infrastruktur lintas modul:
- router aggregator
- axios client
- redux store
- helper umum

## Peta Modul

### Dashboard
Modul utama untuk monitoring SLA.
Mendukung:
- menu MSA
- menu CNOP
- rekonsiliasi
- one visibility
- monday monitoring
- grafik tren
- tabel detail parameter
- history data

Route:
- `/:menuId`
- `/dashboard/:menuId/:detailParameter`

### Site
Modul rekonsiliasi dan pelaporan site.
Route:
- `/input-site`
- `/report-site`
- `/report-support-needed`
- `/report-support-needed/detail/:breakdown/:issue/:monthnow/:parameter`

### Monday
Route:
- `/monday`

### One
Route:
- `/one`

### Executive
Route:
- `/executive`

### E-Library
Route:
- `/elibrary`

### Network
Route:
- `/network/:menuId`

### Ticket
Route:
- `/ticket`

### Dashboard TA
Route:
- `/dashboard-ta`

### User
Route:
- `/user`

### Approver
Route:
- `/approver`

### Profile
Route:
- `/profile`

### Access Prediction
Route:
- `/access-prediction`

### Resume RCA
Route:
- `/resume-rca`

## Perilaku Autentikasi
- Login menggunakan NIK/email dan password.
- Sistem mendukung alur OTP email dan 2FA authenticator.
- Setelah login sukses, user diarahkan ke halaman utama sesuai peran.
- `AppRouteGuard` dan `AuthRouteGuard` dipakai untuk memisahkan akses public vs protected route.

## Role dan Menu
Di layout default, menu yang muncul bergantung pada `level_user` dari data pengguna di `localStorage`.

Contoh yang terlihat di kode:
- level 1 sampai 4: executive summary, monday monitoring, SLA dropdown, one visibility, dll.
- level 5: one visibility
- level 6: executive summary dan one visibility

## Catatan Implementasi
- Banyak halaman dimuat secara lazy untuk mengurangi bundle awal.
- Data fetching banyak memakai RTK Query.
- UI utama memakai Ant Design dan utility class Tailwind.
- Beberapa halaman masih memiliki placeholder atau komentar kode yang menandakan fitur tambahan belum diaktifkan penuh.

## File Penting
- [`src/main.tsx`](src/main.tsx)
- [`src/plugins/router/index.tsx`](src/plugins/router/index.tsx)
- [`src/app/ui/AppEntryPoint/index.tsx`](src/app/ui/AppEntryPoint/index.tsx)
- [`src/app/layout/AppLayoutDefault/index.tsx`](src/app/layout/AppLayoutDefault/index.tsx)
- [`src/modules/dashboard/router/dashboard.router.tsx`](src/modules/dashboard/router/dashboard.router.tsx)
- [`src/modules/auth/router/auth.router.tsx`](src/modules/auth/router/auth.router.tsx)

## Kesimpulan
Frontend ini adalah portal monitoring SLA dan quality operations untuk Qosmo/Telkom dengan fokus pada:
- achievement dashboard
- rekonsiliasi data
- analisis ticket dan network
- approval management
- laporan operasional dan executive summary

