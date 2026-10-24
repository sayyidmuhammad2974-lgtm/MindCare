# MindCare Node.js Chat API

Backend Node.js tanpa dependensi untuk meneruskan pesan dari frontend ke NVIDIA Nemotron 3 Ultra 550B. API key dibaca hanya di server dari `backend/.env`; key tidak dikirim ke browser.

## Persyaratan dan menjalankan

- Node.js 20 atau lebih baru.
- API key NVIDIA dari [NVIDIA Build](https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b).

Dari root project, buat `.env` lokal (template tunggal berada di root), lalu mulai server:

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item .env.example backend/.env }
Set-Location backend
node server.mjs
```

Isi `NVIDIA_API_KEY` di `backend/.env`. API key sengaja kosong di `.env.example`. Tidak ada Composer, PHP, atau `npm install` yang diperlukan.

## Endpoint

- `GET /up` — health check.
- `POST /api/chat` — mengirim percakapan ke NVIDIA.

Contoh body:

```json
{
  "messages": [
    { "role": "user", "content": "Aku sedang cemas menghadapi ujian." }
  ]
}
```

Respons frontend menggunakan SSE agar teks jawaban dapat muncul bertahap. Server tidak meneruskan reasoning internal, menjaga penanda rujukan tetap tersembunyi, dan memeriksa pola keluaran kode sebelum melepas teks dari buffer pemeriksaan. Request tertunda HTTP 202 dipolling melalui request ID. Pemanggilan langsung tanpa header stream tetap mendapat respons JSON dengan `reply` dan `show_referral`. Server memvalidasi panjang percakapan, menerapkan rate limit 8 request per menit per alamat IP, dan menambahkan system prompt. API tidak menyimpan pesan; frontend menyimpan riwayat lokal di `localStorage`, bukan cookie. NVIDIA dapat memiliki kebijakan retensi tersendiri.

## Konfigurasi model

Semua pengaturan berada di `backend/.env`, berdasarkan template root `.env.example`. Model default `nvidia/nemotron-3-ultra-550b-a55b`. `NVIDIA_REASONING_EFFORT=none` menekan penalaran panjang untuk respons singkat; ubah ke `medium` jika diperlukan. Timeout default 120 detik. Dokumentasi NVIDIA tidak mencantumkan Bahasa Indonesia di daftar bahasa model, jadi kualitasnya perlu diuji.

## Deploy

Deploy sebagai aplikasi Node.js 20+ dengan start command `node server.mjs` atau `npm start`. Atur `HOST=0.0.0.0`, `PORT`, `FRONTEND_URL`, dan `NVIDIA_API_KEY` di environment/secrets platform hosting, bukan di file yang di-commit. Gunakan HTTPS dan ubah endpoint di `javascript/chat-api.js` ke URL backend publik. Set `TRUST_PROXY=true` hanya bila berada di belakang reverse proxy tepercaya yang membersihkan/menimpa `X-Forwarded-For`.

CORS hanya mengatur origin browser, bukan autentikasi. Rate limit bawaan hanya berlaku di satu proses. Untuk layanan publik multi-instance, pasang rate limit bersama di reverse proxy/API gateway atau Redis, serta pantau kuota dan biaya API.
