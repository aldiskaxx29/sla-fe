# Narasi Fitur Menu Reconciliation / Input Site SLA

## Gambaran Umum
Menu `Reconciliation` atau `/input-site` pada sistem SLA berfungsi sebagai halaman input dan pengelolaan data rekonsiliasi site. Pada halaman ini, user dapat memilih parameter monitoring, menentukan periode minggu dan bulan, melihat data hasil rekonsiliasi, melakukan pencarian pada tabel, mengubah data melalui modal input, serta mengunduh template untuk kebutuhan pengisian.

Fitur ini digunakan untuk membantu proses validasi dan penyelarasan data operasional sebelum masuk ke laporan yang lebih lanjut. Karena melibatkan banyak filter, tabel dinamis, dan proses update data, halaman ini membutuhkan struktur frontend yang rapi dan terstandar.

## Masalah Pada Frontend

### 1. Logika yang Tumpang Tindih
Pada halaman reconciliation, logika tampilan, logika filter, logika request API, dan logika aksi pengguna sering saling bercampur. Kondisi ini menyebabkan:
- perubahan pada satu bagian tabel dapat memengaruhi proses input atau download
- validasi data menjadi sulit dilacak
- pengembangan fitur baru berisiko merusak alur yang sudah ada

Pada menu `/input-site`, risiko ini muncul karena halaman menangani banyak state sekaligus, seperti `week`, `month`, `year`, `parameter`, `exclude`, `prev`, pagination, serta proses fetching data yang bergantung pada kombinasi filter tersebut.

### 2. Tidak Ada Standar Penulisan Kode
Tanpa standar yang jelas, struktur file dan pola implementasi mudah menjadi tidak konsisten. Dampaknya:
- tiap komponen memiliki cara kerja sendiri
- debugging semakin lama karena developer harus memahami pola berbeda-beda
- maintenance menjadi berat ketika halaman berkembang

Untuk menu reconciliation, standar sangat penting agar penamaan parameter, struktur tabel, pola modal input, dan mekanisme download template tetap seragam.

### 3. Beban Muat Berat
Halaman `/input-site` memiliki cukup banyak elemen sekaligus:
- dropdown filter
- tabel data utama
- modal edit atau input
- proses download template
- pencarian dan pagination

Jika semua elemen dimuat tanpa pemisahan yang baik, halaman akan terasa berat saat dibuka. Pengguna perlu menunggu lebih lama sebelum dapat mulai mengerjakan rekonsiliasi data.

## Solusi Yang Diterapkan

### Solusi 1: Mengurangi Beban Muat Dengan Pemisahan dan Lazy Loading
Untuk mengatasi loading yang berat, halaman reconciliation sebaiknya dimuat sebagai modul terpisah dari menu lain dan hanya me-render bagian yang dibutuhkan sesuai state aktif. Pendekatan yang bisa diterapkan:
- memisahkan komponen tabel, modal, dan filter
- menunda pemuatan bagian yang tidak langsung dipakai
- menjaga data fetching tetap spesifik terhadap parameter yang dipilih user

Dengan cara ini, halaman lebih responsif dan tidak membuat user menunggu terlalu lama saat membuka fitur.

### Solusi 2: Membuat Aturan Baku dan Dokumen Panduan Sistem
Menu reconciliation perlu SOP penulisan kode agar semua developer mengikuti pola yang sama. Aturan ini dapat mencakup:
- struktur folder per fitur
- penamaan hook, komponen, dan endpoint
- pola state management untuk filter dan pagination
- format tabel dan modal input
- standar handling error dan notifikasi

Dokumen panduan yang terpusat akan membuat pengembangan `/input-site` lebih aman dan mudah dipelihara.

### Solusi 3: Membagi File Tampilan Menjadi Bagian Kecil
Frontend reconciliation lebih mudah dikelola jika file besar dipecah menjadi bagian kecil. Contoh pembagian yang tepat:
- halaman utama sebagai pengatur state dan alur data
- komponen filter dan dropdown
- komponen tabel rekonsiliasi
- komponen modal input dan edit
- hook untuk fetch, download, dan submit data

Dengan struktur seperti ini, setiap bagian fokus pada satu tugas sehingga perubahan di satu komponen tidak mudah merusak komponen lain.

## Penerapan Pada Menu Reconciliation / Input Site

Menu `/input-site` cocok dijadikan sample fitur karena memiliki kebutuhan yang kompleks namun masih satu alur bisnis:
- user memilih parameter monitoring
- sistem menyesuaikan minggu, bulan, dan tahun
- data hasil rekonsiliasi ditampilkan dalam tabel
- user bisa mencari data tertentu
- user bisa membuka modal untuk mengubah data
- user bisa mengunduh template rekonsiliasi

Karena banyak alur tersebut berjalan di satu halaman, penerapan prinsip modular sangat penting. Frontend yang baik pada menu ini harus:
- memisahkan logika data dari tampilan
- menjaga state filter tetap konsisten
- memastikan proses download dan update tidak saling mengganggu
- memudahkan pengembangan untuk parameter baru

## Hasil Yang Diharapkan

Setelah perbaikan diterapkan, menu `Reconciliation / Input Site` akan menjadi:
- lebih cepat dibuka
- lebih mudah dipahami oleh developer
- lebih stabil saat ada perubahan fitur
- lebih konsisten dalam struktur dan tampilan

Secara operasional, user bisa melakukan proses rekonsiliasi data dengan lebih lancar, tanpa terganggu oleh frontend yang berat atau kode yang sulit dirawat.

## Kesimpulan

Menu `Reconciliation / Input Site` adalah contoh fitur yang tepat untuk menunjukkan pentingnya frontend yang terstruktur. Dengan mengatasi logika yang tumpang tindih, menerapkan standar kode yang jelas, dan memecah file tampilan menjadi komponen kecil, sistem menjadi lebih ringan, mudah dikembangkan, dan lebih aman untuk operasional SLA.
