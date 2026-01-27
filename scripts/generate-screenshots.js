const sharp = require('sharp');
const path = require('path');

// ChromaMix brand colors
const GRADIENT_START = '#6366f1';
const GRADIENT_END = '#a855f7';
const BACKGROUND = '#1e1b4b';

async function createScreenshot(width, height, label, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BACKGROUND}"/>
          <stop offset="100%" style="stop-color:#312e81"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${GRADIENT_START}"/>
          <stop offset="100%" style="stop-color:${GRADIENT_END}"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Center content area -->
      <rect x="${width * 0.1}" y="${height * 0.15}" 
            width="${width * 0.8}" height="${height * 0.5}" 
            rx="20" fill="url(#accent)" opacity="0.2"/>
      
      <!-- Color mixing circles -->
      <circle cx="${width * 0.3}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.08}" fill="#ef4444"/>
      <circle cx="${width * 0.5}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.08}" fill="#fbbf24"/>
      <circle cx="${width * 0.7}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.08}" fill="#3b82f6"/>
      
      <!-- Mixed result -->
      <circle cx="${width * 0.5}" cy="${height * 0.55}" r="${Math.min(width, height) * 0.1}" fill="${GRADIENT_START}"/>
      
      <!-- Title -->
      <text x="${width/2}" y="${height * 0.85}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="${Math.min(width, height) * 0.06}" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle">ChromaMix</text>
      
      <!-- Subtitle -->
      <text x="${width/2}" y="${height * 0.92}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="${Math.min(width, height) * 0.03}" 
            fill="#a5b4fc" 
            text-anchor="middle">Mix colors, match targets</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Created ${path.basename(outputPath)} (${width}x${height})`);
}

async function main() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  
  console.log('📸 Generating ChromaMix screenshots...\n');
  
  // Wide (desktop) screenshot
  await createScreenshot(1280, 720, 'desktop', path.join(screenshotsDir, 'gameplay-wide.png'));
  
  // Narrow (mobile) screenshot
  await createScreenshot(390, 844, 'mobile', path.join(screenshotsDir, 'gameplay-narrow.png'));
  
  console.log('\n✅ All screenshots generated!');
}

main().catch(console.error);
