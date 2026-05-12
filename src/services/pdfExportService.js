import jsPDF from 'jspdf'
import { formatRupiah } from '@/utils/format'

export async function generateDailySalesReport({
  title = 'Laporan Penjualan',
  bulan = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
  transactions = [],
  totalRevenue = 0,
  totalCost = 0,
  gross_profit = 0,
  transaction_count = 0
} = {}) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = 15

    // Header Section
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 80, 20)
    doc.text('BUMDes DesaPOS', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 8
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 6
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Periode: ${bulan}`, pageWidth / 2, yPosition, { align: 'center' })

    // Summary Box dengan better styling
    yPosition += 10
    doc.setDrawColor(40, 100, 40)
    doc.setLineWidth(0.5)
    doc.setFillColor(240, 250, 240)
    doc.rect(margin, yPosition, contentWidth, 38, 'FD')

    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 80, 20)
    doc.text('RINGKASAN PENJUALAN', margin + 3, yPosition + 5)

    yPosition += 8
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(40, 40, 40)

    // Summary data dengan 2 kolom layout
    const col1X = margin + 3
    const col2X = pageWidth / 2 - 5
    let summaryY = yPosition

    doc.text('Total Transaksi:', col1X, summaryY)
    doc.text(transaction_count.toString(), col2X - 5, summaryY, { align: 'right' })

    summaryY += 6
    doc.text('Total Pendapatan:', col1X, summaryY)
    doc.text(formatRupiah(totalRevenue), col2X - 5, summaryY, { align: 'right' })

    summaryY += 6
    doc.text('Total HPP:', col1X, summaryY)
    doc.text(formatRupiah(totalCost), col2X - 5, summaryY, { align: 'right' })

    summaryY += 6
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 120, 20)
    doc.text('Laba Kotor:', col1X, summaryY)
    doc.text(formatRupiah(gross_profit), col2X - 5, summaryY, { align: 'right' })

    yPosition += 41

    // Detail Transaksi Section
    if (transactions.length > 0) {
      yPosition += 3
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(20, 80, 20)
      doc.text('DETAIL TRANSAKSI', margin, yPosition)

      yPosition += 6
      
      // Header Table
      const colNo = margin + 2
      const colTime = margin + 8
      const colKasir = margin + 30
      const colAmount = pageWidth - margin - 45
      const colMethod = pageWidth - margin - 20

      doc.setFontSize(8)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(255, 255, 255)
      doc.setFillColor(40, 100, 40)
      doc.rect(margin, yPosition - 4, contentWidth, 6, 'F')
      doc.text('#', colNo, yPosition)
      doc.text('Waktu Transaksi', colTime, yPosition)
      doc.text('Kasir', colKasir, yPosition)
      doc.text('Total', colAmount, yPosition, { align: 'right' })
      doc.text('Metode', colMethod, yPosition, { align: 'right' })

      yPosition += 6
      doc.setLineWidth(0.3)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)

      yPosition += 4
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(40, 40, 40)

      transactions.forEach((trx, index) => {
        // Page break check dengan buffer untuk header
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 15
          
          // Repeat table header pada halaman baru
          doc.setFontSize(8)
          doc.setFont(undefined, 'bold')
          doc.setTextColor(255, 255, 255)
          doc.setFillColor(40, 100, 40)
          doc.rect(margin, yPosition - 4, contentWidth, 6, 'F')
          doc.text('#', colNo, yPosition)
          doc.text('Waktu Transaksi', colTime, yPosition)
          doc.text('Kasir', colKasir, yPosition)
          doc.text('Total', colAmount, yPosition, { align: 'right' })
          doc.text('Metode', colMethod, yPosition, { align: 'right' })
          
          yPosition += 6
          doc.setLineWidth(0.3)
          doc.setDrawColor(200, 200, 200)
          doc.line(margin, yPosition, pageWidth - margin, yPosition)
          
          yPosition += 4
          doc.setFontSize(8)
          doc.setFont(undefined, 'normal')
          doc.setTextColor(40, 40, 40)
        }

        // Parse timestamp dari created_at
        let timeStr = '-'
        if (trx.created_at) {
          const date = new Date(trx.created_at)
          timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }

        const kasirName = trx.kasir ? trx.kasir.substring(0, 15) : '-'
        const methodText = trx.payment_method === 'CASH' ? 'Tunai' : (trx.payment_method || '-')

        doc.text((index + 1).toString(), colNo, yPosition)
        doc.text(timeStr, colTime, yPosition)
        doc.text(kasirName, colKasir, yPosition)
        doc.text(formatRupiah(trx.grand_total || 0), colAmount, yPosition, { align: 'right' })
        doc.text(methodText, colMethod, yPosition, { align: 'right' })

        yPosition += 5
      })

      // Bottom line
      yPosition += 1
      doc.setLineWidth(0.5)
      doc.setDrawColor(40, 100, 40)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
    }

    // Footer
    yPosition = pageHeight - 8
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Generated: ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    )

    const fileName = `Laporan-Penjualan-${Date.now()}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (err) {
    return err.message
  }
}

