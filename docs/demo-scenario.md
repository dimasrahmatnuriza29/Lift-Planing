# DEMO SCENARIO SCRIPT — RENTAL DIVISION
# Lift Planning System POC — Trakindo
# Tanggal: 29 Jul 2026

=====================================================================
KONTEKS DEMO
=====================================================================

Divisi Rental adalah divisi yang PALING SERING butuh lift plan.
Setiap hari, Trakindo Rental mengirim crane + operator ke site customer.
Sebelum lifting dimulai, operator WAJIB buat lift plan.
Lift plan = bukti due diligence Trakindo kalau terjadi insiden.

Target audience: Management Trakindo (Rental Director, HSE Manager, Ops Manager)
Durasi demo: 15-20 menit

=====================================================================
SKENARIO: LIFTING BOILER 40 TON DI REFINERY
(Case nyata — customer sewa crane Trakindo)
=====================================================================

LATAR BELAKANG:
  Customer: PT Pertamina Refinery Balikpapan
  Request: Angkat boiler unit 40 ton dari ground level ke platform
           setinggi 8 meter di area refinery.
  Crane yang disewa: Cat 336 (100 ton) — milik Trakindo Rental
  Operator: Eka Putra (Rigger Trakindo Rental)
  Supervisor: Fajar Nugroho (Supervisor Trakindo Rental)

  RISIKO:
  - Boiler 40 ton = beban berat, critical lift
  - Area refinery = ada pipa & struktur di sekitar (limited clearance)
  - Tanah area refinery = concrete pad, tapi ada trench di dekatnya
  - Angin di area pesisir Balikpapan bisa unpredictible
  - Kalau crane jatuh/kelebihan beban → Trakindo yang tanggung jawab

FLOW DEMO:

1. DASHBOARD OVERVIEW (2 menit)
   URL: http://localhost:3000/dashboard

   - Tunjukkan statistik: total plans, approved, pending, critical
   - Tunjukkan chart "Plan Status Distribution"
   - Tunjukkan chart "Crane Utilization Overview"
   - POINT: "Semua aktivitas lifting Trakindo Rental terpusat di satu dashboard.
             Management bisa monitor real-time berapa lift plan aktif,
             berapa yang critical, crane mana yang sedang digunakan."

2. REVIEW EXISTING RENTAL LIFT PLAN (3 menit)
   URL: http://localhost:3000/lift-plans/2
   (LP-2026-002: Loading Excavator Cat 320 ke Trailer — Rental Division)

   - Tunjukkan data: Divisi Rental, excavator 35 ton, crane Cat 320
   - Tunjukkan utilization: 70% (MODERATE — kuning)
   - Tunjukkan rigging: 4-leg sling, 45° angle
   - Tunjukkan risk: Low, standard exclusion zone
   - Tunjukkan approval: sudah approved
   - KLIK: Download PDF
   - POINT: "Ini dokumen yang operator bawa ke lapangan.
             Format profesional, branding Trakindo/CAT, siap print.
             Kalau terjadi insiden, ini bukti Trakindo sudah lakukan
             due diligence dengan benar."

