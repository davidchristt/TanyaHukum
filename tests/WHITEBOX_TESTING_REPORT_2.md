# Laporan Whitebox Testing v2 — TanyaHukum

**Proyek:** TanyaHukum (AI Legal Assistant Platform)  
**Tanggal Pengujian:** 28 Mei 2026  
**Branch:** `feat/frontend`  
**Metode:** Inspeksi kode sumber, analisis jalur basis, pengukuran kompleksitas siklomatik, verifikasi branch coverage

---

## Metode Pengujian

### Apa itu Whitebox Testing?

Whitebox testing (juga disebut *glass-box* atau *structural testing*) adalah metode pengujian yang dilakukan dengan **melihat langsung struktur kode program**. Berbeda dengan blackbox yang hanya melihat input dan output, whitebox memeriksa **alur logika, percabangan (branch), dan jalur eksekusi** di dalam kode.

### Teknik yang Digunakan

#### 1. Basis Path Testing
Metode yang dikembangkan oleh Tom McCabe. Setiap jalur independen dalam kode diidentifikasi dan diuji minimal satu kali. Jumlah jalur minimum = nilai kompleksitas siklomatik.

#### 2. Kompleksitas Siklomatik (Cyclomatic Complexity)
Mengukur jumlah jalur independen dalam sebuah fungsi menggunakan rumus:

```
CC = E - N + 2P
```

Keterangan:
- `E` = jumlah edge (panah) dalam control flow graph
- `N` = jumlah node (titik keputusan)
- `P` = jumlah komponen yang terhubung (biasanya 1)

Atau cara lebih mudah:

```
CC = jumlah titik keputusan (if, else if, catch, &&, ||) + 1
```

Pedoman nilai CC:
| CC | Interpretasi |
|---|---|
| 1–4 | Kode sederhana, mudah diuji |
| 5–10 | Moderat, masih dapat dikelola |
| 11–20 | Kompleks, perlu perhatian |
| > 20 | Sangat kompleks, risiko tinggi |

#### 3. Branch Coverage
Memastikan setiap percabangan `if/else` dieksekusi setidaknya satu kali — baik jalur `true` maupun `false`.

```
Branch Coverage = (Jumlah branch yang diuji / Total branch) × 100%
```

---

## 1. Analisis Modul: `POST /api/auth/login`

### 1.1 Source Code yang Dianalisis

**File:** `app/api/auth/login/route.js`

```javascript
// Fungsi helper — dianalisis terpisah
function validateInput(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') { // B1
    return 'Input tidak valid';
  }
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {           // B2
    return 'Format email tidak valid';
  }
  if (!password || password.length < 8) {                          // B3
    return 'Password minimal 8 karakter';
  }
  return null; // valid
}

export async function POST(request) {
  try {
    if (!rateLimit(ip, 5)) {                    // B4 — rate limit
      return 429;
    }
    try {
      body = await request.json();
    } catch {                                   // B5 — parse JSON gagal
      return 400;
    }
    const validationError = validateInput(...);
    if (validationError) {                      // B6 — validasi gagal
      return 400;
    }
    const user = await prisma.user.findUnique(...);
    const isPasswordValid = await bcrypt.compare(...);
    if (!user || !isPasswordValid) {            // B7 — user/password salah
      return 401;
    }
    // buat token, set cookie
    return 200;
  } catch (error) {                             // B8 — error tak terduga
    return 500;
  }
}
```

### 1.2 Control Flow Graph

```
[START]
   │
   ▼
[B4: Rate limit?] ──YES──► [Return 429] ──► [END]
   │ NO
   ▼
[B5: JSON parse gagal?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[B6: validateInput gagal?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼  (di dalam validateInput)
   ├─[B1: tipe bukan string?] ──YES──► [Return error]
   ├─[B2: email kosong/regex gagal?] ──YES──► [Return error]
   └─[B3: password < 8?] ──YES──► [Return error]
   │ (semua NO = valid)
   ▼
[DB: findUnique + bcrypt.compare]
   │
   ▼
[B7: !user || !isPasswordValid?] ──YES──► [Return 401] ──► [END]
   │ NO
   ▼
[Buat JWT + Set Cookie]
   │
   ▼
[Return 200] ──► [END]

[CATCH B8] ──► [Return 500] ──► [END]
```

