export class DesaPOSError extends Error {
  constructor(code, message, detail = null) {
    super(message)
    this.name = 'DesaPOSError'
    this.code = code
    this.detail = detail
    this.timestamp = new Date().toISOString()
  }
}

export const ERROR_CODES = {
  AUTH_INVALID_PIN: 'AUTH_INVALID_PIN',
  AUTH_USER_INACTIVE: 'AUTH_USER_INACTIVE',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  CART_EMPTY: 'CART_EMPTY',
  CHECKOUT_INSUFFICIENT_PAYMENT: 'CHECKOUT_INSUFFICIENT_PAYMENT',
  CHECKOUT_STOCK_ERROR: 'CHECKOUT_STOCK_ERROR',
  
  DB_ERROR: 'DB_ERROR',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  
  NETWORK_ERROR: 'NETWORK_ERROR',
  OFFLINE: 'OFFLINE',
  
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  INVENTORY_DUPLICATE_SKU: 'INVENTORY_DUPLICATE_SKU',
  INVENTORY_PRODUCT_NOT_FOUND: 'INVENTORY_PRODUCT_NOT_FOUND',
  
  UNKNOWN: 'UNKNOWN'
}

export function mapSupabaseError(error) {
  if (!error) return ERROR_CODES.UNKNOWN
  
  if (error.code === '23505') return ERROR_CODES.DB_CONSTRAINT_VIOLATION
  if (error.code === '23503') return ERROR_CODES.DB_ERROR
  if (error.code === 'PGRST116') return ERROR_CODES.DB_NOT_FOUND
  
  return ERROR_CODES.DB_ERROR
}

export function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    code: error?.code || ERROR_CODES.UNKNOWN,
    message: error?.message || 'Unknown error',
    context,
    stack: error?.stack
  }
  
  console.error('[DesaPOS Error]', errorLog)
  
  // TODO: Send to Sentry atau monitoring service di production
  // sentry.captureException(error, { tags: context })
  
  // TODO: Store ke backend untuk error tracking
  // db.errorLogs.add(errorLog)
}

export function getErrorMessage(code) {
  const messages = {
    [ERROR_CODES.AUTH_INVALID_PIN]: 'PIN tidak valid. Silakan coba kembali.',
    [ERROR_CODES.AUTH_USER_INACTIVE]: 'Akun Anda telah dinonaktifkan. Hubungi Admin.',
    [ERROR_CODES.AUTH_UNAUTHORIZED]: 'Anda tidak memiliki akses ke fitur ini.',
    [ERROR_CODES.CART_EMPTY]: 'Keranjang belanja kosong. Pilih barang terlebih dahulu.',
    [ERROR_CODES.CHECKOUT_INSUFFICIENT_PAYMENT]: 'Uang pembayaran tidak cukup.',
    [ERROR_CODES.CHECKOUT_STOCK_ERROR]: 'Stok barang tidak mencukupi untuk transaksi.',
    [ERROR_CODES.INVENTORY_DUPLICATE_SKU]: 'SKU sudah digunakan oleh produk lain.',
    [ERROR_CODES.INVENTORY_PRODUCT_NOT_FOUND]: 'Produk tidak ditemukan.',
    [ERROR_CODES.NETWORK_ERROR]: 'Gagal terhubung ke server. Cek koneksi internet Anda.',
    [ERROR_CODES.OFFLINE]: 'Anda sedang offline. Transaksi akan disimpan dan disinkronkan nanti.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Data tidak valid. Periksa kembali input Anda.',
    [ERROR_CODES.DB_ERROR]: 'Terjadi kesalahan pada sistem. Coba lagi nanti.',
    [ERROR_CODES.DB_NOT_FOUND]: 'Data yang dicari tidak ditemukan.',
  }
  
  return messages[code] || 'Terjadi kesalahan yang tidak terduga.'
}

export function withErrorHandler(asyncFn) {
  return async function(...args) {
    try {
      return await asyncFn(...args)
    } catch (err) {
      logError(err, { function: asyncFn.name, args })
      throw err
    }
  }
}