3. LIVE DEMO: BUAT LIFT PLAN BOILER 40 TON (7 menit)
   URL: http://localhost:3000/lift-plans/create

   === STEP 1: LIFT REQUEST ===
   - Divisi: Rental
   - Title: "Lifting Boiler Unit ke Platform Refinery"
   - Type: Critical (beban > 30 ton = automatic critical)
   - Date: 15 Agustus 2026
   - Location: Pertamina Refinery Balikpapan

   POINT: "Divisi Rental dipilih karena crane milik Trakindo.
           Type Critical karena beban > 30 ton — ini akan trigger
           approval 4-level lengkap, tidak bisa di-skip."

   === STEP 2: LOAD ANALYSIS ===
   - Load Description: Boiler Unit Type Fire-Tube
   - Weight: 40,000 kg (40 ton)
   - Dimensions: 6.0m x 2.5m x 2.8m (panjang — perlu perhatian rigging)
   - CoG: X=3.0m, Y=1.25m, Z=1.4m
     (CoG X = 3.0m dari total length 6.0m → ratio 0.5, simetris)
   - Sistem auto-calculate total load (weight + rigging allowance)

   POINT: "Operator input data beban dari spec sheet boiler.
           Sistem auto-calculate total load termasuk rigging weight.
           CoG simetris di kasus ini — tapi kalau offset,
           sistem akan detect dan adjust perhitungan sling."

   === STEP 3: CRANE SELECTION ===
   - Pilih: Cat 336 (100 ton) — crane yang disewa customer
   - Lift Radius: 12m (crane park di sisi platform, jangkauan 12m)
   - Boom Length: 28m (jangkauan ke platform setinggi 8m)
   - SISTEM AUTO-CALCULATE:
     * Capacity at radius 12m: 28,000 kg (dari load chart Cat 336)
     * WAIT — 40,000 kg beban vs 28,000 kg capacity → UTILIZATION > 100%!

   DEMO THE "CRANE TIDAK CUKUP" SCENARIO:
   - Sistem akan show WARNING MERAH: "Utilization exceeds 100%!"
   - Operator harus pilih crane lebih besar

   - GANTI ke: Cat 340 (150 ton)
   - Radius 12m: capacity = 47,000 kg
   - Utilization: 40,000 ÷ 47,000 × 100 = 85% → MASIH CRITICAL (> 75%)

   - GANTI ke: Cat 345 (250 ton)
   - Radius 12m: capacity = 90,000 kg
   - Utilization: 40,000 ÷ 90,000 × 100 = 44% → SAFE (HIJAU)

   POINT: "Ini value utama sistem — operator TIDAK menebak crane.
           Sistem ambil capacity dari load chart asli per radius.
           Cat 336 tidak cukup di radius 12m, Cat 340 masih terlalu risky
           di 85%, Cat 345 aman di 44%.
           Tanpa sistem ini, operator bisa salah pilih crane = FATAL."

   === STEP 4: RIGGING PLAN ===
   - Sling Legs: 4 (beban panjang 6m → butuh 4 leg untuk stabil)
   - Sling Angle: 60° (standar untuk beban berat)
   - SISTEM AUTO-CALCULATE:
     * Sling tension per leg: dihitung dari total load ÷ (legs × sin 60°)
     * WLL required: tension × safety factor 6:1
     * Recommended sling size: auto-select dari catalog
   - Load length 6m > 3m → SISTEM RECOMMEND SPREADER BEAM
     "Beban 6m panjang — disarankan pakai spreader beam (5m)"
     KLIK: Apply

   POINT: "Beban 6 meter panjang → sling angle akan terlalu lebar
           kalau tanpa spreader beam. Sistem auto-recommend spreader beam
           dan hitung beam compression force.
           Sling tension & WLL dihitung otomatis dengan safety factor 6:1
           sesuai standar rigging industri."

   === STEP 5: SITE ASSESSMENT ===
   - Ground Type: Concrete (refinery pad)
   - Ground Bearing Capacity: 250 kPa (concrete pad refinery — kuat)
   - Slope: 1° (minimal, aman)
   - Wind Speed: 10 km/h (di bawah threshold 20 km/h — aman)
   - Overhead Clearance: 15m (area refinery terbuka di atas)
   - Nearest Obstacle: 6m (ada struktur refinery di dekatnya)

   SISTEM AUTO-VALIDATE: semua parameter dalam threshold aman.
   Tapi nearest obstacle 6m → sistem note untuk exclusion zone.

   POINT: "Sistem validate setiap parameter site.
           Kalau wind speed > 20 km/h → sistem akan flag WARNING.
           Kalau ground bearing capacity tidak cukup untuk outrigger load
           → sistem akan flag DANGER.
           Operator tidak perlu ingat threshold — sistem yang cek."

   === STEP 6: RISK ASSESSMENT ===
   - SISTEM AUTO-GENERATE berdasarkan data Step 2-5:
     * Hazard: "Heavy Load (>30 ton)" — auto-detected dari load weight
     * Hazard: "Limited Clearance" — auto-detected dari nearest obstacle
     * Hazard: "Wind Exposure" — auto-detected dari outdoor location
   - Risk score: dihitung dari hazard weight × severity
   - Risk level: MEDIUM (critical lift tapi site condition aman)
   - Mitigations auto-generated:
     * "Establish exclusion zone minimum 6m radius"
     * "Assign dedicated signalman"
     * "Pre-lift briefing dengan semua personnel"
     * "Wind monitoring continuous — stop if > 20 km/h"

   POINT: "Risk assessment tidak manual — sistem generate hazard
           berdasarkan data yang sudah di-input di step sebelumnya.
           Mitigations juga auto-generated sesuai hazard.
           Ini memastikan tidak ada hazard yang terlewat."

   === STEP 7: REVIEW SUMMARY ===
   - Tunjukkan semua data terstruktur:
     * Load: Boiler 40 ton, 6m x 2.5m x 2.8m
     * Crane: Cat 345 (250 ton), radius 12m, utilization 44%
     * Rigging: 4-leg sling 60° + spreader beam 5m
     * Site: Concrete 250 kPa, wind 10 km/h, clearance 15m
     * Risk: Medium, 3 hazards, 4 mitigations

   POINT: "Semua data satu tempat, terstruktur.
           Reviewer bisa lihat full picture sebelum approve."

   === STEP 8: SUBMIT ===
   - Plan number auto-generate: LP-2026-00X
   - Status: Submitted → masuk approval queue
   - Sistem confirm: "Lift plan submitted for approval"

   POINT: "Plan langsung masuk approval queue.
           Karena type Critical → butuh 4-level approval lengkap:
           Rigger → Supervisor → Safety Officer → Manager."

