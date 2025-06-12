FLOWLY API DOCUMENTATION
========================

Base URL: https://my-cloudflare-api.farelrasyah87.workers.dev

## AUTHENTICATION ENDPOINTS

### 1. POST /auth/register
   Deskripsi: Mendaftarkan user baru ke dalam sistem
   Endpoint: POST /auth/register
   Permission: Public (tidak memerlukan autentikasi)
   Feature: User Management
   
   Request Headers:
   - Content-Type: application/json
   
   Request Body:
   {
     "username": string,  // minimal 3 karakter
     "password": string   // minimal 6 karakter
   }

   Response Success (201):
   {
     "success": true,
     "message": "User berhasil dibuat",
     "user": {
       "id": integer,
       "username": string,
       "createdAt": datetime,
       "updatedAt": datetime
     }
   }

### 2. POST /auth/login
   Deskripsi: Melakukan autentikasi user dan mendapatkan JWT token
   Endpoint: POST /auth/login
   Permission: Public (tidak memerlukan autentikasi)
   Feature: User Management
   
   Request Headers:
   - Content-Type: application/json
   
   Request Body:
   {
     "username": string,
     "password": string
   }

   Response Success (200):
   {
     "success": true,
     "access_token": string,
     "user": {
       "id": integer,
       "username": string,
       "createdAt": datetime,
       "updatedAt": datetime
     }
   }

### 3. GET /auth/profile
   Deskripsi: Mendapatkan informasi profile user yang sedang login
   Endpoint: GET /auth/profile
   Permission: Authenticated User
   Feature: User Management
   
   Request Headers:
   - Authorization: Bearer <jwt_token>

   Response Success (200):
   {
     "success": true,
     "message": "Profile berhasil diambil",
     "user": {
       "id": integer,
       "username": string,
       "createdAt": datetime,
       "updatedAt": datetime
     }
   }

## TASK MANAGEMENT ENDPOINTS

### 4. POST /api/tasks
   Deskripsi: Membuat tugas baru untuk user yang sedang login
   Endpoint: POST /api/tasks
   Permission: Authenticated User
   Feature: Task Management
   
   Request Headers:
   - Content-Type: application/json
   - Authorization: Bearer <jwt_token>
   
   Request Body:
   {
     "judul": string,              // wajib
     "deskripsi": string,          // opsional
     "kategori": string,           // opsional
     "tenggat_waktu": datetime     // opsional, format ISO 8601
   }

   Response Success (201):
   {
     "success": true,
     "message": "Task berhasil dibuat",
     "task": {
       "id": integer,
       "judul": string,
       "deskripsi": string,
       "kategori": string,
       "status": "belum_selesai",
       "tenggat_waktu": datetime,
       "user_id": integer,
       "created_at": datetime,
       "updated_at": datetime
     }
   }

### 5. GET /api/tasks
   Deskripsi: Mendapatkan semua tugas milik user yang sedang login
   Endpoint: GET /api/tasks
   Permission: Authenticated User
   Feature: Task Management
   
   Request Headers:
   - Authorization: Bearer <jwt_token>
   
   Query Parameters:
   - kategori (optional): string
     * Deskripsi: Filter tugas berdasarkan kategori
     * Contoh: "sekolah", "kerja", "rumah", "hobi"

   Response Success (200):
   {
     "success": true,
     "message": "Tasks berhasil diambil",
     "tasks": [
       {
         "id": integer,
         "judul": string,
         "deskripsi": string,
         "kategori": string,
         "status": "selesai" | "belum_selesai",
         "tenggat_waktu": datetime,
         "created_at": datetime,
         "updated_at": datetime
       }
     ]
   }

### 6. GET /api/tasks/{id}
   Deskripsi: Mendapatkan detail tugas berdasarkan ID
   Endpoint: GET /api/tasks/{id}
   Permission: Authenticated User (hanya tugas milik sendiri)
   Feature: Task Management
   
   Request Headers:
   - Authorization: Bearer <jwt_token>
   
   Path Parameters:
   - id: integer
     * Deskripsi: ID dari task yang ingin diambil

   Response Success (200):
   {
     "success": true,
     "message": "Task berhasil diambil",
     "task": {
       "id": integer,
       "judul": string,
       "deskripsi": string,
       "kategori": string,
       "status": "selesai" | "belum_selesai",
       "tenggat_waktu": datetime,
       "created_at": datetime,
       "updated_at": datetime
     }
   }

