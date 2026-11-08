
/* ==================================
   KASAP ID - SUPABASE APP
   ================================== */

const SUPA_URL = "https://zgliygdpbaorutzttxlr.supabase.co";
const SUPA_KEY = "sb_publishable_o7z4YitotXfBKTSR67YScg_pcBRFS84";

let supabaseClient = null;
let products = [];

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("kasap_cart") || "[]");
  if (!Array.isArray(cart)) cart = [];
} catch (e) {
  cart = [];
}

// CONNECT SUPABASE
function connectSupabase() {
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("Library Supabase tidak berhasil dimuat.");
  }

  supabaseClient = window.supabase.createClient(
    SUPA_URL,
    SUPA_KEY
  );

  console.log("KASAP: Supabase terhubung.");
}

// LOAD PRODUCTS
async function loadProducts() {
  const grid = document.getElementById("product-grid");
  const count = document.getElementById("product-count");
  const notice = document.getElementById("notice");

  if (!grid) {
    console.error("product-grid tidak ditemukan.");
    return;
  }

  grid.textContent = "Menghubungkan ke Supabase...";
  if (count) count.textContent = "Memuat produk...";

  try {
    if (!supabaseClient) connectSupabase();

    // Ambil data dari tabel products
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const allProducts = data || [];

    // Hanya tampilkan produk aktif
    products = allProducts.filter(p =>
      p.aktif === true ||
      p.aktif === "true" ||
      p.aktif === 1
    );

    grid.innerHTML = "";

    if (count) {
      count.textContent =
        products.length + " produk tersedia";
    }

    if (notice) notice.hidden = true;

    if (allProducts.length === 0) {
      grid.textContent =
        "Tabel products berhasil dibaca, tetapi belum ada data produk.";
      return;
    }

    if (products.length === 0) {
      grid.textContent =
        "Ada " + allProducts.length +
        " produk, tetapi belum ada yang berstatus aktif.";
      return;
    }

    products.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";

      if (product.foto) {
        const img = document.createElement("img");
        img.src = product.foto;
        img.alt = product.nama || "Produk";
        img.onerror = () => {
          img.style.display = "none";
        };
        card.appendChild(img);
      }

      const info = document.createElement("div");
      info.className = "product-info";

      const name = document.createElement("h3");
      name.className = "product-name";
      name.textContent = product.nama || "Produk";

      const price = document.createElement("div");
      price.className = "product-price";
      price.textContent =
        "Rp " + Number(product.harga || 0)
          .toLocaleString("id-ID");

      const description = document.createElement("p");
      description.textContent = product.deskripsi || "";

      const stock = document.createElement("p");
      stock.textContent = "Stok: " + (product.stok ?? 0);

      const button = document.createElement("button");
      button.className = "primary-button";
      button.textContent = "Tambah Keranjang";
      button.type = "button";
      button.addEventListener("click", () => {
        addToCart(product.id);
      });

      info.append(name, price, description, stock, button);
      card.appendChild(info);
      grid.appendChild(card);
    });

    console.log(
      "KASAP: Produk berhasil dimuat:",
      products.length
    );

  } catch (error) {
    console.error("KASAP ERROR:", error);

    grid.textContent =
      "Gagal memuat produk: " + error.message;

    if (count) count.textContent = "Terjadi kesalahan";

    if (notice) {
      notice.hidden = false;
      notice.textContent = error.message;
    }
  }
}

// CART
function addToCart(id) {
  const product = products.find(
    p => String(p.id) === String(id)
  );

  if (!product) return;

  const item = cart.find(
    p => String(p.id) === String(id)
  );

  if (item) {
    item.quantity++;
  } else {
    cart.push({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      quantity: 1
    });
  }

  localStorage.setItem("kasap_cart", JSON.stringify(cart));
  updateCart();

  alert("Produk berhasil masuk keranjang!");
}

function updateCart() {
  const badge = document.getElementById("cart-badge");
  const content = document.getElementById("cart-content");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  if (badge) badge.textContent = total;

  if (content) {
    content.innerHTML = "";

    if (!cart.length) {
      content.textContent = "Keranjang masih kosong.";
    } else {
      cart.forEach(item => {
        const row = document.createElement("p");
        row.textContent =
          item.nama + " x " + item.quantity +
          " - Rp " +
          Number(item.harga * item.quantity)
            .toLocaleString("id-ID");

        content.appendChild(row);
      });
    }
  }
}

// START APP
document.addEventListener("DOMContentLoaded", async () => {
  console.log("KASAP APP DIMULAI");

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  updateCart();

  const refresh = document.getElementById("refresh-button");
  if (refresh) {
    refresh.addEventListener("click", loadProducts);
  }

  await loadProducts();
});

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./server-worker.js")
      .catch(error => console.error("Worker:", error));
  });
}
