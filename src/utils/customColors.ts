/**
 * Custom Color Database for ChromaMix
 * 
 * A curated selection of colors designed for RGB additive color mixing gameplay.
 * These colors span the full RGB gamut with names that are fun and memorable.
 * 
 * Colors are organized to ensure good distribution across:
 * - Hue (full spectrum coverage)
 * - Saturation (vibrant to muted)
 * - Lightness (dark to light)
 */

export interface CustomColor {
  hex: string;
  name: string;
  category: 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'brown' | 'gray' | 'white';
}

export const CUSTOM_COLORS: CustomColor[] = [
  // ============ REDS ============
  { hex: '#FF0000', name: 'Pure Red', category: 'red' },
  { hex: '#DC143C', name: 'Crimson', category: 'red' },
  { hex: '#B22222', name: 'Firebrick', category: 'red' },
  { hex: '#CD5C5C', name: 'Indian Red', category: 'red' },
  { hex: '#FF6B6B', name: 'Coral Red', category: 'red' },
  { hex: '#E74C3C', name: 'Alizarin', category: 'red' },
  { hex: '#C0392B', name: 'Pomegranate', category: 'red' },
  { hex: '#8B0000', name: 'Dark Red', category: 'red' },
  { hex: '#FF4444', name: 'Neon Red', category: 'red' },
  { hex: '#D63031', name: 'Red Salsa', category: 'red' },
  
  // ============ ORANGES ============
  { hex: '#FF8C00', name: 'Dark Orange', category: 'orange' },
  { hex: '#FFA500', name: 'Orange', category: 'orange' },
  { hex: '#FF7F50', name: 'Coral', category: 'orange' },
  { hex: '#FF6347', name: 'Tomato', category: 'orange' },
  { hex: '#E67E22', name: 'Carrot', category: 'orange' },
  { hex: '#D35400', name: 'Pumpkin', category: 'orange' },
  { hex: '#F39C12', name: 'Orange Peel', category: 'orange' },
  { hex: '#FF9F43', name: 'Tangerine', category: 'orange' },
  { hex: '#FFAB5E', name: 'Sandy Orange', category: 'orange' },
  
  // ============ YELLOWS ============
  { hex: '#FFFF00', name: 'Pure Yellow', category: 'yellow' },
  { hex: '#FFD700', name: 'Gold', category: 'yellow' },
  { hex: '#F1C40F', name: 'Sunflower', category: 'yellow' },
  { hex: '#FFEB3B', name: 'Lemon', category: 'yellow' },
  { hex: '#FFC107', name: 'Amber', category: 'yellow' },
  { hex: '#FFE066', name: 'Canary', category: 'yellow' },
  { hex: '#FDCB6E', name: 'Mustard', category: 'yellow' },
  { hex: '#F9E79F', name: 'Cream Yellow', category: 'yellow' },
  { hex: '#DAA520', name: 'Goldenrod', category: 'yellow' },
  
  // ============ GREENS ============
  { hex: '#00FF00', name: 'Pure Green', category: 'green' },
  { hex: '#32CD32', name: 'Lime Green', category: 'green' },
  { hex: '#228B22', name: 'Forest Green', category: 'green' },
  { hex: '#2ECC71', name: 'Emerald', category: 'green' },
  { hex: '#27AE60', name: 'Nephritis', category: 'green' },
  { hex: '#1ABC9C', name: 'Turquoise Green', category: 'green' },
  { hex: '#16A085', name: 'Green Sea', category: 'green' },
  { hex: '#9ACD32', name: 'Yellow Green', category: 'green' },
  { hex: '#7CFC00', name: 'Lawn Green', category: 'green' },
  { hex: '#00FF7F', name: 'Spring Green', category: 'green' },
  { hex: '#3CB371', name: 'Medium Sea Green', category: 'green' },
  { hex: '#98D8C8', name: 'Seafoam', category: 'green' },
  { hex: '#55EFC4', name: 'Mint', category: 'green' },
  
  // ============ CYANS ============
  { hex: '#00FFFF', name: 'Pure Cyan', category: 'cyan' },
  { hex: '#00CED1', name: 'Dark Turquoise', category: 'cyan' },
  { hex: '#20B2AA', name: 'Light Sea Green', category: 'cyan' },
  { hex: '#5DADE2', name: 'Picton Blue', category: 'cyan' },
  { hex: '#48C9B0', name: 'Medium Turquoise', category: 'cyan' },
  { hex: '#7FDBFF', name: 'Electric Cyan', category: 'cyan' },
  { hex: '#00BCD4', name: 'Cyan 500', category: 'cyan' },
  { hex: '#81ECEC', name: 'Light Cyan', category: 'cyan' },
  { hex: '#74B9FF', name: 'Sky Blue', category: 'cyan' },
  
  // ============ BLUES ============
  { hex: '#0000FF', name: 'Pure Blue', category: 'blue' },
  { hex: '#3498DB', name: 'Peter River', category: 'blue' },
  { hex: '#2980B9', name: 'Belize Hole', category: 'blue' },
  { hex: '#1E90FF', name: 'Dodger Blue', category: 'blue' },
  { hex: '#4169E1', name: 'Royal Blue', category: 'blue' },
  { hex: '#0984E3', name: 'Electron Blue', category: 'blue' },
  { hex: '#6495ED', name: 'Cornflower Blue', category: 'blue' },
  { hex: '#4682B4', name: 'Steel Blue', category: 'blue' },
  { hex: '#1A5276', name: 'Prussian Blue', category: 'blue' },
  { hex: '#00008B', name: 'Dark Blue', category: 'blue' },
  { hex: '#0066CC', name: 'Sapphire', category: 'blue' },
  { hex: '#5865F2', name: 'Discord Blue', category: 'blue' },
  
  // ============ PURPLES ============
  { hex: '#800080', name: 'Purple', category: 'purple' },
  { hex: '#9B59B6', name: 'Amethyst', category: 'purple' },
  { hex: '#8E44AD', name: 'Wisteria', category: 'purple' },
  { hex: '#6C3483', name: 'Studio Purple', category: 'purple' },
  { hex: '#A569BD', name: 'Medium Purple', category: 'purple' },
  { hex: '#7D3C98', name: 'Plum Purple', category: 'purple' },
  { hex: '#9B2335', name: 'Cranberry', category: 'purple' },
  { hex: '#663399', name: 'Rebecca Purple', category: 'purple' },
  { hex: '#8B008B', name: 'Dark Magenta', category: 'purple' },
  { hex: '#6C5CE7', name: 'Soft Purple', category: 'purple' },
  { hex: '#A29BFE', name: 'Light Purple', category: 'purple' },
  
  // ============ PINKS ============
  { hex: '#FF00FF', name: 'Pure Magenta', category: 'pink' },
  { hex: '#FF1493', name: 'Deep Pink', category: 'pink' },
  { hex: '#FF69B4', name: 'Hot Pink', category: 'pink' },
  { hex: '#FFB6C1', name: 'Light Pink', category: 'pink' },
  { hex: '#FFC0CB', name: 'Pink', category: 'pink' },
  { hex: '#FF6B9D', name: 'Flamingo', category: 'pink' },
  { hex: '#E91E63', name: 'Rose', category: 'pink' },
  { hex: '#F06292', name: 'Carnation', category: 'pink' },
  { hex: '#FD79A8', name: 'Strawberry', category: 'pink' },
  { hex: '#FF85A1', name: 'Salmon Pink', category: 'pink' },
  
  // ============ BROWNS ============
  { hex: '#8B4513', name: 'Saddle Brown', category: 'brown' },
  { hex: '#A0522D', name: 'Sienna', category: 'brown' },
  { hex: '#D2691E', name: 'Chocolate', category: 'brown' },
  { hex: '#CD853F', name: 'Peru', category: 'brown' },
  { hex: '#B8860B', name: 'Dark Goldenrod', category: 'brown' },
  { hex: '#DEB887', name: 'Burlywood', category: 'brown' },
  { hex: '#F4A460', name: 'Sandy Brown', category: 'brown' },
  { hex: '#BC8F8F', name: 'Rosy Brown', category: 'brown' },
  
  // ============ GRAYS ============
  { hex: '#2C3E50', name: 'Midnight Blue', category: 'gray' },
  { hex: '#34495E', name: 'Wet Asphalt', category: 'gray' },
  { hex: '#7F8C8D', name: 'Asbestos', category: 'gray' },
  { hex: '#95A5A6', name: 'Concrete', category: 'gray' },
  { hex: '#BDC3C7', name: 'Silver', category: 'gray' },
  { hex: '#636E72', name: 'Gull Gray', category: 'gray' },
  { hex: '#B2BEC3', name: 'City Lights', category: 'gray' },
  { hex: '#DFE6E9', name: 'Light Gray', category: 'gray' },
  { hex: '#778899', name: 'Slate Gray', category: 'gray' },
  
  // ============ WHITES ============
  { hex: '#FFFFFF', name: 'Pure White', category: 'white' },
  { hex: '#FAFAFA', name: 'Ghost White', category: 'white' },
  { hex: '#F5F5F5', name: 'White Smoke', category: 'white' },
  { hex: '#FFF5EE', name: 'Seashell', category: 'white' },
  { hex: '#FFFAF0', name: 'Floral White', category: 'white' },
];

