-- Jalankan di Supabase Dashboard > SQL Editor.
-- Skema dasar yang dipakai oleh app.js. Sesuaikan jika project Anda sudah punya tabel sendiri.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  total numeric(12,2) not null default 0,
  status text not null default 'menunggu_pembayaran',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0)
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Produk aktif dapat dibaca publik" on public.products;
create policy "Produk aktif dapat dibaca publik" on public.products
for select to anon, authenticated using (is_active = true);

drop policy if exists "Pembeli dapat membaca pesanannya" on public.orders;
create policy "Pembeli dapat membaca pesanannya" on public.orders
for select to authenticated using (auth.uid() = buyer_id);

drop policy if exists "Pembeli dapat membuat pesanannya" on public.orders;
create policy "Pembeli dapat membuat pesanannya" on public.orders
for insert to authenticated with check (auth.uid() = buyer_id);

drop policy if exists "Pembeli dapat membaca detail pesanannya" on public.order_items;
create policy "Pembeli dapat membaca detail pesanannya" on public.order_items
for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

drop policy if exists "Pembeli dapat menambahkan detail pesanannya" on public.order_items;
create policy "Pembeli dapat menambahkan detail pesanannya" on public.order_items
for insert to authenticated with check (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

-- Contoh produk uji (hapus komentar untuk memasukkan data contoh):
-- insert into public.products (name, price, stock, description)
-- values ('Bougenville poetri', 75000, 3, 'Tanaman bougenville pilihan');

-- PENTING:
-- Jangan pernah menaruh service_role key di HTML/JS.
-- Untuk pembayaran otomatis DOKU, buat Edge Function server-side dan verifikasi webhook.
-- Checkout versi ini hanya menyimpan pesanan, belum memproses pembayaran atau mengurangi stok.