export async function generateInventoryReport({
  title = 'Laporan Inventaris',
  date = new Date().toLocaleDateString('id-ID'),
  products = [],
  totalAssetValue = 0
} = {}) {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = 15

    // Header Section
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 80, 20)
    doc.text('BUMDes DesaPOS', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 8
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 6
    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Tanggal: ${date}`, pageWidth / 2, yPosition, { align: 'center' })

    // Asset Value Summary Box
    yPosition += 10
    doc.setDrawColor(40, 100, 40)
    doc.setLineWidth(0.5)
    doc.setFillColor(240, 250, 240)
    doc.rect(margin, yPosition, contentWidth, 12, 'F')

    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 80, 20)
    doc.text('Total Nilai Aset Inventaris:', margin + 3, yPosition + 7)
    
    doc.setFontSize(10)
    doc.setTextColor(20, 120, 20)
    doc.text(formatRupiah(totalAssetValue), pageWidth - margin - 3, yPosition + 7, { align: 'right' })

    yPosition += 18

    // Daftar Barang Section
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 80, 20)
    doc.text('DAFTAR BARANG', margin, yPosition)

    yPosition += 6

    // Table Header
    const col1 = margin + 2
    const col2 = margin + 8
    const col3 = margin + 28
    const col4 = pageWidth - margin - 60
    const col5 = pageWidth - margin - 38
    const col6 = pageWidth - margin - 3

    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(255, 255, 255)
    doc.setFillColor(40, 100, 40)
    doc.rect(margin, yPosition - 4, contentWidth, 6, 'F')
    doc.text('#', col1, yPosition)
    doc.text('SKU', col2, yPosition)
    doc.text('Nama Barang', col3, yPosition)
    doc.text('Stok', col4, yPosition, { align: 'right' })
    doc.text('Harga Modal', col5, yPosition, { align: 'right' })
    doc.text('Nilai Aset', col6, yPosition, { align: 'right' })

    yPosition += 6
    doc.setLineWidth(0.3)
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    yPosition += 4
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(40, 40, 40)

    products.forEach((product, index) => {
      // Page break check
      if (yPosition > pageHeight - 20) {
        doc.addPage()
        yPosition = 15

        // Repeat table header pada halaman baru
        doc.setFontSize(8)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(255, 255, 255)
        doc.setFillColor(40, 100, 40)
        doc.rect(margin, yPosition - 4, contentWidth, 6, 'F')
        doc.text('#', col1, yPosition)
        doc.text('SKU', col2, yPosition)
        doc.text('Nama Barang', col3, yPosition)
        doc.text('Stok', col4, yPosition, { align: 'right' })
        doc.text('Harga Modal', col5, yPosition, { align: 'right' })
        doc.text('Nilai Aset', col6, yPosition, { align: 'right' })

        yPosition += 6
        doc.setLineWidth(0.3)
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)

        yPosition += 4
        doc.setFontSize(8)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(40, 40, 40)
      }

      const totalNilai = (product.stock || 0) * (product.cost_price || 0)
      const namaDisplay = product.name ? (product.name.length > 22 ? product.name.substring(0, 22) : product.name) : '-'

      // Alternate row color untuk readability
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248)
        doc.rect(margin, yPosition - 3, contentWidth, 4.5, 'F')
      }

      doc.setTextColor(40, 40, 40)
      doc.text((index + 1).toString(), col1, yPosition)
      doc.text(product.sku || '-', col2, yPosition)
      doc.text(namaDisplay, col3, yPosition)
      doc.text((product.stock || 0).toString(), col4, yPosition, { align: 'right' })
      doc.text(formatRupiah(product.cost_price || 0), col5, yPosition, { align: 'right' })
      
      doc.setFont(undefined, 'bold')
      doc.setTextColor(20, 100, 20)
      doc.text(formatRupiah(totalNilai), col6, yPosition, { align: 'right' })
      doc.setFont(undefined, 'normal')
      doc.setTextColor(40, 40, 40)

      yPosition += 5
    })

    // Bottom line
    yPosition += 1
    doc.setLineWidth(0.5)
    doc.setDrawColor(40, 100, 40)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    // Summary row
    yPosition += 5
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 80, 20)
    doc.text(`Total: ${products.length} SKU`, margin, yPosition)
    doc.text(formatRupiah(totalAssetValue), pageWidth - margin - 3, yPosition, { align: 'right' })

    // Footer
    yPosition = pageHeight - 8
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Generated: ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    )

    const fileName = `Inventaris-${Date.now()}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (err) {
    return err.message
  }
}

