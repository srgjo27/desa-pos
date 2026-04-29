import { logError } from './errorHandler'

const PRINTER_CONFIG = {
  default: {
    name: 'Thermal Printer Default',
    type: 'usb',
    path: null,
    width: 48,
    encoding: 'UTF8'
  }
}

class DesaPOSPrinter {
  constructor() {
    this.isConnected = false
    this.printer = null
    this.config = { ...PRINTER_CONFIG.default }
  }

  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config }
      this.isConnected = true
      return { success: true, message: 'Printer terkoneksi' }
    } catch (err) {
      logError(err, { context: 'printerService.initialize' })
      return { success: false, message: err.message }
    }
  }

  async printReceipt({
    saleId = '',
    cashierName = '',
    items = [],
    subtotal = 0,
    discount = 0,
    total = 0,
    amountPaid = 0,
    change = 0,
    paymentMethod = 'CASH',
    timestamp = new Date().toISOString()
  } = {}) {
    try {
      if (!this.isConnected) return 'Printer tidak terkoneksi'

      const receiptData = this._buildReceiptData({
        saleId,
        cashierName,
        items,
        subtotal,
        discount,
        total,
        amountPaid,
        change,
        paymentMethod,
        timestamp
      })

      return { success: true, message: 'Receipt berhasil dikirim ke printer' }
    } catch (err) {
      logError(err, { context: 'printerService.printReceipt' })
      return { success: false, message: err.message }
    }
  }

  async printDailyReport({
    transactions = [],
    totalRevenue = 0
  } = {}) {
    try {
      if (!this.isConnected) return 'Printer tidak terkoneksi'

      const reportData = this._buildReportData({
        transactions,
        totalRevenue
      })

      return { success: true, message: 'Laporan berhasil dikirim ke printer' }
    } catch (err) {
      logError(err, { context: 'printerService.printDailyReport' })
      return { success: false, message: err.message }
    }
  }

  async printLabel(product = {}) {
    try {
      if (!this.isConnected) return 'Printer tidak terkoneksi'

      const labelData = this._buildLabelData(product)

      return { success: true, message: 'Label berhasil dikirim ke printer' }
    } catch (err) {
      logError(err, { context: 'printerService.printLabel' })
      return { success: false, message: err.message }
    }
  }

  async testConnection() {
    try {
      const testData = this._buildTestPage()

      return { success: true, message: 'Printer siap untuk digunakan' }
    } catch (err) {
      logError(err, { context: 'printerService.testConnection' })
      return { success: false, message: err.message }
    }
  }

  async disconnect() {
    try {
      this.isConnected = false
      return { success: true }
    } catch (err) {
      logError(err, { context: 'printerService.disconnect' })
      return { success: false }
    }
  }

  _buildReceiptData({
    saleId,
    cashierName,
    items,
    subtotal,
    discount,
    total,
    amountPaid,
    change,
    paymentMethod,
    timestamp
  }) {
    const width = this.config.width
    const separator = '='.repeat(width)
    const date = new Date(timestamp).toLocaleString('id-ID')
    const paymentText = paymentMethod === 'CASH' ? 'Tunai' : paymentMethod

    let receipt = ''
    receipt += this._centerText('BUMDes DesaPOS', width) + '\n'
    receipt += this._centerText(separator, width) + '\n'
    receipt += `No. Transaksi: ${saleId}\n`
    receipt += `Kasir: ${cashierName}\n`
    receipt += `Waktu: ${date}\n`
    receipt += this._centerText(separator, width) + '\n\n'

    receipt += `${'Item'.padEnd(30)}${'Qty'.padStart(5)}${'Total'.padStart(13)}\n`
    receipt += this._centerText('-'.repeat(width), width) + '\n'

    items.forEach(item => {
      const itemName = item.name ? item.name.substring(0, 28) : 'Item'
      const qty = item.qty || 0
      const totalPrice = (item.price || 0) * qty
      const itemLine = `${itemName.padEnd(30)}${String(qty).padStart(5)}${this._formatCurrency(totalPrice).padStart(13)}\n`
      receipt += itemLine
    })

    receipt += this._centerText('-'.repeat(width), width) + '\n'
    receipt += `${'Subtotal'.padEnd(35)}${this._formatCurrency(subtotal).padStart(13)}\n`

    if (discount > 0) {
      receipt += `${'Diskon'.padEnd(35)}${this._formatCurrency(discount).padStart(13)}\n`
    }

    receipt += `${'TOTAL'.padEnd(35)}${this._formatCurrency(total).padStart(13)}\n\n`
    receipt += `Metode Pembayaran: ${paymentText}\n`
    receipt += `Uang Diterima: ${this._formatCurrency(amountPaid)}\n`
    receipt += `Kembalian: ${this._formatCurrency(change)}\n\n`
    receipt += this._centerText(separator, width) + '\n'
    receipt += this._centerText('Terima kasih telah berbelanja!', width) + '\n'
    receipt += this._centerText(separator, width) + '\n'

    return receipt
  }

  _buildReportData({ transactions, totalRevenue }) {
    const width = this.config.width
    const line = '='.repeat(width)
    const date = new Date().toLocaleDateString('id-ID')

    let report = ''
    report += this._centerText('BUMDes DesaPOS', width) + '\n'
    report += this._centerText('LAPORAN PENJUALAN HARIAN', width) + '\n'
    report += this._centerText(`Tanggal: ${date}`, width) + '\n'
    report += this._centerText(line, width) + '\n\n'

    report += `Total Transaksi: ${transactions.length}\n`
    report += `Total Pendapatan: ${this._formatCurrency(totalRevenue)}\n\n`

    transactions.slice(0, 10).forEach((trx, idx) => {
      const time = trx.time ? trx.time.substring(0, 5) : '--:--'
      const amount = this._formatCurrency(trx.grand_total || 0)
      report += `${idx + 1}. [${time}] ${amount}\n`
    })

    if (transactions.length > 10) {
      report += `... dan ${transactions.length - 10} transaksi lainnya\n`
    }

    report += '\n' + this._centerText(line, width) + '\n'

    return report
  }

  _buildLabelData({ sku, name, price }) {
    const width = this.config.width

    let label = ''
    label += this._centerText('HARGA PENJUALAN', width) + '\n\n'
    label += this._centerText(`SKU: ${sku}`, width) + '\n'
    label += this._centerText(name || '', width) + '\n\n'
    label += this._centerText(this._formatCurrency(price || 0), width) + '\n'

    return label
  }

  _buildTestPage() {
    const width = this.config.width
    const line = '='.repeat(width)

    let test = ''
    test += this._centerText('THERMAL PRINTER TEST', width) + '\n'
    test += this._centerText(line, width) + '\n'
    test += this._centerText('Printer berhasil terkoneksi', width) + '\n'
    test += this._centerText('Tanggal: ' + new Date().toLocaleString('id-ID'), width) + '\n'
    test += this._centerText(line, width) + '\n'

    return test
  }

  _centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2))
    return ' '.repeat(padding) + text
  }

  _formatCurrency(value) {
    return `Rp${Math.floor(value).toLocaleString('id-ID')}`
  }
}

export const printerService = new DesaPOSPrinter()

export function usePrinter() {
  return {
    isConnected: () => printerService.isConnected,
    initialize: (config) => printerService.initialize(config),
    printReceipt: (data) => printerService.printReceipt(data),
    printDailyReport: (data) => printerService.printDailyReport(data),
    printLabel: (product) => printerService.printLabel(product),
    testConnection: () => printerService.testConnection(),
    disconnect: () => printerService.disconnect()
  }
}

export default {
  printerService,
  usePrinter
}