// ============================================================================
// PRNG and Selection Functions
// ============================================================================

/**
 * Mulberry32 PRNG - Fast, high-quality 32-bit PRNG for deterministic selection
 */
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Filter colors to only include those with good visual variety for gameplay
 * Excludes near-white, near-black, and very desaturated colors
 */
export function getGameplayColors(): CustomColor[] {
  return CUSTOM_COLORS.filter(color => {
    const hex = color.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    let s = 0;
    if (max !== min) {
      s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    }
    
    // Exclude very light (>0.92), very dark (<0.12), or very desaturated (<0.12)
    return l > 0.12 && l < 0.92 && s > 0.12;
  });
}

// Pre-computed gameplay colors for performance
export const GAMEPLAY_COLORS: CustomColor[] = getGameplayColors();

/**
 * Get a random custom color from gameplay-suitable colors
 */
export function getRandomCustomColor(): CustomColor {
  const index = Math.floor(Math.random() * GAMEPLAY_COLORS.length);
  return GAMEPLAY_COLORS[index];
}

/**
 * Get a custom color by index (for seeded/deterministic selection)
 */
export function getCustomColorByIndex(index: number): CustomColor {
  return GAMEPLAY_COLORS[index % GAMEPLAY_COLORS.length];
}

/**
 * Get the daily custom color using deterministic seed based on date
 * Same color for all players on the same day
 */
