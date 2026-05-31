# Laporan Whitebox Testing — TanyaHukum

**Proyek:** TanyaHukum (AI Legal Assistant Platform)  
**Tanggal Pengujian:** 28 Mei 2026  
**Metode:** Inspeksi kode sumber, static analysis, branch coverage analysis  
**Pengujian dilakukan tanpa server berjalan** — semua handler diisolasi menggunakan mock Prisma dan mock external services (Pinecone, Gemini, Midtrans)  
**Branch:** `feat/frontend`

---

## Metodologi

Whitebox testing dilakukan dengan membaca langsung seluruh source code route handler, middleware, dan library autentikasi. Setiap percabangan logika (if/else, try/catch, validasi input) ditelusuri secara manual kemudian diverifikasi menggunakan unit test otomatis melalui Jest.

**Tools:**
- **Jest** — unit & integration test runner
- **loadRouteWithMocks** — isolasi Next.js route handler tanpa server
- **makeMockRequest** — simulasi HTTP request tanpa browser
- **jest.doMock** — mock Prisma, getSession(), external services

---

## 1. Analisis Coverage per Modul

| Modul | File Sumber | Estimasi Branch Coverage | File Test |
|---|---|---|---|
| `api/auth/login` | `app/api/auth/login/route.js` | ~85% | `unit/auth/login.test.js` |
| `api/auth/register` | `app/api/auth/register/route.js` | ~90% | `unit/auth/register.test.js` |
| `api/auth/forgot-password` | `app/api/auth/forgot-password/route.js` | ~80% | `unit/auth/forgot-password.test.js` |
| `api/auth/reset-password` | `app/api/auth/reset-password/route.js` | ~85% | `unit/auth/reset-password.test.js` |
| `api/auth/google` | `app/api/auth/google/route.js` | ~75% | `unit/auth/google.test.js` |
| `api/chat` | `app/api/chat/route.js` | ~80% | `unit/chat/chat.test.js` |
| `api/payment/checkout` | `app/api/payment/checkout/route.js` | ~85% | `unit/payment/checkout.test.js` |
| `api/payment/webhook` | `app/api/payment/webhook/route.js` | ~90% | `integration/payment-flow.test.js` |
| `api/regulations` | `app/api/regulations/route.js` | ~85% | `unit/regulations/regulations.test.js` |
| `api/regulations/download` | `app/api/regulations/download/route.js` | ~80% | `unit/regulations/download.test.js` |
| `api/profile` | `app/api/profile/route.js` | ~80% | `unit/profile/profile.test.js` |
| `middleware.js` | `middleware.js` | ~95% | `security/middleware-admin.test.js` |
| **Estimasi Keseluruhan** | | **~78%** | |

---

## 2. Hasil Pengujian Whitebox — Authentication

### 2.1 POST /api/auth/login

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-LOGIN-01 | `auth/login` | Request body bukan JSON (malformed) | Response 400, pesan "Request body tidak valid" | ✅ PASS |
| WB-LOGIN-02 | `auth/login` | Format email tidak valid (`not-an-email`) | Response 400, pesan mengandung kata "email" | ✅ PASS |
| WB-LOGIN-03 | `auth/login` | User tidak ditemukan di database | Response 401, pesan "Email atau password salah" (generik, anti-enumeration) | ✅ PASS |
| WB-LOGIN-04 | `auth/login` | Rate limit — lebih dari 5 percobaan dari IP sama dalam 1 menit | Response 429 | ✅ PASS |
| WB-LOGIN-05 | `auth/login` | Password salah — bcrypt compare gagal | Response 401 dengan waktu respons konstan (anti-timing attack) | ✅ PASS |
| WB-LOGIN-06 | `auth/login` | Login berhasil — credential valid | Response 200 + JWT cookie HttpOnly terset | ✅ PASS |

