import { createClient } from '@supabase/supabase-js'

// 1. Inisialisasi koneksi server Supabase menggunakan Key dari GitHub Secrets Anda
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Fungsi kirim produk asli agar masuk ke tabel database server (Bukan Mode Lokal)
async function tambahProdukKeServer(dataProduk) {
  try {
    const { data, error } = await supabase
      .from('produk') // Pastikan nama tabel di Supabase Anda bernama 'produk'
      .insert([
        { 
          nama_produk: dataProduk.nama, 
          harga: dataProduk.harga, 
          kategori: dataProduk.kategori,
          stok: dataProduk.stok
        }
      ])

    if (error) throw error
    alert('Produk berhasil terkirim dan disimpan di server Supabase!')
    return data
  } catch (error) {
    console.error('Koneksi ke server gagal patek:', error.message)
    alert('Gagal mengirim ke server: ' + error.message)
  }
}
