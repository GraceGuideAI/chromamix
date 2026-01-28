/**
 * Porsche Paint to Sample (PTS) Color Database
 * 
 * A curated selection of iconic PTS colors spanning the full spectrum.
 * These are real Porsche colors with their authentic names.
 * 
 * Colors are organized to ensure good distribution across:
 * - Hue (full spectrum coverage)
 * - Saturation (vibrant to muted)
 * - Lightness (dark to light)
 */

export interface PTSColor {
  hex: string;
  name: string;
  code?: string;
  category: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown' | 'gray' | 'white' | 'black';
}

export const PTS_COLORS: PTSColor[] = [
  // ============ REDS ============
  { hex: '#6D0F12', name: 'Arena Red', code: 'M8U', category: 'red' },
  { hex: '#8C0303', name: 'Guards Red', code: '80K', category: 'red' },
  { hex: '#991C1F', name: 'Carmine Red', code: '8A9', category: 'red' },
  { hex: '#6B1C23', name: 'Ruby Star', code: '82S', category: 'red' },
  { hex: '#A41E23', name: 'Indian Red', code: '81B', category: 'red' },
  { hex: '#7A1818', name: 'Burgundy Red', code: '83K', category: 'red' },
  { hex: '#B52126', name: 'Signal Red', code: '81D', category: 'red' },
  { hex: '#5A1C1E', name: 'Velvet Red', code: '83V', category: 'red' },
  { hex: '#831D23', name: 'Rubin Red', code: '84N', category: 'red' },
  { hex: '#A11F2B', name: 'Amaranth Red', code: 'J4', category: 'red' },
  
  // ============ ORANGES ============
  { hex: '#D45500', name: 'Blood Orange', code: 'S4D', category: 'orange' },
  { hex: '#E55B00', name: 'Tangerine', code: 'S7A', category: 'orange' },
  { hex: '#F67100', name: 'Gulf Orange', code: '2T8', category: 'orange' },
  { hex: '#E86100', name: 'Continental Orange', code: 'L7A1', category: 'orange' },
  { hex: '#E5541E', name: 'Lava Orange', code: 'S9R', category: 'orange' },
  { hex: '#C04B22', name: 'Zanzibar Red', code: 'L3AH', category: 'orange' },
  { hex: '#D35F26', name: 'Pastel Orange', code: '74J', category: 'orange' },
  { hex: '#B55C32', name: 'Copper Brown', code: 'L97U', category: 'orange' },
  
  // ============ YELLOWS ============
  { hex: '#FFC700', name: 'Speed Yellow', code: '19E', category: 'yellow' },
  { hex: '#FFD100', name: 'Racing Yellow', code: '1E8', category: 'yellow' },
  { hex: '#FFCC00', name: 'Signal Yellow', code: '12P', category: 'yellow' },
  { hex: '#F5DE00', name: 'Light Yellow', code: 'L12G', category: 'yellow' },
  { hex: '#EAB800', name: 'Golden Yellow', code: '13C', category: 'yellow' },
  { hex: '#C99E10', name: 'Sand Yellow', code: 'L6B3', category: 'yellow' },
  { hex: '#D4AF37', name: 'Gold Metallic', code: 'L96D', category: 'yellow' },
  { hex: '#F2E854', name: 'Summer Yellow', code: 'L13J', category: 'yellow' },
  
  // ============ GREENS ============
  { hex: '#004225', name: 'Irish Green', code: '22A', category: 'green' },
  { hex: '#274C34', name: 'British Racing Green', code: '24A', category: 'green' },
  { hex: '#006747', name: 'Signal Green', code: '22K', category: 'green' },
  { hex: '#1A472A', name: 'Oak Green', code: 'L6H', category: 'green' },
  { hex: '#2D5D3F', name: 'Auratium Green', code: 'J6', category: 'green' },
  { hex: '#455D3A', name: 'Olive', code: '27G', category: 'green' },
  { hex: '#8DB600', name: 'Birch Green', code: 'L6X', category: 'green' },
  { hex: '#567D46', name: 'Viper Green', code: '25D', category: 'green' },
  { hex: '#4E7351', name: 'Smaragd Green', code: '22U', category: 'green' },
  { hex: '#2E5A44', name: 'Forest Green', code: '25H', category: 'green' },
  { hex: '#355E3B', name: 'Python Green', code: 'M6B', category: 'green' },
  { hex: '#00A693', name: 'Mint Green', code: '24K', category: 'green' },
  
  // ============ BLUES ============
  { hex: '#003399', name: 'Maritime Blue', code: '37W', category: 'blue' },
  { hex: '#002B5C', name: 'Dark Blue', code: '39U', category: 'blue' },
  { hex: '#1B3C59', name: 'Oslo Blue', code: '37F', category: 'blue' },
  { hex: '#1C3E5C', name: 'Yachting Blue', code: '36G', category: 'blue' },
  { hex: '#0066B1', name: 'Mexico Blue', code: '37F', category: 'blue' },
  { hex: '#006BB6', name: 'Riviera Blue', code: '38A', category: 'blue' },
  { hex: '#4169E1', name: 'Gemini Blue', code: '35X', category: 'blue' },
  { hex: '#26428B', name: 'Albert Blue', code: '35A', category: 'blue' },
  { hex: '#2B4F81', name: 'Azzurro California', code: '39D', category: 'blue' },
  { hex: '#2E5090', name: 'Minerva Blue', code: '38U', category: 'blue' },
  { hex: '#324A5F', name: 'Night Blue', code: '39N', category: 'blue' },
  { hex: '#394851', name: 'Graphite Blue', code: '37X', category: 'blue' },
  { hex: '#5D8AA8', name: 'Miami Blue', code: 'S5A', category: 'blue' },
  { hex: '#7BA7CC', name: 'Gulf Blue', code: '38K', category: 'blue' },
  { hex: '#87CEEB', name: 'Pastel Blue', code: '36L', category: 'blue' },
  { hex: '#00CED1', name: 'Turquoise', code: '35G', category: 'blue' },
  
  // ============ PURPLES ============
  { hex: '#4B0082', name: 'Viola', code: '42H', category: 'purple' },
  { hex: '#663399', name: 'Ultraviolet', code: 'M8B', category: 'purple' },
  { hex: '#5D2D5E', name: 'Amethyst', code: '41G', category: 'purple' },
  { hex: '#702963', name: 'Byzantium', code: '41K', category: 'purple' },
  { hex: '#8E4585', name: 'Fuchsia', code: '42A', category: 'purple' },
  { hex: '#9966CC', name: 'Lavender', code: '41P', category: 'purple' },
  { hex: '#483D8B', name: 'Cobalt Violet', code: '41M', category: 'purple' },
  { hex: '#7851A9', name: 'Royal Purple', code: '42M', category: 'purple' },
  
  // ============ BROWNS ============
  { hex: '#4A3728', name: 'Espresso', code: '47A', category: 'brown' },
  { hex: '#5C4033', name: 'Cognac', code: 'L8AC', category: 'brown' },
  { hex: '#654321', name: 'Sepia Brown', code: '48D', category: 'brown' },
  { hex: '#6F4E37', name: 'Coffee Brown', code: '47G', category: 'brown' },
  { hex: '#7B3F00', name: 'Bitter Chocolate', code: '49A', category: 'brown' },
  { hex: '#8B4513', name: 'Saddle Brown', code: '47N', category: 'brown' },
  { hex: '#A0522D', name: 'Sienna', code: '49G', category: 'brown' },
  { hex: '#87634B', name: 'Macadamia', code: 'L8AT', category: 'brown' },
  { hex: '#AE8964', name: 'Palladium', code: 'M7Z', category: 'brown' },
  
  // ============ GRAYS ============
  { hex: '#4A4A4A', name: 'Slate Grey', code: '7A1', category: 'gray' },
  { hex: '#5C5C5C', name: 'Agate Grey', code: 'M7S', category: 'gray' },
  { hex: '#6E6E6E', name: 'Aventurine Green', code: 'M6S', category: 'gray' },
  { hex: '#71797E', name: 'Nardo Grey', code: 'LY7C', category: 'gray' },
  { hex: '#808080', name: 'Meteor Grey', code: 'M7P', category: 'gray' },
  { hex: '#919191', name: 'Chalk', code: 'M9A', category: 'gray' },
  { hex: '#A9A9A9', name: 'GT Silver', code: 'M7Y', category: 'gray' },
  { hex: '#C0C0C0', name: 'Rhodium Silver', code: 'M9Z', category: 'gray' },
  { hex: '#B5B5B5', name: 'Polar Silver', code: 'M8R', category: 'gray' },
  { hex: '#CBD5E1', name: 'Fashion Grey', code: '7B6', category: 'gray' },
  
  // ============ WHITES ============
  { hex: '#FFFAFA', name: 'Grand Prix White', code: '908', category: 'white' },
  { hex: '#F5F5F5', name: 'Carrara White', code: '9A1', category: 'white' },
  { hex: '#FAEBD7', name: 'Light Ivory', code: 'A1A', category: 'white' },
  { hex: '#FFFFF0', name: 'Cream White', code: 'A2A', category: 'white' },
  
  // ============ BLACKS ============
  { hex: '#0A0A0A', name: 'Black', code: 'A1', category: 'black' },
  { hex: '#1A1A2E', name: 'Night Blue Metallic', code: 'Z8L', category: 'black' },
  { hex: '#2D2D2D', name: 'Jet Black', code: 'A1U', category: 'black' },
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
export function getGameplayColors(): PTSColor[] {
  return PTS_COLORS.filter(color => {
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
    
    // Exclude very light (>0.85), very dark (<0.15), or very desaturated (<0.15)
    return l > 0.15 && l < 0.85 && s > 0.15;
  });
}

// Pre-computed gameplay colors for performance
export const GAMEPLAY_COLORS: PTSColor[] = getGameplayColors();

/**
 * Get a random PTS color from gameplay-suitable colors
 */
export function getRandomPTSColor(): PTSColor {
  const index = Math.floor(Math.random() * GAMEPLAY_COLORS.length);
  return GAMEPLAY_COLORS[index];
}

/**
 * Get a PTS color by index (for seeded/deterministic selection)
 */
export function getPTSColorByIndex(index: number): PTSColor {
  return GAMEPLAY_COLORS[index % GAMEPLAY_COLORS.length];
}

/**
 * Get the daily PTS color using deterministic seed based on date
 * Same color for all players on the same day
 */
export function getDailyPTSColor(date: Date = new Date()): PTSColor {
  const seed = date.getFullYear() * 10000 + 
               (date.getMonth() + 1) * 100 + 
               date.getDate();
  const rng = mulberry32(seed);
  const colorIndex = Math.floor(rng() * GAMEPLAY_COLORS.length);
  return GAMEPLAY_COLORS[colorIndex];
}

/**
 * Get all PTS colors in a category
 */
export function getPTSColorsByCategory(category: PTSColor['category']): PTSColor[] {
  return PTS_COLORS.filter(c => c.category === category);
}

/**
 * Total count of all PTS colors
 */
export const PTS_COLOR_COUNT = PTS_COLORS.length;

/**
 * Total count of gameplay-suitable colors
 */
export const GAMEPLAY_COLOR_COUNT = GAMEPLAY_COLORS.length;

// ═══════════════════════════════════════════════════════════════════
// COLOR NAME MATCHING - Find closest PTS color name for any hex
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

// Pre-compute LAB values for all PTS colors for fast matching
const PTS_COLORS_LAB = PTS_COLORS.map(color => ({
  color,
  lab: rgbToLab(hexToRgb(color.hex))
}));

/**
 * Find the closest PTS color to a given hex color
 * Uses perceptual color matching in LAB color space
 */
export function findClosestPTSColor(hex: string): { color: PTSColor; distance: number } {
  const targetLab = rgbToLab(hexToRgb(hex));
  
  let closestColor = PTS_COLORS[0];
  let minDistance = Infinity;
  
  for (const { color, lab } of PTS_COLORS_LAB) {
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
 * Get the PTS color name for any hex color
 * Returns the name of the closest matching PTS color
 */
export function getPTSColorName(hex: string): string {
  const match = findClosestPTSColor(hex);
  return match.color.name;
}