### 2.2 POST /api/auth/register

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-REG-01 | `auth/register` | Registrasi berhasil dengan email dan password valid | Response 201, user tersimpan di DB | ✅ PASS |
| WB-REG-02 | `auth/register` | Field email kosong | Response 400 | ✅ PASS |
| WB-REG-03 | `auth/register` | Field password kosong | Response 400 | ✅ PASS |
| WB-REG-04 | `auth/register` | Format email tidak valid | Response 400 | ✅ PASS |
| WB-REG-05 | `auth/register` | Password kurang dari 8 karakter | Response 400 | ✅ PASS |
| WB-REG-06 | `auth/register` | Email dengan huruf kapital (`USER@TEST.COM`) | Email dinormalisasi menjadi lowercase sebelum disimpan | ✅ PASS |
| WB-REG-07 | `auth/register` | Email sudah terdaftar (duplikasi) | Response 409 | ✅ PASS |
| WB-REG-08 | `auth/register` | Email sudah terdaftar via Google OAuth | Response 409 dengan hint "gunakan tombol Login with Google" | ✅ PASS |
| WB-REG-09 | `auth/register` | Race condition — Prisma P2002 unique constraint error | Response 409 (constraint ditangkap dengan benar) | ✅ PASS |
| WB-REG-10 | `auth/register` | SQL injection di field email (`' OR 1=1 --`) | Ditolak oleh validasi regex sebelum menyentuh DB | ✅ PASS |
| WB-REG-11 | `auth/register` | Rate limit — lebih dari 10 percobaan dari IP sama | Response 429 | ✅ PASS |

### 2.3 POST /api/auth/forgot-password

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-FP-01 | `auth/forgot-password` | Email terdaftar — kirim link reset | Response 200 dengan pesan generik | ✅ PASS |
| WB-FP-02 | `auth/forgot-password` | Email tidak terdaftar | Response 200 dengan pesan yang sama (anti user enumeration) | ✅ PASS |
| WB-FP-03 | `auth/forgot-password` | Field email tidak ada di body | Response 400 | ✅ PASS |
| WB-FP-04 | `auth/forgot-password` | Format email tidak valid | Response 400 | ✅ PASS |
| WB-FP-05 | `auth/forgot-password` | Rate limit — lebih dari 3 request dari IP sama dalam 15 menit | Response 429 | ✅ PASS |
| WB-FP-06 | `auth/forgot-password` | Token reset disimpan ke database | Token disimpan dalam bentuk SHA-256 hash (bukan plaintext) | ✅ PASS |

### 2.4 POST /api/auth/reset-password

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-RP-01 | `auth/reset-password` | Token valid dan password baru valid | Response 200, token dihapus dari DB (one-time use) | ✅ PASS |
| WB-RP-02 | `auth/reset-password` | Field token tidak ada | Response 400 | ✅ PASS |
| WB-RP-03 | `auth/reset-password` | Field newPassword tidak ada | Response 400 | ✅ PASS |
| WB-RP-04 | `auth/reset-password` | Password baru kurang dari 8 karakter | Response 400 | ✅ PASS |
| WB-RP-05 | `auth/reset-password` | Token tidak valid (tidak ada di DB) | Response 400 | ✅ PASS |
| WB-RP-06 | `auth/reset-password` | Token sudah kedaluwarsa | Expiry difilter langsung di query DB (`resetTokenExpiry: { gt: new Date() }`) | ✅ PASS |
| WB-RP-07 | `auth/reset-password` | Password baru disimpan ke DB | Password tersimpan dalam bentuk bcrypt hash (bukan plaintext) | ✅ PASS |

### 2.5 POST /api/auth/google

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-GAUTH-01 | `auth/google` | Login user yang sudah terdaftar via Google | Response 200 + cookie JWT terset | ✅ PASS |
| WB-GAUTH-02 | `auth/google` | Login user baru (auto-register) | User dibuat otomatis dengan default `tier: FREE`, `role: USER` | ✅ PASS |
| WB-GAUTH-03 | `auth/google` | `credentialToken` tidak ada di body | Response 400 | ✅ PASS |
| WB-GAUTH-04 | `auth/google` | Token Google palsu / tidak valid | Response 401 (verifikasi ke server Google gagal) | ✅ PASS |

---

