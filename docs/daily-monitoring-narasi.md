# Narasi Fitur Menu Daily Monitoring SLA

## Gambaran Umum
Menu `Daily Monitoring` pada sistem SLA berfungsi sebagai halaman pemantauan harian untuk melihat kondisi kualitas layanan secara cepat dan terstruktur. Pada menu ini, user dapat memantau ringkasan performa, melihat data `Packet Loss`, meninjau `MTTR Quality`, serta melakukan ekspor data untuk kebutuhan analisis dan pelaporan.

Secara konteks operasional, halaman ini menjadi titik pantau utama untuk memastikan status SLA tetap terjaga setiap hari. Karena digunakan untuk monitoring yang dibuka berulang oleh banyak user, struktur frontend pada menu ini harus ringan, konsisten, dan mudah dikembangkan.

## Masalah Pada Frontend

### 1. Logika yang Tumpang Tindih
Pada implementasi frontend yang tidak terstruktur, logika tampilan sering tercampur di banyak bagian. Kondisi ini membuat pengembangan fitur baru menjadi sulit karena:
- perubahan kecil pada satu komponen dapat memengaruhi tampilan lain secara tidak sengaja
- proses debug menjadi lebih lama karena alur data dan alur UI tidak dipisahkan dengan jelas
- kode menjadi sulit dipelihara ketika menu `Daily Monitoring` berkembang

Untuk menu `Daily Monitoring`, risiko ini muncul pada bagian tabel, ekspor data, pengaturan tampilan split, dan pengolahan data monitoring yang saling berkaitan.

### 2. Tidak Ada Standar Penulisan Kode
Jika tidak ada standar yang jelas, struktur file dan pola implementasi akan berbeda-beda antar developer. Dampaknya:
- komponen sulit dipahami karena tiap file punya pola sendiri
- perubahan fitur rawan menimbulkan inkonsistensi UI
- onboarding developer baru menjadi lebih lambat

Pada menu `Daily Monitoring`, standar dibutuhkan agar penamaan komponen, alur fetch data, format tabel, dan mekanisme ekspor tetap seragam.

### 3. Beban Muat Berat
Halaman `Daily Monitoring` berisi tabel data, proses pemetaan data, dan fitur ekspor. Jika seluruh bagian dimuat sekaligus tanpa pemisahan yang baik, maka:
- halaman terasa lebih lambat saat dibuka
- user harus menunggu lebih lama sebelum bisa melihat data
- pengalaman penggunaan menurun, terutama saat data yang dimuat besar atau kompleks

Masalah ini sangat berpengaruh karena halaman monitoring biasanya diakses untuk kebutuhan cepat dan berulang.

## Solusi Yang Diterapkan

### Solusi 1: Mengurangi Beban Muat Dengan Pemisahan dan Lazy Loading
Untuk mengatasi loading yang berat, halaman `Daily Monitoring` sebaiknya dimuat secara terpisah dari menu lain agar bundle awal tidak membengkak. Selain itu:
- komponen tabel dipisah menjadi bagian yang lebih kecil
- data summary dan packet loss diproses secara terpisah
- elemen yang tidak langsung dibutuhkan ditunda pemuatannya

Dengan pendekatan ini, user tidak perlu menunggu seluruh fitur besar termuat sekaligus saat membuka aplikasi.

### Solusi 2: Membuat Aturan Baku dan Dokumen Panduan Sistem
Agar pengembangan tetap konsisten, diperlukan SOP penulisan kode dan dokumen panduan sistem yang terpusat. Aturan ini mencakup:
- struktur folder per fitur
- penamaan komponen, hooks, dan types
- pola pengambilan data
- standar tampilan tabel dan state loading
- standar ekspor file dan handling error

Untuk menu `Daily Monitoring`, dokumen panduan membantu memastikan bahwa setiap perubahan tetap mengikuti pola yang sama dan tidak merusak modul lain.

### Solusi 3: Membagi File Tampilan Menjadi Bagian Kecil
Frontend `Daily Monitoring` lebih aman dan mudah dirawat jika file tampilan dipecah menjadi komponen kecil. Contoh pembagian yang relevan:
- halaman utama sebagai pengatur layout dan state
- komponen tabel `Packet Loss`
- komponen tabel `MTTR Quality`
- hook khusus untuk pengolahan data dan fetch API

Dengan memecah file menjadi bagian kecil, sistem hanya memuat dan merender bagian yang memang dibutuhkan. Hasilnya, struktur kode lebih bersih dan risiko gangguan antar fitur lebih rendah.

## Penerapan Pada Menu Daily Monitoring

Menu `Daily Monitoring` dapat dijadikan sample fitur karena memiliki karakteristik yang mewakili masalah frontend umum:
- menampilkan data monitoring SLA harian
- memiliki lebih dari satu blok informasi utama
- membutuhkan proses transformasi data sebelum ditampilkan
- memiliki aksi tambahan seperti download dan export image

Karena itu, menu ini cocok dijadikan contoh untuk memperbaiki arsitektur frontend dengan pendekatan berikut:
- memisahkan halaman utama dari komponen tabel
- memindahkan logika transformasi data ke hook atau helper
- menyiapkan standar UI untuk loading, error, dan empty state
- menahan pemuatan komponen yang tidak langsung dibutuhkan

## Hasil Yang Diharapkan

Setelah perbaikan dilakukan, menu `Daily Monitoring` akan menjadi:
- lebih cepat dibuka
- lebih mudah dipelihara
- lebih aman saat dikembangkan
- lebih konsisten dari sisi kode dan tampilan

Secara bisnis, hal ini membantu user operasional mendapatkan data SLA harian dengan lebih cepat dan stabil, tanpa terganggu oleh beban frontend yang berat atau struktur kode yang tidak teratur.

## Kesimpulan

Menu `Daily Monitoring` pada SLA adalah contoh fitur yang tepat untuk menunjukkan pentingnya arsitektur frontend yang rapi. Dengan mengatasi logika yang tumpang tindih, menerapkan standar kode yang jelas, dan memecah beban tampilan menjadi komponen yang lebih kecil, frontend menjadi lebih ringan, stabil, dan siap dikembangkan untuk kebutuhan monitoring berikutnya.
