
## Product Requirements Document (PRD): DesaPOS

### 1. Tujuan & Solusi

* **Tujuan:** Menyediakan sistem kasir dan pencatatan inventaris yang ringan, responsif, dan mudah digunakan oleh pengurus BUMDes dengan literasi digital menengah ke bawah.
* **Solusi & Fitur Utama:**
* **Interactive POS Register (Vue 3 + Pinia):** Halaman kasir yang super cepat. Keranjang belanja (*cart*) disimpan di State Management (Pinia) agar tidak hilang saat pindah menu.
* **Offline-First (PWA):** Menggunakan *Service Workers* agar aplikasi tetap bisa dipakai mencatat transaksi saat desa mati lampu atau internet putus, lalu akan melakukan *sync* ke server saat internet kembali (memenuhi poin optimasi performa di JD).
* **Role-Based Access:** Kasir (hanya melayani transaksi) vs. Kepala BUMDes (bisa melihat *dashboard* laba/rugi).
* **One-Click Report:** Meng-*generate* laporan transaksi harian/bulanan dalam format PDF yang rapi.

### 2. Alur Bisnis (Business Flow)

1. **Login & Shift:** Kasir *login* menggunakan PIN/Password dan memulai *shift* harian (mencatat uang modal di laci kasir).
2. **Transaksi:** Kasir memilih barang dari layar (menggunakan UI berbasis *Grid Component*), sistem otomatis menghitung total harga, diskon, dan kembalian.
3. **Checkout & Struk:** Transaksi selesai, memotong stok inventaris di *backend*. Sistem mencetak struk thermal (via koneksi Bluetooth/USB) atau mengirim nota via WhatsApp.
4. **Reporting:** Di akhir bulan, Kepala BUMDes membuka *dashboard* analitik untuk melihat barang paling laku dan total omzet.

### 3. Stack Teknologi

Kita akan memaksimalkan Vue.js di Frontend, dan menggunakan layanan *Backend-as-a-Service* (BaaS) agar Anda bisa fokus merilis produk ini dengan cepat tanpa pusing mengurus infrastruktur *server* backend yang mahal di awal.

* **Frontend:**
* **Framework:** Vue 3 (Composition API).
* **Build Tool:** Vite (Sangat cepat untuk *development* dan *build*).
* **State Management:** Pinia (Standar baru pengganti Vuex).
* **Styling & UI:** TailwindCSS + Headless UI (Untuk membuat komponen *modal*, *dropdown*, *table* yang *reusable* dan responsif).
* **API Client:** Axios (Terintegrasi dengan *interceptors* untuk token JWT).

* **Backend & Database (Live Ready):**
* **Supabase:** Menyediakan PostgreSQL database, *Authentication*, dan RESTful API secara otomatis. Ini sangat *powerful* untuk *Solo Developer* yang ingin produknya langsung *live* di *production*.

* **Hosting:** Vercel atau Netlify (Frontend).

### 4. Skema Sistem (Architecture)

Sistem ini menggunakan arsitektur *Client-Server* modern:

* **Vue SPA (Client):** Menangani semua UI, validasi *form*, dan *state* keranjang kasir. Disajikan via Vercel (CDN).
* **Supabase (BaaS):** Bertindak sebagai penyedia REST API. Vue.js akan melakukan GET/POST *request* ke Supabase. Supabase menangani keamanan data (Row Level Security).

### 5. Skema Database (PostgreSQL)

Tabel dirancang agar relasional dan menjaga integritas data keuangan:

| Tabel | Kolom Penting | Relasi |
| --- | --- | --- |
| **users** | `id`, `name`, `role` (KASIR, ADMIN), `pin` | Karyawan BUMDes |
| **products** | `id`, `sku`, `name`, `price`, `stock`, `image_url` | Master data barang |
| **sales** | `id`, `user_id`, `total_amount`, `payment_method`, `created_at` | Header nota transaksi |
| **sale_items** | `id`, `sale_id`, `product_id`, `qty`, `price_at_sale` | Detail barang yang dibeli pada satu nota |

*(Catatan: `price_at_sale` sangat penting! Harga barang bisa berubah besok, tapi harga di nota masa lalu tidak boleh berubah).*

---