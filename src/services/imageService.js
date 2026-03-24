import { supabase } from './supabase'

const BUCKET_NAME = 'product-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: 'File gambar wajib dipilih' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Tipe file tidak didukung. Gunakan: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}` 
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `Ukuran file terlalu besar. Maksimal 5MB, file Anda ${(file.size / 1024 / 1024).toFixed(2)}MB` 
    }
  }

  return { isValid: true }
}

export async function uploadProductImage(file, productName = '') {
  try {
    const validation = validateImageFile(file)

    if (!validation.isValid) throw validation.error

    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const sanitizedName = (productName || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 30)
    const fileName = `${sanitizedName}_${timestamp}.${fileExt}`
    const filePath = `products/${fileName}`

    const { _, error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadErr) throw 'Gagal mengupload gambar. Coba lagi nanti.'
    
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData?.publicUrl

    if (!publicUrl) throw 'Gagal mendapatkan URL gambar setelah upload'

    return { success: true, publicUrl }
  } catch (err) {
    return {
      success: false,
      error: 'Gagal mengupload gambar. Periksa koneksi internet Anda.'
    }
  }
}

export async function deleteProductImage(publicUrl) {
  try {
    if (!publicUrl) return { success: true }

    const filePath = publicUrl.split(`/${BUCKET_NAME}/`)[1]
    
    if (!filePath) return { success: true }

    const { error: deleteErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (deleteErr) return { success: false, error: 'Gagal menghapus gambar lama' }

    return { success: true }
  } catch (err) {
    return { success: false }
  }
}

export async function updateProductImage(newFile, oldPublicUrl, productName) {
  try {
    const uploadResult = await uploadProductImage(newFile, productName)

    if (!uploadResult.success) return uploadResult
    if (oldPublicUrl) await deleteProductImage(oldPublicUrl)

    return { success: true, publicUrl: uploadResult.publicUrl }
  } catch (err) {
    return { success: false }
  }
}