### 1.3 Kompleksitas Siklomatik

| Titik Keputusan | Deskripsi |
|---|---|
| B1 | `typeof email !== 'string' \|\| typeof password !== 'string'` |
| B2 | `!trimmedEmail \|\| !emailRegex.test(trimmedEmail)` |
| B3 | `!password \|\| password.length < 8` |
| B4 | `!rateLimit(ip, 5)` |
| B5 | `catch` — JSON parse gagal |
| B6 | `if (validationError)` |
| B7 | `!user \|\| !isPasswordValid` |
| B8 | `catch` — error tak terduga |

**CC = 8 titik keputusan + 1 = 9** → Moderat, dapat dikelola

### 1.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B4=YES → Return 429 | HTTP 429, pesan rate limit | ✅ Tercover |
| P2 | B4=NO → B5=YES → Return 400 | HTTP 400, body tidak valid | ✅ Tercover |
| P3 | B4=NO → B5=NO → B1=YES → B6=YES → Return 400 | HTTP 400, input bukan string | ✅ Tercover |
| P4 | B4=NO → B5=NO → B2=YES → B6=YES → Return 400 | HTTP 400, format email salah | ✅ Tercover |
| P5 | B4=NO → B5=NO → B3=YES → B6=YES → Return 400 | HTTP 400, password < 8 char | ✅ Tercover |
| P6 | B4=NO → B5=NO → B6=NO → B7=YES → Return 401 | HTTP 401, email/password salah | ✅ Tercover |
| P7 | B4=NO → B5=NO → B6=NO → B7=NO → Return 200 | HTTP 200 + cookie JWT | ✅ Tercover |
| P8 | B8=YES (exception) → Return 500 | HTTP 500, pesan umum | ✅ Tercover |

### 1.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1 TRUE | Email/password bukan string | ✅ Ya |
| B1 FALSE | Email/password bertipe string | ✅ Ya |
| B2 TRUE | Email kosong atau format salah | ✅ Ya |
| B2 FALSE | Email valid | ✅ Ya |
| B3 TRUE | Password < 8 karakter | ✅ Ya |
| B3 FALSE | Password ≥ 8 karakter | ✅ Ya |
| B4 TRUE | IP melebihi rate limit | ✅ Ya |
| B4 FALSE | IP belum melebihi limit | ✅ Ya |
| B5 TRUE | JSON parse error | ✅ Ya |
| B5 FALSE | JSON valid | ✅ Ya |
| B6 TRUE | Ada error validasi | ✅ Ya |
| B6 FALSE | Validasi lolos | ✅ Ya |
| B7 TRUE | User tidak ada atau password salah | ✅ Ya |
| B7 FALSE | Credential valid | ✅ Ya |
| B8 TRUE | Exception tak terduga | ✅ Ya |

**Branch Coverage: 15/15 = 100%**

---

## 2. Analisis Modul: `POST /api/auth/register`

### 2.1 Source Code yang Dianalisis

**File:** `app/api/auth/register/route.js`

```javascript
export async function POST(request) {
  try {
    if (!rateLimit(ip, 10)) {              // B1 — rate limit
      return 429;
    }
    const email = body.email?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!email || !password) {             // B2 — field kosong
      return 400;
    }
    if (!emailRegex.test(email)) {         // B3 — format email
      return 400;
    }
    if (password.length < 8) {             // B4 — panjang password
      return 400;
    }
    const existingUser = await prisma.user.findUnique(...);
    if (existingUser) {                    // B5 — email sudah ada
      if (existingUser.authProvider === 'GOOGLE') { // B6 — via Google
        return 409; // hint Google
      }
      return 409; // hint biasa
    }
    await bcrypt.hash(password, 10);
    await prisma.user.create(...);
    return 201;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2002') {       // B7 — race condition P2002
      return 409;
    }
    return 500;                            // B8 — error lain
  }
}
```

