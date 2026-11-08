
function loadProduk() {
  setText("status", "");
  setText("count", "Memuat produk...");

  fetch(
    SUPA_URL + "/rest/v1/produk?select=id,nama,harga,created_at,deskripsi,kategori,stok,min_beli,kondisi,foto,aktif&aktif=eq.true&order=created_at.desc",
    {
      method: "GET",
      headers: {
        apikey: SUPA_KEY,
        Authorization: "Bearer " + SUPA_KEY
      }
    }
  )
  .then(function(response) {
    if (!response.ok) {
      throw new Error("Supabase HTTP " + response.status);
    }
    return response.json();
  })
  .then(function(data) {
    produk = Array.isArray(data)
      ? data.filter(function(p) {
          return p.aktif === true;
        })
      : [];

    setText("count", produk.length + " produk");
    tampil();

    if (produk.length === 0) {
      toast("Belum ada produk aktif.");
    }
  })
  .catch(function(error) {
    console.error("Gagal memuat produk:", error);

    produk = [];
    setText("count", "0 produk");
    document.getElementById("grid").innerHTML =
      "<p>Gagal memuat produk dari server. Silakan coba lagi.</p>";
  });
}
