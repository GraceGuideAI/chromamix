const sharp = require('sharp');
const path = require('path');

// ChromaMix brand colors - purple gradient
const GRADIENT_START = '#6366f1'; // indigo-500
const GRADIENT_END = '#a855f7';   // purple-500
const BACKGROUND = '#1e1b4b';     // dark purple

async function createIcon(size, outputPath) {
  // Create SVG with gradient background and "C" logo
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${GRADIENT_START}"/>
          <stop offset="100%" style="stop-color:${GRADIENT_END}"/>
        </linearGradient>
        <linearGradient id="letter-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff"/>
          <stop offset="100%" style="stop-color:#e0e7ff"/>
        </linearGradient>
      </defs>
      <!-- Background with rounded corners -->
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg-gradient)"/>
      <!-- Inner circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="${BACKGROUND}" opacity="0.3"/>
      <!-- Letter C with color mixing hint -->
      <text 
        x="${size/2}" 
        y="${size * 0.65}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${size * 0.55}" 
        font-weight="bold"
        fill="url(#letter-gradient)"
        text-anchor="middle"
        style="filter: drop-shadow(0 ${size * 0.02}px ${size * 0.04}px rgba(0,0,0,0.3));"
      >C</text>
      <!-- Color mixing accent dots -->
      <circle cx="${size * 0.25}" cy="${size * 0.75}" r="${size * 0.06}" fill="#ef4444" opacity="0.9"/>
      <circle cx="${size * 0.35}" cy="${size * 0.82}" r="${size * 0.05}" fill="#fbbf24" opacity="0.9"/>
      <circle cx="${size * 0.75}" cy="${size * 0.75}" r="${size * 0.06}" fill="#3b82f6" opacity="0.9"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Created ${path.basename(outputPath)} (${size}x${size})`);
}

async function createFavicon(outputPath) {
  const size = 32;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${GRADIENT_START}"/>
          <stop offset="100%" style="stop-color:${GRADIENT_END}"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg-gradient)"/>
      <text 
        x="${size/2}" 
        y="${size * 0.72}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${size * 0.6}" 
        font-weight="bold"
        fill="white"
        text-anchor="middle"
      >C</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Created favicon.png (${size}x${size})`);
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('🎨 Generating ChromaMix PWA icons...\n');
  
  // Standard PWA icons
  await createIcon(192, path.join(publicDir, 'icon-192.png'));
  await createIcon(512, path.join(publicDir, 'icon-512.png'));
  
  // Apple touch icon
  await createIcon(180, path.join(publicDir, 'apple-touch-icon.png'));
  
  // Favicon
  await createFavicon(path.join(publicDir, 'favicon.png'));
  
  console.log('\n✅ All icons generated successfully!');
}

main().catch(console.error);
