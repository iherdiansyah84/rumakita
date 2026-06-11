# Rumakita — API Documentation

Dokumentasi REST API untuk aplikasi mobile Android **Rumakita** (Sistem Manajemen Perumahan).

---

## Daftar Isi

1. [Informasi Umum](#1-informasi-umum)
2. [Autentikasi](#2-autentikasi)
3. [Format Response](#3-format-response)
4. [Pagination](#4-pagination)
5. [Auth API](#5-auth-api)
6. [Dashboard API](#6-dashboard-api)
7. [Perumahan API](#7-perumahan-api)
8. [Warga API](#8-warga-api)
9. [Anggota Keluarga API](#9-anggota-keluarga-api)
10. [Keuangan / Transaksi API](#10-keuangan--transaksi-api)
11. [Agenda API](#11-agenda-api)
12. [Forum / Diskusi API](#12-forum--diskusi-api)
13. [Galeri API](#13-galeri-api)
14. [Voting API](#14-voting-api)
15. [Marketplace API](#15-marketplace-api)
16. [Users API](#16-users-api)
17. [HTTP Status Codes](#17-http-status-codes)

---

## 1. Informasi Umum

| Item | Nilai |
|------|-------|
| Base URL | `http://your-domain.com/api/v1` |
| Format | JSON |
| Encoding | UTF-8 |
| Content-Type | `application/json` (kecuali upload file: `multipart/form-data`) |

---

## 2. Autentikasi

API menggunakan **Laravel Sanctum** dengan mekanisme **Bearer Token**.

### Cara Mendapatkan Token
Login menggunakan endpoint `POST /api/v1/auth/login`. Token dikembalikan dalam field `token`.

### Cara Menggunakan Token
Sertakan token di header setiap request yang memerlukan autentikasi:

```
Authorization: Bearer {token}
```

### Endpoint Publik (Tanpa Token)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`

Semua endpoint lainnya **wajib menyertakan token**.

---

## 3. Format Response

### Success Response
```json
{
  "message": "Pesan sukses.",
  "data": { ... }
}
```

### Error Response (Validasi)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Pesan error."]
  }
}
```

### Error Response (Umum)
```json
{
  "message": "Pesan error."
}
```

---

## 4. Pagination

Semua endpoint list mendukung pagination. Response format:

```json
{
  "current_page": 1,
  "data": [ ... ],
  "first_page_url": "http://domain/api/v1/resource?page=1",
  "from": 1,
  "last_page": 5,
  "last_page_url": "http://domain/api/v1/resource?page=5",
  "next_page_url": "http://domain/api/v1/resource?page=2",
  "path": "http://domain/api/v1/resource",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 70
}
```

**Query parameter pagination:**
| Parameter | Default | Keterangan |
|-----------|---------|-----------|
| `page` | 1 | Halaman yang diminta |
| `per_page` | 15 | Jumlah item per halaman |

---

## 5. Auth API

### 5.1 Login

```
POST /api/v1/auth/login
```

**Auth:** Tidak diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `email` | string | Ya | Email terdaftar |
| `password` | string | Ya | Password akun |

**Contoh Request:**
```json
{
  "email": "admin@rumakita.id",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "message": "Login berhasil.",
  "token": "1|abcdefghij1234567890...",
  "user": {
    "id": 1,
    "name": "Admin Perumahan",
    "email": "admin@rumakita.id",
    "role": "pengurus",
    "role_label": "Pengurus",
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Response 422 (Kredensial salah):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email atau password salah."]
  }
}
```

---

### 5.2 Register

```
POST /api/v1/auth/register
```

**Auth:** Tidak diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `name` | string | Ya | Nama lengkap (maks. 255) |
| `email` | string | Ya | Email unik |
| `password` | string | Ya | Password (min. 8 karakter) |
| `password_confirmation` | string | Ya | Konfirmasi password |

**Contoh Request:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response 201:**
```json
{
  "message": "Registrasi berhasil.",
  "token": "2|xyz...",
  "user": {
    "id": 2,
    "name": "Budi Santoso",
    "email": "budi@email.com",
    "role": null,
    "role_label": null,
    "created_at": "2024-06-01T10:00:00.000000Z"
  }
}
```

---

### 5.3 Logout

```
POST /api/v1/auth/logout
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Logout berhasil."
}
```

---

### 5.4 Get Profile (Me)

```
GET /api/v1/auth/me
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin Perumahan",
    "email": "admin@rumakita.id",
    "role": "pengurus",
    "role_label": "Pengurus",
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 5.5 Update Profile

```
PUT /api/v1/auth/me
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `name` | string | Tidak | Nama baru |
| `email` | string | Tidak | Email baru (harus unik) |

**Contoh Request:**
```json
{
  "name": "Budi Santoso Baru"
}
```

**Response 200:**
```json
{
  "message": "Profil berhasil diperbarui.",
  "user": {
    "id": 1,
    "name": "Budi Santoso Baru",
    "email": "budi@email.com",
    "role": "warga",
    "role_label": "Warga",
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 5.6 Ganti Password

```
PUT /api/v1/auth/me/password
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `current_password` | string | Ya | Password saat ini |
| `password` | string | Ya | Password baru (min. 8 karakter) |
| `password_confirmation` | string | Ya | Konfirmasi password baru |

**Contoh Request:**
```json
{
  "current_password": "password123",
  "password": "newpassword456",
  "password_confirmation": "newpassword456"
}
```

**Response 200:**
```json
{
  "message": "Password berhasil diubah."
}
```

**Response 422 (Password salah):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "current_password": ["Password saat ini salah."]
  }
}
```

---

## 6. Dashboard API

### 6.1 Statistik Dashboard

```
GET /api/v1/dashboard
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "statistik": {
    "total_warga": 120,
    "agenda_aktif": 3,
    "voting_aktif": 2,
    "item_marketplace": 45,
    "total_diskusi": 88
  },
  "keuangan": {
    "pemasukan": 15000000,
    "pengeluaran": 8500000,
    "saldo": 6500000
  },
  "agenda_mendatang": [
    {
      "id": 5,
      "judul": "Rapat RT Bulan Juni",
      "tanggal": "2024-06-15",
      "waktu_mulai": "19:00",
      "waktu_selesai": "21:00",
      "lokasi": "Balai Pertemuan Blok A",
      "tipe": "rapat",
      "status": "upcoming"
    }
  ],
  "voting_aktif": [
    {
      "id": 1,
      "judul": "Pemilihan Ketua RT",
      "status": "aktif",
      "deadline": "2024-06-30",
      "suara_count": 45
    }
  ],
  "diskusi_terbaru": [
    {
      "id": 10,
      "judul": "Jadwal Kerja Bakti",
      "kategori": "lingkungan",
      "likes": 12,
      "komentar_count": 5,
      "user": { "id": 3, "name": "Siti Aminah" },
      "created_at": "2024-06-01T08:00:00.000000Z"
    }
  ]
}
```

---

## 7. Perumahan API

### 7.1 List Perumahan

```
GET /api/v1/perumahan
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan nama atau lokasi |
| `status` | string | Filter: `aktif`, `nonaktif` |
| `page` | integer | Halaman (default: 1) |
| `per_page` | integer | Item per halaman (default: 15) |

**Response 200:**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "nama": "Perumahan Griya Indah",
      "lokasi": "Jl. Mawar No. 1, Jakarta Selatan",
      "admin_nama": "Pak Budi",
      "telepon": "021-1234567",
      "email": "griyaindah@email.com",
      "total_unit": 150,
      "status": "aktif",
      "warga_count": 120,
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "total": 5,
  "per_page": 15,
  "current_page": 1
}
```

---

### 7.2 Tambah Perumahan

```
POST /api/v1/perumahan
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `nama` | string | Ya | Nama perumahan (maks. 255) |
| `lokasi` | string | Ya | Alamat/lokasi (maks. 255) |
| `admin_nama` | string | Tidak | Nama admin/pengurus |
| `telepon` | string | Tidak | Nomor telepon (maks. 20) |
| `email` | string | Tidak | Email perumahan |
| `total_unit` | integer | Tidak | Jumlah total unit |
| `status` | string | Tidak | `aktif` / `nonaktif` |

**Contoh Request:**
```json
{
  "nama": "Perumahan Griya Indah",
  "lokasi": "Jl. Mawar No. 1, Jakarta Selatan",
  "admin_nama": "Pak Budi",
  "telepon": "021-1234567",
  "email": "griyaindah@email.com",
  "total_unit": 150,
  "status": "aktif"
}
```

**Response 201:**
```json
{
  "message": "Perumahan berhasil ditambahkan.",
  "perumahan": {
    "id": 1,
    "nama": "Perumahan Griya Indah",
    "lokasi": "Jl. Mawar No. 1, Jakarta Selatan",
    "admin_nama": "Pak Budi",
    "telepon": "021-1234567",
    "email": "griyaindah@email.com",
    "total_unit": 150,
    "status": "aktif",
    "created_at": "2024-06-01T00:00:00.000000Z",
    "updated_at": "2024-06-01T00:00:00.000000Z"
  }
}
```

---

### 7.3 Detail Perumahan

```
GET /api/v1/perumahan/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "perumahan": {
    "id": 1,
    "nama": "Perumahan Griya Indah",
    "lokasi": "Jl. Mawar No. 1, Jakarta Selatan",
    "admin_nama": "Pak Budi",
    "telepon": "021-1234567",
    "email": "griyaindah@email.com",
    "total_unit": 150,
    "status": "aktif",
    "warga_count": 120,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 7.4 Update Perumahan

```
PUT /api/v1/perumahan/{id}
```

**Auth:** Diperlukan

**Request Body:** Sama seperti POST, semua field bersifat opsional.

**Response 200:**
```json
{
  "message": "Perumahan berhasil diperbarui.",
  "perumahan": { ... }
}
```

---

### 7.5 Hapus Perumahan

```
DELETE /api/v1/perumahan/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Perumahan berhasil dihapus."
}
```

---

## 8. Warga API

### 8.1 List Warga

```
GET /api/v1/warga
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan nama, NIK, atau blok |
| `perumahan_id` | integer | Filter berdasarkan perumahan |
| `status_iuran` | string | Filter: `lunas`, `belum_lunas`, `tunggakan` |
| `page` | integer | Halaman |
| `per_page` | integer | Item per halaman (default: 15) |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "perumahan_id": 1,
      "nama": "Budi Santoso",
      "nik": "3171234567890001",
      "blok": "A-01",
      "no_hp": "08123456789",
      "email": "budi@email.com",
      "status_iuran": "lunas",
      "tempat_lahir": "Jakarta",
      "tanggal_lahir": "1985-05-15",
      "jenis_kelamin": "laki-laki",
      "agama": "Islam",
      "pekerjaan": "Karyawan Swasta",
      "status_perkawinan": "kawin",
      "anggota_keluarga_count": 3,
      "perumahan": {
        "id": 1,
        "nama": "Perumahan Griya Indah"
      }
    }
  ],
  "total": 120
}
```

---

### 8.2 Tambah Warga

```
POST /api/v1/warga
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `perumahan_id` | integer | Ya | ID perumahan |
| `nama` | string | Ya | Nama lengkap |
| `nik` | string | Ya | NIK unik (maks. 16 digit) |
| `blok` | string | Ya | Nomor blok/unit |
| `no_hp` | string | Tidak | Nomor HP |
| `email` | string | Tidak | Email |
| `status_iuran` | string | Tidak | `lunas` / `belum_lunas` / `tunggakan` |
| `tempat_lahir` | string | Tidak | Tempat lahir |
| `tanggal_lahir` | date | Tidak | Format: `YYYY-MM-DD` |
| `jenis_kelamin` | string | Tidak | `laki-laki` / `perempuan` |
| `agama` | string | Tidak | Agama |
| `pekerjaan` | string | Tidak | Pekerjaan |
| `status_perkawinan` | string | Tidak | `belum_kawin` / `kawin` / `cerai_hidup` / `cerai_mati` |
| `alamat_asal` | string | Tidak | Alamat asal |
| `tipe_dokumen` | string | Tidak | `ktp` / `paspor` / `sim` |
| `no_dokumen` | string | Tidak | Nomor dokumen |

**Contoh Request:**
```json
{
  "perumahan_id": 1,
  "nama": "Budi Santoso",
  "nik": "3171234567890001",
  "blok": "A-01",
  "no_hp": "08123456789",
  "email": "budi@email.com",
  "status_iuran": "lunas",
  "tempat_lahir": "Jakarta",
  "tanggal_lahir": "1985-05-15",
  "jenis_kelamin": "laki-laki",
  "agama": "Islam",
  "pekerjaan": "Karyawan Swasta",
  "status_perkawinan": "kawin"
}
```

**Response 201:**
```json
{
  "message": "Warga berhasil ditambahkan.",
  "warga": { ... }
}
```

---

### 8.3 Detail Warga

```
GET /api/v1/warga/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "warga": {
    "id": 1,
    "nama": "Budi Santoso",
    "nik": "3171234567890001",
    "blok": "A-01",
    "perumahan": { "id": 1, "nama": "Perumahan Griya Indah" },
    "anggota_keluarga": [
      {
        "id": 1,
        "nama": "Siti Aminah",
        "status_hubungan": "Istri",
        "nik": "3171234567890002",
        "tanggal_lahir": "1987-08-20",
        "jenis_kelamin": "perempuan",
        "pekerjaan": "Ibu Rumah Tangga"
      }
    ]
  }
}
```

---

### 8.4 Update Warga

```
PUT /api/v1/warga/{id}
```

**Auth:** Diperlukan

**Request Body:** Sama seperti POST, semua field opsional.

**Response 200:**
```json
{
  "message": "Warga berhasil diperbarui.",
  "warga": { ... }
}
```

---

### 8.5 Hapus Warga

```
DELETE /api/v1/warga/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Warga berhasil dihapus."
}
```

---

## 9. Anggota Keluarga API

### 9.1 List Anggota Keluarga

```
GET /api/v1/warga/{warga_id}/anggota-keluarga
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "anggota_keluarga": [
    {
      "id": 1,
      "warga_id": 1,
      "nama": "Siti Aminah",
      "status_hubungan": "Istri",
      "nik": "3171234567890002",
      "tanggal_lahir": "1987-08-20",
      "jenis_kelamin": "perempuan",
      "pekerjaan": "Ibu Rumah Tangga",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 9.2 Tambah Anggota Keluarga

```
POST /api/v1/warga/{warga_id}/anggota-keluarga
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `nama` | string | Ya | Nama anggota keluarga |
| `status_hubungan` | string | Ya | Contoh: Istri, Anak, Suami |
| `nik` | string | Tidak | NIK (maks. 16) |
| `tanggal_lahir` | date | Tidak | Format: `YYYY-MM-DD` |
| `jenis_kelamin` | string | Tidak | `laki-laki` / `perempuan` |
| `pekerjaan` | string | Tidak | Pekerjaan |

**Contoh Request:**
```json
{
  "nama": "Andi Santoso",
  "status_hubungan": "Anak",
  "tanggal_lahir": "2010-03-12",
  "jenis_kelamin": "laki-laki",
  "pekerjaan": "Pelajar"
}
```

**Response 201:**
```json
{
  "message": "Anggota keluarga berhasil ditambahkan.",
  "anggota": {
    "id": 2,
    "warga_id": 1,
    "nama": "Andi Santoso",
    "status_hubungan": "Anak",
    "nik": null,
    "tanggal_lahir": "2010-03-12",
    "jenis_kelamin": "laki-laki",
    "pekerjaan": "Pelajar"
  }
}
```

---

### 9.3 Update Anggota Keluarga

```
PUT /api/v1/warga/{warga_id}/anggota-keluarga/{anggota_id}
```

**Auth:** Diperlukan

**Request Body:** Sama seperti POST, semua field opsional.

**Response 200:**
```json
{
  "message": "Anggota keluarga berhasil diperbarui.",
  "anggota": { ... }
}
```

---

### 9.4 Hapus Anggota Keluarga

```
DELETE /api/v1/warga/{warga_id}/anggota-keluarga/{anggota_id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Anggota keluarga berhasil dihapus."
}
```

---

## 10. Keuangan / Transaksi API

### 10.1 Ringkasan Keuangan

```
GET /api/v1/keuangan/summary
```

**Auth:** Diperlukan

> **Catatan:** Panggil endpoint ini sebelum `GET /api/v1/keuangan` agar tidak tertangkap sebagai ID.

**Response 200:**
```json
{
  "pemasukan": 15000000,
  "pengeluaran": 8500000,
  "saldo": 6500000
}
```

---

### 10.2 List Transaksi

```
GET /api/v1/keuangan
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan deskripsi |
| `tipe` | string | Filter: `masuk` / `keluar` |
| `kategori` | string | Filter berdasarkan kategori |
| `tanggal_dari` | date | Filter mulai tanggal (YYYY-MM-DD) |
| `tanggal_sampai` | date | Filter sampai tanggal (YYYY-MM-DD) |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "tanggal": "2024-06-01",
      "deskripsi": "Iuran bulanan warga",
      "tipe": "masuk",
      "jumlah": 5000000,
      "kategori": "iuran",
      "created_at": "2024-06-01T00:00:00.000000Z"
    }
  ],
  "total": 50
}
```

---

### 10.3 Tambah Transaksi

```
POST /api/v1/keuangan
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `tanggal` | date | Ya | Format: `YYYY-MM-DD` |
| `deskripsi` | string | Ya | Keterangan transaksi |
| `tipe` | string | Ya | `masuk` / `keluar` |
| `jumlah` | integer | Ya | Nominal (dalam rupiah, min: 0) |
| `kategori` | string | Tidak | Kategori transaksi |

**Contoh Request:**
```json
{
  "tanggal": "2024-06-01",
  "deskripsi": "Iuran bulanan warga bulan Juni",
  "tipe": "masuk",
  "jumlah": 5000000,
  "kategori": "iuran"
}
```

**Response 201:**
```json
{
  "message": "Transaksi berhasil ditambahkan.",
  "transaksi": {
    "id": 1,
    "tanggal": "2024-06-01",
    "deskripsi": "Iuran bulanan warga bulan Juni",
    "tipe": "masuk",
    "jumlah": 5000000,
    "kategori": "iuran",
    "created_at": "2024-06-01T10:00:00.000000Z",
    "updated_at": "2024-06-01T10:00:00.000000Z"
  }
}
```

---

### 10.4 Detail Transaksi

```
GET /api/v1/keuangan/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "transaksi": {
    "id": 1,
    "tanggal": "2024-06-01",
    "deskripsi": "Iuran bulanan warga bulan Juni",
    "tipe": "masuk",
    "jumlah": 5000000,
    "kategori": "iuran"
  }
}
```

---

### 10.5 Update Transaksi

```
PUT /api/v1/keuangan/{id}
```

**Auth:** Diperlukan

**Request Body:** Sama seperti POST, semua field opsional.

**Response 200:**
```json
{
  "message": "Transaksi berhasil diperbarui.",
  "transaksi": { ... }
}
```

---

### 10.6 Hapus Transaksi

```
DELETE /api/v1/keuangan/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Transaksi berhasil dihapus."
}
```

---

## 11. Agenda API

### 11.1 List Agenda

```
GET /api/v1/agenda
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan judul atau lokasi |
| `tipe` | string | Filter berdasarkan tipe acara |
| `status` | string | `upcoming` / `ongoing` / `selesai` / `dibatalkan` |
| `tanggal_dari` | date | Filter mulai tanggal |
| `tanggal_sampai` | date | Filter sampai tanggal |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "judul": "Rapat RT Bulan Juni",
      "tanggal": "2024-06-15",
      "waktu_mulai": "19:00",
      "waktu_selesai": "21:00",
      "lokasi": "Balai Pertemuan Blok A",
      "tipe": "rapat",
      "penyelenggara": "Pengurus RT",
      "max_peserta": 50,
      "status": "upcoming",
      "created_at": "2024-06-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 11.2 Tambah Agenda

```
POST /api/v1/agenda
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `judul` | string | Ya | Judul agenda |
| `tanggal` | date | Ya | Tanggal acara (YYYY-MM-DD) |
| `waktu_mulai` | string | Tidak | Format: `HH:MM` |
| `waktu_selesai` | string | Tidak | Format: `HH:MM` (harus setelah waktu_mulai) |
| `lokasi` | string | Tidak | Tempat acara |
| `tipe` | string | Tidak | Jenis acara (rapat, olahraga, dll) |
| `penyelenggara` | string | Tidak | Penanggung jawab acara |
| `max_peserta` | integer | Tidak | Batas maksimal peserta |
| `status` | string | Tidak | `upcoming` / `ongoing` / `selesai` / `dibatalkan` |

**Contoh Request:**
```json
{
  "judul": "Rapat RT Bulan Juni",
  "tanggal": "2024-06-15",
  "waktu_mulai": "19:00",
  "waktu_selesai": "21:00",
  "lokasi": "Balai Pertemuan Blok A",
  "tipe": "rapat",
  "penyelenggara": "Pengurus RT",
  "max_peserta": 50,
  "status": "upcoming"
}
```

**Response 201:**
```json
{
  "message": "Agenda berhasil ditambahkan.",
  "agenda": { ... }
}
```

---

### 11.3 Detail Agenda

```
GET /api/v1/agenda/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "agenda": {
    "id": 1,
    "judul": "Rapat RT Bulan Juni",
    "tanggal": "2024-06-15",
    "waktu_mulai": "19:00",
    "waktu_selesai": "21:00",
    "lokasi": "Balai Pertemuan Blok A",
    "tipe": "rapat",
    "penyelenggara": "Pengurus RT",
    "max_peserta": 50,
    "status": "upcoming"
  }
}
```

---

### 11.4 Update Agenda

```
PUT /api/v1/agenda/{id}
```

**Auth:** Diperlukan

**Request Body:** Sama seperti POST, semua field opsional.

**Response 200:**
```json
{
  "message": "Agenda berhasil diperbarui.",
  "agenda": { ... }
}
```

---

### 11.5 Hapus Agenda

```
DELETE /api/v1/agenda/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Agenda berhasil dihapus."
}
```

---

## 12. Forum / Diskusi API

### 12.1 List Diskusi

```
GET /api/v1/forum
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan judul atau konten |
| `kategori` | string | Filter berdasarkan kategori |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "judul": "Jadwal Kerja Bakti",
      "konten": "Warga diharapkan hadir...",
      "kategori": "lingkungan",
      "likes": 12,
      "komentar_count": 5,
      "user": { "id": 3, "name": "Siti Aminah" },
      "created_at": "2024-06-01T08:00:00.000000Z"
    }
  ]
}
```

---

### 12.2 Tambah Diskusi

```
POST /api/v1/forum
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `judul` | string | Ya | Judul diskusi |
| `konten` | string | Ya | Isi diskusi |
| `kategori` | string | Tidak | Kategori diskusi |

**Contoh Request:**
```json
{
  "judul": "Jadwal Kerja Bakti Bulan Ini",
  "konten": "Warga diharapkan hadir pada hari Minggu, 16 Juni pukul 07.00 WIB di area taman.",
  "kategori": "lingkungan"
}
```

**Response 201:**
```json
{
  "message": "Diskusi berhasil dibuat.",
  "diskusi": {
    "id": 1,
    "judul": "Jadwal Kerja Bakti Bulan Ini",
    "konten": "Warga diharapkan hadir...",
    "kategori": "lingkungan",
    "likes": 0,
    "user_id": 3,
    "user": { "id": 3, "name": "Siti Aminah" },
    "created_at": "2024-06-01T08:00:00.000000Z"
  }
}
```

---

### 12.3 Detail Diskusi (beserta komentar)

```
GET /api/v1/forum/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "diskusi": {
    "id": 1,
    "judul": "Jadwal Kerja Bakti Bulan Ini",
    "konten": "Warga diharapkan hadir...",
    "kategori": "lingkungan",
    "likes": 12,
    "user": { "id": 3, "name": "Siti Aminah" },
    "komentar": [
      {
        "id": 1,
        "konten": "Siap hadir!",
        "user": { "id": 5, "name": "Budi Santoso" },
        "created_at": "2024-06-01T09:00:00.000000Z"
      }
    ],
    "created_at": "2024-06-01T08:00:00.000000Z"
  }
}
```

---

### 12.4 Update Diskusi

```
PUT /api/v1/forum/{id}
```

**Auth:** Diperlukan (hanya pemilik atau pengurus)

**Request Body:** Sama seperti POST, semua field opsional.

**Response 200:**
```json
{
  "message": "Diskusi berhasil diperbarui.",
  "diskusi": { ... }
}
```

**Response 403 (Bukan pemilik):**
```json
{
  "message": "This action is unauthorized."
}
```

---

### 12.5 Hapus Diskusi

```
DELETE /api/v1/forum/{id}
```

**Auth:** Diperlukan (hanya pemilik atau pengurus)

**Response 200:**
```json
{
  "message": "Diskusi berhasil dihapus."
}
```

---

### 12.6 Like Diskusi

```
POST /api/v1/forum/{id}/like
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Berhasil menyukai diskusi.",
  "likes": 13
}
```

---

### 12.7 Tambah Komentar

```
POST /api/v1/forum/{id}/komentar
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `konten` | string | Ya | Isi komentar |

**Contoh Request:**
```json
{
  "konten": "Siap hadir, terima kasih infonya!"
}
```

**Response 201:**
```json
{
  "message": "Komentar berhasil ditambahkan.",
  "komentar": {
    "id": 2,
    "diskusi_id": 1,
    "konten": "Siap hadir, terima kasih infonya!",
    "user": { "id": 5, "name": "Budi Santoso" },
    "created_at": "2024-06-01T10:00:00.000000Z"
  }
}
```

---

### 12.8 Hapus Komentar

```
DELETE /api/v1/forum/{diskusi_id}/komentar/{komentar_id}
```

**Auth:** Diperlukan (hanya pemilik komentar atau pengurus)

**Response 200:**
```json
{
  "message": "Komentar berhasil dihapus."
}
```

---

## 13. Galeri API

### 13.1 List Galeri

```
GET /api/v1/galeri
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan judul |
| `kategori` | string | Filter berdasarkan kategori |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "judul": "Kerja Bakti Bulan Juni",
      "tanggal_kegiatan": "2024-06-16",
      "kategori": "kegiatan",
      "foto_count": 12,
      "user": { "id": 1, "name": "Admin" },
      "created_at": "2024-06-16T12:00:00.000000Z"
    }
  ]
}
```

---

### 13.2 Tambah Galeri

```
POST /api/v1/galeri
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `judul` | string | Ya | Judul galeri |
| `tanggal_kegiatan` | date | Tidak | Tanggal kegiatan (YYYY-MM-DD) |
| `kategori` | string | Tidak | Kategori galeri |

**Contoh Request:**
```json
{
  "judul": "Kerja Bakti Bulan Juni",
  "tanggal_kegiatan": "2024-06-16",
  "kategori": "kegiatan"
}
```

**Response 201:**
```json
{
  "message": "Galeri berhasil dibuat.",
  "galeri": {
    "id": 1,
    "judul": "Kerja Bakti Bulan Juni",
    "tanggal_kegiatan": "2024-06-16",
    "kategori": "kegiatan",
    "user": { "id": 1, "name": "Admin" }
  }
}
```

---

### 13.3 Detail Galeri (beserta foto)

```
GET /api/v1/galeri/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "galeri": {
    "id": 1,
    "judul": "Kerja Bakti Bulan Juni",
    "tanggal_kegiatan": "2024-06-16",
    "kategori": "kegiatan",
    "user": { "id": 1, "name": "Admin" },
    "foto": [
      {
        "id": 1,
        "galeri_id": 1,
        "path": "galeri/foto1.jpg",
        "url": "http://domain.com/storage/galeri/foto1.jpg"
      }
    ]
  }
}
```

---

### 13.4 Update Galeri

```
PUT /api/v1/galeri/{id}
```

**Auth:** Diperlukan (hanya pemilik atau pengurus)

**Request Body:** Sama seperti POST, semua field opsional.

**Response 200:**
```json
{
  "message": "Galeri berhasil diperbarui.",
  "galeri": { ... }
}
```

---

### 13.5 Hapus Galeri

```
DELETE /api/v1/galeri/{id}
```

**Auth:** Diperlukan (hanya pemilik atau pengurus)

Menghapus galeri beserta semua foto di dalamnya.

**Response 200:**
```json
{
  "message": "Galeri berhasil dihapus."
}
```

---

### 13.6 Upload Foto ke Galeri

```
POST /api/v1/galeri/{id}/foto
```

**Auth:** Diperlukan

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `foto[]` | file | Ya | Satu atau lebih file gambar (maks. 5MB/foto) |

**Contoh Request (Android — Retrofit):**
```kotlin
val requestBody = MultipartBody.Builder()
    .setType(MultipartBody.FORM)
    .addFormDataPart("foto[]", "foto1.jpg", file1.asRequestBody("image/*".toMediaType()))
    .addFormDataPart("foto[]", "foto2.jpg", file2.asRequestBody("image/*".toMediaType()))
    .build()
```

**Response 201:**
```json
{
  "message": "2 foto berhasil diunggah.",
  "foto": [
    { "id": 1, "galeri_id": 1, "path": "galeri/xxx.jpg" },
    { "id": 2, "galeri_id": 1, "path": "galeri/yyy.jpg" }
  ]
}
```

---

### 13.7 Hapus Foto

```
DELETE /api/v1/galeri/{galeri_id}/foto/{foto_id}
```

**Auth:** Diperlukan (hanya pemilik galeri atau pengurus)

**Response 200:**
```json
{
  "message": "Foto berhasil dihapus."
}
```

---

## 14. Voting API

### 14.1 List Voting

```
GET /api/v1/voting
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan judul |
| `status` | string | `aktif` / `selesai` / `draft` |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "judul": "Pemilihan Ketua RT 2024",
      "deskripsi": "Pilih ketua RT periode 2024-2027",
      "deadline": "2024-06-30",
      "status": "aktif",
      "suara_count": 45,
      "created_at": "2024-06-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 14.2 Buat Voting

```
POST /api/v1/voting
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `judul` | string | Ya | Judul voting |
| `deskripsi` | string | Tidak | Deskripsi voting |
| `deadline` | date | Tidak | Batas waktu (YYYY-MM-DD) |
| `status` | string | Tidak | `aktif` / `selesai` / `draft` |
| `pilihan` | array | Ya | Min. 2 pilihan (array of string) |

**Contoh Request:**
```json
{
  "judul": "Pemilihan Ketua RT 2024",
  "deskripsi": "Pilih ketua RT periode 2024-2027",
  "deadline": "2024-06-30",
  "status": "aktif",
  "pilihan": ["Pak Ahmad", "Pak Budi", "Pak Cahyo"]
}
```

**Response 201:**
```json
{
  "message": "Voting berhasil dibuat.",
  "voting": {
    "id": 1,
    "judul": "Pemilihan Ketua RT 2024",
    "deskripsi": "Pilih ketua RT periode 2024-2027",
    "deadline": "2024-06-30",
    "status": "aktif",
    "pilihan": [
      { "id": 1, "voting_id": 1, "nama": "Pak Ahmad", "votes": 0 },
      { "id": 2, "voting_id": 1, "nama": "Pak Budi", "votes": 0 },
      { "id": 3, "voting_id": 1, "nama": "Pak Cahyo", "votes": 0 }
    ]
  }
}
```

---

### 14.3 Detail Voting

```
GET /api/v1/voting/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "voting": {
    "id": 1,
    "judul": "Pemilihan Ketua RT 2024",
    "deskripsi": "Pilih ketua RT periode 2024-2027",
    "deadline": "2024-06-30",
    "status": "aktif",
    "suara_count": 45,
    "pilihan": [
      { "id": 1, "nama": "Pak Ahmad", "votes": 20 },
      { "id": 2, "nama": "Pak Budi", "votes": 15 },
      { "id": 3, "nama": "Pak Cahyo", "votes": 10 }
    ]
  }
}
```

---

### 14.4 Update Voting

```
PUT /api/v1/voting/{id}
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `judul` | string | Tidak | Judul voting |
| `deskripsi` | string | Tidak | Deskripsi |
| `deadline` | date | Tidak | Batas waktu |
| `status` | string | Tidak | `aktif` / `selesai` / `draft` |

**Response 200:**
```json
{
  "message": "Voting berhasil diperbarui.",
  "voting": { ... }
}
```

---

### 14.5 Hapus Voting

```
DELETE /api/v1/voting/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Voting berhasil dihapus."
}
```

---

### 14.6 Berikan Suara

```
POST /api/v1/voting/{id}/vote
```

**Auth:** Diperlukan

> Setiap user hanya dapat memberikan suara **satu kali** per voting. Voting harus berstatus `aktif`.

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `pilihan_id` | integer | Ya | ID pilihan yang dipilih |

**Contoh Request:**
```json
{
  "pilihan_id": 2
}
```

**Response 200:**
```json
{
  "message": "Suara berhasil diberikan.",
  "pilihan": {
    "id": 2,
    "voting_id": 1,
    "nama": "Pak Budi",
    "votes": 16
  }
}
```

**Response 422 (Sudah vote):**
```json
{
  "message": "Anda sudah memberikan suara pada voting ini."
}
```

**Response 422 (Voting tidak aktif):**
```json
{
  "message": "Voting sudah tidak aktif."
}
```

---

### 14.7 Tambah Pilihan Voting

```
POST /api/v1/voting/{id}/pilihan
```

**Auth:** Diperlukan

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `nama` | string | Ya | Nama pilihan |

**Response 201:**
```json
{
  "message": "Pilihan berhasil ditambahkan.",
  "pilihan": { "id": 4, "voting_id": 1, "nama": "Pak Dedi", "votes": 0 }
}
```

---

### 14.8 Hapus Pilihan Voting

```
DELETE /api/v1/voting/{voting_id}/pilihan/{pilihan_id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "message": "Pilihan berhasil dihapus."
}
```

---

## 15. Marketplace API

### 15.1 List Item Marketplace

```
GET /api/v1/marketplace
```

**Auth:** Diperlukan

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan judul atau deskripsi |
| `kategori` | string | Filter berdasarkan kategori |
| `status` | string | `tersedia` / `terjual` / `dihapus` |
| `harga_min` | integer | Filter harga minimum |
| `harga_max` | integer | Filter harga maksimum |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "judul": "Meja Makan Kayu Jati",
      "deskripsi": "Meja makan 6 kursi kondisi baik",
      "harga": 2500000,
      "kategori": "furnitur",
      "gambar": "marketplace/meja.jpg",
      "status": "tersedia",
      "user": { "id": 5, "name": "Budi Santoso" },
      "created_at": "2024-06-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 15.2 Tambah Item Marketplace

```
POST /api/v1/marketplace
```

**Auth:** Diperlukan

**Content-Type:** `multipart/form-data` (jika ada gambar), atau `application/json`

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `judul` | string | Ya | Judul item |
| `deskripsi` | string | Tidak | Deskripsi item |
| `harga` | integer | Ya | Harga dalam rupiah |
| `kategori` | string | Tidak | Kategori item |
| `gambar` | file | Tidak | Foto item (maks. 5MB, format gambar) |
| `status` | string | Tidak | `tersedia` / `terjual` / `dihapus` |

**Contoh Request:**
```json
{
  "judul": "Meja Makan Kayu Jati",
  "deskripsi": "Meja makan 6 kursi kondisi baik",
  "harga": 2500000,
  "kategori": "furnitur",
  "status": "tersedia"
}
```

**Response 201:**
```json
{
  "message": "Item berhasil ditambahkan.",
  "item": {
    "id": 1,
    "judul": "Meja Makan Kayu Jati",
    "harga": 2500000,
    "kategori": "furnitur",
    "gambar": "marketplace/xxx.jpg",
    "status": "tersedia",
    "user": { "id": 5, "name": "Budi Santoso" }
  }
}
```

---

### 15.3 Detail Item Marketplace

```
GET /api/v1/marketplace/{id}
```

**Auth:** Diperlukan

**Response 200:**
```json
{
  "item": {
    "id": 1,
    "judul": "Meja Makan Kayu Jati",
    "deskripsi": "Meja makan 6 kursi kondisi baik",
    "harga": 2500000,
    "kategori": "furnitur",
    "gambar": "marketplace/xxx.jpg",
    "status": "tersedia",
    "user": { "id": 5, "name": "Budi Santoso" },
    "created_at": "2024-06-01T00:00:00.000000Z"
  }
}
```

---

### 15.4 Update Item Marketplace

```
PUT /api/v1/marketplace/{id}
```

**Auth:** Diperlukan (hanya pemilik atau pengurus)

**Content-Type:** `multipart/form-data` (jika ada gambar baru)

**Request Body:** Sama seperti POST, semua field opsional. Jika field `gambar` disertakan, foto lama akan diganti.

**Response 200:**
```json
{
  "message": "Item berhasil diperbarui.",
  "item": { ... }
}
```

---

### 15.5 Hapus Item Marketplace

```
DELETE /api/v1/marketplace/{id}
```

**Auth:** Diperlukan (hanya pemilik atau pengurus)

**Response 200:**
```json
{
  "message": "Item berhasil dihapus."
}
```

---

## 16. Users API

> **Akses:** Hanya untuk user dengan role **pengurus**.

### 16.1 List Users

```
GET /api/v1/users
```

**Auth:** Diperlukan (pengurus)

**Query Parameters:**
| Parameter | Tipe | Keterangan |
|-----------|------|-----------|
| `search` | string | Cari berdasarkan nama atau email |
| `role_id` | integer | Filter berdasarkan role |
| `page` | integer | Halaman |
| `per_page` | integer | Default: 15 |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin Perumahan",
      "email": "admin@rumakita.id",
      "role_id": 1,
      "role": { "id": 1, "name": "pengurus", "label": "Pengurus" },
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 16.2 Tambah User

```
POST /api/v1/users
```

**Auth:** Diperlukan (pengurus)

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `name` | string | Ya | Nama user |
| `email` | string | Ya | Email unik |
| `password` | string | Ya | Password (min. 8 karakter) |
| `role_id` | integer | Tidak | ID role |

**Contoh Request:**
```json
{
  "name": "Warga Baru",
  "email": "warga@email.com",
  "password": "password123",
  "role_id": 2
}
```

**Response 201:**
```json
{
  "message": "User berhasil dibuat.",
  "user": {
    "id": 10,
    "name": "Warga Baru",
    "email": "warga@email.com",
    "role": { "id": 2, "name": "warga", "label": "Warga" }
  }
}
```

---

### 16.3 Detail User

```
GET /api/v1/users/{id}
```

**Auth:** Diperlukan (pengurus)

**Response 200:**
```json
{
  "user": {
    "id": 10,
    "name": "Warga Baru",
    "email": "warga@email.com",
    "role": { "id": 2, "name": "warga", "label": "Warga" },
    "created_at": "2024-06-01T00:00:00.000000Z"
  }
}
```

---

### 16.4 Update User

```
PUT /api/v1/users/{id}
```

**Auth:** Diperlukan (pengurus)

**Request Body:**
| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `name` | string | Tidak | Nama baru |
| `email` | string | Tidak | Email baru |
| `password` | string | Tidak | Password baru (min. 8 karakter) |
| `role_id` | integer | Tidak | ID role baru |

**Response 200:**
```json
{
  "message": "User berhasil diperbarui.",
  "user": { ... }
}
```

---

### 16.5 Hapus User

```
DELETE /api/v1/users/{id}
```

**Auth:** Diperlukan (pengurus)

> Tidak dapat menghapus akun diri sendiri.

**Response 200:**
```json
{
  "message": "User berhasil dihapus."
}
```

**Response 422 (Hapus diri sendiri):**
```json
{
  "message": "Tidak dapat menghapus akun sendiri."
}
```

---

## 17. HTTP Status Codes

| Kode | Nama | Keterangan |
|------|------|-----------|
| `200` | OK | Request berhasil |
| `201` | Created | Resource berhasil dibuat |
| `401` | Unauthorized | Token tidak ada atau tidak valid |
| `403` | Forbidden | Tidak memiliki izin akses |
| `404` | Not Found | Resource tidak ditemukan |
| `422` | Unprocessable Entity | Validasi gagal atau bisnis rule dilanggar |
| `500` | Internal Server Error | Kesalahan server |

---

## Catatan Implementasi Android

### Setup Retrofit + OkHttp

```kotlin
// ApiClient.kt
object ApiClient {
    private const val BASE_URL = "http://your-domain.com/api/v1/"

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val token = TokenManager.getToken()  // Ambil dari SharedPreferences
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Accept", "application/json")
                .build()
            chain.proceed(request)
        }
        .build()

    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
}
```

### Contoh API Interface

```kotlin
interface RumakitaApi {
    // Auth
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<LoginResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<MessageResponse>

    // Warga
    @GET("warga")
    suspend fun getWarga(
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1,
        @Query("per_page") perPage: Int = 15
    ): Response<PaginatedResponse<Warga>>

    @POST("warga")
    suspend fun createWarga(@Body body: WargaRequest): Response<WargaResponse>

    // Upload foto galeri (multipart)
    @Multipart
    @POST("galeri/{id}/foto")
    suspend fun uploadFoto(
        @Path("id") galeriId: Int,
        @Part foto: List<MultipartBody.Part>
    ): Response<FotoResponse>
}
```

### Mengakses URL Gambar

File yang diunggah tersimpan di storage Laravel. Tambahkan base URL storage untuk menampilkan gambar:

```
http://your-domain.com/storage/{path}
```

Contoh: jika `path` = `marketplace/abc.jpg`, maka URL lengkapnya:
```
http://your-domain.com/storage/marketplace/abc.jpg
```

> Pastikan sudah menjalankan `php artisan storage:link` di server.

---

*Dokumentasi ini dibuat untuk Rumakita API v1. Diperbarui: Mei 2026.*