## 3. Hasil Pengujian Whitebox — Chat AI (RAG)

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-CHAT-01 | `api/chat POST` | User PRO kirim pesan valid | AI menjawab, history tersimpan ke DB, response 200 | ✅ PASS |
| WB-CHAT-02 | `api/chat POST` | Pesan kosong (`message: ""`) | Response 400 | ✅ PASS |
| WB-CHAT-03 | `api/chat POST` | Tidak ada JWT session (tidak login) | Response 401 | ✅ PASS |
| WB-CHAT-04 | `api/chat POST` | userId dari session tidak ada di DB | Response 404 | ✅ PASS |
| WB-CHAT-05 | `api/chat POST` | User FREE — melebihi limit harian | Response 403 dengan flag `limitReached: true` | ✅ PASS |
| WB-CHAT-06 | `api/chat POST` | User PRO — tidak pernah kena limit | Tidak ada response 403, permintaan selalu diproses | ✅ PASS |
| WB-CHAT-07 | `api/chat POST` | `chatId` existing dikirim di body | Chat session lama digunakan, bukan dibuat baru | ✅ PASS |
| WB-CHAT-08 | `api/chat GET` | GET tanpa token JWT | Response 401 (IDOR sudah ditutup) | ✅ PASS |
| WB-CHAT-09 | `api/chat GET` | `userId` di query param tidak cocok dengan session | Response 401 | ✅ PASS |
| WB-CHAT-10 | `api/chat GET` | `userId` cocok dengan session, `type=list` | Daftar semua chat user dikembalikan | ✅ PASS |
| WB-CHAT-11 | `api/chat GET` | `chatId` valid milik user sendiri | Pesan dalam chat dikembalikan | ✅ PASS |
| WB-CHAT-12 | `api/chat PATCH` | Rename chat berhasil (pemilik sah) | Response 200, judul diperbarui | ✅ PASS |
| WB-CHAT-13 | `api/chat PATCH` | `chatId` atau `title` tidak ada | Response 400 | ✅ PASS |
| WB-CHAT-14 | `api/chat PATCH` | PATCH tanpa login | Response 401 (auth dipasang) | ✅ PASS |
| WB-CHAT-15 | `api/chat PATCH` | PATCH chat milik user lain | Response 403 (ownership check) | ✅ PASS |
| WB-CHAT-16 | `api/chat DELETE` | Hapus chat berhasil (pemilik sah) | Response 200, chat dihapus | ✅ PASS |
| WB-CHAT-17 | `api/chat DELETE` | `chatId` tidak ada di query param | Response 400 | ✅ PASS |
| WB-CHAT-18 | `api/chat DELETE` | DELETE tanpa login | Response 401 (auth dipasang) | ✅ PASS |
| WB-CHAT-19 | `api/chat DELETE` | DELETE chat milik user lain | Response 403 (ownership check) | ✅ PASS |

---

## 4. Hasil Pengujian Whitebox — Profile

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-PROF-01 | `api/profile GET` | GET profil dengan token valid | Data user dikembalikan, `passwordHash` tidak ikut terekspos | ✅ PASS |
| WB-PROF-02 | `api/profile GET` | GET tanpa token cookie | Response 401 | ✅ PASS |
| WB-PROF-03 | `api/profile GET` | User FREE memiliki transaksi PENDING | Self-healing: cek status ke Midtrans, upgrade ke PRO jika sudah settlement | ✅ PASS |
| WB-PROF-04 | `api/profile PATCH` | Update nama berhasil | Response 200, nama diperbarui | ✅ PASS |
| WB-PROF-05 | `api/profile PATCH` | Tidak ada field yang diubah | Response 400 "Tidak ada perubahan data" | ✅ PASS |
| WB-PROF-06 | `api/profile PATCH` | `avatarUrl` tidak diawali `http` | Response 400 (pencegahan XSS melalui URL) | ✅ PASS |
| WB-PROF-07 | `api/profile PATCH` | Ganti password tanpa `currentPassword` | Response 400 | ✅ PASS |
| WB-PROF-08 | `api/profile PATCH` | `currentPassword` salah | Response 401 | ✅ PASS |
| WB-PROF-09 | `api/profile PATCH` | Update `personalContext` | Tersimpan ke DB | ✅ PASS |
| WB-PROF-10 | `api/profile PATCH` | `personalContext` melebihi 500 karakter | Response 400 (batas panjang ditegakkan) | ✅ PASS |
| WB-PROF-11 | `api/profile PATCH` | `personalContext` tepat 500 karakter | Response 200, diterima | ✅ PASS |
| WB-PROF-12 | `api/profile DELETE` | Hapus akun berhasil | Akun dan semua data terhapus, cookie di-clear | ✅ PASS |
| WB-PROF-13 | `api/profile DELETE` | DELETE tanpa token | Response 401 | ✅ PASS |

