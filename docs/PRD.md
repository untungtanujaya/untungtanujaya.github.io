# PRD — Untung Tanujaya, personal website v4

Status: implementasi lokal. Pemilik: Untung Tanujaya. Tanggal: 8 Oktober 2026.

## 1. Tujuan produk

Website personal bilingual yang menjelaskan rekam jejak backend engineering, menyajikan CV yang mudah dipindai, dan menjadi rumah berkelanjutan untuk studi serta publikasi riset S2. Struktur dan frontend dibangun ulang, dengan konten sumber dipertahankan.

Target rilis: `https://untungtanujaya.com` (keputusan pemilik 8 Okt 2026: CNAME Pages dipertahankan; `untungtanujaya.github.io` me-redirect ke sana). Repository sumber baru: `personal-website-v4` (private). Folder lokal: `/Users/tanujaya/Projects/personal-website-v4`. Riwayat v3 tetap utuh.

## 2. Audiens dan pekerjaan yang ingin diselesaikan

| Audiens | Pertanyaan utama | Alur sukses |
| --- | --- | --- |
| Perekrut / hiring manager | Siapa orang ini dan apa kompetensi backend-nya? | Overview → Work → CV → email/LinkedIn |
| Engineer | Bagaimana ia memecahkan masalah sistem? | Work → detail proyek → Writing → artikel |
| Pembimbing / kolaborator akademik | Apa studi, minat, dan publikasinya? | Research → publikasi atau kondisi belum ada → kontak |
| Pengguna lama tools | Di mana kalkulator saya? | URL lama → tools yang sama |
| Pemilik | Bagaimana menambah paper tanpa mengubah layout? | Tambah file Markdown sesuai schema → validasi → rilis |

## 3. Prinsip dan batas cakupan

Konten sebagai bukti; pembaca memahami profesi dan status S2 dalam layar pertama. Comfortable density pada overview, balanced pada daftar, readable pada artikel/CV. Gunakan fakta sumber; jangan mengarang paper, metrik, afiliasi, proyek publik atau tautan GitHub untuk pekerjaan privat.

Termasuk: redesign menyeluruh, CV, work, writing, research/publications, feed, search, contact, tools, dua tema, EN/简体中文, SEO, responsive, print, migrasi URL, repo dan deployment.

Tidak termasuk: CMS berbayar, akun pengguna, backend server, analytics/tracking, formulir email yang memerlukan layanan pihak ketiga, penyusunan penelitian baru, sertifikasi medis, atau perubahan rumus kalkulator.

## 4. Arsitektur informasi

```text
/ → overview Inggris (tautan ke dua bahasa, pengalihan statis)
/{en|zh}/                    Overview
/{en|zh}/work/               Selected work, empat proyek
/{en|zh}/work/{slug}/        Detail pekerjaan/proyek
/{en|zh}/research/           Studi, area minat, pembaruan terbaru
/{en|zh}/research/publications/   Daftar publikasi, keadaan kosong
/{en|zh}/research/publications/{id}/   Paper, abstrak, tautan, sitasi
/{en|zh}/writing/            Tujuh artikel, tanggal dan waktu baca
/{en|zh}/writing/{slug}/     Reader artikel asli
/{en|zh}/cv/                 Ringkasan, pengalaman, pendidikan, skill
/{en|zh}/tools/              Indeks koleksi pendukung
/{en|zh}/tools/{specialty}/  Radiology / Psychiatry
/{en|zh}/tools/{specialty}/{slug}/  Kalkulator asli
/{en|zh}/search/             Pencarian lokal seluruh koleksi
/{en|zh}/feed.xml            Artikel, pembaruan riset, paper
/404.html                   Pemulihan dari URL salah
```

Navigasi utama: Work, Research, Writing, CV. Identitas ke Overview. Search, bahasa dan tema selalu mudah ditemukan. Tools dan kontak di footer serta tautan konteks. Mobile memakai menu disclosure native, bukan overlay yang memerlukan focus trap. Breadcrumb/back link muncul di detail.

## 5. Spesifikasi halaman

### Overview

Hero menyebut nama, backend engineer, Go/Python, production reliability. Subteks menyebut S2 HIT dan Harbin. Satu CTA utama ke Work, CTA sekunder CV. Panel identitas memakai portrait asli. Bagian berikutnya: riwayat perusahaan ringkas; 3 selected projects; research preview dengan status studi; 3 tulisan; kontak.

### Work

Empat pekerjaan: OCR/RPA, agent workflow, customs gateway, Tokopedia Plus. Setiap item: urutan, judul, kategori, deskripsi, teknologi. Detail mempertahankan seluruh deskripsi sumber, menambahkan navigasi dan pengelompokan tanpa membuat hasil baru. Tidak ada tombol demo/repository jika sumber tidak menyediakannya.

### CV