### 2.2 Control Flow Graph

```
[START]
   │
   ▼
[B1: Rate limit?] ──YES──► [Return 429] ──► [END]
   │ NO
   ▼
[B2: email/password kosong?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[B3: format email salah?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[B4: password < 8?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[DB: findUnique]
   │
   ▼
[B5: email sudah ada?] ──YES──► [B6: via Google?] ──YES──► [Return 409 + hint Google] ──► [END]
   │ NO                                              │ NO
   │                                                 └──► [Return 409] ──► [END]
   ▼
[Hash password + create user]
   │
   ▼
[Return 201] ──► [END]

[CATCH]
   ├─[B7: P2002?] ──YES──► [Return 409] ──► [END]
   └─ NO ──► [Return 500] ──► [END]
```

### 2.3 Kompleksitas Siklomatik

**CC = 8 titik keputusan + 1 = 9** → Moderat

### 2.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B1=YES | HTTP 429 | ✅ Tercover |
| P2 | B1=NO → B2=YES | HTTP 400, field wajib | ✅ Tercover |
| P3 | B1=NO → B2=NO → B3=YES | HTTP 400, format email | ✅ Tercover |
| P4 | B1=NO → B2=NO → B3=NO → B4=YES | HTTP 400, password pendek | ✅ Tercover |
| P5 | B1=NO → … → B5=YES → B6=YES | HTTP 409, hint Google | ✅ Tercover |
| P6 | B1=NO → … → B5=YES → B6=NO | HTTP 409, email duplikat | ✅ Tercover |
| P7 | B1=NO → … → B5=NO → Return 201 | HTTP 201, registrasi berhasil | ✅ Tercover |
| P8 | CATCH B7=YES | HTTP 409, P2002 race condition | ✅ Tercover |
| P9 | CATCH B7=NO | HTTP 500 | ✅ Tercover |

### 2.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1 TRUE/FALSE | Rate limit tercapai / belum | ✅ Ya |
| B2 TRUE/FALSE | Field kosong / terisi | ✅ Ya |
| B3 TRUE/FALSE | Format email salah / benar | ✅ Ya |
| B4 TRUE/FALSE | Password < 8 / ≥ 8 | ✅ Ya |
| B5 TRUE/FALSE | Email sudah ada / belum | ✅ Ya |
| B6 TRUE/FALSE | AuthProvider Google / bukan | ✅ Ya |
| B7 TRUE/FALSE | Error P2002 / bukan P2002 | ✅ Ya |

**Branch Coverage: 14/14 = 100%**

---

## 3. Analisis Modul: `POST /api/chat`

### 3.1 Source Code yang Dianalisis

**File:** `app/api/chat/route.js`

```javascript
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {                              // B1 — tidak login
      return 401;
    }
    const { message } = body;
    if (!message) {                              // B2 — pesan kosong
      return 400;
    }
    const user = await prisma.user.findUnique(...);
    if (!user) {                                 // B3 — user tidak ada
      return 404;
    }
    if (user.tier === "FREE"
        && chatsTodayCount >= user.promptLimit) { // B4 — limit habis
      return 403;
    }
    // Embed → Pinecone → Gemini
    const userCustomInstructions = user.personalContext
      ? `...${user.personalContext}...`           // B5 — ada personalContext
      : "";
    try {
      response = await llm.invoke([...]);
    } catch (llmError) {
      if (llmError?.status === 429) {             // B6 — quota AI habis
        return 429;
      }
      throw llmError;                             // B7 — error AI lain
    }
    const chatSession = chatId
      ? await prisma.chat.findUnique(...)          // B8 — pakai chat lama
      : await prisma.chat.create(...);             // B8 — buat chat baru
    if (!chatSession) {                            // B9 — chat tidak ditemukan
      return 404;
    }
    return 200;
  } catch (error) {                               // B10 — error tak terduga
    return 500;
  }
}
```

