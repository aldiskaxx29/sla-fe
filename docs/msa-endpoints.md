# Endpoint API di Halaman `/msa`

Daftar ini berdasarkan kode frontend saat ini untuk halaman `http://localhost:5173/msa`.

## Endpoint utama saat halaman dibuka

| Method | Endpoint | Dipakai untuk | Lokasi kode |
| --- | --- | --- | --- |
| `GET` | `dashboard/monthly/nation` | Data utama MSA di tabel `TableParentChild` | `src/modules/dashboard/rtk/dashboard.rtk.ts` |
| `GET` | `dashboard/weekly/trend` | Data chart `TREND ACHIEVEMENT` | `src/modules/dashboard/rtk/dashboard.rtk.ts` |
| `GET` | `dashboard/history/weekly` | Data tabel `MONTHLY DATA SLA` | `src/modules/dashboard/rtk/dashboard.rtk.ts` |
| `GET` | `dashboard/parameter/comply` | Kartu ringkasan `ACHIEVEMENT PREDICTION` | `src/modules/dashboard/rtk/dashboard.rtk.ts` |

## Endpoint yang dipanggil saat interaksi di tabel MSA

| Method | Endpoint | Dipakai untuk | Lokasi kode |
| --- | --- | --- | --- |
| `GET` | `dashboard/region/monthly/msa/cnop` | Expand baris level parent di tabel MSA | `src/modules/dashboard/rtk/dashboard.rtk.ts` |
| `GET` | `dashboard/witel/monthly/detail` | Expand baris child di tabel MSA | `src/modules/dashboard/rtk/dashboard.rtk.ts` |
| `GET` | `dashboard/history/weekly/region` | Drill-down dari tabel `MONTHLY DATA SLA` untuk level region | `src/modules/dashboard/rtk/dashboard.rtk.ts` |
| `GET` | `dashboard/history/weekly/witel` | Drill-down dari tabel `MONTHLY DATA SLA` untuk level witel | `src/modules/dashboard/rtk/dashboard.rtk.ts` |

## Catatan penggunaan

- `dashboard/weekly/trend` dipanggil beberapa kali dengan parameter berbeda:
  - `packetloss ran to core`
  - `packetloss 1-5% ran to core`
  - `packetloss >5% ran to core`
  - `latency ran to core`
  - `jitter ran to core`
  - `packetloss core to internet`
  - `latency core to internet`
  - `jitter core to internet`
  - `mttrq ran to core major`
  - `mttrq ran to core minor`
- Tombol `Export as XLS` di halaman MSA tidak memanggil API. Proses export dilakukan full di frontend.
- Endpoint di atas dipanggil lewat RTK Query, jadi URL akhirnya mengikuti base URL API yang dikonfigurasi di aplikasi.