---

## 5. Hasil Pengujian Whitebox — Regulations

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-REGS-01 | `api/regulations GET` | Request default tanpa parameter | Data paginasi dan meta dikembalikan | ✅ PASS |
| WB-REGS-02 | `api/regulations GET` | Search dengan keyword — query WHERE benar | Filter `OR (title ILIKE, description ILIKE)` diterapkan | ✅ PASS |
| WB-REGS-03 | `api/regulations GET` | Search tidak menemukan hasil | Array kosong dikembalikan (bukan error) | ✅ PASS |
| WB-REGS-04 | `api/regulations GET` | Filter `category` selain "Semua" | `where.category` diterapkan | ✅ PASS |
| WB-REGS-05 | `api/regulations GET` | Filter `category=Semua` | Filter kategori tidak diterapkan | ✅ PASS |
| WB-REGS-06 | `api/regulations GET` | Halaman ke-3 (`page=3`) | Nilai `skip` dihitung dengan benar: `(3-1) * limit` | ✅ PASS |
| WB-REGS-07 | `api/regulations GET` | Regulasi dengan `isActive=false` | Tidak ikut ditampilkan (selalu filter `isActive: true`) | ✅ PASS |
| WB-REGS-08 | `api/regulations GET` | Query pencarian ada (`search` tidak kosong) | Query dicatat ke `SearchLog` secara asinkron | ✅ PASS |
| WB-REGS-09 | `api/regulations GET` | Query pencarian kosong | `searchLog.create` tidak dipanggil | ✅ PASS |
| WB-REGS-10 | `api/regulations GET` | `page=abc` (NaN) | Fallback ke 1 (`Math.max(1, parseInt(...) \|\| 1)`) — tidak crash | ✅ PASS |
| WB-VIEW-01 | `api/regulations/[id] GET` | Buka detail dokumen | `viewCount` naik +1 secara fire-and-forget | ✅ PASS |
| WB-VIEW-02 | `api/regulations/[id] GET` | Update `viewCount` gagal di DB | Response tetap 200 (tidak mempengaruhi user) | ✅ PASS |
| WB-VIEW-03 | `api/regulations/[id] GET` | ID dokumen tidak ada | Response 404, `viewCount` tidak diincrement | ✅ PASS |
| WB-DL-01 | `api/regulations/download GET` | Download PDF dari URL Supabase valid | Buffer PDF dikembalikan dengan header `Content-Disposition: attachment` | ✅ PASS |
| WB-DL-02 | `api/regulations/download GET` | Parameter `url` tidak ada | Response 400 | ✅ PASS |
| WB-DL-03 | `api/regulations/download GET` | File tidak ditemukan di Supabase (404 upstream) | Response 404 diteruskan | ✅ PASS |
| WB-DL-04 | `api/regulations/download GET` | Network error saat fetch ke Supabase | Response 500 | ✅ PASS |
| WB-DL-05 | `api/regulations/download GET` | Filename mengandung path traversal (`../etc/passwd`) | Karakter berbahaya di-sanitasi | ✅ PASS |
| WB-DL-06 | `api/regulations/download GET` | URL bukan domain Supabase | Response 400 — SSRF diblokir oleh allowlist | ✅ PASS |

---