4. APPROVAL DEMO (3 menit)
   URL: http://localhost:3000/approvals

   - Tunjukkan plan baru di queue dengan status "Submitted"
   - Expand plan → tunjukkan approval steps:
     1. Rigger (Eka Putra) — PENDING
     2. Supervisor (Fajar Nugroho) — PENDING
     3. Safety Officer — PENDING
     4. Manager — PENDING

   - KLIK: Approve sebagai Rigger → status berubah APPROVED
   - KLIK: Approve sebagai Supervisor → status berubah APPROVED
   - Tunjukkan comment field (bisa tambah comment saat approve)
   - (Demo 2 level saja untuk waktu, jelaskan 4 level lengkap)

   POINT: "4-level approval berlapis. Setiap approve tercatat:
           siapa, kapan, comment apa.
           Kalau Safety Officer reject → plan kembali ke drafter
           dengan alasan. Full audit trail."

5. CRANE COMPARE DEMO (3 menit)
   URL: http://localhost:3000/cranes/compare

   - Pilih 3 crane: Cat 336, Cat 340, Cat 345
   - Tunjukkan LOAD CHART OVERLAY:
     3 garis di 1 chart — capacity vs radius untuk semua crane
     Cat 345 (250t) garis tertinggi, Cat 336 (100t) garis tengah

   - Tunjukkan SPEC COMPARISON TABLE:
     Max capacity, boom length, max radius, outrigger load
     Best value di-highlight hijau

   - LIFT SCENARIO TESTER (KEY FEATURE):
     Input: Load = 40 ton, Radius = 12m
     KLIK: Test Scenario

     HASIL:
     - Cat 336: capacity 28,000 kg → CANNOT LIFT (40,000 > 28,000)
       Utilization: 143% — DANGER MERAH
     - Cat 340: capacity 47,000 kg → CAN LIFT
       Utilization: 85% — CRITICAL MERAH
     - Cat 345: capacity 90,000 kg → CAN LIFT
       Utilization: 44% — SAFE HIJAU

     RECOMMENDATION: "Cat 345 — lowest utilization at 44%"

   POINT: "Ini tool decision-support untuk Rental division.
           Sebelum kirim crane ke customer, engineer bisa compare
           crane mana yang optimal untuk beban & radius tertentu.
           Data-driven, bukan trial-and-error di site."

=====================================================================
CLOSING: VALUE PROPOSITION UNTUK RENTAL DIVISION (2 menit)
=====================================================================

3 KEY VALUE:

1. PROTECT TRAKINDO LIABILITY
   "Setiap lift di site customer = risiko Trakindo.
    Lift plan digital = bukti due diligence.
    Kalau terjadi insiden, Trakindo punya dokumen lengkap:
    siapa buat, siapa approve, data perhitungan, risk assessment."