export function getDailyCustomColor(date: Date = new Date()): CustomColor {
  const seed = date.getFullYear() * 10000 + 
               (date.getMonth() + 1) * 100 + 
               date.getDate();
  const rng = mulberry32(seed);
  const colorIndex = Math.floor(rng() * GAMEPLAY_COLORS.length);
  return GAMEPLAY_COLORS[colorIndex];
}

/**
 * Get all custom colors in a category
 */
export function getCustomColorsByCategory(category: CustomColor['category']): CustomColor[] {
  return CUSTOM_COLORS.filter(c => c.category === category);
}

/**
 * Total count of all custom colors
 */
export const CUSTOM_COLOR_COUNT = CUSTOM_COLORS.length;

/**
 * Total count of gameplay-suitable colors
 */
export const GAMEPLAY_COLOR_COUNT = GAMEPLAY_COLORS.length;

// ═══════════════════════════════════════════════════════════════════
// COLOR NAME MATCHING - Find closest custom color name for any hex
// ═══════════════════════════════════════════════════════════════════

/**
 * Hex to RGB conversion helper
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
}

/**
 * RGB to LAB conversion for perceptual color matching
 */
function rgbToLab(rgb: { r: number; g: number; b: number }): { L: number; a: number; b: number } {
  // RGB to XYZ
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return {
    L: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

/**
 * Calculate perceptual color difference (CIE76 approximation)
 */
function colorDifference(lab1: { L: number; a: number; b: number }, lab2: { L: number; a: number; b: number }): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Pre-compute LAB values for all custom colors for fast matching
const CUSTOM_COLORS_LAB = CUSTOM_COLORS.map(color => ({
  color,
  lab: rgbToLab(hexToRgb(color.hex))
}));

/**
 * Find the closest custom color to a given hex color
 * Uses perceptual color matching in LAB color space
 */
export function findClosestCustomColor(hex: string): { color: CustomColor; distance: number } {
  const targetLab = rgbToLab(hexToRgb(hex));
  
  let closestColor = CUSTOM_COLORS[0];
  let minDistance = Infinity;
  
  for (const { color, lab } of CUSTOM_COLORS_LAB) {
    const distance = colorDifference(targetLab, lab);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }
  
  return {
    color: closestColor,
    distance: minDistance
  };
}

/**
 * Get the custom color name for any hex color
 * Returns the name of the closest matching custom color
 */
export function getCustomColorName(hex: string): string {
  const match = findClosestCustomColor(hex);
  return match.color.name;
}