## 6. Hasil Pengujian Whitebox — Payment

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-PAY-01 | `api/payment/checkout POST` | Checkout berhasil | Response 200 dengan `token` dan `redirect_url` dari Midtrans | ✅ PASS |
| WB-PAY-02 | `api/payment/checkout POST` | Transaksi dibuat sebelum panggil Midtrans | Record dengan `status: PENDING` ada di DB lebih dulu | ✅ PASS |
| WB-PAY-03 | `api/payment/checkout POST` | `paymentUrl` disimpan setelah Midtrans response | DB diupdate dengan URL redirect Midtrans | ✅ PASS |
| WB-PAY-04 | `api/payment/checkout POST` | `userId` tidak ada di body | Response 401 | ✅ PASS |
| WB-PAY-05 | `api/payment/checkout POST` | User tidak ditemukan di DB | Response 404 | ✅ PASS |
| WB-PAY-06 | `api/payment/checkout POST` | Format `orderId` diperiksa | Format `TRX-{timestamp}-{userId[:5]}` — unik per transaksi | ✅ PASS |
| WB-PAY-07 | `api/payment/checkout POST` | User sudah berstatus PRO coba checkout lagi | Response 400 — double payment diblokir | ✅ PASS |
| WB-PAY-08 | `api/payment/checkout POST` | Midtrans tidak dapat dijangkau | Response 500 | ✅ PASS |
| WB-WH-01 | `api/payment/webhook POST` | Webhook `settlement` — upgrade user ke PRO | Transaksi jadi `SUCCESS`, user jadi `PRO` secara atomik | ✅ PASS |
| WB-WH-02 | `api/payment/webhook POST` | Idempotency — order sudah `SUCCESS` | Tidak diproses ulang, response 200 | ✅ PASS |
| WB-WH-03 | `api/payment/webhook POST` | Status `cancel`/`deny`/`expire` | Transaksi diset ke `FAILED` | ✅ PASS |
| WB-WH-04 | `api/payment/webhook POST` | `fraud_status=challenge` | Status tetap `PENDING` | ✅ PASS |
| WB-WH-05 | `api/payment/webhook POST` | `order_id` tidak ada di DB | Response 404 | ✅ PASS |
| WB-WH-06 | `api/payment/webhook POST` | Mode production — signature tidak valid | Response 403 | ✅ PASS |

---

## 7. Hasil Pengujian Whitebox — Integrasi Alur

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-INT-01 | `auth → profile` | Register → Login → akses profil (full cycle) | Semua tahap berhasil, profil dapat diakses | ✅ PASS |
| WB-INT-02 | `auth → profile` | Login dengan password salah setelah register | Response 401 | ✅ PASS |
| WB-INT-03 | `auth/login` | Rate limit memblokir percobaan ke-6 dari IP sama | Response 429 | ✅ PASS |
| WB-INT-04 | `auth/forgot-password → reset-password` | Forgot password → reset password (full cycle) | Password berhasil diganti, token dihapus | ✅ PASS |
| WB-INT-05 | `middleware → admin` | Token USER biasa mencoba akses `/api/admin/*` | Response 403 | ✅ PASS |
| WB-INT-06 | `middleware → admin` | Token ADMIN mengakses `/api/admin/*` | Response 200 | ✅ PASS |
| WB-INT-07 | `checkout → webhook → profile` | Checkout → Webhook settlement → user jadi PRO | Upgrade berhasil secara end-to-end | ✅ PASS |

---

