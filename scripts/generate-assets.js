const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');

// --- Icon SVG template (Z monogram on rounded rect gradient) ---
const ICON_SVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#g)"/>
  <path d="M31 15H17l-2 4h10l-8 16h14l2-4H23l8-16z" fill="#fff"/>
</svg>`;

// --- Filled icon SVG (no rounded rect, just the Z shape with gradient) ---
const FAV_SVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <path d="M31 15H17l-2 4h10l-8 16h14l2-4H23l8-16z" fill="url(#g)"/>
</svg>`;

async function renderPng(size, svgFn = ICON_SVG) {
  return sharp(Buffer.from(svgFn(size)))
    .resize(size, size)
    .png()
    .toBuffer();
}

async function generate() {
  // --- PNG favicons ---
  console.log('Generating favicon-16.png...');
  await sharp(Buffer.from(FAV_SVG(48)))
    .resize(16, 16)
    .png()
    .toFile(path.join(PUBLIC, 'favicon-16.png'));

  console.log('Generating favicon-32.png...');
  await sharp(Buffer.from(FAV_SVG(48)))
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC, 'favicon-32.png'));

  // --- apple-touch-icon (180x180) ---
  console.log('Generating apple-touch-icon.png...');
  await sharp(Buffer.from(ICON_SVG(512)))
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC, 'apple-touch-icon.png'));

  // --- PWA icons ---
  console.log('Generating icon-192.png...');
  await sharp(Buffer.from(ICON_SVG(512)))
    .resize(192, 192)
    .png()
    .toFile(path.join(PUBLIC, 'icon-192.png'));

  console.log('Generating icon-512.png...');
  await sharp(Buffer.from(ICON_SVG(512)))
    .resize(512, 512)
    .png()
    .toFile(path.join(PUBLIC, 'icon-512.png'));

  // --- OG Image (1200x630) ---
  console.log('Generating og-image.png...');
  const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#0E1B2B"/>
    </linearGradient>
    <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="50%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Grid pattern -->
  <g opacity="0.03">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i*60}" y1="0" x2="${i*60}" y2="630" stroke="#60A5FA" stroke-width="1"/>`).join('')}
    ${Array.from({length: 12}, (_, i) => `<line x1="0" y1="${i*60}" x2="1200" y2="${i*60}" stroke="#60A5FA" stroke-width="1"/>`).join('')}
  </g>
  <!-- Glow -->
  <ellipse cx="240" cy="315" rx="300" ry="300" fill="#3B82F6" opacity="0.08" filter="url(#blur)"/>
  <ellipse cx="960" cy="315" rx="350" ry="250" fill="#06B6D4" opacity="0.06" filter="url(#blur)"/>
  <!-- Logo mark -->
  <g transform="translate(80, 243)">
    <rect x="2" y="2" width="96" height="96" rx="20" fill="url(#fg)"/>
    <path d="M67 30H37l-4 8h20l-16 32h28l4-8H53l16-32z" fill="#fff"/>
  </g>
  <!-- Text -->
  <text x="200" y="320" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#F8FAFC" letter-spacing="-1.5">Zilita</text>
  <text x="200" y="378" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="400" fill="#94A3B8" letter-spacing="-0.3">Smart Tools for Productivity &amp; Education</text>
  <!-- Gradient bar -->
  <rect x="0" y="620" width="1200" height="10" fill="url(#fg)"/>
  <defs>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>
</svg>`;
  await sharp(Buffer.from(OG_SVG))
    .resize(1200, 630)
    .png()
    .toFile(path.join(PUBLIC, 'og-image.png'));

  // --- favicon.ico (multi-size: 16, 32, 48) ---
  console.log('Generating favicon.ico...');
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(sz => sharp(Buffer.from(FAV_SVG(48))).resize(sz, sz).png().toBuffer())
  );

  const count = sizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);  // reserved
  header.writeUInt16LE(1, 2);  // type: 1 = ICO
  header.writeUInt16LE(count, 4);

  // ICO layout: [header][entry 0][entry 1][entry 2][png 0][png 1][png 2]
  let offset = 6 + count * 16;
  const icoParts = [header];
  const entries = [];

  for (let i = 0; i < count; i++) {
    const sz = sizes[i];
    const png = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sz >= 256 ? 0 : sz, 0);
    entry.writeUInt8(sz >= 256 ? 0 : sz, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }

  icoParts.push(...entries);
  icoParts.push(...pngBuffers);

  const icoBuf = Buffer.concat(icoParts);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), icoBuf);

  console.log('Done! All assets generated successfully.');
}

generate().catch(err => {
  console.error('Asset generation failed:', err);
  process.exit(1);
});