### 3.2 Control Flow Graph

```
[START]
   │
   ▼
[B1: session ada?] ──NO──► [Return 401] ──► [END]
   │ YES
   ▼
[B2: message kosong?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[DB: findUnique user]
   │
   ▼
[B3: user ada?] ──NO──► [Return 404] ──► [END]
   │ YES
   ▼
[B4: FREE & limit habis?] ──YES──► [Return 403] ──► [END]
   │ NO
   ▼
[B5: personalContext ada?] ──YES──► [tambah ke prompt]
   │ NO                     ──NO──► [prompt kosong]
   ▼
[Embed → Pinecone → LLM]
   │
   ▼
[B6: LLM error 429?] ──YES──► [Return 429] ──► [END]
   │ NO
[B7: LLM error lain?] ──YES──► [throw → B10]
   │ NO
   ▼
[B8: chatId ada?] ──YES──► [findUnique chat lama]
   │ NO            ──NO──► [create chat baru]
   ▼
[B9: chatSession ada?] ──NO──► [Return 404] ──► [END]
   │ YES
   ▼
[Simpan history, Return 200] ──► [END]

[CATCH B10] ──► [Return 500] ──► [END]
```

### 3.3 Kompleksitas Siklomatik

**CC = 10 titik keputusan + 1 = 11** → Kompleks, perlu perhatian

### 3.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B1=NO | HTTP 401 | ✅ Tercover |
| P2 | B1=YES → B2=YES | HTTP 400 | ✅ Tercover |
| P3 | B1=YES → B2=NO → B3=NO | HTTP 404 | ✅ Tercover |
| P4 | B1=YES → B2=NO → B3=YES → B4=YES | HTTP 403 + `limitReached: true` | ✅ Tercover |
| P5 | … → B4=NO → B5=YES → LLM sukses → B8=NO → B9=YES → 200 | HTTP 200 dengan personalContext | ✅ Tercover |
| P6 | … → B4=NO → B5=NO → LLM sukses → B8=YES → B9=YES → 200 | HTTP 200 pakai chat lama | ✅ Tercover |
| P7 | … → B6=YES | HTTP 429 quota AI habis | ✅ Tercover |
| P8 | … → B9=NO | HTTP 404 chat tidak ditemukan | ✅ Tercover |
| P9 | B10 (exception) | HTTP 500 | ✅ Tercover |

### 3.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1: session | Ada / tidak ada | ✅ Ya |
| B2: message | Kosong / tidak kosong | ✅ Ya |
| B3: user | Ada / tidak ada di DB | ✅ Ya |
| B4: limit | FREE & habis / tidak | ✅ Ya |
| B5: personalContext | Ada / tidak ada | ✅ Ya |
| B6: LLM 429 | Quota habis / tidak | ✅ Ya |
| B7: LLM error lain | Ada error / tidak | ✅ Ya |
| B8: chatId | Ada / tidak ada | ✅ Ya |
| B9: chatSession | Ditemukan / tidak | ✅ Ya |
| B10: catch | Exception / tidak | ✅ Ya |

**Branch Coverage: 20/20 = 100%**

---

## 4. Analisis Modul: `POST /api/payment/checkout`

### 4.1 Source Code yang Dianalisis

**File:** `app/api/payment/checkout/route.js`

