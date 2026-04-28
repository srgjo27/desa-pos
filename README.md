# 🏪 DesaPOS - Sistem Kasir & Inventaris BUMDes

Sistem Point of Sales (POS) modern yang dirancang khusus untuk **Badan Usaha Milik Desa (BUMDes)** dengan fokus pada kemudahan penggunaan, performa tinggi, dan kemampuan offline-first.

> **DesaPOS** adalah solusi terintegrasi untuk mengelola penjualan, inventaris, dan laporan keuangan dengan antarmuka yang ramah pengguna dan responsif di semua perangkat.

---

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Requirements & Prerequisites](#requirements--prerequisites)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi](#konfigurasi)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Development Workflow](#development-workflow)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Fitur Utama

### 🛒 **Sistem Kasir Interaktif**
- Interface kasir yang responsif dan intuitif
- Keranjang belanja real-time dengan state management (Pinia)
- Perhitungan otomatis: subtotal, diskon, pajak, kembalian
- Dukungan multiple payment methods

### 📱 **Offline-First Architecture (PWA)**
- Progressive Web App untuk pengalaman seperti aplikasi native
- Service Workers untuk sinkronisasi data otomatis
- Berfungsi optimal saat internet mati (offline mode)
- Sinkronisasi data otomatis ketika internet kembali

### 🔐 **Role-Based Access Control (RBAC)**
- **Kasir:** Dapat melakukan transaksi penjualan
- **Admin/Kepala BUMDes:** Akses ke analytics, inventory management, dan reporting
- Sistem autentikasi berbasis PIN/Password dengan JWT

### 📊 **Dashboard Analytics & Reporting**
- Dashboard penjualan dengan grafik interaktif (Chart.js)
- Analisis profit/rugi per periode
- Laporan inventaris dan pergerakan stok
- Export laporan ke PDF dengan formatting profesional

### 🧾 **Receipt & Printing**
- Generate struk transaksi otomatis
- Dukungan print thermal printer via Bluetooth/USB
- Opsi kirim nota via WhatsApp
- Preview sebelum print

### 📦 **Manajemen Inventaris**
- CRUD produk dengan foto produk
- Tracking stok real-time
- Alert ketika stok menipis
- History pergerakan barang

### 👥 **Manajemen User & Shift**
- Kelola user kasir dan admin
- Tracking shift kerja karyawan (buka/tutup shift)
- Monitoring durasi kerja dan target jam kerja
- History absensi per karyawan

---

## 🔧 Tech Stack

### **Frontend**
| Technology | Versi | Tujuan |
|-----------|-------|--------|
| **Vue.js** | 3.5.13 | Framework SPA utama |
| **Vite** | 6.3.1 | Build tool & dev server |
| **Pinia** | 3.0.1 | State Management |
| **Vue Router** | 4.5.0 | Client-side routing |
| **TailwindCSS** | 4.1.0 | Styling & UI framework |
| **Headless UI** | 1.7.23 | UI components (reusable) |
| **Chart.js** | 4.5.1 | Visualisasi data & grafik |
| **Vue-ChartJS** | 5.3.3 | Vue wrapper untuk Chart.js |
| **Axios** | 1.8.4 | HTTP client & API calls |
| **jsPDF** | 4.2.1 | Generate laporan PDF |
| **html2canvas** | 1.4.1 | Screenshot untuk PDF export |
| **Vite PWA Plugin** | 1.2.0 | Progressive Web App setup |

### **Backend & Database**
| Technology | Fungsi |
|-----------|--------|
| **Supabase** | PostgreSQL Database, REST API, Authentication |
| **JWT** | Token-based authentication |

### **DevOps & Tools**
| Tool | Versi | Tujuan |
|------|-------|--------|
| **Node.js** | 18+ | Runtime environment |
| **npm/yarn** | - | Package manager |
| **Git** | - | Version control |

---

## 📋 Requirements & Prerequisites

### **System Requirements**
- **Node.js** versi 18.x atau lebih baru
- **npm** atau **yarn** package manager
- **Browser modern** (Chrome, Firefox, Safari, Edge - versi terbaru)

### **Akses & Account**
- Akun **Supabase** (gratis tersedia di https://supabase.com)
- PostgreSQL database URL dari Supabase
- API Key dari Supabase

---

## 🚀 Instalasi & Setup

### **Step 1: Clone Repository**
```bash
# Clone project dari repository
git clone https://github.com/your-repo/desa-pos.git
cd desa-pos
```

### **Step 2: Install Dependencies**
```bash
# Menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

### **Step 3: Setup Environment Variables**
Buat file `.env.local` di root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration (opsional)
VITE_API_TIMEOUT=30000
VITE_APP_NAME=DesaPOS
```

**Cara mendapatkan Supabase credentials:**
1. Buat project di https://supabase.com
2. Buka menu "Settings" → "API"
3. Copy `Project URL` dan `anon public key`
4. Paste ke file `.env.local`

### **Step 4: Konfigurasi Database**
Supabase akan setup database secara otomatis. Tabel-tabel yang diperlukan:

```sql
-- Tables akan di-seed melalui Supabase console
-- Atau gunakan SQL scripts yang ada di folder: /database/migrations/
```

---

## ⚙️ Konfigurasi

### **Konfigurasi Supabase (supabase.js)**
```javascript
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### **Konfigurasi Axios (axios.js)**
```javascript
// src/services/axios.js
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000
})

