import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // ===============================================================
  // GANTI DENGAN URL DAN ANON KEY SUPABASE ANDA YANG LENGKAP
  // ===============================================================
  await Supabase.initialize(
    url: 'https://zgliygdpbaorutzttxlr.supabase.co',
    anonKey: 'sb_publishable_o7z4YitotXfBKTSR67YScg_pcBRFS84',
  );

  runApp(const MyApp());
}

final supabase = Supabase.instance.client;

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: const DashboardSopPage(),
    );
  }
}

class DashboardSopPage extends StatefulWidget {
  const DashboardSopPage({super.key});

  @override
  State<DashboardSopPage> createState() => _DashboardSopPageState();
}

class _DashboardSopPageState extends State<DashboardSopPage> {
  // Mengambil data dari tabel produk_sop di Supabase secara Realtime / Asynchronous
  Future<List<Map<String, dynamic>>> fetchProduk() async {
    final data = await supabase.from('produk_sop').select();
    return List<Map<String, dynamic>>.from(data);
  }

  // Mengambil data dari tabel dompet_saldo
  Future<List<Map<String, dynamic>>> fetchSaldo() async {
    final data = await supabase.from('dompet_saldo').select();
    return List<Map<String, dynamic>>.from(data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.green[700],
        title: const Text("Tetap Taman.", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner Hijau Atas
            Container(
              width: double.infinity,
              color: Colors.green[700],
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Dari Sop Enak Sumekar • ID Toko 1", style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.play_arrow, color: Colors.green),
                        label: const Text("Tonton Live", style: TextStyle(color: Colors.green)),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.white)),
                        child: const Text("Lihat Produk", style: TextStyle(color: Colors.white)),
                      )
                    ],
                  )
                ],
              ),
            ),

            const SizedBox(height: 16),

            // SECTION 1: SALDO E-WALLET (Koneksi Supabase Otomatis)
            FutureBuilder<List<Map<String, dynamic>>>(
              future: fetchSaldo(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text("Gagal memuat saldo / Data kosong", style: TextStyle(color: Colors.red)),
                  );
                }

                final saldos = snapshot.data!;
                return SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: saldos.length,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemBuilder: (context, index) {
                      final item = saldos[index];
                      return Container(
                        width: 130,
                        margin: const EdgeInsets.only(right: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item['nama_dompet'] ?? 'Wallet', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                            const SizedBox(height: 8),
                            Text("Rp ${item['saldo']}", style: const TextStyle(fontWeight: FontWeight.bold)),
                            const Text("Saldo lokal", style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      );
                    },
                  ),
                );
              },
            ),

            const Padding(
              padding: EdgeInsets.all(16),
              child: Text("PPOB • Bayar & Isi Ulang", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),

            // Menu PPOB Grid Statis
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildMenuIcon(Icons.flash_on, "Pulsa", "Telkomsel, Indosat"),
                _buildMenuIcon(Icons.wifi, "Paket Data", "Harian, Mingguan"),
                _buildMenuIcon(Icons.electric_bolt, "Listrik", "Token & Tagihan"),
              ],
            ),

            const Padding(
              padding: EdgeInsets.all(16),
              child: Text("Produk • Sop Enak Sumekar", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),

            // SECTION 2: LIST PRODUK TANAMAN (Koneksi Supabase Otomatis)
            FutureBuilder<List<Map<String, dynamic>>>(
              future: fetchProduk(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text("Gagal memuat produk dari Supabase"));
                }

                final produkList = snapshot.data!;
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.8,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: produkList.length,
                  itemBuilder: (context, index) {
                    final produk = produkList[index];
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.green[50],
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                              ),
                              child: produk['url_gambar'] != null 
                                  ? Image.network(produk['url_gambar'], fit: BoxFit.cover)
                                  : const Icon(Icons.local_florist, size: 50, color: Colors.green),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(produk['nama_produk'] ?? 'Tanaman', style: const TextStyle(fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Text("Stok ${produk['stok'] ?? 0}", style: const TextStyle(color: Colors.green, fontSize: 12)),
                              ],
                            ),
                          )
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuIcon(IconData icon, String title, String subtitle) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: Colors.green, size: 32),
        const SizedBox(height: 4),
