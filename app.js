
/* ==================================
   KASAP ID - SUPABASE APP
   ================================== */

const SUPA_URL = "https://zgliygdpbaorutzttxlr.supabase.co";
const SUPA_KEY = "sb_publishable_o7z4YitotXfBKTSR67YScg_pcBRFS84";

let supabaseClient = null;
let products = [];
let cart = JSON.parse(localStorage.getItem("kasap_cart") || "[]");

// CONNECT SUPABASE
function connectSupabase() {
  if (!window.supabase) {
    throw new Error("Library Supabase tidak ditemukan");
  }

  supabaseClient = window.supabase.createClient(
    SUPA_URL,
    SUPA_KEY
  );

  console.log("Supabase berhasil diinisialisasi");
}

// LOAD PRODUCTS
async function loadProducts() {
  const grid = document.getElementById("product-grid");
  const count = document.getElementById("product-count");
  const notice = document.getElementById("notice");

  if (!grid) {
    console.error("Elemen product-grid tidak ditemukan");
    return;
  }

  grid.innerHTML = '<div class="loading">Memuat produk...</div>';

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .eq("aktif", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = data || [];

    grid.innerHTML = "";

    if (count) {
      count.textContent = products.length + " produk tersedia";
    }

    if (!products.length) {
      grid.textContent = "Belum ada produk aktif.";
      return;
    }

    products.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";

      const img = document.createElement("img");
      img.src = product.foto || "";
      img.alt = product.nama || "Produk";
      img.onerror = () => img.style.display = "none";

      const info = document.createElement("div");
      info.className = "product-info";

      const name = document.createElement("h3");
      name.className = "product-name";
      name.textContent = product.nama || "Produk";

      const price = document.createElement("div");
      price.className = "product-price";
      price.textContent =
        "Rp " + Number(product.harga || 0).toLocaleString("id-ID");

      const description = document.createElement("p");
      description.textContent = product.deskripsi || "";

      const stock = document.createElement("p");
      stock.textContent = "Stok: " + (product.stok || 0);

      const button = document.createElement("button");
      button.className = "primary-button";
      button.textContent = "Tambah Keranjang";
      button.addEventListener("click", () => addToCart(product.id));

      info.append(name, price, description, stock, button);
      card.append(img, info);
      grid.appendChild(card);
    });

    if (notice) {
      notice.hidden = true;
    }

    console.log("Produk berhasil dimuat:", products.length);

  } catch (error) {
    console.error("Supabase error:", error);

    grid.textContent = "Gagal memuat produk: " + error.message;

    if (count) {
      count.textContent = "Gagal memuat produk";
    }

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

  const total = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  if (badge) badge.textContent = total;

  const content = document.getElementById("cart-content");

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
          Number(item.harga * item.quantity).toLocaleString("id-ID");
        content.appendChild(row);
      });
    }
  }
}

// REFRESH BUTTON
document.getElementById("refresh-button")
  ?.addEventListener("click", loadProducts);

// START APP
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").textContent =
    new Date().getFullYear();

  updateCart();

  try {
    connectSupabase();
    await loadProducts();
  } catch (error) {
    console.error(error);

    const grid = document.getElementById("product-grid");
    if (grid) grid.textContent = error.message;
  }
});

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./server-worker.js")
      .catch(error => console.error("Worker:", error));
  });
}