Informasi kontak, posisi, pendidikan dan pengalaman kronologis. Ringkasan tiap peran selalu terlihat; detail lengkap bisa dibuka dengan keyboard dan menjadi terbuka saat mencetak. Semua skill tetap tersedia. Tombol Print / Save PDF memanggil print browser; CSS print membuang navigasi, menghilangkan disclosure tertutup, memakai tinta hitam dan kertas putih. Tidak berpura-pura memiliki PDF unduhan yang belum ada.

### Research

Pendidikan S2 sejak September 2026. Area fokus bersumber dari repo: software architecture, distributed systems, artificial intelligence, research methodology. Bedakan "minat/studi" dari "hasil/publikasi". Update awal hanya fakta mulai studi. Publications memiliki halaman sendiri dan keadaan kosong yang jelas dengan tautan research/contact. Publikasi mendatang dibuat dari koleksi, bukan HTML per paper.

### Writing

Daftar editorial tanpa kartu besar berulang. Judul dan ringkasan singkat terlokalisasi, tanggal dan waktu baca. Detail memakai lebar 68–72 karakter, heading yang bisa dipindai, kode bisa discroll secara lokal, daftar isi dari heading Markdown. Badan tujuh artikel asli Inggris dipertahankan verbatim; di UI Mandarin diberi label "英文原文" serta abstrak Mandarin. Schema siap untuk file terjemahan opsional di masa depan.

### Tools

Diindeks sebagai aplikasi pendukung. Semua 14 fungsi dan konten Inggris/Indonesia lama dipertahankan. Navigasi luar EN/ZH, aplikasi ditandai bahasa aslinya. Tidak menerjemahkan instrumen menjadi seolah versi klinis tervalidasi. Indeks dapat digunakan tanpa JavaScript; fungsi perhitungan memerlukan JS dengan pesan noscript yang jelas. Pengubahan UI tidak merupakan validasi klinis.

### Search

Cari work, CV, writing, research, publikasi dan tools secara lokal tanpa request eksternal. Pencarian tidak peka huruf besar, mendukung substring Mandarin. Query tersimpan di URL. Semua hasil tampil pada query kosong, hasil kosong menjelaskan cara reset. Result count memakai aria-live. Tanpa JS daftar tetap tersedia untuk dibrowse.

## 6. Persyaratan fungsional dan penerimaan

| ID | Kebutuhan | Kriteria lulus |
| --- | --- | --- |
| F01 | CV lengkap | 4 role, 2 pendidikan, 3 skill groups; seluruh teks sumber tersedia |
| F02 | Work | 4 listing dan 4 detail per bahasa; tidak ada dead action |
| F03 | Research | Hub + publications; zero paper state tanpa placeholder fiktif |
| F04 | Publikasi | Schema tervalidasi, status/venue/authors/date/abstract/DOI/PDF/code/BibTeX; draft tersembunyi |
| F05 | Tema | System default + light/dark/system, persist antar halaman, storage error tidak merusak UI |
| F06 | Bahasa | EN/ZH locale routes; switch mempertahankan halaman, query dan hash; lang/hreflang/canonical benar |
| F07 | Writing | 7 sumber tidak berubah; original-language banner; reader responsif |
| F08 | Tools | Semua 14 route aktif; hasil sampel regresi sama; asli en/id tetap tersedia |
| F09 | Search | Query match + no-result + reset + URL state diuji |
| F10 | Print CV | Navigasi hilang; detail muncul; konten tidak terpotong horizontal |
| F11 | Compatibility | Semua route v3 punya pengalihan; 404 berfungsi di static host |
| F12 | Contact | Email, LinkedIn, GitHub valid sesuai sumber; tanpa form palsu |
| F13 | Feed/SEO | Sitemap, robots, RSS; metadata unik dan locale alternates |
| F14 | Release | Repo Git baru, build reproducible, tes lulus sebelum deployment |

## 7. Visual system

Arah: engineer's field notes. Grid bersih, typographic hierarchy, pemisah tipis, metadata monospace, portrait kecil yang manusiawi. Bukan simulator terminal atau dashboard statistik. Warna dasar slate/ink; biru hanya link, focus, primary action. Surface datar; radius 8–16px; tidak ada gradient neon atau dekorasi yang menghalangi pembacaan.

Sans: Plus Jakarta Sans lokal (sudah tersedia), fallback CJK PingFang SC / Microsoft YaHei / sans-serif. Mono sistem untuk nomor/label, bukan body. Ukuran body 16–18px, metadata ≥12px, judul fluid 40–76px dengan line-height yang cocok untuk CJK. Tidak memakai font CJK eksternal yang menghambat jaringan China.

Lebar max 1160px, gutter fluid 20–56px. Mobile satu kolom; hero dua kolom pada ≥900px; CV/sidebar reader runtuh ke urutan DOM yang benar. Content tidak disembunyikan oleh animasi. Hover/focus 150ms; prefers-reduced-motion menonaktifkan transisi.

