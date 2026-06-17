# ONX Reverse Proxy Patch

Target:
- Web utama tetap di `qosmo.telkom.co.id`
- Route `/onx` diarahkan ke aplikasi external `http://10.62.205.124:3001/onx`
- Route `/select-module` ikut diproxy karena flow external masih mengarah ke sana setelah login
- Tidak memakai iframe

## Tambahkan ke `VirtualHost *:80`

Sisipkan block berikut di atas rule `/api/` dan rule proxy lain yang serupa:

```apache
ProxyPreserveHost On

# ONX external app
ProxyPass /onx/ http://10.62.205.124:3001/onx/
ProxyPassReverse /onx/ http://10.62.205.124:3001/onx/
ProxyPass /onx http://10.62.205.124:3001/onx
ProxyPassReverse /onx http://10.62.205.124:3001/onx

# Flow after login
ProxyPass /select-module/ http://10.62.205.124:3001/select-module/
ProxyPassReverse /select-module/ http://10.62.205.124:3001/select-module/

# Jika cookie path perlu disesuaikan
ProxyPassReverseCookiePath / /onx/
```

## Tambahkan ke `VirtualHost *:443`

Sisipkan block berikut di atas rule `/api/` dan rule proxy lain yang serupa:

```apache
ProxyPreserveHost On

# ONX external app
ProxyPass /onx/ http://10.62.205.124:3001/onx/
ProxyPassReverse /onx/ http://10.62.205.124:3001/onx/
ProxyPass /onx http://10.62.205.124:3001/onx
ProxyPassReverse /onx http://10.62.205.124:3001/onx

# Flow after login
ProxyPass /select-module/ http://10.62.205.124:3001/select-module/
ProxyPassReverse /select-module/ http://10.62.205.124:3001/select-module/

# Jika cookie path perlu disesuaikan
ProxyPassReverseCookiePath / /onx/
```

## Kenapa perlu dua route

- `/onx` adalah halaman utama yang mau dibuka dari web ini
- `/select-module` diproxy karena app external setelah login memang pindah ke halaman itu
- Dengan proxy ini, browser melihatnya sebagai same-origin di `qosmo.telkom.co.id`, jadi login external lebih stabil dibanding iframe

## Catatan

- Letakkan rule `/onx` dan `/select-module` sebelum rule lain yang bisa menangkap path serupa.
- Kalau app external nanti menambah route lain setelah login, route itu juga perlu diproxy.
- Tidak perlu ubah backend aplikasi utama.

