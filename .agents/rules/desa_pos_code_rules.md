---
trigger: manual
---

---
name:
description:
---

# Code Rules & Style Guide: DesaPOS Frontend

Dokumen ini adalah panduan wajib bagi semua developer dan *coding agents* (termasuk agen Antigravity) yang berkontribusi pada proyek DesaPOS. Patuhi aturan ini untuk memastikan kode yang dihasilkan sesuai dengan PRD, responsif, berkinerja tinggi, dan ramah untuk pengguna BUMDes.

## 1. Tech Stack Utama
* **Framework:** Vue 3 dengan `<script setup>` (Composition API).
* **Build Tool:** Vite.
* **State Management:** Pinia.
* **Styling:** TailwindCSS v4++ and Headless UI.
* **Network:** Axios (dengan interceptors) & Supabase Client.

## 2. Struktur Folder Proyek
Gunakan struktur berbasis fitur dan pemisahan logika yang jelas:

\`\`\`text
src/
├── assets/          # Gambar, ikon, font
├── components/      # Komponen UI Reusable (Tailwind + Headless UI)
│   ├── ui/          # Button, Modal, Input, Grid (Dumb components)
│   └── pos/         # Komponen spesifik POS (ProductCard, CartList)
├── composables/     # Vue custom hooks (misal: useAuth, useOfflineSync)
├── layouts/         # Layout utama (DashboardLayout, POSLayout)
├── pages/           # Halaman utama aplikasi (Vue Router)
├── router/          # Konfigurasi Vue Router (termasuk Role-Based Route Guards)
├── services/        # Komunikasi API (Axios instance, Supabase calls)
├── stores/          # Pinia stores (authStore, cartStore)
└── utils/           # Fungsi helper (formatRupiah, generatePDF)
\`\`\`

## 3. Aturan Penulisan Vue 3 (Composition API)
* **Selalu gunakan `<script setup>`:** Ini adalah standar modern Vue 3 untuk performa dan keterbacaan yang lebih baik.
* **Pisahkan Logika dari UI:** Jika logika bisnis (seperti perhitungan diskon atau filter barang) mulai panjang, ekstrak menjadi *Composables* (`src/composables/`).
* **Penamaan File:**
    * Komponen & Pages: `PascalCase.vue` (contoh: `ProductGrid.vue`, `PosRegister.vue`).
    * Composables & Utils: `camelCase.ts` (contoh: `useCart.ts`, `formatCurrency.ts`).

## 4. State Management (Pinia) & Interaktivitas Kasir
* **Keranjang Tidak Boleh Hilang:** Gunakan `cartStore` di Pinia untuk menyimpan daftar belanja. Integrasikan dengan `localStorage` (atau plugin `pinia-plugin-persistedstate`) agar keranjang tidak *reset* jika kasir tidak sengaja me-refresh halaman.
* **Perhitungan Reaktif:** Gunakan `computed` properties di dalam Pinia untuk menghitung `total_amount`, total diskon, dan kembalian secara otomatis setiap kali ada perubahan pada `sale_items`.

## 5. Offline-First (PWA) & Sinkronisasi
* **Service Workers:** Konfigurasikan vite-plugin-pwa untuk melakukan *caching* aset statis (HTML, CSS, JS, Gambar) agar aplikasi bisa diakses tanpa internet.
* **Offline Transaction Queue:** Jika internet terputus, simpan transaksi baru ke IndexedDB lokal terlebih dahulu.
* **Background Sync:** Buat *composable* `useOfflineSync` yang akan mendeteksi ketika koneksi kembali (`navigator.onLine`) dan mengirimkan data transaksi lokal (antrean) ke Supabase.

## 6. Integrasi Backend (Supabase & Axios)
* **Axios Interceptors:** Gunakan Axios untuk *request* REST API ke Supabase. Pasang *interceptor* untuk menyisipkan token JWT yang didapat dari autentikasi Supabase ke setiap *request headers*.
* **Role-Based Access Control (RBAC):** Lindungi *router* di frontend berdasarkan `role` (KASIR vs ADMIN). Arahkan KASIR langsung ke halaman POS, dan ADMIN ke Dashboard Laporan.
* **Integritas Harga (Sangat Penting):** Saat melakukan POST ke tabel `sale_items`, pastikan aplikasi frontend mengirimkan `price_at_sale` (harga barang saat itu juga), BUKAN hanya `product_id`. Ini mencegah nota lama berubah jika harga master barang naik di kemudian hari.

## 7. Styling & UI Components
* Gunakan utilitas TailwindCSS untuk *styling*.
* Untuk komponen yang butuh interaksi aksesibilitas tinggi (seperti Dropdown, Modal konfirmasi pembayaran), WAJIB gunakan **Headless UI** agar tidak perlu membuat logika interaksi dari nol.
* Tampilan kasir harus mengandalkan *Grid Component* agar daftar produk mudah di-tap di layar sentuh (tablet/monitor kasir).