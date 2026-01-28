/**
 * Custom Color Palette for ChromaMix
 * 
 * A curated collection of 100 unique colors with rare and interesting names.
 * These colors span the full spectrum with good variety for gameplay.
 */

export interface CustomColor {
  name: string;
  hex: string;
}

export const CUSTOM_COLORS: CustomColor[] = [
  // 1-10: Original provided colors
  { name: 'Phlox', hex: '#DF00FF' },
  { name: 'Zaffre', hex: '#0014A8' },
  { name: 'Sarcoline', hex: '#FFDDAA' },
  { name: 'Feldgrau', hex: '#4D5D53' },
  { name: 'Falu', hex: '#801818' },
  { name: 'Atrovirens', hex: '#0D9494' },
  { name: 'Wenge', hex: '#645452' },
  { name: 'Incarnadine', hex: '#AA0022' },
  { name: 'Icterine', hex: '#FCF55F' },
  { name: 'Coquelicot', hex: '#FF3800' },
  
  // 11-20: Rare reds and pinks
  { name: 'Amaranth', hex: '#E52B50' },
  { name: 'Vermillion', hex: '#E34234' },
  { name: 'Cinnabar', hex: '#E44D2E' },
  { name: 'Rufous', hex: '#A81C07' },
  { name: 'Puce', hex: '#CC8899' },
  { name: 'Cerise', hex: '#DE3163' },
  { name: 'Carmine', hex: '#960018' },
  { name: 'Alizarin', hex: '#E32636' },
  { name: 'Nacarat', hex: '#F5795A' },
  { name: 'Gamboge', hex: '#E49B0F' },
  
  // 21-30: Oranges and yellows
  { name: 'Mikado', hex: '#FFC40C' },
  { name: 'Xanthic', hex: '#EEED09' },
  { name: 'Aureolin', hex: '#FDEE00' },
  { name: 'Fulvous', hex: '#E48400' },
  { name: 'Saffron', hex: '#F4C430' },
  { name: 'Marigold', hex: '#EAA221' },
  { name: 'Tenné', hex: '#CD5700' },
  { name: 'Sinopia', hex: '#CB410B' },
  { name: 'Flax', hex: '#EEDC82' },
  { name: 'Jasmine', hex: '#F8DE7E' },
  
  // 31-40: Greens
  { name: 'Viridian', hex: '#40826D' },
  { name: 'Smaragdine', hex: '#4A7C59' },
  { name: 'Malachite', hex: '#0BDA51' },
  { name: 'Verdigris', hex: '#43B3AE' },
  { name: 'Glaucous', hex: '#6082B6' },
  { name: 'Celadon', hex: '#ACE1AF' },
  { name: 'Chartreuse', hex: '#7FFF00' },
  { name: 'Absinthe', hex: '#7FDD4C' },
  { name: 'Reseda', hex: '#6C7C59' },
  { name: 'Hooker', hex: '#49796B' },
  
  // 41-50: Blues
  { name: 'Cerulean', hex: '#007BA7' },
  { name: 'Prussian', hex: '#003153' },
  { name: 'Lapis', hex: '#26619C' },
  { name: 'Mazarine', hex: '#273BE2' },
  { name: 'Sapphire', hex: '#0F52BA' },
  { name: 'Azure', hex: '#007FFF' },
  { name: 'Cobalt', hex: '#0047AB' },
  { name: 'Periwinkle', hex: '#CCCCFF' },
  { name: 'Glaukos', hex: '#6A93D4' },
  { name: 'Cadet', hex: '#536872' },
  
  // 51-60: Purples and violets
  { name: 'Tyrian', hex: '#66023C' },
  { name: 'Heliotrope', hex: '#DF73FF' },
  { name: 'Mauve', hex: '#E0B0FF' },
  { name: 'Orchid', hex: '#DA70D6' },
  { name: 'Byzantium', hex: '#702963' },
  { name: 'Thistle', hex: '#D8BFD8' },
  { name: 'Mulberry', hex: '#C54B8C' },
  { name: 'Amethyst', hex: '#9966CC' },
  { name: 'Purpure', hex: '#9A4EAE' },
  { name: 'Regalia', hex: '#522D80' },
  
  // 61-70: Browns and earth tones
  { name: 'Bistre', hex: '#3D2B1F' },
  { name: 'Umber', hex: '#635147' },
  { name: 'Sepia', hex: '#704214' },
  { name: 'Russet', hex: '#80461B' },
  { name: 'Sienna', hex: '#A0522D' },
  { name: 'Ochre', hex: '#CC7722' },
  { name: 'Taupe', hex: '#483C32' },
  { name: 'Ecru', hex: '#C2B280' },
  { name: 'Bole', hex: '#79443B' },
  { name: 'Cordovan', hex: '#893F45' },
  
  // 71-80: Grays and neutrals
  { name: 'Payne', hex: '#536878' },
  { name: 'Arsenic', hex: '#3B444B' },
  { name: 'Battleship', hex: '#848482' },
  { name: 'Pewter', hex: '#8BA8B7' },
  { name: 'Platinum', hex: '#E5E4E2' },
  { name: 'Nickel', hex: '#727472' },
  { name: 'Gunmetal', hex: '#2C3539' },
  { name: 'Calamite', hex: '#ACB1B5' },
  { name: 'Cinereous', hex: '#98817B' },
  { name: 'Onyx', hex: '#353839' },
  
  // 81-90: Unusual and rare colors
  { name: 'Watchet', hex: '#80DAEB' },
  { name: 'Skobeloff', hex: '#007474' },
  { name: 'Perse', hex: '#183D5D' },
  { name: 'Labrador', hex: '#286ACD' },
  { name: 'Eburnean', hex: '#F5F5DC' },
  { name: 'Minium', hex: '#E05D18' },
  { name: 'Luteous', hex: '#DED717' },
  { name: 'Erythraen', hex: '#CE2029' },
  { name: 'Xanadu', hex: '#738678' },
  { name: 'Gossamer', hex: '#069B81' },
  
  // 91-100: Final unique selections
  { name: 'Smalt', hex: '#003399' },
  { name: 'Murrey', hex: '#8C0554' },
  { name: 'Corbeau', hex: '#0D0D0D' },
  { name: 'Roan', hex: '#B97A7A' },
  { name: 'Grisaille', hex: '#B3C6D4' },
  { name: 'Folly', hex: '#FF004F' },
  { name: 'Feldspath', hex: '#E8D8C8' },
  { name: 'Aureate', hex: '#DAA520' },
  { name: 'Aquamarine', hex: '#7FFFD4' },
  { name: 'Carnelian', hex: '#B31B1B' },
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
    
    // Exclude very light (>0.85), very dark (<0.15), or very desaturated (<0.15)
    return l > 0.15 && l < 0.85 && s > 0.15;
  });
}

// Pre-computed gameplay colors for performance
export const GAMEPLAY_COLORS: CustomColor[] = getGameplayColors();

/**
 * Get a random custom color from gameplay-suitable colors
 */
export function getRandomCustomColor(): { hex: string; name: string } {
  const index = Math.floor(Math.random() * GAMEPLAY_COLORS.length);
  const color = GAMEPLAY_COLORS[index];
  return { hex: color.hex, name: color.name };
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
export function getDailyCustomColor(date: Date = new Date()): { hex: string; name: string } {
  const seed = date.getFullYear() * 10000 + 
               (date.getMonth() + 1) * 100 + 
               date.getDate();
  const rng = mulberry32(seed);
  const colorIndex = Math.floor(rng() * GAMEPLAY_COLORS.length);
  const color = GAMEPLAY_COLORS[colorIndex];
  return { hex: color.hex, name: color.name };
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