```javascript
export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) {                          // B1 — userId tidak ada
      return 401;
    }
    const user = await prisma.user.findUnique(...);
    if (!user) {                            // B2 — user tidak ditemukan
      return 404;
    }
    if (user.tier === "PRO") {             // B3 — sudah PRO
      return 400;
    }
    await prisma.transaction.create(...);  // buat PENDING
    const transaction = await snap.createTransaction(...);
    await prisma.transaction.update(...);  // simpan paymentUrl
    return 200; // token + redirect_url
  } catch (error) {                        // B4 — Midtrans/DB gagal
    return 500;
  }
}
```

### 4.2 Control Flow Graph

```
[START]
   │
   ▼
[B1: userId ada?] ──NO──► [Return 401] ──► [END]
   │ YES
   ▼
[DB: findUnique]
   │
   ▼
[B2: user ada?] ──NO──► [Return 404] ──► [END]
   │ YES
   ▼
[B3: tier PRO?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[DB: create PENDING transaction]
   │
   ▼
[Midtrans: createTransaction]
   │
   ▼
[DB: update paymentUrl]
   │
   ▼
[Return 200] ──► [END]

[CATCH B4] ──► [Return 500] ──► [END]
```

### 4.3 Kompleksitas Siklomatik

**CC = 4 titik keputusan + 1 = 5** → Sederhana

### 4.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B1=NO | HTTP 401 | ✅ Tercover |
| P2 | B1=YES → B2=NO | HTTP 404 | ✅ Tercover |
| P3 | B1=YES → B2=YES → B3=YES | HTTP 400, sudah PRO | ✅ Tercover |
| P4 | B1=YES → B2=YES → B3=NO → sukses | HTTP 200 + token Midtrans | ✅ Tercover |
| P5 | CATCH B4 | HTTP 500, Midtrans/DB gagal | ✅ Tercover |

### 4.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1 TRUE/FALSE | userId ada / tidak | ✅ Ya |
| B2 TRUE/FALSE | User ditemukan / tidak | ✅ Ya |
| B3 TRUE/FALSE | Tier PRO / bukan PRO | ✅ Ya |
| B4 TRUE/FALSE | Exception / tidak | ✅ Ya |

**Branch Coverage: 8/8 = 100%**

---

## 5. Analisis Modul: `middleware.js`

### 5.1 Source Code yang Dianalisis

**File:** `middleware.js`

```javascript
export async function middleware(request) {
  const token = request.cookies.get('token')?.value;

  if (request.nextUrl.pathname.startsWith('/api/admin')) { // B1 — path admin?
    if (!token) {                                           // B2 — token ada?
      return 401;
    }
    try {
      if (!process.env.JWT_SECRET) {                       // B3 — secret ada?
        return 500;
      }
      const { payload } = await jwtVerify(token, secret);
      if (payload.role !== 'ADMIN') {                      // B4 — role ADMIN?
        return 403;
      }
    } catch (error) {                                      // B5 — token invalid
      return 401;
    }
  }
  return NextResponse.next(); // lanjutkan request
}
```

### 5.2 Control Flow Graph

```
[START]
   │
   ▼
[B1: path /api/admin?] ──NO──► [NextResponse.next()] ──► [END]
   │ YES
   ▼
[B2: token ada?] ──NO──► [Return 401] ──► [END]
   │ YES
   ▼
[B3: JWT_SECRET ada?] ──NO──► [Return 500] ──► [END]
   │ YES
   ▼
[jwtVerify(token)]
   │
   ▼
[B4: role === ADMIN?] ──NO──► [Return 403] ──► [END]
   │ YES
   ▼
[NextResponse.next()] ──► [END]

[CATCH B5: token invalid/expired] ──► [Return 401] ──► [END]
```

### 5.3 Kompleksitas Siklomatik

**CC = 5 titik keputusan + 1 = 6** → Sederhana

