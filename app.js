
async function loadProducts() {
  const container =
    document.querySelector("#products") ||
    document.querySelector(".grid-products");

  if (!container) return;

  if (!supabaseClient) {
    container.innerHTML = "<p>Supabase belum terhubung.</p>";
    return;
  }

  container.innerHTML = "<p>Memuat produk...</p>";

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("aktif", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = data || [];

    if (!products.length) {
      container.innerHTML = "<p>Belum ada produk aktif.</p>";
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card">
        <img
          src="${escapeHTML(product.foto || "")}"
          alt="${escapeHTML(product.nama || "Produk")}"
          onerror="this.style.display='none'"
        >

        <div class="product-info">
          <div class="product-name">
            ${escapeHTML(product.nama || "Produk")}
          </div>

          <div class="product-price">
            Rp ${Number(product.harga || 0).toLocaleString("id-ID")}
          </div>

          <p>${escapeHTML(product.deskripsi || "")}</p>

          <p class="seller-name">
            Stok: ${Number(product.stok || 0)}
          </p>

          <button class="btn"
            onclick="addToCart('${escapeHTML(String(product.id))}')">
            Tambah Keranjang
          </button>
        </div>
      </div>
    `).join("");

  } catch (error) {
    console.error("Gagal memuat produk:", error);
    container.innerHTML =
      "<p>Gagal memuat produk: " +
      escapeHTML(error.message) + "</p>";
  }
}