## 8. Hasil Pengujian Whitebox — Keamanan (Static Analysis)

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-SEC-01 | `middleware.js` | `JWT_SECRET` tidak di-set di environment | Response 500 (fail-closed) — server tidak bisa diakses tanpa secret valid | ✅ PASS |
| WB-SEC-02 | `middleware.js` | Token JWT kedaluwarsa | Response 401 — token ditolak | ✅ PASS |
| WB-SEC-03 | `middleware.js` | Token ditandatangani dengan secret salah | Response 401 — verifikasi gagal | ✅ PASS |
| WB-SEC-04 | `middleware.js` | Request tanpa token ke `/api/admin/*` | Response 401 | ✅ PASS |
| WB-SEC-05 | `middleware.js` | Token role USER mencoba akses admin | Response 403 | ✅ PASS |
| WB-SEC-06 | `api/chat` | IDOR — GET history chat tanpa token | Response 401 (bug IDOR sudah ditutup) | ✅ PASS |
| WB-SEC-07 | `api/chat` | IDOR — POST chat tanpa token | Response 401 | ✅ PASS |
| WB-SEC-08 | `api/regulations/download` | SSRF — URL AWS metadata (`169.254.169.254`) | Response 400 — diblokir allowlist | ✅ PASS |
| WB-SEC-09 | `api/regulations/download` | SSRF — URL `localhost` internal | Response 400 — diblokir | ✅ PASS |
| WB-SEC-10 | `api/regulations/download` | SSRF — domain acak bukan Supabase | Response 400 — diblokir | ✅ PASS |
| WB-SEC-11 | `api/regulations/download` | URL valid Supabase | Berhasil didownload — allowlist benar | ✅ PASS |
| WB-SEC-12 | `api/dashboard` | Akses dashboard tanpa login | Response 401 (perbaikan dari bug publik tanpa auth) | ✅ PASS |
| WB-SEC-13 | `api/auth/login` | SQL injection di field email | Ditolak oleh regex validasi sebelum menyentuh DB | ✅ PASS |
| WB-SEC-14 | `api/auth/login` | SQL injection pola OR (`' OR '1'='1`) | Ditolak oleh regex validasi | ✅ PASS |
| WB-SEC-15 | `api/auth/register` | SQL injection di field email saat register | Ditolak oleh regex validasi | ✅ PASS |
| WB-SEC-16 | `api/chat POST` | XSS payload disimpan ke DB | Payload tersimpan — risiko Stored XSS (perlu sanitasi di output) | ⚠️ OPEN |
| WB-SEC-17 | `api/profile PATCH` | HTML di field `name` | Disimpan, tidak dirender di server-side (JSON response) — relatif aman | ⚠️ PARTIAL |
| WB-SEC-18 | `api/chat POST` | Pesan sangat panjang (oversize) | Server tidak crash | ✅ PASS |
| WB-SEC-19 | `api/regulations GET` | Karakter khusus di parameter `search` | Tidak crash, Prisma parameterized query aman | ✅ PASS |
| WB-SEC-20 | `api/auth/register` | Password mengandung emoji Unicode | Diterima tanpa crash | ✅ PASS |
| WB-SEC-21 | `api/payment/webhook POST` | Sandbox — signature tidak valid | Tetap diproses (by design untuk sandbox) | ⚠️ BY DESIGN |

---

## 9. Hasil Pengujian Whitebox — Error Handling

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-ERR-01 | `api/auth/login` | DB timeout saat `findUnique` | Response 500, detail error tidak terekspos ke client | ✅ PASS |
| WB-ERR-02 | `api/auth/register` | DB penuh saat `create` | Response 500, detail error tidak terekspos | ✅ PASS |
| WB-ERR-03 | `api/regulations GET` | DB error saat query | Response 500 dengan pesan umum | ✅ PASS |
| WB-ERR-04 | `api/payment/webhook POST` | DB gagal update transaksi | Response 500 | ✅ PASS |
| WB-ERR-05 | `api/chat POST` | Pinecone tidak dapat dijangkau | Response 500 | ✅ PASS |
| WB-ERR-06 | `api/chat POST` | Gemini API quota habis (HTTP 429) | Response 429 dengan pesan spesifik "Kuota AI hari ini telah habis" | ✅ PASS |
| WB-ERR-07 | `api/chat POST` | `chatId` dikirim tapi tidak ada di DB | Response 404 | ✅ PASS |
| WB-ERR-08 | `api/auth/login` | Body request bukan JSON | Response 400 | ✅ PASS |
| WB-ERR-09 | `api/regulations GET` | Parameter `page=abc` (NaN) | Fallback ke page 1 — tidak crash | ✅ PASS |
| WB-ERR-10 | `api/chat POST` | Body kosong (tidak ada field JSON) | Response 400 atau 401 — ditangani | ✅ PASS |
| WB-ERR-11 | `api/auth/forgot-password` | Field di body tidak ada | Response 400 | ✅ PASS |
| WB-ERR-12 | `api/payment/checkout POST` | Midtrans tidak dapat dijangkau | Response 500, `ECONNREFUSED` tidak terekspos ke client | ✅ PASS |

---

