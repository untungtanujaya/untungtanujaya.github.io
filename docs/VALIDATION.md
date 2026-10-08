# Validation — personal website v4

Tanggal: 8 Oktober 2026. Lingkungan: macOS, Node v22.21.0, astro v7.0.7, Playwright chromium (Desktop Chrome).
Semua perintah dijalankan dari `/Users/tanujaya/Projects/personal-website-v4`.

## 1. Build produksi

`npm run build` — sukses, 104 halaman HTML (EN/ZH × overview/work/work detail/research/publications/writing/writing detail/cv/tools/search + legacy redirect + 404), sitemap terfilter ke route locale saja, tanpa error atau warning blocking.

## 2. Integritas konten (`npm run test:content`)

PASS: 11 file sumber (4 data JSON + 7 artikel) byte-identical terhadap SHA-256 di `docs/content-manifest.json`; 104 halaman diperiksa: seluruh href/src internal resolve ke file build, anchor tujuan ada, tepat satu H1 per halaman locale, `rel="canonical"` + `hreflang="zh-Hans"` ada, halaman konten non-tools bebas runtime React (`astro-island`), feed EN/ZH masing-masing 8 item (7 artikel + 1 update riset), `dist/CNAME` = `untungtanujaya.com`, canonical memakai domain produksi.

## 3. E2E (`npm test`) — 27/27 lulus

- Matrix responsif 16 kombinasi (375/768/1024/1440 × EN/ZH × light/dark): tanpa overflow horizontal.
- Tema: mengikuti OS saat belum memilih; pilihan persist antar halaman; storage diblokir tidak merusak UI.
- Navigasi: locale context dipertahankan saat pindah halaman; skip link keyboard; menu mobile disclosure native.
- Search: query match, keadaan kosong menampilkan semua, no-result menjelaskan reset, substring Mandarin, query tersimpan di URL.
- CV: seluruh konten sumber tersedia; disclosure terbuka saat print; navigasi hilang di media print.
- Legacy: route v3 mengalih ke tujuan baru dengan query terjaga.
- No-JS: daftar tetap terbaca dan ternavigasi.
- Tools: regresi PHQ-9 dengan input known sama; 14 route smoke; navigasi tools dalam locale.
- Research: keadaan kosong publikasi jujur + feed valid.
- Semua route konten: nol error console browser.

## 4. Review visual (9 screenshot di `test-results/visual/`)

Home EN light 1440, home EN dark 1440, home ZH light 375, home ZH dark 375, CV, research, work detail, article reader, PHQ-9.
Arah "engineer's field notes" terbaca: grid terukur, pemisah tipis, label metadata monospace bernomor (01/PROFILE, 02/ENGINEERING, dst.), satu aksen biru, portrait kecil. Berbeda besar dari v3 (serif Fraunces, tinta hijau, aksen brass, panel "Currently"): v4 sans Plus Jakarta Sans, daftar tabular bukan kartu bertumpuk, hierarki lewat tipografi dan ruang. CJK ZH tampil benar di light/dark tanpa font eksternal. Reader artikel: lebar baca nyaman, TOC dari heading, kode scroll lokal.

## 5. Keputusan domain (perubahan dari PRD awal)

Pemilik memutuskan 8 Okt 2026: domain produksi tetap `https://untungtanujaya.com` (CNAME dipertahankan). Konsekuensi yang sudah diterapkan dan diverifikasi: `astro.config.mjs` site → `.com`, `public/robots.txt` sitemap → `.com`, `public/CNAME` = `untungtanujaya.com` (file CNAME wajib ikut build, sama seperti v3), basis URL check-content → `.com`, PRD §1 diperbarui. Build + content check + 27 test diulang setelah perubahan: hijau.

## 6. Limitasi

- Lighthouse tidak dijalankan pada validasi ini; tidak ada nilai performance yang diklaim. Target PRD ≥90 tetap terbuka untuk diukur terpisah.
- Core Web Vitals lapangan memerlukan trafik riil; tidak dijanjikan dari tes lokal.
- Badan artikel ZH tetap bahasa Inggris asli berlabel "英文原文" + abstrak Mandarin (sesuai PRD); terjemahan penuh bukan cakupan.
- Tools mempertahankan bahasa asli EN/ID; tidak diklaim sebagai instrumen klinis tervalidasi dalam bahasa lain.
- `gh auth` sempat invalid saat PRD ditulis; pada validasi ini token pulih (scope repo+workflow) sehingga rilis publik memungkinkan.

## 7. Catatan rilis

Diisi setelah deployment: SHA rilis source, SHA commit di repo deployment, Pages run, hasil production smoke, dan rollback point (`80b7acd` = rilis v3 terakhir).