export async function generateReceiptPDF({
  saleId = '',
  date = new Date().toISOString(),
  cashierName = '',
  items = [],
  subtotal = 0,
  itemDiscounts = 0,
  transactionDiscount = 0,
  total = 0,
  amountPaid = 0,
  change = 0,
  paymentMethod = 'CASH'
} = {}) {
  try {
    // 80mm thermal printer = 80 x 200mm
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [80, 200]
    })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 3
    let yPosition = 4

    // Header
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('DesaPOS', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 4
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text('BUMDes Maju Bersama', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 3
    doc.text('Jl. Desa Mandiri No. 1', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 4
    doc.setLineWidth(0.3)
    doc.setDrawColor(0, 0, 0)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    // Transaction Info
    yPosition += 3
    doc.setFontSize(7)
    const transDate = new Date(date)
    const dateStr = transDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })
    const timeStr = transDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    doc.text(`No: ${saleId || '-'}`, margin, yPosition)
    yPosition += 3
    doc.text(`Tgl: ${dateStr} ${timeStr}`, margin, yPosition)
    yPosition += 3
    doc.text(`Kasir: ${cashierName || '-'}`, margin, yPosition)

    yPosition += 4
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    // Items Section
    yPosition += 3
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')

    items.forEach(item => {
      if (yPosition + 6 > doc.internal.pageSize.getHeight() - 25) {
        doc.addPage()
        yPosition = 4
      }

      const itemName = item.name ? (item.name.length > 20 ? item.name.substring(0, 20) : item.name) : 'Item'
      doc.setFont(undefined, 'bold')
      doc.text(itemName, margin, yPosition)
      
      const itemPrice = item.price || 0
      const itemQty = item.qty || 0
      const itemTotal = itemPrice * itemQty

      yPosition += 2.5
      doc.setFont(undefined, 'normal')
      doc.setFontSize(6)
      doc.text(`${itemQty}x @ ${formatRupiah(itemPrice)}`, margin, yPosition)
      doc.text(formatRupiah(itemTotal), pageWidth - margin, yPosition, { align: 'right' })

      yPosition += 2.5
      doc.setFontSize(7)
    })

    yPosition += 2
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    // Total Section
    yPosition += 3
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')

    doc.text('Subtotal', margin, yPosition)
    doc.text(formatRupiah(subtotal), pageWidth - margin, yPosition, { align: 'right' })

    if (itemDiscounts > 0) {
      yPosition += 2.5
      doc.setTextColor(200, 80, 0)
      doc.text('Dis. Item', margin, yPosition)
      doc.text(`-${formatRupiah(itemDiscounts)}`, pageWidth - margin, yPosition, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }

    if (transactionDiscount > 0) {
      yPosition += 2.5
      doc.setTextColor(200, 80, 0)
      doc.text('Dis. Transaksi', margin, yPosition)
      doc.text(`-${formatRupiah(transactionDiscount)}`, pageWidth - margin, yPosition, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }

    yPosition += 3
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    yPosition += 3
    doc.setFont(undefined, 'bold')
    doc.setFontSize(8)
    doc.text('TOTAL', margin, yPosition)
    doc.text(formatRupiah(total), pageWidth - margin, yPosition, { align: 'right' })

    // Payment Info
    yPosition += 4
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    yPosition += 3
    const paymentText = paymentMethod === 'CASH' ? 'Tunai' : paymentMethod
    doc.text('Metode:', margin, yPosition)
    doc.text(paymentText, pageWidth - margin, yPosition, { align: 'right' })

    yPosition += 2.5
    doc.text('Diterima', margin, yPosition)
    doc.text(formatRupiah(amountPaid), pageWidth - margin, yPosition, { align: 'right' })

    yPosition += 2.5
    doc.setFont(undefined, 'bold')
    doc.setTextColor(20, 100, 20)
    doc.text('Kembalian', margin, yPosition)
    doc.text(formatRupiah(change), pageWidth - margin, yPosition, { align: 'right' })

    // Footer
    yPosition += 4
    doc.setTextColor(80, 80, 80)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(6)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)

    yPosition += 2.5
    doc.text('Terima kasih telah berbelanja!', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 2
    doc.text('Semoga puas dengan pelayanan kami', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 2.5
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(5)
    const nowStr = new Date().toLocaleString('id-ID')
    doc.text(`[${nowStr}]`, pageWidth / 2, yPosition, { align: 'center' })

    const fileName = `Receipt-${saleId?.split('-')[0] || 'TRX'}-${Date.now()}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (err) {
    return err.message
  }
}

export default {
  generateDailySalesReport,
  generateInventoryReport,
  generateReceiptPDF
}
