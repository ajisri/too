# PANDUAN TIMING ANIMASI - STORY OF AKSA

## ATURAN URUTAN KEMUNCULAN ELEMEN

### 1. FLOOR ID 0 (Intro - "Based in Semarang")
- **Tampil**: Teks "Based in Semarang Indonesia"
- **TIDAK tampil**: 
  - Bot (opacity: 0)
  - Tree (opacity: 0)
  - Floating Island (opacity: 0)
  - Teks "Bayangan yang ia tinggalkan" (HARUS SUDAH HILANG SEPENUHNYA)

### 2. TRANSISI ke FLOOR ID 1 (AWAKENING)
**URUTAN YANG BENAR:**
1. Teks "Based in Semarang" fade out SEPENUHNYA
2. Layar menjadi FULL HITAM
3. **BARU KEMUDIAN** teks "Bayangan yang ia tinggalkan" fade in
4. Teks "Bayangan yang ia tinggalkan" fade out
5. **BARU KEMUDIAN** background text "AWAKENING" muncul

**CATATAN PENTING:**
- JANGAN tampilkan "Bayangan yang ia tinggalkan" saat masih ada transisi dari "Based in Semarang"
- Tunggu hingga layar benar-benar hitam sebelum menampilkan "Bayangan yang ia tinggalkan"

### 3. FLOOR ID 1 (AWAKENING)
**Urutan kemunculan:**
1. Background text "AWAKENING" fade in
2. Background text "AWAKENING" fade out
3. **BARU KEMUDIAN** konten teks floor 1 muncul

**TIDAK tampil:**
- Bot (opacity: 0)
- Tree (opacity: 0)  
- Floating Island (opacity: 0)

### 4. FLOOR ID 2 (AKSA) - MASALAH UTAMA
**Urutan kemunculan yang BENAR:**
1. Background text "AKSA" fade in
2. Background text "AKSA" fade out SEPENUHNYA
3. **BARU KEMUDIAN** konten teks floor 2 muncul
4. **BERSAMAAN** dengan konten teks:
   - Bot fade in DAN berdiri (rotationX: 0)
   - Tree fade in dengan posisi NORMAL (trunk di bawah, daun di atas)
   - Floating Island fade in

**PERBAIKAN YANG DIPERLUKAN:**
- ✅ Bot HARUS berdiri (rotationX: 0), BUKAN tiduran (rotationX: -Math.PI/2)
- ✅ Tree HARUS normal (rotation: [0, 0, 0]), BUKAN terbalik (rotation: [Math.PI, 0, 0])
- ✅ Tree position HARUS di atas permukaan island, BUKAN di bawah tanah
- ✅ Background text "AKSA" HARUS hilang SEBELUM konten teks muncul

### 5. FLOOR ID 3-9 (Lanjutan cerita)
- Semua elemen 3D tetap visible dengan opacity: 1
- Bot melakukan animasi sesuai cerita (tenggelam, muncul kembali, dll)
- Tree dan Island tetap visible

---

## KONFIGURASI POSISI & ROTASI

### Tree Component
```javascript
// FLOOR ID 2 (AKSA) - POSISI NORMAL
position={[0, -0.5, -0.8]}  // Y: -0.5 agar trunk di atas permukaan island
rotation={[0, 0, 0]}         // TIDAK TERBALIK (bukan Math.PI)
```

### Bot Component  
```javascript
// FLOOR ID 2 (AKSA) - BERDIRI
positionY: 0.3               // Di atas permukaan island
rotationX: 0                 // BERDIRI (bukan -Math.PI/2)
rotationY: 0
rotationZ: 0
```

### Floating Island
```javascript
// Base position
position={[0, -1.0, -0.8]}
// Grass & rocks position relative to island
grassPosition: y = -0.75
rockPosition: y = -0.75
```

---

## TIMING ANIMASI TEKS

### Title "Bayangan yang ia tinggalkan"
```javascript
scrollTrigger: {
  start: "5% top",  // Mulai SETELAH layar hitam penuh
  end: "12% top",    // Selesai SEBELUM AWAKENING muncul
}
```

### Initial Delay (Global)
Menambahkan `INITIAL_DELAY = 1.5` (turunan view height) di awal timeline untuk memastikan jeda yang cukup antara transisi intro dan kemunculan "AWAKENING".

### Tree Rotation Fix (CRITICAL)
Menggunakan hardcoded `rotation={[0, 0, 0]}` langsung di dalam komponen `Tree.jsx` untuk mencegah props eksternal membalikkan pohon secara tidak sengaja. Posisi Y dinaikkan ke `0.2` untuk memastikan pohon berada di atas permukaan tanah.

### Active Floor Logic (Bi-directional)
Menggunakan `onReverseComplete` untuk memastikan animasi (seperti api) tetap muncul saat scroll back.

```javascript
// Content In
onStart: () => setActiveFloorId(id)           // Forward Enter
onReverseComplete: () => setActiveFloorId(null) // Backward Exit

// Content Exit
onComplete: () => setActiveFloorId(null)      // Forward Exit
onReverseComplete: () => setActiveFloorId(id)   // Backward Enter
```

### Background Text Sequence (per floor)
```javascript
// Durasi total per floor = thisDuration
bgInDuration = thisDuration * 0.25      // 25% untuk fade in
bgStayDuration = thisDuration * 0.15    // 15% untuk stay
bgOutDuration = thisDuration * 0.25     // 25% untuk fade out
contentInDuration = thisDuration * 0.35 // 35% untuk konten fade in

// Timeline:
// [0%--------25%] BG fade in
// [25%-------40%] BG stay
// [40%-------65%] BG fade out
// [65%------100%] Content fade in & stay
```

**PENTING:** Background text HARUS opacity: 0 SEBELUM content muncul!

---

## CHECKLIST DEBUGGING

Saat memeriksa FLOOR ID 2 (AKSA):
- [ ] Background text "AKSA" muncul terlebih dahulu?
- [ ] Background text "AKSA" hilang SEPENUHNYA sebelum konten teks muncul?
- [ ] Bot berdiri (rotationX: 0), bukan tiduran?
- [ ] Tree trunk di bawah, daun di atas (rotation: [0,0,0])?
- [ ] Tree tidak tertanam di bawah tanah (positionY: -0.5)?
- [ ] Island, tree, dan bot fade in bersamaan dengan konten teks?

---

## CATATAN TAMBAHAN

1. **currentPart** di ThreeCanvas.jsx menggunakan index 0-8:
   - currentPart 0 = AWAKENING (floor.id 1)
   - currentPart 1 = AKSA (floor.id 2)
   - currentPart 2 = TIME (floor.id 3)
   - dst...

2. **Tree.jsx** memiliki rotation prop yang di-apply ke group utama:
   - Jangan gunakan `rotation={[Math.PI, 0, 0]}` karena akan membalik tree
   - Gunakan `rotation={[0, 0, 0]}` untuk posisi normal

3. **Bot standing position**:
   - rotationX: 0 = berdiri
   - rotationX: -Math.PI/2 = tiduran
   - Transisi dari tiduran ke berdiri menggunakan THREE.MathUtils.lerp()