// Add JWT token ke setiap request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### **Konfigurasi Vite (vite.config.js)**
```javascript
// vite.config.js - sudah di-configure dengan:
// - Vue 3 plugin
// - TailwindCSS
// - PWA plugin untuk offline support
// - Path aliases (@/ untuk src/)
```

### **Konfigurasi PWA (vite.config.js)**
```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'DesaPOS - Sistem Kasir BUMDes',
    description: 'Sistem kasir dan inventaris untuk BUMDes yang responsif dan offline-first'
  }
})
```

---

## 📁 Struktur Proyek

```
desa-pos/
├── public/                          # Static assets
├── src/
│   ├── assets/
│   │   └── main.css                # Global styles
│   ├── components/                 # Reusable Vue components
│   │   ├── SessionTimeoutWarning.vue
│   │   ├── inventory/
│   │   │   ├── AddProductModal.vue
│   │   │   ├── EditProductModal.vue
│   │   │   └── ...
│   │   ├── pos/
│   │   │   ├── CheckoutModal.vue
│   │   │   ├── ReceiptModal.vue
│   │   │   └── CloseShiftModal.vue
│   │   └── ui/
│   │       ├── BaseButton.vue
│   │       └── BaseInput.vue
│   ├── composables/                # Vue composition functions
│   │   ├── useAnalytics.js        # Analytics logic
│   │   ├── useChartAnalytics.js   # Chart data preparation
│   │   ├── useAuth.js             # Authentication
│   │   ├── useCheckout.js         # Checkout logic
│   │   ├── useInventory.js        # Inventory management
│   │   ├── usePosTrxState.js      # POS transaction state
│   │   ├── useShift.js            # Shift management
│   │   ├── useUsers.js            # User management
│   │   └── ...
│   ├── layouts/
│   │   ├── AdminLayout.vue        # Admin dashboard layout
│   │   └── AuthLayout.vue         # Auth page layout
│   ├── pages/                      # Page components
│   │   ├── LoginPage.vue
│   │   ├── admin/
│   │   │   ├── AnalyticsPage.vue
│   │   │   ├── InventoryPage.vue
│   │   │   ├── ShiftsPage.vue
│   │   │   ├── UsersPage.vue
│   │   │   └── UserDetailPage.vue
│   │   └── kasir/
│   │       ├── OpenShiftPage.vue
│   │       └── PosTrxPage.vue
│   ├── router/
│   │   └── index.js               # Vue Router configuration
│   ├── services/
│   │   ├── supabase.js            # Supabase client
│   │   ├── axios.js               # Axios instance
│   │   ├── errorHandler.js        # Error handling
│   │   ├── pdfExportService.js    # PDF export logic
│   │   ├── printerService.js      # Thermal printer integration
│   │   ├── imageService.js        # Image upload handling
│   │   ├── whatsappService.js     # WhatsApp integration
│   │   └── activityLogService.js  # Activity logging
│   ├── stores/
│   │   ├── authStore.js           # Auth state (Pinia)
│   │   ├── cartStore.js           # Shopping cart state
│   │   └── shiftStore.js          # Shift state
│   ├── utils/
│   │   ├── formatCurrency.js      # Currency & date formatting
│   │   └── shiftHelpers.js        # Shift calculation helpers
│   ├── App.vue                     # Root component
│   └── main.js                     # Application entry point
├── .env.local                      # Environment variables (gitignored)
├── .gitignore                      # Git ignore rules
├── package.json                    # Project dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # This file
```

---

## 🎯 Menjalankan Aplikasi

### **Development Mode**
```bash
# Start development server dengan hot reload
npm run dev

# Atau dengan yarn
yarn dev

# Server akan berjalan di: http://localhost:5173
```

### **Build untuk Production**
```bash
# Build SPA yang dioptimasi
npm run build

# Atau dengan yarn
yarn build

# Output akan di-generate di folder: dist/
```

### **Preview Production Build**
```bash
# Preview build sebelum deployment
npm run preview

# Atau dengan yarn
yarn preview
```

---

## 🔄 Development Workflow