2. ELIMINATE HUMAN ERROR
   "Sling tension, WLL, utilization — semua auto-calculate.
    Operator tidak bisa salah hitung.
    Sistem akan BLOCK kalau utilization > 100% atau crane tidak cukup.
    Crane compare bantu pilih crane yang tepat sebelum kirim ke site."

3. PROFESSIONAL DOCUMENT
   "PDF otomatis dengan branding Trakindo/CAT.
    Bisa di-print, dibawa ke site, di-archive.
    Kalau customer atau regulator audit, Trakindo punya dokumen
    profesional untuk setiap lifting."

=====================================================================
ANTISIPASI PERTANYAAN
=====================================================================

Q: "Apakah data crane-nya asli?"
A: "Format load chart sudah sesuai manufacturer manual Caterpillar.
    Load chart Cat 336, Cat 340, Cat 345 sudah input.
    Tinggal verifikasi dengan manual terbaru dari Caterpillar.
    Database siap untuk semua model crane Trakindo."

Q: "Kalau customer punya crane sendiri, bisa pakai sistem ini?"
A: "Ya. Crane customer bisa di-input ke database dengan load chart
    dari manufacturer manual. Sistem flexible untuk crane brand apa saja."

Q: "Bagaimana kalau operator di lapangan tidak punya laptop?"
A: "Responsive design — operator bisa akses dari tablet/handphone
    di site. Buat lift plan langsung di lapangan sebelum lifting.
    Di production, bisa dibuat PWA (Progressive Web App) untuk
    offline mode di area site yang tidak ada signal."

Q: "Berapa lama development production?"
A: "Estimasi 3-4 bulan dengan tim 3-4 orang.
    POC ini sudah cover 80% core functionality.
    Tambahan production: user authentication, photo upload,
    integration dengan ERP Trakindo, multi-language (ID/EN)."

Q: "Apakah bisa integrate dengan sistem Trakindo yang sudah ada?"
A: "Ya, RESTful API. Bisa integrate dengan SAP/ERP Trakindo
    untuk auto-fetch data divisi, customer, equipment, user.
    API sudah standar — tinggal mapping ke sistem existing."

Q: "Siapa yang akan pakai sistem ini di Trakindo?"
A: "Primary user: Operator/Driver crane Rental division.
    Secondary: Supervisor (approve), Safety Officer (review risk),
    Manager (monitor dashboard).
    Tertiary: Management (dashboard analytics, reporting)."

Q: "Kalau lift plan di-reject, apa yang terjadi?"
A: "Plan kembali ke operator dengan alasan reject + comment.
    Operator bisa edit dan re-submit.
    Semua history reject tercatat untuk audit trail."

=====================================================================
PRE-DEMO CHECKLIST
=====================================================================

SEBELUM DEMO:
  [ ] Server running (npm run dev)
  [ ] Database seeded (npm run db:seed)
  [ ] Test semua route: /dashboard, /lift-plans, /lift-plans/create,
      /lift-plans/2, /approvals, /cranes/compare
  [ ] Test PDF download di /lift-plans/2
  [ ] Browser fullscreen (F11), zoom 100%
  [ ] Pastikan internet stabil (Google Fonts)
  [ ] Siapkan scenario boiler 40 ton di hati/memorized
  [ ] Test "crane tidak cukup" scenario: Cat 336 di radius 12m
      harus show utilization > 100% (DANGER)

DEMO FLOW:
  1. Dashboard (2 min)
  2. Review existing plan LP-2026-002 + PDF (3 min)
  3. Live create boiler 40 ton (7 min) — HIGHLIGHT
  4. Approval demo (3 min)
  5. Crane compare (3 min)
  6. Closing + Q&A (2 min)

TIPS DEMO:
  - Jangan terlalu cepat di Step 3 (Crane Selection) —
    ini moment "wow" saat sistem show crane tidak cukup
  - Saat sistem show WARNING MERAH utilization > 100%,
    JELASKAN: "Tanpa sistem ini, operator bisa salah pilih crane"
  - Saat auto-recommend spreader beam, tunjukkan ini adalah
    engineering intelligence yang tidak ada di sistem manual
  - Di Crane Compare, test scenario 40 ton/12m —
    tunjukkan 3 crane sekaligus, recommendation otomatis
