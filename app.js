
/* =========================================
   KASAP ID - MARKETPLACE MULTI SELLER
   SUPABASE CONNECTION
   ========================================= */

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

// =========================================
// CONNECT SUPABASE
// =========================================

function connectSupabase() {
  if (!window.supabase) {
    throw new Error("Library Supabase tidak ditemukan.");
  }

  supabaseClient = window.supabase.createClient(
    SUPA_URL,
    SUPA_KEY
  );

  console.log("KASAP berhasil terhubung ke Supabase.");
}

// =========================================
// LOAD PRODUCTS FROM TABLE PRODUK
// =========================================

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  const count = document.getElementById("product-count");
  const notice = document.getElementById("notice");

  if (!grid) return;

  grid.textContent = "Memuat produk...";
  if (count) count.textContent = "Menghubungkan ke Supabase...";

  try {
    if (!supabaseClient) connectSupabase();

    const { data, error } = await supabaseClient
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const allProducts = data || [];

    // FILTER PRODUK AKTIF JIKA KOLOM TERSEDIA
    products = allProducts.filter(p => {
      if (!Object.prototype.hasOwnProperty.call(p, "aktif")) {
        return true;
      }

      return p.aktif === true ||
             p.aktif === "true" ||
             p.aktif === 1;
    });

    grid.innerHTML = "";

    if (count) {
      count.textContent = products.length + " produk tersedia";
    }

    if (notice) notice.hidden = true;

    if (products.length === 0) {
      grid.textContent = "Belum ada produk yang tersedia.";
      return;
    }

    products.forEach(product => {
      const card = document.createElement("article");
      card.className = "product-card";

      // GAMBAR PRODUK
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

      // NAMA
      const name = document.createElement("h3");
      name.className = "product-name";
      name.textContent = product.nama || "Produk";

      // HARGA
      const price = document.createElement("div");
      price.className = "product-price";
      price.textContent =
        "Rp " + Number(product.harga || 0)
          .toLocaleString("id-ID");

      // DESKRIPSI
      const description = document.createElement("p");
      description.textContent = product.deskripsi || "";

      // STOK
      const stock = document.createElement("p");
      stock.textContent = "Stok: " + (product.stok ?? 0);

      // TOMBOL KERANJANG
      const button = document.createElement("button");
      button.type = "button";
      button.className = "primary-button";
      button.textContent = "Tambah Keranjang";

      button.addEventListener("click", () => {
        addToCart(product.id);
      });

      info.append(
        name,
        price,
        description,
        stock,
        button
      );

      card.appendChild(info);
      grid.appendChild(card);
    });

    console.log("Produk berhasil dimuat:", products.length);

  } catch (error) {
    console.error("KASAP ERROR:", error);

    grid.textContent =
      "Gagal memuat produk: " + error.message;

    if (count) count.textContent = "Gagal memuat produk";

    if (notice) {
      notice.hidden = false;
      notice.textContent = error.message;
    }
  }
}

// =========================================
// ADD TO CART
// =========================================

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

  localStorage.setItem(
    "kasap_cart",
    JSON.stringify(cart)
  );

  updateCart();

  alert("Produk berhasil masuk keranjang!");
}

// =========================================
// UPDATE CART
// =========================================

function updateCart() {
  const badge = document.getElementById("cart-badge");
  const content = document.getElementById("cart-content");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  if (badge) badge.textContent = total;

  if (!content) return;

  content.innerHTML = "";

  if (cart.length === 0) {
    content.textContent = "Keranjang masih kosong.";
    return;
  }

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

// =========================================
// SEARCH PRODUCTS
// =========================================

function searchProducts(keyword) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const search = keyword.toLowerCase().trim();

  const filtered = products.filter(p =>
    String(p.nama || "").toLowerCase().includes(search) ||
    String(p.kategori || "").toLowerCase().includes(search)
  );

  grid.innerHTML = "";

  if (!filtered.length) {
    grid.textContent = "Produk tidak ditemukan.";
    return;
  }

  filtered.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const name = document.createElement("h3");
    name.textContent = product.nama || "Produk";

    const price = document.createElement("p");
    price.textContent =
      "Rp " + Number(product.harga || 0)
        .toLocaleString("id-ID");

    const button = document.createElement("button");
    button.className = "primary-button";
    button.textContent = "Tambah Keranjang";

    button.addEventListener("click", () => {
      addToCart(product.id);
    });

    card.append(name, price, button);
    grid.appendChild(card);
  });
}

// =========================================
// NAVIGATION
// =========================================

function openView(view) {
  const views = [
    "home",
    "chat",
    "cart",
    "orders",
    "account"
  ];

  views.forEach(name => {
    const section = document.getElementById(name + "-view");
    if (section) section.hidden = name !== view;
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.view === view
    );

    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });

  if (view === "cart") updateCart();
}

// =========================================
// START APPLICATION
// =========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("KASAP ID DIMULAI");

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  updateCart();

  // NAVIGATION BUTTONS
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      openView(button.dataset.view);
    });
  });

  // REFRESH BUTTON
  const refresh = document.getElementById("refresh-button");

  if (refresh) {
    refresh.addEventListener("click", loadProducts);
  }

  // SEARCH FORM
  const searchForm = document.getElementById("search-form");

  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();

      const input = document.getElementById("search-input");

      searchProducts(input ? input.value : "");
    });
  }

  await loadProducts();
});

// =========================================
// SERVICE WORKER
// =========================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./server-worker.js")
      .catch(error => {
        console.error("Service Worker:", error);
      });
  });
}
