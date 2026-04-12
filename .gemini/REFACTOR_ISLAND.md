# Refaktor Floating Island - Realistis

## Tujuan
Membuat floating island lebih realistis seperti referensi gambar:
- Rumput hijau lebat di permukaan atas
- Batu/tanah gelap bertekstur di sisi-sisi
- Bentuk seperti kerucut terbalik (lebar di atas, meruncing ke bawah)
- Transisi natural dari rumput ke batu

## Perubahan yang Diperlukan

### 1. Vertex Shader (Multi-scale Displacement)
```glsl
// Multi-scale noise untuk tekstur batu yang natural
float noiseFreq1 = 1.5;
float noiseFreq2 = 3.0;
float noiseFreq3 = 6.0;

float noise1 = snoise(vec3(position.x * noiseFreq1, position.y * noiseFreq1, position.z * noiseFreq1));
float noise2 = snoise(vec3(position.x * noiseFreq2, position.y * noiseFreq2, position.z * noiseFreq2)) * 0.5;
float noise3 = snoise(vec3(position.x * noiseFreq3, position.y * noiseFreq3, position.z * noiseFreq3)) * 0.25;

float combinedNoise = noise1 + noise2 + noise3;

// Displacement lebih besar di sisi, lebih kecil di atas
float heightFactor = smoothstep(0.5, -0.8, position.y);
float noiseAmp = 0.35 * heightFactor + 0.05; // 0.05 to 0.4

vec3 newPosition = position + normal * combinedNoise * noiseAmp;
```

### 2. Fragment Shader (Warna Realistis)
```glsl
// ROCK/STONE COLORS
vec3 darkRock = vec3(0.15, 0.12, 0.10);      // Very dark brown-gray
vec3 midRock = vec3(0.25, 0.22, 0.18);       // Medium brown-gray
vec3 lightRock = vec3(0.35, 0.30, 0.25);     // Lighter brown
vec3 mossyRock = vec3(0.18, 0.25, 0.15);     // Dark mossy green

// GRASS COLORS
vec3 grassDark = vec3(0.15, 0.35, 0.10);     // Dark grass
vec3 grassMid = vec3(0.25, 0.50, 0.15);      // Medium grass
vec3 grassLight = vec3(0.35, 0.60, 0.20);    // Light grass

// DIRT/SOIL
vec3 dirtColor = vec3(0.30, 0.22, 0.15);

// Height-based blending: rock -> dirt -> grass
float grassStart = 0.5;
float grassFull = 0.7;
float grassMix = smoothstep(grassStart, grassFull, h);

float dirtStart = 0.2;
float dirtMix = smoothstep(dirtStart, grassStart, h);

// Ambient occlusion
float ao = smoothstep(-0.8, 0.6, h);
vec3 color = baseColor * light * (0.6 + ao * 0.4);
```

### 3. Geometry (Lebih Tinggi & Detail)
```javascript
// Main Island
new THREE.CylinderGeometry(2.0, 1.0, 2.0, 80, 32, true)

// Inner Wall
new THREE.CylinderGeometry(1.95, 0.95, 1.95, 80, 1, true)
```

## Fitur yang Harus Tetap Ada
1. ✅ Bot sinking animation (scroll part 2-3)
2. ✅ Floating animation
3. ✅ Camera movements
4. ✅ Sparkles effects
5. ✅ Cloud planes
6. ✅ Responsive scaling

## Status
- [x] Shader dirancang
- [ ] Shader diaplikasikan
- [ ] Geometry disesuaikan
- [ ] Testing fitur sinking
- [ ] Verifikasi visual

## Catatan
File ThreeCanvas.jsx sudah di-reset ke versi stabil.
Perlu apply perubahan dengan hati-hati agar tidak merusak fitur existing.
