# Audit personal website v3 → v4

Tanggal: 8 Oktober 2026. Sumber: kode dan konten lokal v3, bukan asumsi dari portfolio generik. Repo lama tidak dimodifikasi. Screenshot lama yang belum di-commit tetap milik repo lama.

## Kesimpulan

Konten profesional sudah cukup kuat, tetapi arsitektur informasi belum membantu pengunjung memahami hubungan antara pekerjaan backend, studi S2, dan tulisan teknis. Perubahan yang diperlukan adalah penataan ulang menyeluruh, bukan mengganti warna saja.

| Prioritas | Temuan berbasis kode | Dampak | Keputusan v4 |
| --- | --- | --- | --- |
| P0 | Layout mengunci `color-scheme: dark`; tidak ada pengaturan tema | Preferensi pembaca tidak terlayani | Sistem/light/dark dengan penyimpanan pilihan dan fallback tanpa JS |
| P0 | Layout selalu `lang=en`; data CV hanya Inggris | Tidak memenuhi kebutuhan Mandarin | URL `/en/` dan `/zh/`, UI serta profil/CV/proyek diterjemahkan |
| P0 | Belum ada koleksi atau halaman research | S2 hanya paragraf homepage; publikasi masa depan tidak punya tempat | Research hub, publikasi, detail publikasi, pembaruan, RSS |
| P1 | Homepage hanya hero dan panel "Currently" | Bukti pengalaman dan tulisan tersembunyi | Home menampilkan profil, selected work, study/research, tulisan |
| P1 | Apps setara bobotnya dengan resume di navigasi utama | Identitas backend engineer kurang fokus | Tools jadi koleksi pendukung; semua URL lama tetap tersedia |
| P1 | CV berupa daftar panjang, fr8co punya 10 uraian panjang | Sulit dipindai perekrut | Ringkasan pengalaman, timeline, uraian lengkap dalam disclosure, print CV |
| P1 | Detail proyek hanya deskripsi dan teknologi | Pembaca sulit menghubungkan proyek dengan kompetensi | Halaman kerja berstruktur, konteks praktik dan tautan tulisan relevan tanpa menambah klaim hasil |
| P1 | Motion gate, failsafe 2.5 detik, ClientRouter, event lifecycle khusus | Kompleksitas untuk website konten | Navigasi HTML biasa; konten langsung terlihat; motion hanya feedback |
| P1 | Tidak ada halaman 404 khusus | Jalan buntu saat URL salah | 404 dengan jalur kembali dan pencarian |
| P1 | Canonical, sitemap dan CNAME mengarah ke `.com` | Target user sekarang `.github.io` | Konfigurasi domain rilis eksplisit; jangan menyalin CNAME lama |
| P2 | Apps menggunakan sejumlah teks 10–12px, flag emoji, navigasi button | Keterbacaan dan semantik tidak konsisten | Indeks tools statis, label teks, tipografi lebih besar; kalkulasi lama dipertahankan |
| P2 | Font serif dekoratif, kartu dan reveal tersebar | Presentasi belum langsung mencerminkan profesi | Sans yang jelas, mono untuk metadata, grid terukur, satu aksen biru |

## Yang dipertahankan

- 4 pengalaman kerja, 2 pendidikan, 4 proyek, 3 kelompok skill, 7 artikel.
- Semua angka, tanggal, nama organisasi, detail karier dan badan artikel Inggris dari sumber.
- 14 kalkulator dan dukungan bahasa Inggris/Indonesia yang sudah ada di kalkulator.
- Email, LinkedIn, GitHub dan identitas personal.
- URL lama melalui halaman pengalihan statis; slug proyek tidak berubah.

## Yang dikurangi

Pengulangan paragraf di homepage, efek masuk yang menunda teks, visual ala dashboard, kartu bertumpuk, terlalu banyak aksen, navigasi berbasis React untuk halaman daftar, dan angka vanity sebagai headline. Angka sumber tetap disimpan di CV lengkap.

## Batas pengetahuan

S2 tercatat sejak September 2026 di Harbin Institute of Technology, bidang Software Engineering. AI dan software engineering adalah fokus studi yang tercantum, bukan judul tesis atau hasil penelitian yang sudah terbukti. Tidak ada publikasi terverifikasi di repo. Research dimulai dengan keadaan kosong yang jujur. Tidak dibuat DOI, pembimbing, afiliasi lab, paper, penghargaan, atau data dampak baru.

Artikel panjang dan instrumen klinis adalah konten asli yang dipertahankan dengan penanda bahasa; Mandarin diterapkan pada penemuan konten dan shell. Terjemahan instrumen klinis bukan bagian dari perubahan desain dan tidak boleh diklaim sebagai versi Mandarin tervalidasi.

Audit awal berbasis kode. Hasil pengujian build, browser dan screenshot dicatat terpisah dalam VALIDATION.md setelah implementasi.
