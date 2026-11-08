# KASAP ID - untuk GitHub Pages

## File
- index.html -> struktur
- style.css -> tampilan
- app.js -> logika (cari, keranjang, checkout WA)
- products.json -> DATABASE. Semua produk dari sini saja, tidak ada dummy di kode.

## Cara upload ke GitHub
1. Buat repo baru, misal `Kasap-id`
2. Upload ke-4 file ini ke root repo (jangan di dalam folder)
3. Settings > Pages > Branch: main, Folder: / (root) > Save
4. Buka https://username.github.io/Kasap-id/

## Cara tambah / ubah produk
Edit HANYA products.json, contoh:
{ "id": 4, "nama": "Bougenville baru", "harga": 50000, "stok": 5 }

Hapus produk = hapus barisnya dari products.json. Web akan otomatis ikut berubah.

## Yang perlu diganti
- Di app.js: WA_NUMBER = nomor WhatsApp seller (format 62...)
- Link Live: ganti di app.js / index.html