## 10. Temuan Logic Flaw dari Inspeksi Kode

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-LF-01 | `api/regulations GET` | `parseInt('abc')` menghasilkan NaN → `skip: NaN` dikirim ke Prisma | Fallback ke nilai valid menggunakan `Math.max(1, parseInt(...) \|\| 1)` | ✅ FIXED |
| WB-LF-02 | `api/payment/checkout POST` | User PRO bisa membuat transaksi berulang kali | Cek `user.tier === "PRO"` sebelum membuat transaksi → return 400 | ✅ FIXED |
| WB-LF-03 | `api/chat POST` | `userId` diambil dari request body, bukan dari JWT | `userId` diambil dari `session.userId` via `getSession()` | ✅ FIXED |
| WB-LF-04 | `api/logout POST` | Logout via Supabase tidak menghapus JWT cookie | Cookie `token` di-expire: `cookies.set('token', '', { expires: new Date(0) })` | ✅ FIXED |
| WB-LF-05 | `api/profile PATCH` | `personalContext` tidak ada validasi panjang maksimum | Batasan 500 karakter ditegakkan, return 400 jika melebihi | ✅ FIXED |
| WB-LF-06 | `api/regulations/[id] GET` | `viewCount` tidak pernah diincrement (fitur mati) | Fire-and-forget `viewCount: { increment: 1 }` dipasang di GET handler | ✅ FIXED |
| WB-LF-07 | `api/dashboard GET` | Dashboard dapat diakses tanpa login (data leakage) | `getSession()` dipasang, return 401 jika tidak ada session | ✅ FIXED |
| WB-LF-08 | `middleware.js` | Hardcoded fallback secret JWT (`fallback_secret_key_sementara`) | Jika `JWT_SECRET` tidak di-set → return 500 fail-closed | ✅ FIXED |

---

## 11. Temuan Anti-Pattern dari Inspeksi Arsitektur

| Kodifikasi Uji | Modul Uji | Skenario Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| WB-AP-01 | `middleware.js` vs `src/lib/auth-server.js` | Dua library JWT digunakan (`jose` dan `jsonwebtoken`) | Unifikasi ke satu library untuk menghindari gap verifikasi | ⚠️ OPEN |
| WB-AP-02 | `lib/rateLimit.js` | Rate limiter in-memory hilang saat server restart | Migrasi ke Redis untuk environment multi-pod | ⚠️ OPEN |
| WB-AP-03 | `middleware.js` | Security headers belum lengkap (`X-Frame-Options`, `CSP`, `HSTS` tidak ada) | Tambahkan header keamanan standar | ⚠️ OPEN |
| WB-AP-04 | `api/auth/login` vs `api/auth/register` vs `api/logout` | Dual auth system: login pakai JWT cookie, logout pakai Supabase session | Standarisasi ke satu mekanisme auth | ⚠️ OPEN |
| WB-AP-05 | `api/chat POST` | Tidak ada retry mechanism saat Gemini atau Pinecone gagal | Tambahkan retry 1-2x dengan exponential backoff | ⚠️ OPEN |

---

## 12. Rekapitulasi Hasil

| Kategori | Jumlah Test | PASS | FIXED | OPEN / PARTIAL | BY DESIGN |
|---|---|---|---|---|---|
| Authentication | 29 | 29 | — | — | — |
| Chat AI | 19 | 19 | — | — | — |
| Profile | 13 | 13 | — | — | — |
| Regulations | 19 | 19 | — | — | — |
| Payment | 14 | 14 | — | — | — |
| Integrasi | 7 | 7 | — | — | — |
| Keamanan | 21 | 18 | — | 2 | 1 |
| Error Handling | 12 | 12 | — | — | — |
| Logic Flaw | 8 | — | 8 | — | — |
| Anti-Pattern | 5 | — | — | 5 | — |
| **Total** | **147** | **131** | **8** | **7** | **1** |

### Keterangan Status

| Status | Arti |
|---|---|
| ✅ PASS | Test berhasil — behavior sesuai ekspektasi dari inspeksi kode |
| ✅ FIXED | Bug/celah ditemukan dari inspeksi kode dan sudah diperbaiki |
| ⚠️ OPEN | Temuan belum diperbaiki — diakui sebagai risiko yang diterima |
| ⚠️ PARTIAL | Mitigasi ada tapi tidak sempurna |
| ⚠️ BY DESIGN | Perilaku disengaja untuk kebutuhan tertentu (misal: sandbox bypass) |

---

*Laporan ini dibuat berdasarkan inspeksi langsung source code tanpa menjalankan server. Semua verifikasi dilakukan menggunakan unit test Jest dengan mock Prisma dan mock external services.*
