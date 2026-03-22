export function useValidation() {
  function validateSKU(sku) {
    if (!sku || typeof sku !== 'string') return 'SKU harus berupa teks'
    if (sku.trim().length < 3) return 'SKU minimal 3 karakter'
    if (sku.trim().length > 30) return 'SKU maksimal 30 karakter'
    if (!/^[A-Z0-9\-]+$/.test(sku.trim())) {
      return 'SKU hanya boleh berisi huruf besar, angka, dan dash'
    }
    return null
  }

  function validateProductName(name) {
    if (!name || typeof name !== 'string') return 'Nama barang harus berupa teks'
    if (name.trim().length < 3) return 'Nama barang minimal 3 karakter'
    if (name.trim().length > 100) return 'Nama barang maksimal 100 karakter'
    return null
  }

  function validatePrice(price, minPrice = 0, maxPrice = 999999999) {
    const num = Number(price)
    if (isNaN(num)) return 'Harga harus berupa angka'
    if (num < minPrice) return `Harga minimal ${minPrice}`
    if (num > maxPrice) return `Harga maksimal ${maxPrice}`
    if (!Number.isInteger(num)) return 'Harga harus angka bulat'
    return null
  }

  function validateQuantity(qty, minQty = 1, maxQty = 10000) {
    const num = Number(qty)
    if (isNaN(num)) return 'Kuantitas harus berupa angka'
    if (!Number.isInteger(num)) return 'Kuantitas harus angka bulat'
    if (num < minQty) return `Kuantitas minimal ${minQty}`
    if (num > maxQty) return `Kuantitas maksimal ${maxQty}`
    return null
  }

  function validatePaymentAmount(amount, minimum = 0) {
    const num = Number(amount)
    if (isNaN(num)) return 'Nominal pembayaran harus berupa angka'
    if (num < minimum) return `Pembayaran minimal ${minimum}`
    if (num > 999999999) return 'Pembayaran terlalu besar'
    return null
  }

  function validateProductForm(form) {
    const errors = {}
    let error
    
    if ((error = validateSKU(form.sku))) errors.sku = error
    if ((error = validateProductName(form.name))) errors.name = error
    if ((error = validatePrice(form.cost_price, 0, 99999999))) errors.cost_price = error
    if ((error = validatePrice(form.price, 1, 99999999))) errors.price = error
    
    if (!errors.price && !errors.cost_price && form.price < form.cost_price) {
      errors.price = 'Harga jual tidak boleh lebih rendah dari harga modal'
    }
    
    if ((error = validateQuantity(form.stock, 0, 99999))) errors.stock = error
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  function validateOpeningCash(amount) {
    const num = Number(amount)
    if (isNaN(num)) return 'Nominal harus berupa angka'
    if (num < 0) return 'Nominal tidak boleh negatif'
    if (num > 999999999) return 'Nominal terlalu besar'
    return null
  }

  function validateClosingCash(closingCash, expectedCash) {
    const closing = Number(closingCash)
    const expected = Number(expectedCash)
    
    if (isNaN(closing)) return { isValid: false, error: 'Nominal harus berupa angka' }
    if (closing < 0) return { isValid: false, error: 'Nominal tidak boleh negatif' }
    if (closing > 999999999) return { isValid: false, error: 'Nominal terlalu besar' }
    
    const difference = closing - expected
    return {
      isValid: true,
      difference,
      warning: difference !== 0 ? `Selisih kas: Rp ${difference.toLocaleString('id-ID')}` : null
    }
  }

  return {
    validateSKU,
    validateProductName,
    validatePrice,
    validateQuantity,
    validatePaymentAmount,
    validateProductForm,
    validateOpeningCash,
    validateClosingCash
  }
}