### 7. PUT /api/tasks/{id}
   Deskripsi: Memperbarui informasi tugas yang sudah ada
   Endpoint: PUT /api/tasks/{id}
   Permission: Authenticated User (hanya tugas milik sendiri)
   Feature: Task Management
   
   Request Headers:
   - Content-Type: application/json
   - Authorization: Bearer <jwt_token>
   
   Path Parameters:
   - id: integer
     * Deskripsi: ID dari task yang ingin diupdate
   
   Request Body:
   {
     "judul": string,              // opsional
     "deskripsi": string,          // opsional
     "kategori": string,           // opsional
     "status": string,             // opsional, "selesai" | "belum_selesai"
     "tenggat_waktu": datetime     // opsional, format ISO 8601
   }

   Response Success (200):
   {
     "success": true,
     "message": "Task berhasil diupdate",
     "task": {
       "id": integer,
       "judul": string,
       "deskripsi": string,
       "kategori": string,
       "status": "selesai" | "belum_selesai",
       "tenggat_waktu": datetime,
       "created_at": datetime,
       "updated_at": datetime
     }
   }

### 8. PATCH /api/tasks/{id}/status
   Deskripsi: Mengubah status tugas antara 'selesai' dan 'belum_selesai'
   Endpoint: PATCH /api/tasks/{id}/status
   Permission: Authenticated User (hanya tugas milik sendiri)
   Feature: Task Management
   
   Request Headers:
   - Authorization: Bearer <jwt_token>
   
   Path Parameters:
   - id: integer
     * Deskripsi: ID dari task yang ingin diubah statusnya

   Response Success (200):
   {
     "success": true,
     "message": "Status task berhasil diupdate",
     "task": {
       "id": integer,
       "judul": string,
       "deskripsi": string,
       "kategori": string,
       "status": "selesai" | "belum_selesai",
       "tenggat_waktu": datetime,
       "created_at": datetime,
       "updated_at": datetime
     }
   }

### 9. DELETE /api/tasks/{id}
   Deskripsi: Menghapus tugas dari sistem
   Endpoint: DELETE /api/tasks/{id}
   Permission: Authenticated User (hanya tugas milik sendiri)
   Feature: Task Management
   
   Request Headers:
   - Authorization: Bearer <jwt_token>
   
   Path Parameters:
   - id: integer
     * Deskripsi: ID dari task yang ingin dihapus

   Response Success (200):
   {
     "success": true,
     "message": "Task berhasil dihapus"
   }

## RESPONSE ERROR

Response Error (400/401/404/409/500):
{
  "success": false,
  "message": string,
  "errors": [string]  // opsional, untuk validation errors
}

## ERROR CODES

- 400: Bad Request (validation errors, invalid input)
- 401: Unauthorized (missing atau invalid token)
- 404: Not Found (resource tidak ditemukan)
- 409: Conflict (username sudah digunakan)
- 500: Internal Server Error

## CONTOH PENGGUNAAN

1. Register user baru:
   POST /auth/register
   Body: {"username": "testuser", "password": "password123"}

2. Login untuk mendapatkan token:
   POST /auth/login
   Body: {"username": "testuser", "password": "password123"}

3. Membuat task baru:
   POST /api/tasks
   Headers: Authorization: Bearer <token>
   Body: {"judul": "Belajar Flutter", "kategori": "sekolah", "tenggat_waktu": "2025-06-15T10:00:00Z"}

4. Mendapatkan semua tasks:
   GET /api/tasks
   Headers: Authorization: Bearer <token>

5. Filter tasks berdasarkan kategori:
   GET /api/tasks?kategori=sekolah
   Headers: Authorization: Bearer <token>

6. Mendapatkan task tertentu:
   GET /api/tasks/1
   Headers: Authorization: Bearer <token>

7. Update task:
   PUT /api/tasks/1
   Headers: Authorization: Bearer <token>
   Body: {"judul": "Belajar Flutter - Updated", "status": "selesai"}

8. Toggle status task:
   PATCH /api/tasks/1/status
   Headers: Authorization: Bearer <token>

9. Hapus task:
   DELETE /api/tasks/1
   Headers: Authorization: Bearer <token>

## CATATAN

- Semua endpoint (kecuali register dan login) memerlukan autentikasi JWT
- Token JWT berlaku selama 24 jam
- User hanya bisa mengakses dan memodifikasi task milik mereka sendiri
- Format datetime menggunakan ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- Kategori task bersifat opsional dan dapat berupa string apapun
- Status task hanya dapat berupa "selesai" atau "belum_selesai"
- Password di-hash menggunakan SHA-256 untuk keamanan
- API menggunakan CORS yang memperbolehkan semua origin (untuk development)

## TECH STACK

- Runtime: Cloudflare Workers
- Framework: Hono.js
- Database: Cloudflare D1 (SQLite)
- Authentication: JWT (JSON Web Tokens)
- Language: TypeScript