## 8. Aksesibilitas, performance, SEO

Target WCAG 2.2 AA: semantic landmarks, satu H1, skip link, active nav aria-current, form label, focus terlihat, semua fungsi keyboard. Kontras teks ≥4.5:1, target sentuh utama ≥44px. Uji 375/768/1024/1440px, EN/ZH × light/dark. Zoom/reflow, code scroll lokal, long strings wrap. Tidak menggunakan warna saja untuk status.

Astro static output; React hanya pada halaman kalkulator. Tidak ada client router, font eksternal, tracker atau backend baru. Target halaman konten tidak memuat runtime React; JS shell kecil; portrait dibatasi dimensi untuk menghindari CLS. Lighthouse target ≥90 performance/accessibility/SEO bila runner tersedia; nilai tidak boleh diklaim tanpa pengukuran. Core Web Vitals lapangan memerlukan trafik dan tidak dijanjikan dari tes lokal.

Canonical menggunakan domain target; hreflang en/zh-Hans/x-default. Structured data Person. Paper memakai ScholarlyArticle bila record ada. Sitemap tidak mencantumkan legacy redirects atau draft. Feed menggunakan XML escaping dan absolute URLs.

## 9. Konten dan model data

Data CV/proyek asli di `src/data/*.json` tetap byte-identical untuk audit. Terjemahan Mandarin terpisah berdasarkan id, tanpa menimpa sumber. Artikel asli di `src/content/articles/*.md`. Manifest SHA-256 memverifikasi tidak ada konten hilang.

Publication: id dari filename; title dan abstract EN/ZH; authors[]; published date; venue; status (preprint/published); optional doi, paperUrl, codeUrl, bibtex; draft default true. Tidak ada record contoh yang masuk build. Update riset: date, title/body EN/ZH, type. Tautan sumber hanya berasal dari data nyata.

Workflow menambah paper: salin template di docs → isi fakta → letakkan di koleksi → set draft false setelah siap → `npm run validate` → review → deploy. Artikel tetap kategori Writing, tidak otomatis menjadi publikasi akademik.

## 10. Stack dan keputusan teknis

Pertahankan Astro 7/React 19/Tailwind 4 yang sudah terpasang, dengan lockfile. Static locale paths dibuat lewat getStaticPaths. CSS tokens bersama, Astro components untuk shell/list/reader. React kalkulator dipertahankan terisolasi. ESLint/CMS/framework tambahan tidak diperlukan untuk redesign ini.

Referensi implementasi: [Astro routing](https://docs.astro.build/en/guides/routing/), [content collections](https://docs.astro.build/en/guides/content-collections/), [i18n](https://docs.astro.build/en/guides/internationalization/), [GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

## 11. Rencana validasi

1. Audit manifest 4 data files + 7 article files dan route inventory.
2. Build produksi, internal link/asset check, canonical/locale checks, draft exclusion.
3. Browser E2E: navigasi, locale context, theme persistence/system/storage blocked, search, mobile menu, print, no-JS.
4. Visual: screenshot overview, CV, research, work detail, article, tools pada desktop/mobile; matrix 4 width × 2 theme × 2 language untuk overflow.
5. Regresi kalkulator PHQ-9 dan eGFR/CT-dose dengan input known; semua 14 route smoke.
6. Setelah deploy, verifikasi HTTPS, root, locale, deep links, assets, sitemap/feed dan custom-domain behavior.

## 12. Rilis dan rollback

Repo sumber baru memiliki sejarah sendiri. Repo deployment `untungtanujaya.github.io` mempertahankan riwayatnya; hasil rilis dipromosikan sebagai commit baru, tanpa force push atau mengganti sejarah. Build/test CI harus lulus sebelum Pages deployment. Source repo tidak mencoba deploy ke project Pages yang salah.

Sebelum publikasi: periksa remote HEAD dan Pages settings, simpan SHA rilis lama, pastikan domain `.github.io` sesuai permintaan. Custom domain lama `.com` perlu dikelola lewat settings/CNAME pada repo deployment agar target tidak diam-diam redirect. Rollback dengan revert commit rilis dan rerun workflow, bukan reset paksa.

Kendala awal: `gh auth status` melaporkan token invalid dan koneksi CLI GitHub gagal. Ini bukan alasan mengurangi kualitas implementasi lokal. Rilis publik belum dinyatakan selesai sebelum koneksi/autentikasi pulih dan production smoke lulus.

## 13. Definisi selesai

PRD/audit/design lengkap, repo baru ter-commit, data lama terjaga, seluruh acceptance checks yang tersedia lulus, screenshots diperiksa, limitation terdokumentasi, deployment berjalan dan production verification sukses. Jika deployment terhalang autentikasi/jaringan, status adalah "lokal siap, deployment tertunda", bukan "selesai live".
