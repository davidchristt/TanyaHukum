# Dokumentasi Teknis — TanyaHukum

Platform AI Konsultasi Hukum Indonesia berbasis RAG (Retrieval-Augmented Generation).  
Pendekatan: **Prosedural/Struktural** · Stack: Next.js 16 · PostgreSQL · Pinecone · Gemini 2.5 Flash · Midtrans

---

## Daftar Isi

1. [Deployment Diagram](#1-deployment-diagram)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Context Diagram](#3-context-diagram)
4. [ERD](#4-erd)
5. [Use Case Diagram](#5-use-case-diagram)
6. [DFD (Data Flow Diagram)](#6-dfd-data-flow-diagram)
7. [Flowchart](#7-flowchart)
8. [Sequence Diagram](#8-sequence-diagram)

> **Total: 51 diagram** | Format tersedia: PNG & SVG di folder `output/`  
> Generate ulang: `node generate-diagrams.mjs`

---

## 1. Deployment Diagram

Menggambarkan infrastruktur dan lingkungan deployment sistem.

| Komponen | Teknologi |
|---|---|
| Hosting | Vercel (Next.js App Router) |
| Database | Supabase PostgreSQL + Storage |
| Vector DB | Pinecone |
| LLM | Google Gemini 2.5 Flash |
| Embedding | VoyageAI voyage-law-2 |
| Payment | Midtrans Snap + CoreAPI |
| Auth | Google OAuth 2.0 |
| Email | Gmail SMTP (Nodemailer) |

![DEPLOYMENT](output/deployment/DEPLOYMENT.png)

---

## 2. Arsitektur Sistem

Gambaran 4-layer arsitektur sistem: Client → API → Data → External Services.

![ARCH](output/diagrams/ARCH.png)

---

## 3. Context Diagram

Sistem sebagai kotak hitam — menampilkan semua entitas eksternal dan alur data masuk/keluar.

![CONTEXT](output/diagrams/CONTEXT.png)

---

## 4. ERD

Skema database berdasarkan Prisma schema. Terdiri dari 7 entitas utama.

| Entitas | Keterangan |
|---|---|
| User | Pengguna (FREE/PRO/ADMIN) |
| Chat | Sesi percakapan |
| ChatHistory | Pesan per sesi (role: USER/AI) |
| Transaction | Riwayat pembayaran |
| Regulation | Dokumen hukum |
| TrendingIssue | Isu hukum terkini |
| SearchLog | Log pencarian pengguna |

![ERD](output/diagrams/ERD.png)

---

## 5. Use Case Diagram

27 use case untuk 5 aktor: Guest, FREE User, PRO User, Admin, Sistem Eksternal.

![USECASE](output/diagrams/USECASE.png)

---

## 6. DFD (Data Flow Diagram)

8 diagram — Level 0 (Context), Level 1 (proses utama), Level 2 (detail per modul).

### DFD-00 — Context (Level 0)
![DFD-00](output/dfd/DFD-00-Context.png)

### DFD-01 — Proses Utama (Level 1)
![DFD-01](output/dfd/DFD-01-Level1.png)

### DFD-02 — Manajemen Autentikasi (Level 2)
![DFD-02](output/dfd/DFD-02-Auth.png)

### DFD-03 — Chatbot AI / RAG Pipeline (Level 2)
![DFD-03](output/dfd/DFD-03-ChatRAG.png)

### DFD-04 — Pusat Data Hukum (Level 2)
![DFD-04](output/dfd/DFD-04-Regulations.png)

### DFD-05 — Manajemen Pembayaran (Level 2)
![DFD-05](output/dfd/DFD-05-Payment.png)

### DFD-06 — Manajemen Profil (Level 2)
![DFD-06](output/dfd/DFD-06-Profile.png)

### DFD-07 — Admin Panel (Level 2)
![DFD-07](output/dfd/DFD-07-Admin.png)

---

## 7. Flowchart

15 diagram alur logika per fitur sistem.

### FC-00 — Overview Sistem
![FC-00](output/flowchart/FC-00-SystemOverview.png)

### FC-01 — Registrasi Email
![FC-01](output/flowchart/FC-01-Register.png)

### FC-02 — Login Email
![FC-02](output/flowchart/FC-02-Login.png)

### FC-03 — Login Google OAuth
![FC-03](output/flowchart/FC-03-GoogleOAuth.png)

### FC-04 — Lupa & Reset Password
![FC-04](output/flowchart/FC-04-ForgotResetPassword.png)

### FC-05 — Logout
![FC-05](output/flowchart/FC-05-Logout.png)

### FC-06 — Middleware Auth Guard
![FC-06](output/flowchart/FC-06-Middleware.png)

### FC-07 — Chat RAG Pipeline
![FC-07](output/flowchart/FC-07-ChatRAG.png)

### FC-08 — Manajemen Profil
![FC-08](output/flowchart/FC-08-Profile.png)

### FC-09 — Upload Avatar
![FC-09](output/flowchart/FC-09-UploadAvatar.png)

### FC-10 — Pusat Data Hukum
![FC-10](output/flowchart/FC-10-Regulations.png)

### FC-11 — Download PDF
![FC-11](output/flowchart/FC-11-Download.png)

### FC-12 — Payment Upgrade PRO
![FC-12](output/flowchart/FC-12-Payment.png)

### FC-13 — Dashboard
![FC-13](output/flowchart/FC-13-Dashboard.png)

### FC-14 — Admin Panel
![FC-14](output/flowchart/FC-14-Admin.png)

---

## 8. Sequence Diagram

23 diagram — mencakup seluruh 24 endpoint API sistem.

### SEQ-01 — Login Email
![SEQ-01](output/diagrams/SEQ-01-Login.png)

### SEQ-02 — Chat RAG Pipeline
![SEQ-02](output/diagrams/SEQ-02-ChatRAG.png)

### SEQ-03 — Login Google OAuth
![SEQ-03](output/diagrams/SEQ-03-GoogleOAuth.png)

### SEQ-04 — Payment Upgrade PRO + Webhook
![SEQ-04](output/diagrams/SEQ-04-Payment.png)

### SEQ-05 — Lupa & Reset Password
![SEQ-05](output/diagrams/SEQ-05-ResetPassword.png)

### SEQ-06 — Admin Upload Regulasi
![SEQ-06](output/diagrams/SEQ-06-AdminUpload.png)

### SEQ-07 — Registrasi Email
![SEQ-07](output/sequences/SEQ-07-Register.png)

### SEQ-08 — Logout
![SEQ-08](output/sequences/SEQ-08-Logout.png)

### SEQ-09 — Lihat Profil + Self-Healing PRO
![SEQ-09](output/sequences/SEQ-09-GetProfile.png)

### SEQ-10 — Update Profil
![SEQ-10](output/sequences/SEQ-10-UpdateProfile.png)

### SEQ-11 — Hapus Akun
![SEQ-11](output/sequences/SEQ-11-DeleteProfile.png)

### SEQ-12 — Upload Foto Avatar
![SEQ-12](output/sequences/SEQ-12-UploadAvatar.png)

### SEQ-13 — Ambil Riwayat Chat
![SEQ-13](output/sequences/SEQ-13-GetChat.png)

### SEQ-14 — Rename Judul Chat
![SEQ-14](output/sequences/SEQ-14-RenameChat.png)

### SEQ-15 — Hapus Chat
![SEQ-15](output/sequences/SEQ-15-DeleteChat.png)

### SEQ-16 — Cari & Filter Regulasi
![SEQ-16](output/sequences/SEQ-16-GetRegulations.png)

### SEQ-17 — Detail Regulasi + ViewCount
![SEQ-17](output/sequences/SEQ-17-RegulationDetail.png)

### SEQ-18 — Download PDF (Proxy + SSRF Guard)
![SEQ-18](output/sequences/SEQ-18-DownloadPDF.png)

### SEQ-19 — Dashboard + Cache 30s
![SEQ-19](output/sequences/SEQ-19-Dashboard.png)

### SEQ-20 — Admin Manajemen Pengguna
![SEQ-20](output/sequences/SEQ-20-AdminUsers.png)

### SEQ-21 — Admin Manajemen Regulasi
![SEQ-21](output/sequences/SEQ-21-AdminRegulations.png)

### SEQ-22 — Admin Manajemen Isu Terkini
![SEQ-22](output/sequences/SEQ-22-AdminTrending.png)

### SEQ-23 — Admin Dashboard Analitik
![SEQ-23](output/sequences/SEQ-23-AdminDashboard.png)

---

## Ringkasan Diagram

| Jenis | Jumlah | File Sumber |
|---|---|---|
| Deployment Diagram | 1 | `deployment.puml` |
| Arsitektur Sistem | 1 | `diagrams.puml` |
| Context Diagram | 1 | `diagrams.puml` |
| ERD | 1 | `diagrams.puml` |
| Use Case Diagram | 1 | `diagrams.puml` |
| DFD (Level 0, 1, 2) | 8 | `dfd.puml` |
| Flowchart | 15 | `flowchart.puml` |
| Sequence Diagram | 23 | `diagrams.puml` + `sequences.puml` |
| **Total** | **51** | |
