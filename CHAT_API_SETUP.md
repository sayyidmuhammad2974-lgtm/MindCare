# Menyiapkan Chat API MindCare

Halaman `chat.html` mengirim pesan melalui `javascript/chat-api.js` ke backend Node.js di folder [`backend/`](backend/README.md). Backend meneruskan pesan ke NVIDIA Nemotron 3 Ultra 550B. API key hanya disimpan di `backend/.env` atau secret manager hosting; browser tidak menerima key tersebut.

## Menjalankan secara lokal

Persyaratan: Node.js 20 atau lebih baru. Backend memakai modul bawaan Node.js, jadi tidak perlu `npm install`.

Dari PowerShell di root project:

```powershell
if (-not (Test-Path backend/.env)) { Copy-Item .env.example backend/.env }
Set-Location backend
node server.mjs
```

Buka `backend/.env` dan isi `NVIDIA_API_KEY=` dengan key NVIDIA milikmu. Key sengaja kosong di template. Jangan masukkan key ke file JavaScript atau commit `backend/.env`.

Jalankan frontend dengan server lokal seperti VS Code Live Server di `http://127.0.0.1:5500`; jangan buka halaman memakai `file://`. Frontend mengirim request ke `http://127.0.0.1:8000/api/chat`.

Model default adalah `nvidia/nemotron-3-ultra-550b-a55b`. Backend meminta keluaran streaming dari NVIDIA dan meneruskannya ke chat sebagai SSE; reasoning internal tidak ditampilkan. `NVIDIA_REASONING_EFFORT=none` menghindari token penalaran panjang agar jawaban singkat lebih cepat; ubah ke `medium` bila diperlukan. Timeout NVIDIA default 120 detik. Backend juga memeriksa hasil tertunda (HTTP 202) menggunakan request ID sesuai API NVIDIA. Kartu model NVIDIA tidak mencantumkan Bahasa Indonesia di daftar bahasa yang didukung, jadi kualitas bahasa Indonesia perlu dievaluasi sebelum dipakai luas.

Health check tersedia di `http://127.0.0.1:8000/up`.

## Konfigurasi saat deploy

Deploy folder `backend` sebagai aplikasi Node.js dengan perintah start `node server.mjs` (atau `npm start`). Gunakan Node.js 20 atau lebih baru. Atur `HOST=0.0.0.0`, `PORT`, `FRONTEND_URL`, dan `NVIDIA_API_KEY` melalui environment/secrets hosting. Jangan mengunggah `.env`; gunakan HTTPS dan ubah `endpoint` di `javascript/chat-api.js` ke URL backend publik yang berakhir dengan `/api/chat`. Set `TRUST_PROXY=true` hanya bila hosting berada di belakang reverse proxy tepercaya yang membersihkan/menimpa `X-Forwarded-For`.

Backend membatasi request ke 8 per menit per alamat IP untuk proses server tunggal dan tidak menyimpan riwayat chat. Agar riwayat tersedia pada browser yang sama, frontend menyimpannya di `localStorage`; buka **Riwayat** untuk memuat atau menghapus percakapan. Data ini tidak dikirim otomatis seperti cookie, tetapi tetap dapat dibaca oleh JavaScript pada origin situs dan orang lain yang memakai profil browser yang sama. CORS membatasi origin browser, tetapi bukan autentikasi. Untuk beberapa instance, gunakan rate limit bersama di reverse proxy/API gateway atau Redis. Pantau kuota dan biaya NVIDIA. NVIDIA dapat memiliki kebijakan retensi datanya sendiri.

Chat dibatasi untuk refleksi emosi dan dukungan pelajar. Server menolak beberapa pola permintaan coding atau upaya mengubah/membocorkan instruksi, serta menahan jawaban yang tampak seperti kode. Prompt dan filter mengurangi risiko, tetapi tidak menjamin kebal jailbreak.

Chatbot diarahkan untuk mendengarkan dan memahami perasaan pengguna terlebih dahulu, tanpa mengakhiri setiap balasan dengan saran menghubungi BK. Tombol rujukan hanya muncul saat pengguna menunjukkan kesiapan/meminta bantuan untuk menghubungi orang tepercaya, atau saat ada petunjuk risiko keselamatan. Untuk indikasi berniat menyakiti diri sendiri atau orang lain, chatbot diminta merespons langsung dan mengutamakan keselamatan. Deteksi pola di server hanyalah lapisan tambahan dan tidak dapat memastikan keadaan seseorang; ini bukan pengganti pendampingan langsung atau layanan darurat.

Template environment hanya ada satu, di root: `.env.example`. Salin template itu ke `backend/.env`; file `.env` lokal diabaikan oleh Git.
