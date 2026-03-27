import axios from 'axios'
import { logError } from './errorHandler'
import { formatRupiah } from '@/utils/formatCurrency'

class WhatsAppService {
  constructor() {
    this.provider = import.meta.env.VITE_WHATSAPP_PROVIDER || 'webhook'
    this.apiUrl = import.meta.env.VITE_WHATSAPP_API_URL || null
    this.apiKey = import.meta.env.VITE_WHATSAPP_API_KEY || null
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || null
    this.businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || null
    this.isConfigured = this._validateConfig()
  }

  _validateConfig() {
    if (!this.apiUrl) return false
    if (!this.apiKey) return false
    if (this.provider === 'official' && !this.phoneNumberId) return false

    return true
  }

  async sendReceipt({
    customerPhone = '',
    saleId = '',
    cashierName = '',
    items = [],
    total = 0,
    change = 0,
    paymentMethod = 'CASH'
  } = {}) {
    try {
      if (!this.isConfigured) return { success: false, error: 'WhatsApp API belum dikonfigurasi' }
      if (!customerPhone) return 'Nomor WA customer diperlukan'

      const phone = this._normalizePhoneNumber(customerPhone)

      const receiptMessage = this._buildReceiptMessage({
        saleId,
        cashierName,
        items,
        total,
        change,
        paymentMethod
      })

      let result
      if (this.provider === 'official') {
        result = await this._sendViaOfficial(phone, receiptMessage)
      } else if (this.provider === 'twilio') {
        result = await this._sendViaTwilio(phone, receiptMessage)
      } else {
        result = await this._sendViaWebhook(phone, receiptMessage)
      }

      if (!result.success) return { success: false, error: result.error }

      return { success: true, messageId: result.messageId }
    } catch (err) {
      logError(err, { context: 'whatsappService.sendReceipt', phone: customerPhone })
      return { success: false, error: err.message }
    }
  }

  async sendDailyReport({
    adminPhone = '',
    transactions = [],
    totalRevenue = 0,
    totalCost = 0,
    grossProfit = 0
  } = {}) {
    try {
      if (!this.isConfigured) return { success: false, error: 'WhatsApp API belum dikonfigurasi' }
      if (!adminPhone) return { success: false, error: 'Nomor WA admin diperlukan' }

      const phone = this._normalizePhoneNumber(adminPhone)

      const reportMessage = this._buildReportMessage({
        transactions,
        totalRevenue,
        totalCost,
        grossProfit
      })

      let result
      if (this.provider === 'official') {
        result = await this._sendViaOfficial(phone, reportMessage)
      } else if (this.provider === 'twilio') {
        result = await this._sendViaTwilio(phone, reportMessage)
      } else {
        result = await this._sendViaWebhook(phone, reportMessage)
      }

      if (!result.success) return { success: false, error: result.error }

      return { success: true, messageId: result.messageId }
    } catch (err) {
      logError(err, { context: 'whatsappService.sendDailyReport', phone: adminPhone })
      return { success: false, error: err.message }
    }
  }

  _buildReceiptMessage({ saleId, cashierName, items, total, change, paymentMethod }) {
    const date = new Date().toLocaleString('id-ID')
    const paymentText = paymentMethod === 'CASH' ? 'Tunai' : paymentMethod

    let message = '*🛒 NOTA PEMBELIAN*\n'
    message += `_DesaPOS - Toko Official_\n\n`

    message += `*No. Transaksi:* ${saleId}\n`
    message += `*Waktu:* ${date}\n`
    message += `*Kasir:* ${cashierName}\n\n`

    message += '*─────────────────*\n'
    message += '*DETAIL BARANG*\n'
    message += '*─────────────────*\n'

    items.forEach((item, idx) => {
      const itemTotal = (item.price || 0) * (item.qty || 0)
      message += `${idx + 1}. ${item.name}\n`
      message += `   ${item.qty}x @ ${formatRupiah(item.price | 0)} = ${formatRupiah(itemTotal)}\n`
    })

    message += '*─────────────────*\n'
    message += `*TOTAL: ${formatRupiah(total)}*\n`
    message += `*Pembayaran: ${paymentText}*\n`

    if (change > 0) {
      message += `*Kembalian: ${formatRupiah(change)}*\n`
    }

    message += '*─────────────────*\n'
    message += '\n_Terima kasih telah berbelanja! 🙏_\n'
    message += '_Semoga puas dengan pelayanan kami_ 😊'

    return message
  }

  _buildReportMessage({ transactions, totalRevenue, totalCost, grossProfit }) {
    const date = new Date().toLocaleDateString('id-ID')

    let message = '*📊 LAPORAN PENJUALAN HARIAN*\n'
    message += `_Tanggal: ${date}_\n\n`

    message += `*Total Transaksi:* ${transactions.length}\n`
    message += `*Total Pendapatan:* ${formatRupiah(totalRevenue)}\n`
    message += `*Total HPP:* ${formatRupiah(totalCost)}\n`
    message += `*Laba Kotor:* ${formatRupiah(grossProfit)}\n\n`

    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : 0
    message += `*Profit Margin:* ${profitMargin}%\n\n`

    if (transactions.length > 0) {
      message += '*Top Transaksi:*\n'
      transactions
        .sort((a, b) => (b.grand_total || 0) - (a.grand_total || 0))
        .slice(0, 5)
        .forEach((trx, idx) => {
          message += `${idx + 1}. ${formatRupiah(trx.grand_total || 0)}\n`
        })
    }

    message += '\n_Generated by DesaPOS_'

    return message
  }

  _normalizePhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '')

    if (cleaned.startsWith('62')) {
      return cleaned
    }

    if (cleaned.startsWith('0')) {
      return '62' + cleaned.substring(1)
    }

    return '62' + cleaned
  }

  async _sendViaOfficial(phone, message) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const messageId = response.data?.messages?.[0]?.id

      return { success: true, messageId }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message }
    }
  }

  async _sendViaTwilio(phone, message) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/Messages.json`,
        {
          From: `whatsapp:${this.phoneNumberId}`,
          To: `whatsapp:+${phone}`,
          Body: message
        },
        {
          auth: {
            username: this.phoneNumberId,
            password: this.apiKey
          }
        }
      )

      const messageId = response.data?.sid

      return { success: true, messageId }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message }
    }
  }

  async _sendViaWebhook(phone, message) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          phone,
          message,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const messageId = response.data?.messageId || response.data?.id

      return { success: true, messageId }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message }
    }
  }
}

export const whatsappService = new WhatsAppService()

export function useWhatsApp() {
  return {
    isConfigured: () => whatsappService.isConfigured,
    sendReceipt: (data) => whatsappService.sendReceipt(data),
    sendDailyReport: (data) => whatsappService.sendDailyReport(data)
  }
}

export default {
  whatsappService,
  useWhatsApp
}
