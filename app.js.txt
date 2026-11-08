// KASAP ID V4 - Data dari SUPABASE, bukan dari products.json lagi. Tidak ada dummy.
var SUPA_URL = 'https://zgliygdpbaorutzttxlr.supabase.co'; // <-- GANTI dengan Project URL kamu
var SUPA_KEY = 'sb_publishable_o7z4YitotXfBKTSR67YScg_pcBRFS84'; // <-- GANTI dengan anon public key kamu

let PRODUCTS = [];
let cart = JSON.parse(localStorage.getItem('kasap_cart') || '[]');
const WA_NUMBER = '6281234567890';

const grid = document.getElementById('productGrid');
const statusEl = document.getElementById('status');
const totalEl = document.getElementById('totalProduk');
const emptyEl = document.getElementById('emptyMsg');
const searchInput = document.getElementById('searchInput');

function rupiah(n){ return 'Rp ' + n.toLocaleString('id-ID'); }

async function loadProducts(){
  try{
    const res = await fetch(SUPA_URL + '/rest/v1/products?select=*&order=id.asc', {
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
    });
    if(!res.ok) throw new Error('Gagal ambil dari Supabase: ' + res.status);
    PRODUCTS = await res.json();
    statusEl.textContent = '';
    render(PRODUCTS);
  }catch(e){
    statusEl.textContent = 'SUPABASE V4 - Gagal memuat dari Supabase. Cek URL, Key, dan Policy tabel products.';
    console.error(e);
  }
}

function render(list){
  totalEl.textContent = list.length + ' produk';
  emptyEl.hidden = list.length !== 0;
  grid.innerHTML = list.map(p => `
    <article class="product">
      <h3>${p.nama}</h3>
      <div class="price">${rupiah(p.harga)}</div>
      <div class="stock">• Stok ${p.stok}</div>
      <div class="row">
        <button class="btn-buy" onclick="beli(${p.id})">Beli</button>
        <button class="btn-cart" onclick="tambahKeranjang(${p.id})">Masuk Keranjang</button>
      </div>
    </article>`).join('');
  updateCartUI();
}

function cari(){
  const q = searchInput.value.toLowerCase().trim();
  render(q ? PRODUCTS.filter(p => p.nama.toLowerCase().includes(q)) : PRODUCTS);
}
document.getElementById('searchForm').addEventListener('submit', e => { e.preventDefault(); cari(); });
searchInput.addEventListener('input', cari);

function tambahKeranjang(id){
  const item = cart.find(i => i.id === id);
  if(item) item.qty++;
  else cart.push({id, qty: 1});
  simpanCart();
}
function beli(id){ tambahKeranjang(id); bukaKeranjang(); }
function simpanCart(){ localStorage.setItem('kasap_cart', JSON.stringify(cart)); updateCartUI(); }
function updateCartUI(){
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = totalQty;
  const totalHarga = cart.reduce((s,i)=>{
    const p = PRODUCTS.find(x=>x.id===i.id);
    return s + (p ? p.harga*i.qty : 0);
  },0);
  document.getElementById('cartTotal').textContent = rupiah(totalHarga);
  document.getElementById('cartItems').innerHTML = cart.length ? cart.map(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id);
    if(!p) return '';
    return `<div class="cart-item"><div><b>${p.nama}</b><br>${rupiah(p.harga)} x ${i.qty}</div>
    <div class="qty"><button onclick="ubahQty(${p.id},-1)">-</button> ${i.qty} <button onclick="ubahQty(${p.id},1)">+</button></div></div>`;
  }).join('') : '<p>Keranjang masih kosong.</p>';
}
function ubahQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(i=>i.id!==id);
  simpanCart();
}
function bukaKeranjang(){ document.getElementById('cartDrawer').hidden = false; }
function tutupKeranjang(){ document.getElementById('cartDrawer').hidden = true; }
document.getElementById('navKeranjang').addEventListener('click', e=>{ e.preventDefault(); bukaKeranjang(); });
document.getElementById('closeCart').addEventListener('click', tutupKeranjang);
document.getElementById('checkoutBtn').addEventListener('click', ()=>{
  if(!cart.length) return alert('Keranjang masih kosong');
  const pesan = cart.map(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id);
    return `- ${p.nama} x ${i.qty} = ${rupiah(p.harga*i.qty)}`;
  }).join('\n');
  const total = document.getElementById('cartTotal').textContent;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo KASAP ID, saya mau pesan:\n'+pesan+'\nTotal: '+total)}`, '_blank');
});
document.getElementById('liveBtn').addEventListener('click', e=>{ e.preventDefault(); alert('Link Live belum diisi.'); });
document.getElementById('chatBtn').addEventListener('click', e=>{ e.preventDefault(); window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Halo KASAP ID')}`, '_blank'); });

loadProducts();
