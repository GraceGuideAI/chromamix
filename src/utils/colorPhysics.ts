import chroma from 'chroma-js';

/**
 * Kubelka-Munk theory for subtractive color mixing
 * Simulates how paint pigments mix (not RGB additive)
 */

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

// Convert RGB to CMYK for subtractive mixing
function rgbToCMYK(rgb: RGBColor): CMYKColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return { c, m, y, k };
}

// Convert CMYK back to RGB
function cmykToRGB(cmyk: CMYKColor): RGBColor {
  const r = 255 * (1 - cmyk.c) * (1 - cmyk.k);
  const g = 255 * (1 - cmyk.m) * (1 - cmyk.k);
  const b = 255 * (1 - cmyk.y) * (1 - cmyk.k);

  return { 
    r: Math.round(r), 
    g: Math.round(g), 
    b: Math.round(b) 
  };
}

/**
 * Mix colors using Kubelka-Munk subtractive mixing
 * Simulates real paint mixing behavior
 */
export function mixColorsSubtractive(
  colors: { hex: string; amount: number }[]
): string {
  // Normalize amounts
  const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
  
  if (totalAmount === 0) {
    return '#808080'; // Gray default
  }

  const normalized = colors.map(c => ({
    hex: c.hex,
    weight: c.amount / totalAmount
  }));

  // Convert all colors to CMYK
  const cmykColors = normalized.map(c => {
    const rgb = chroma(c.hex).rgb();
    const cmyk = rgbToCMYK({ r: rgb[0], g: rgb[1], b: rgb[2] });
    return { cmyk, weight: c.weight };
  });

  // Weighted average in CMYK space (subtractive mixing)
  const mixedCMYK: CMYKColor = {
    c: cmykColors.reduce((sum, c) => sum + c.cmyk.c * c.weight, 0),
    m: cmykColors.reduce((sum, c) => sum + c.cmyk.m * c.weight, 0),
    y: cmykColors.reduce((sum, c) => sum + c.cmyk.y * c.weight, 0),
    k: cmykColors.reduce((sum, c) => sum + c.cmyk.k * c.weight, 0),
  };

  // Convert back to RGB
  const mixedRGB = cmykToRGB(mixedCMYK);
  
  return chroma(mixedRGB.r, mixedRGB.g, mixedRGB.b).hex();
}

/**
 * Calculate color difference using CIEDE2000 formula
 * Returns a score from 0-100 (100 = perfect match)
 */
export function calculateColorScore(color1: string, color2: string): number {
  try {
    const deltaE = chroma.deltaE(color1, color2);
    
    // DeltaE values typically range from 0 (identical) to ~100 (opposite)
    // Convert to 0-100 score where 100 is perfect
    // Use exponential decay for scoring curve
    const score = Math.max(0, 100 * Math.exp(-deltaE / 15));
    
    return Math.round(score * 10) / 10; // Round to 1 decimal
  } catch (e) {
    return 0;
  }
}

/**
 * Generate a random target color
 * Weighted towards vibrant, saturated colors for better gameplay
 */
export function generateRandomColor(): string {
  const hue = Math.random() * 360;
  const saturation = 0.5 + Math.random() * 0.5; // 50-100% saturation
  const lightness = 0.3 + Math.random() * 0.4; // 30-70% lightness
  
  return chroma.hsl(hue, saturation, lightness).hex();
}

/**
 * Generate daily target color (seeded by date)
 * Same color for all players on the same day
 */
export function getDailyTargetColor(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + 
               (today.getMonth() + 1) * 100 + 
               today.getDate();
  
  // Simple seeded random
  const random = (Math.sin(seed) * 10000) % 1;
  const hue = random * 360;
  
  const random2 = (Math.sin(seed + 1) * 10000) % 1;
  const saturation = 0.5 + random2 * 0.5;
  
  const random3 = (Math.sin(seed + 2) * 10000) % 1;
  const lightness = 0.3 + random3 * 0.4;
  
  return chroma.hsl(hue, saturation, lightness).hex();
}

/**
 * Get color name/description for UI
 */
export function getColorName(hex: string): string {
  const color = chroma(hex);
  const hsl = color.hsl();
  const hue = hsl[0];
  const sat = hsl[1];
  const light = hsl[2];

  if (sat < 0.1) {
    if (light > 0.9) return 'White';
    if (light < 0.1) return 'Black';
    return 'Gray';
  }

  if (hue < 30) return 'Red';
  if (hue < 60) return 'Orange';
  if (hue < 90) return 'Yellow';
  if (hue < 150) return 'Green';
  if (hue < 210) return 'Cyan';
  if (hue < 270) return 'Blue';
  if (hue < 330) return 'Purple';
  return 'Red';
}
