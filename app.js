<script>
  // Data Produk Tiruan (Mock Data)
  const dataProduk = [
    { id: 1, nama: "Bougenville Singapore Variegata", harga: 45000, img: "https://unsplash.com" },
    { id: 2, nama: "Bougenville Mahara Merah Tumpuk", harga: 65000, img: "https://unsplash.com" },
    { id: 3, nama: "Bougenville Citra Monduring Multiwarna", harga: 120000, img: "https://unsplash.com" },
    { id: 4, nama: "Bibit Bougenville Ungu Ekspor", harga: 25000, img: "https://unsplash.com" }
  ];

  let keranjang = [];
  let riwayatChat = [];
  let counterBelumBayar = 0;

  // 1. Sistem Navigasi Halaman
  function nav(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('pg-' + pageId).classList.add('active');
    document.getElementById('btn-' + pageId).classList.add('active');
    
    if (pageId === 'keranjang') renderCart();
  }

  // 2. Tampilkan & Cari Produk (Sudah Diperbaiki)
  function tampil() {
    const cariInput = document.getElementById('cari');
    const kataKunci = cariInput ? cariInput.value.toLowerCase() : '';
    const grid = document.getElementById('grid');
    
    if (!grid) return;
    grid.innerHTML = '';
    
    const produkDisaring = dataProduk.filter(p => p.nama.toLowerCase().includes(kataKunci));
    
    const countSpan = document.getElementById('count');
    if (countSpan) {
      countSpan.innerText = `${produkDisaring.length} produk`;
    }

    if (produkDisaring.length === 0) {
      grid.innerHTML = '<p style="padding:10px;">Produk tidak ditemukan.</p>';
      return;
    }

    produkDisaring.forEach(p => {
      grid.innerHTML += `
        <div class="card">
          <img src="${p.img}" alt="${p.nama}">
          <div style="padding:4px 0;">
            <b>${p.nama}</b>
            <span class="price">Rp ${p.harga.toLocaleString('id-ID')}</span>
          </div>
          <button class="btn" onclick="tambahKeKeranjang(${p.id})">🛒 +Keranjang</button>
        </div>
      `;
    });
  }

  // 3. Fitur Keranjang Belanja
  function tambahKeKeranjang(id) {
    const produk = dataProduk.find(p => p.id === id);
    const adaDiKeranjang = keranjang.find(item => item.id === id);

    if (adaDiKeranjang) {
      adaDiKeranjang.qty++;
    } else {
      keranjang.push({ ...produk, qty: 1 });
    }
    alert(`${produk.nama} berhasil ditambahkan ke keranjang!`);
  }

  function renderCart() {
    const cartList = document.getElementById('cartList');
    if (!cartList) return;
    
    if (keranjang.length === 0) {
      cartList.innerHTML = '<p>Keranjang masih kosong.</p>';
      document.getElementById('totalBayar').innerText = '';
      return;
    }

    cartList.innerHTML = '';
    let subtotal = 0;
    
    keranjang.forEach((item, index) => {
      subtotal += item.harga * item.qty;
      cartList.innerHTML += `
        <div class="cart-item">
          <div>
            <b>${item.nama}</b><br>
            <span class="price">Rp ${item.harga.toLocaleString('id-ID')} x ${item.qty}</span>
          </div>
          <button onclick="hapusCart(${index})" style="background:#e53935;color:#fff;border:none;padding:4px 8px;border-radius:6px;cursor:pointer">Hapus</button>
        </div>
      `;
    });

    const ongkir = parseInt(document.getElementById('kurirPilih').value) || 0;
    const metode = document.getElementById('metodeBayar').value;
    const total = subtotal + ongkir;

    document.getElementById('bayarDetail').innerText = `Metode Pilihan: ${metode}`;
    document.getElementById('hasilOngkir').innerText = `Ongkos Kirim: Rp ${ongkir.toLocaleString('id-ID')}`;
    document.getElementById('rincianBayar').innerText = `Subtotal Produk: Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('totalBayar').innerText = `Total Pembayaran: Rp ${total.toLocaleString('id-ID')}`;
  }

  function hapusCart(index) {
    keranjang.splice(index, 1);
    renderCart();
  }

  function checkout() {
    const kota = document.getElementById('kotaTujuan').value;
    const nama = document.getElementById('namaPembeli').value;

    if (!kota || !nama || keranjang.length === 0) {
      alert('Mohon lengkapi Nama, Kota Tujuan, dan pastikan Keranjang tidak kosong!');
      return;
    }

    counterBelumBayar++;
    const akBelum = document.getElementById('akBelum');
    if (akBelum) akBelum.innerText = counterBelumBayar;
    
    document.getElementById('notifPesananList').innerHTML = `
      <div class="chat-item" style="border-left-color: #008cff">
        <b>Pesanan Baru Dibuat</b><br>
        Menunggu pembayaran untuk tujuan ${kota} atas nama ${nama}.
      </div>
    `;

    document.getElementById('checkoutHasil').innerText = "Checkout Berhasil! Silakan cek menu Akun / Notifikasi.";
    keranjang = [];
    renderCart();
  }

  // 4. Fitur Live Streaming Check
  function cekLive() {
    const penonton = Math.floor(Math.random() * 50) + 10;
    document.getElementById('liveVideoSub').innerText = "KASAP ID sedang bersiap-siap melakukan siaran langsung!";
    document.getElementById('livePenonton').innerText = `${penonton} penonton`;
    alert("Menghubungkan ke server Live KASAP ID... Toko saat ini bersiap Live.");
  }

  // 5. Fitur Chat Seller
  function tambahChat() {
    const nama = document.getElementById('chatNama').value;
    const pesan = document.getElementById('chatPesan').value;

    if (!nama || !pesan) {
      alert('Mohon isi nama dan pesan Anda!');
      return;
    }

    riwayatChat.push({ nama, pesan, waktu: new Date().toLocaleTimeString() });
    document.getElementById('chatPesan').value = '';
    renderChatHistory();
  }

  function renderChatHistory() {
    const listChat = document.getElementById('listChat');
    if (!listChat) return;
    listChat.innerHTML = '';
    [...riwayatChat].reverse().forEach(c => {
      listChat.innerHTML += `
        <div class="chat-item">
          <strong>${c.nama}</strong> <small style="color:#999">(${c.waktu})</small><br>
          <span>${c.pesan}</span>
        </div>
      `;
    });
  }

  // 6. Fitur Pembelian Pulsa / PPOB
  function bukaPulsa(jenis) {
    const form = document.getElementById('pulsaForm');
    if (!form) return;
    form.innerHTML = `
      <div style="background:#f9f9f9;padding:10px;border-radius:10px;border:1px solid #ddd">
        <h4 style="margin:0 0 8px 0">Beli / Bayar ${jenis}</h4>
        <input type="number" id="nomorTujuan" placeholder="Masukkan Nomor HP / ID Pelanggan">
        ${jenis === 'Pulsa' ? `
          <select id="nominalPilih">
            <option value="10000">Rp 10.000 (Bayar Rp 11.500)</option>
            <option value="25000">Rp 25.000 (Bayar Rp 26.300)</option>
            <option value="50000">Rp 50.000 (Bayar Rp 51.000)</option>
          </select>
        ` : `
          <input type="number" id="nominalPilih" placeholder="Nominal Jumlah Bayar">
        `}
        <button class="btn" onclick="prosesPPOB('${jenis}')">Proses Transaksi</button>
      </div>
    `;
  }

  function prosesPPOB(jenis) {
    const no = document.getElementById('nomorTujuan').value;
    if (!no) {
      alert('Mohon masukkan nomor tujuan valid!');
      return;
    }
    alert(`Transaksi ${jenis} untuk ID/Nomor ${no} sedang diproses via DANA.`);
    document.getElementById('pulsaForm').innerHTML = '';
    
    const notifCount = document.getElementById('notifTokoCount');
    if (notifCount) {
      notifCount.innerText = parseInt(notifCount.innerText) + 1;
    }
    document.getElementById('notifTokoList').innerHTML = `
      <div class="chat-item" style="border-left-color:#e53935">
        <b>Transaksi ${jenis} Berhasil!</b><br>Nomor: ${no} telah sukses diisi.
      </div>
    `;
  }

  // PENTING: Menunggu seluruh HTML selesai dimuat sebelum menampilkan produk
  window.addEventListener('DOMContentLoaded', () => {
    tampil();
  });
</script>