### 5.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B1=NO (bukan path admin) | Request diteruskan | ✅ Tercover |
| P2 | B1=YES → B2=NO (tanpa token) | HTTP 401 | ✅ Tercover |
| P3 | B1=YES → B2=YES → B3=NO (JWT_SECRET tidak ada) | HTTP 500 fail-closed | ✅ Tercover |
| P4 | B1=YES → B2=YES → B3=YES → B4=NO (role bukan ADMIN) | HTTP 403 | ✅ Tercover |
| P5 | B1=YES → B2=YES → B3=YES → B4=YES (role ADMIN) | Request diteruskan | ✅ Tercover |
| P6 | CATCH B5 (token expired/palsu) | HTTP 401 | ✅ Tercover |

### 5.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1 TRUE/FALSE | Path admin / bukan admin | ✅ Ya |
| B2 TRUE/FALSE | Token ada / tidak ada | ✅ Ya |
| B3 TRUE/FALSE | JWT_SECRET ada / tidak | ✅ Ya |
| B4 TRUE/FALSE | Role ADMIN / bukan ADMIN | ✅ Ya |
| B5 TRUE/FALSE | Token invalid / valid | ✅ Ya |

**Branch Coverage: 10/10 = 100%**

---

## 6. Analisis Modul: `GET /api/regulations/download`

### 6.1 Source Code yang Dianalisis

**File:** `app/api/regulations/download/route.js`

```javascript
export async function GET(req) {
  try {
    const fileUrl = searchParams.get("url");
    const fileName = searchParams.get("name") || "document.pdf"; // B1

    if (!fileUrl) {                              // B2 — url tidak ada
      return 400;
    }
    try {
      const parsed = new URL(fileUrl);
      const h = parsed.hostname;
      if (h !== 'supabase.co'
          && !h.endsWith('.supabase.co')) {     // B3 — domain bukan Supabase
        return 400; // SSRF diblokir
      }
    } catch {                                   // B4 — URL tidak valid
      return 400;
    }
    const upstream = await fetch(fileUrl, ...);
    if (!upstream.ok) {                         // B5 — file tidak ada
      return upstream.status;
    }
    const safeFileName = fileName.replace(...); // sanitasi nama file
    return 200; // buffer PDF
  } catch (err) {                               // B6 — network error
    return 500;
  }
}
```

### 6.2 Control Flow Graph

```
[START]
   │
   ▼
[B1: fileName ada?] ──NO──► [pakai "document.pdf"]
   │ YES
   ▼
[B2: fileUrl ada?] ──NO──► [Return 400] ──► [END]
   │ YES
   ▼
[B3: domain bukan *.supabase.co?] ──YES──► [Return 400 SSRF] ──► [END]
   │ NO
[B4: URL tidak bisa di-parse?] ──YES──► [Return 400] ──► [END]
   │ NO
   ▼
[fetch(fileUrl)]
   │
   ▼
[B5: upstream tidak OK?] ──YES──► [Return status upstream] ──► [END]
   │ NO
   ▼
[Sanitasi fileName → Return 200 buffer] ──► [END]

[CATCH B6: network error] ──► [Return 500] ──► [END]
```

### 6.3 Kompleksitas Siklomatik

**CC = 6 titik keputusan + 1 = 7** → Sederhana

### 6.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B2=NO (url tidak ada) | HTTP 400 | ✅ Tercover |
| P2 | B2=YES → B4=YES (URL tidak valid) | HTTP 400 | ✅ Tercover |
| P3 | B2=YES → B4=NO → B3=YES (domain bukan Supabase) | HTTP 400, SSRF diblokir | ✅ Tercover |
| P4 | B2=YES → B3=NO → B5=YES (file tidak ada) | HTTP 404 dari upstream | ✅ Tercover |
| P5 | B2=YES → B3=NO → B5=NO → sukses | HTTP 200 + buffer PDF | ✅ Tercover |
| P6 | CATCH B6 (network error) | HTTP 500 | ✅ Tercover |