### **1. Development Loop**
```bash
# Terminal 1: Start dev server
npm run dev

# Buka browser: http://localhost:5173
# File changes akan auto-reload (Hot Module Replacement)
```

### **2. Best Practices**

#### **Composition API (Recommended)**
```javascript
// ✅ GOOD - Menggunakan Composition API
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    
    return { count, doubled }
  }
}
```

#### **Component Structure**
```vue
<script setup>
// Imports
// State management
// Lifecycle hooks
// Methods
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Component styles */
</style>
```

#### **Use Composables untuk Logic Reuse**
```javascript
// ✅ GOOD - Composable untuk shared logic
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// Usage dalam component
import { useCounter } from '@/composables/useCounter'
const { count, increment } = useCounter()
```

#### **Separation of Concerns**
```
View Layer (Component/Page)
    ↓
Business Logic (Composable)
    ↓
Services (API calls, external integrations)
    ↓
State Management (Pinia store)
```

### **3. Code Quality Standards**

**Naming Conventions:**
- Components: PascalCase (`MyComponent.vue`)
- Composables: camelCase dengan `use` prefix (`useAuth.js`)
- Methods/functions: camelCase (`handleClick()`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)

**Formatting:**
```bash
# Format code dengan Prettier (jika configured)
npm run format

# Lint dengan ESLint (jika configured)
npm run lint
```

---

## 📦 Build & Deployment

### **Production Build Checklist**
- [ ] Semua environment variables sudah dikonfigurasi
- [ ] API URLs di-set ke production
- [ ] Database URLs di-arahkan ke production database
- [ ] Error handling & logging sudah siap
- [ ] PWA manifest sudah correct
- [ ] Performance optimization sudah dilakukan

### **Deployment ke Vercel (Recommended)**
```bash
# 1. Push code ke GitHub repository
git push origin main

# 2. Connect repository ke Vercel
# - Buka https://vercel.com
# - Click "New Project"
# - Select GitHub repository
# - Set environment variables

# 3. Deploy otomatis terjadi saat ada push ke main
```

### **Deployment ke Netlify**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login & setup
netlify login
netlify init

# 3. Deploy
npm run build
netlify deploy --prod --dir=dist
```

### **Self-Hosted Deployment**
```bash
# Build
npm run build

# Copy dist/ folder ke server
scp -r dist/ user@server:/var/www/desa-pos/

# Setup nginx reverse proxy (jika diperlukan)
```

---

## 🔍 Troubleshooting

### **Issue: "Cannot find module '@/...'"**
**Solution:** Periksa path alias di `vite.config.js`
```javascript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

### **Issue: Supabase connection error**
**Solution:**
1. Verifikasi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di `.env.local`
2. Cek CORS settings di Supabase dashboard
3. Test koneksi di browser console:
```javascript
import { supabase } from '@/services/supabase'
await supabase.from('users').select('*')
```

### **Issue: PWA tidak bekerja offline**
**Solution:**
1. Build project: `npm run build`
2. Preview build: `npm run preview`
3. Check DevTools → Application → Service Workers
4. Pastikan semua assets ter-cache

### **Issue: CORS error saat API call**
**Solution:**
1. Verifikasi Supabase CORS settings
2. Setup proxy di `vite.config.js` jika diperlukan:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-api.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### **Issue: State tidak persist setelah reload**
**Solution:** Gunakan `pinia-plugin-persistedstate`
```javascript
// main.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

---

## 🤝 Contributing

### **Development Guidelines**
1. Create feature branch: `git checkout -b feature/nama-fitur`
2. Commit dengan pesan yang jelas: `git commit -m "feat: deskripsi singkat"`
3. Push ke branch: `git push origin feature/nama-fitur`
4. Buat Pull Request dengan deskripsi detail

### **Commit Message Format**
```
feat: Tambah fitur baru
fix: Perbaiki bug
refactor: Refactor code
docs: Update dokumentasi
style: Format & styling
test: Tambah test
chore: Update dependencies
```

### **Code Review Checklist**
- [ ] Code mengikuti naming conventions
- [ ] No console.log() di production code
- [ ] Error handling sudah implement
- [ ] Comments untuk logic yang kompleks
- [ ] Component reusable & maintainable
- [ ] Performance considerations

---

## 📝 License

Project ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

---

## 📞 Support & Contact

Untuk support atau pertanyaan, silakan:
- 📧 Email: support@desa-pos.local
- 🐛 Report bugs: Buat issue di GitHub
- 💡 Feature requests: Diskusi di GitHub Discussions

---

## 🙏 Acknowledgments

- **Vue.js** - The Progressive JavaScript Framework
- **Supabase** - Open source Firebase alternative
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Next Generation Frontend Tooling

---

**Last Updated:** April 28, 2026
**Version:** 0.1.0
