
/* ==================================
   KASAP MARKETPLACE - APP.JS
   ================================== */

// SUPABASE CONFIGURATION
const SUPA_URL = "ISI_SUPABASE_PROJECT_URL";
const SUPA_KEY = "ISI_SUPABASE_ANON_KEY";

let supabaseClient = null;
let products = [];
let cart = JSON.parse(localStorage.getItem("kasap_cart") || "[]");

// CONNECT SUPABASE
function connectSupabase() {
  if (!window.supabase) {
    console.error("Supabase library belum dimuat");
    return;
  }

  supabaseClient = window.supabase.createClient(
    SUPA_URL,
    SUPA_KEY
  );

  console.log("Kasap Supabase siap");
}

// LOAD PRODUCTS
async function loadProducts() {
  const container =
    document.querySelector("#products") ||
    document.querySelector(".grid-products");

  if (!container) return;

  if (!supabaseClient) {
    container.innerHTML =
      "<p>Supabase belum terhubung.</p>";
    return;
  }

  container.innerHTML = "<p>Memuat produk...</p>";

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = data || [];

    if (!products.length) {
      container.innerHTML =
        "<p>Belum ada produk tersedia.</p>";
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card">
        <img
          src="${escapeHTML(product.image_url || "")}"
          alt="${escapeHTML(product.name || "Produk")}"
          onerror="this.style.display='none'"
        >
        <div class="product-info">
          <div class="product-name">
            ${escapeHTML(product.name || "Produk")}
          </div>
          <div class="product-price">
            Rp ${Number(product.price || 0).toLocaleString("id-ID")}
          </div>
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
      "<p>Produk gagal dimuat. Periksa koneksi database.</p>";
  }
}

// SAFE HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ADD TO CART
function addToCart(id) {
  const product = products.find(
    item => String(item.id) === String(id)
  );

  if (!product) return;

  const existing = cart.find(
    item => String(item.id) === String(id)
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart();
  alert("Produk berhasil ditambahkan!");
}

// SAVE CART
function saveCart() {
  localStorage.setItem(
    "kasap_cart",
    JSON.stringify(cart)
  );

  updateCartCount();
}

// CART COUNT
function updateCartCount() {
  const count = cart.reduce(
    (total, item) => total + item.quantity, 0
  );

  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
  });
}

// LOGIN
async function loginKasap(email, password) {
  if (!supabaseClient) {
    alert("Supabase belum terhubung");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Login berhasil!");
  return data;
}

// REGISTER
async function registerKasap(email, password) {
  if (!supabaseClient) {
    alert("Supabase belum terhubung");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Pendaftaran berhasil!");
  return data;
}

// LOGOUT
async function logoutKasap() {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  alert("Berhasil keluar");
}

// INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
  connectSupabase();
  loadProducts();
  updateCartCount();
});

// SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./server-worker.js")
      .then(() => console.log("Kasap offline siap"))
      .catch(error => console.error(error));
  });
}