### 6.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1 TRUE/FALSE | fileName ada / tidak (default) | ✅ Ya |
| B2 TRUE/FALSE | fileUrl ada / tidak | ✅ Ya |
| B3 TRUE/FALSE | Domain Supabase / bukan | ✅ Ya |
| B4 TRUE/FALSE | URL valid / tidak | ✅ Ya |
| B5 TRUE/FALSE | File ada / tidak di storage | ✅ Ya |
| B6 TRUE/FALSE | Network error / tidak | ✅ Ya |

**Branch Coverage: 12/12 = 100%**

---

## 7. Analisis Modul: `GET /api/profile`

### 7.1 Source Code yang Dianalisis

**File:** `app/api/profile/route.js`

```javascript
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {                              // B1 — tidak ada token
      return 401;
    }
    const payload = await verifyToken(token); // throws jika invalid
    const user = await prisma.user.findUnique(...);
    if (!user) {                              // B2 — user tidak ada
      return 404;
    }
    if (user.tier === "FREE") {              // B3 — cek self-healing
      const pendingTx = await prisma.transaction.findFirst(...);
      if (pendingTx) {                       // B4 — ada transaksi PENDING
        const status = await core.transaction.status(...);
        if (status.transaction_status === "settlement"
            || status.transaction_status === "capture") { // B5 — sudah bayar
          // upgrade ke PRO
        }
      }
    }
    return 200; // data user
  } catch (err) {                            // B6 — token invalid/error
    return 401;
  }
}
```

### 7.2 Control Flow Graph

```
[START]
   │
   ▼
[B1: token ada?] ──NO──► [Return 401] ──► [END]
   │ YES
   ▼
[verifyToken → DB findUnique]
   │
   ▼
[B2: user ada?] ──NO──► [Return 404] ──► [END]
   │ YES
   ▼
[B3: tier FREE?] ──NO──► [Return 200] ──► [END]
   │ YES
   ▼
[DB: cari PENDING transaction]
   │
   ▼
[B4: pendingTx ada?] ──NO──► [Return 200] ──► [END]
   │ YES
   ▼
[Midtrans: cek status]
   │
   ▼
[B5: settlement/capture?] ──YES──► [Upgrade PRO → Return 200] ──► [END]
   │ NO
   ▼
[Return 200 (tetap FREE)] ──► [END]

[CATCH B6] ──► [Return 401] ──► [END]
```

### 7.3 Kompleksitas Siklomatik

**CC = 6 titik keputusan + 1 = 7** → Sederhana

### 7.4 Basis Path & Hasil Uji

| Path | Jalur Eksekusi | Hasil yang Diharapkan | Status |
|---|---|---|---|
| P1 | B1=NO | HTTP 401 | ✅ Tercover |
| P2 | B1=YES → B2=NO | HTTP 404 | ✅ Tercover |
| P3 | B1=YES → B2=YES → B3=NO (PRO user) | HTTP 200 langsung | ✅ Tercover |
| P4 | B1=YES → B2=YES → B3=YES → B4=NO | HTTP 200 (FREE, tidak ada PENDING) | ✅ Tercover |
| P5 | … → B4=YES → B5=NO | HTTP 200 (PENDING ada, belum settle) | ✅ Tercover |
| P6 | … → B4=YES → B5=YES | HTTP 200 + user diupgrade ke PRO | ✅ Tercover |
| P7 | CATCH B6 | HTTP 401 (token tidak valid) | ✅ Tercover |

### 7.5 Branch Coverage

| Branch | Kondisi | Tercover? |
|---|---|---|
| B1 TRUE/FALSE | Token ada / tidak | ✅ Ya |
| B2 TRUE/FALSE | User ada / tidak | ✅ Ya |
| B3 TRUE/FALSE | Tier FREE / bukan | ✅ Ya |
| B4 TRUE/FALSE | Ada PENDING tx / tidak | ✅ Ya |
| B5 TRUE/FALSE | Status settlement / bukan | ✅ Ya |
| B6 TRUE/FALSE | Exception / tidak | ✅ Ya |

