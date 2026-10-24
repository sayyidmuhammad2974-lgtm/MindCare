# MindCare

Website statis MindCare untuk ruang refleksi pelajar, skrining mandiri, dan rujukan BK. File halaman ada di root; aset CSS, gambar, dan JavaScript dikelompokkan ke folder masing-masing.

## Chat AI

Chat menggunakan backend Node.js tanpa dependensi di [`backend/`](backend/README.md), yang meneruskan pesan ke NVIDIA Nemotron 3 Ultra. Untuk instruksi lengkap, lihat [`CHAT_API_SETUP.md`](CHAT_API_SETUP.md).

Hanya ada satu template environment: [`.env.example`](.env.example). Salin ke `backend/.env`, lalu isi `NVIDIA_API_KEY`. Jangan taruh API key di file browser atau commit file `.env`.
