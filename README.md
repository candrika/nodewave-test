# 🚀 NodeWave Backend — File Processing Service

Ini adalah layanan API untuk upload file Excel, memprosesnya secara asynchronous menggunakan BullMQ (Redis Queue), menyimpan hasil parsing ke database menggunakan Prisma + PostgreSQL, dan menyediakan sistem logging serta retry job.

Backend ini dibangun dengan:

* **Node.js + Express**
* **TypeScript**
* **Prisma ORM**
* **BullMQ**
* **Redis**
* **ExcelJS (Streaming Mode)**
* **JWT Authentication**
* **Multer (File Uploader)**

---

## 📁 Project Structure

```
nodewave/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── queue/
│   ├── utils/
│   ├── routes/
│   ├── prisma.ts
│   ├── index.ts
│   └── types.d.ts
│
├── uploads/
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Setup Environment Variables

Buat file `.env`:

```
PORT=4000
JWT_SECRET=supersecret

DATABASE_URL="postgresql://dika:rahasia@localhost:5432/nodewave?schema=public"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

FILES_UPLOAD_DIR=./uploads
```

## 3️⃣ Generate Prisma Client

```bash
npx prisma generate
```

## 4️⃣ Run Migrations

```bash
npx prisma migrate dev
```

## 5️⃣ Run Server

```bash
npm run dev
```

## 6️⃣ Run Queue Worker

Tambahkan script berikut ke package.json:

```json
"worker": "ts-node src/queue/worker.ts"
```

Lalu jalankan:

```bash
npm run worker
```

---

# 📚 API Documentation

## 🔐 **Authentication**

### **POST /api/login**

Login untuk mendapatkan JWT token.

#### **Body**:

```json
{
  "username": "admin",
  "password": "password"
}
```

#### **Response**:

```json
{
  "token": "JWT_TOKEN"
}
```

---

## 📤 **File Processing API**

### **POST /api/upload**

Upload file Excel (multipart form-data). File otomatis dimasukkan ke queue untuk diproses.

**Headers:**

```
Authorization: Bearer <token>
```

**Form-data:**

```
file: <file.xlsx>
```

**Response:**

```json
{
  "id": "file_123",
  "originalName": "data.xlsx",
  "status": "PENDING"
}
```

---

### **GET /api/**

List seluruh file dengan pagination & filtering.

**Query Params:**

| Param  | Default |
| ------ | ------- |
| page   | 1       |
| limit  | 10      |
| status | ALL     |

**Example:**

```
/api?page=1&limit=20&status=FAILED
```

---

### **GET /api/:id**

Mengambil detail file + data hasil parsing.

**Response:**

```json
{
  "id": "file_123",
  "status": "DONE",
  "processedRows": [
    { "id": 1, "rowData": {"column":"value"} }
  ]
}
```

---

### **GET /api/:id/logs**

Mengambil log proses file.

**Response:**

```json
[
  { "event": "START", "message": "Processing started" },
  { "event": "DONE", "message": "Completed" }
]
```

---

### **POST /api/:id/retry**

Melakukan retry terhadap file yang FAILED.

**Response:**

```json
{
  "message": "Retry queued",
  "fileId": "file_123"
}
```

---

# 🔄 Queue Flow Architecture

```
UPLOAD XLSX
    │
    ▼
API SERVER (Express)
    │
    ▼
MULTER → save file → enqueue job
    │
    ▼
REDIS QUEUE (BullMQ)
    │
    ▼
WORKER (fileWorker.ts)
    │
    ├─ Log START
    ├─ Stream Excel row-by-row
    ├─ Insert ProcessedRows
    ├─ Update status
    └─ Log DONE / ERROR
```

---

# 🧪 Testing (Postman / Thunder Client)

Tambahkan header:

```
Authorization: Bearer <token>
```

Upload file:

```
POST /api/upload
Content-Type: multipart/form-data
```

---

# 📦 Deployment Notes

* Gunakan **PM2** untuk menjalankan API dan worker.
* Redis dapat dijalankan via Docker atau Redis Cloud.
* Folder upload bisa dipindah ke S3/MinIO.
* Gunakan NGINX sebagai reverse proxy.

---