**Branch Coverage: 12/12 = 100%**

---

## 8. Rekapitulasi Hasil Whitebox Testing

### 8.1 Kompleksitas Siklomatik per Modul

| Modul | File | CC | Interpretasi |
|---|---|---|---|
| `POST /api/auth/login` | `auth/login/route.js` | 9 | Moderat |
| `POST /api/auth/register` | `auth/register/route.js` | 9 | Moderat |
| `POST /api/chat` | `chat/route.js` | 11 | Kompleks ⚠️ |
| `POST /api/payment/checkout` | `payment/checkout/route.js` | 5 | Sederhana |
| `middleware.js` | `middleware.js` | 6 | Sederhana |
| `GET /api/regulations/download` | `regulations/download/route.js` | 7 | Sederhana |
| `GET /api/profile` | `profile/route.js` | 7 | Sederhana |

> **Catatan:** `POST /api/chat` memiliki CC = 11 karena menggabungkan autentikasi, logika bisnis (limit), dan alur RAG (Pinecone + LLM) dalam satu fungsi. Disarankan direfaktor menjadi fungsi-fungsi terpisah untuk meningkatkan maintainability.

### 8.2 Branch Coverage Keseluruhan

| Modul | Branch Tercover | Total Branch | Coverage |
|---|---|---|---|
| `POST /api/auth/login` | 15 | 15 | 100% |
| `POST /api/auth/register` | 14 | 14 | 100% |
| `POST /api/chat` | 20 | 20 | 100% |
| `POST /api/payment/checkout` | 8 | 8 | 100% |
| `middleware.js` | 10 | 10 | 100% |
| `GET /api/regulations/download` | 12 | 12 | 100% |
| `GET /api/profile` | 12 | 12 | 100% |
| **Total** | **91** | **91** | **100%** |

### 8.3 Ringkasan Jalur Basis

| Modul | Jumlah Jalur Basis | Semua Tercover? |
|---|---|---|
| `POST /api/auth/login` | 8 | ✅ Ya |
| `POST /api/auth/register` | 9 | ✅ Ya |
| `POST /api/chat` | 9 | ✅ Ya |
| `POST /api/payment/checkout` | 5 | ✅ Ya |
| `middleware.js` | 6 | ✅ Ya |
| `GET /api/regulations/download` | 6 | ✅ Ya |
| `GET /api/profile` | 7 | ✅ Ya |
| **Total Jalur** | **50** | ✅ **Semua Tercover** |

### 8.4 Temuan Logic Flaw dari Inspeksi Kode

| ID | Modul | Temuan | Status |
|---|---|---|---|
| LF-01 | `api/regulations GET` | `parseInt('abc')` → NaN → `skip: NaN` ke Prisma | ✅ Diperbaiki |
| LF-02 | `api/payment/checkout` | User PRO bisa buat transaksi berulang | ✅ Diperbaiki |
| LF-03 | `api/chat POST` | `userId` diambil dari body, bukan JWT | ✅ Diperbaiki |
| LF-04 | `api/logout` | Logout tidak menghapus JWT cookie | ✅ Diperbaiki |
| LF-05 | `api/profile PATCH` | `personalContext` tanpa batas panjang | ✅ Diperbaiki |
| LF-06 | `api/regulations/[id]` | `viewCount` tidak pernah naik | ✅ Diperbaiki |
| LF-07 | `api/dashboard` | Dapat diakses tanpa login | ✅ Diperbaiki |
| LF-08 | `middleware.js` | Hardcoded fallback JWT secret | ✅ Diperbaiki |

---

*Laporan ini menggunakan teknik Basis Path Testing dan analisis Kompleksitas Siklomatik (McCabe) berdasarkan inspeksi langsung source code. Setiap jalur eksekusi diidentifikasi dari control flow graph masing-masing fungsi dan diverifikasi menggunakan Jest unit test.*
