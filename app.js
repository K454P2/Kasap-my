// ============================================================
// app.js - 1 FILE ROBOT PASAR KITA (SATUKAN)
// Taruh file ini di sebelah index.html: Kasap-my/app.js
// Di index.html, di paling bawah sebelum </body>, tambahin 1 baris ini aja:
// <script type="module" src="app.js"></script>
// JANGAN ada config.js lagi, JANGAN ada app.js lain. Ini doang robotnya.
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.4/+esm';

// --- 1. CONFIG - SUDAH BENAR, JANGAN PINDAH ---
// Secret (DOKU_SECRET_KEY, RAJAONGKIR_API_KEY, IAK_*) ada di Supabase Secrets, BUKAN di sini!
export const CONFIG = {
  SUPABASE_URL: "https://zgliygdpbaorutzttxlr.supabase.co",
  SUPABASE_KEY: "sb_publishable_o7z4YitotXfBKTSR67YScg_pcBRFS84",
  DOKU_CLIENT_ID: "ISI-DOKU-CLIENT-ID",
  DOKU_MERCHANT_ID: "ISI-MERCHANT-ID",
  EDGE_DOKU: "https://zgliygdpbaorutzttxlr.supabase.co/functions/v1/doku-bayar",
  EDGE_ONGKIR: "https://zgliygdpbaorutzttxlr.supabase.co/functions/v1/rajaongkir-ongkir",
  EDGE_IAK: "https://zgliygdpbaorutzttxlr.supabase.co/functions/v1/iak-ppob",
};
window.PASAR_KITA_CONFIG = CONFIG;

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// --- 2. ROBOT PRODUK - HANYA DARI SUPABASE, NO DUMMY, NO FALLBACK ---
export async function loadProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '<p>Memuat dari Supabase...</p>';
  const { data, error } = await supabase.from('products').select('*, shops(*)').eq('shop_id', 1).order('id', { ascending: false });
  if (error || !data || data.length === 0) {
    grid.innerHTML = '<p>Belum ada produk - Tambah dari Mode Penjual</p>';
    return;
  }
  grid.innerHTML = data.map(p => `
    <div class="card">
      <b>${p.title || p.name || 'Produk'}</b>
      <p>Rp ${Number(p.price || 0).toLocaleString('id-ID')} • shop_id=${p.shop_id} • ID ${p.id}</p>
      <p>Stok: ${p.stock ?? '-'}</p>
      <button onclick="window.__addToCart(${p.id})">+ Keranjang</button>
    </div>`).join('');
}

// --- 3. ROBOT KERANJANG ---
window.__cart = JSON.parse(localStorage.getItem('pasar_kita_cart') || '[]');
window.__addToCart = (id) => {
  window.__cart.push(id);
  localStorage.setItem('pasar_kita_cart', JSON.stringify(window.__cart));
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = window.__cart.length;
  alert('Masuk keranjang! Total: ' + window.__cart.length);
};

// --- 4. ROBOT ONGKIR - VIA EDGE FUNCTION RAJAONGKIR (BUKAN LANGSUNG) ---
export async function cekOngkir(origin, destination, weight, courier) {
  const res = await fetch(CONFIG.EDGE_ONGKIR, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination, weight, courier })
  });
  return await res.json();
}

// --- 5. ROBOT BAYAR - VIA EDGE FUNCTION DOKU ---
export async function bayarDoku(amount, order_id, email) {
  const res = await fetch(CONFIG.EDGE_DOKU, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, order_id, customer_email: email })
  });
  return await res.json();
}

// --- 6. ROBOT PPOB - VIA EDGE FUNCTION IAK, SIGNATURE OTOMATIS DI BACKEND ---
export async function bayarPPOB(product_code, customer_no) {
  const ref_id = 'PASAR-' + Date.now();
  const res = await fetch(CONFIG.EDGE_IAK, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_code, customer_no, ref_id })
  });
  return await res.json();
}

// --- 7. ROBOT AUTH - EMAIL PISAH NO HP ---
// Login Email: supabase.auth.signInWithPassword({email, password})
// Login No HP: pakai OTP / password terpisah, JANGAN gabung jadi Email/HP
export async function loginEmail(email, password) {
  return await supabase.auth.signInWithPassword({ email, password });
}
export async function daftarUser({ email, phone, password, nama, role, nama_toko }) {
  // Email dan No HP disimpan terpisah di profiles
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error };
  if (data.user) {
    await supabase.from('profiles').insert([{ id: data.user.id, email, phone, nama, role, nama_toko }]);
  }
  return { data };
}

// --- 8. JALANKAN ROBOT SAAT APK DIBUKA ---
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = window.__cart.length;
  console.log('ROBOT app.js jalan - tersambung ke Supabase:', CONFIG.SUPABASE_URL);
});
