/**
 * ChromaMix Custom Color Palette
 * 
 * A curated selection of vibrant colors with unique names spanning the full spectrum.
 * IMPROVED: Now includes achievability scoring to ensure all target colors can be
 * matched using RGB additive mixing.
 */

import chroma from 'chroma-js';

export interface GameColor {
  hex: string;
  name: string;
  category: 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'brown' | 'gray';
  achievable?: boolean; // Whether this color can be achieved with RGB sliders
}

export const GAME_COLORS: GameColor[] = [
  // ============ REDS (10) ============
  { hex: '#E63946', name: 'Crimson Flame', category: 'red' },
  { hex: '#C1121F', name: 'Ruby Heart', category: 'red' },
  { hex: '#9B2335', name: 'Velvet Wine', category: 'red' },
  { hex: '#D62828', name: 'Scarlet Fire', category: 'red' },
  { hex: '#FF4444', name: 'Cherry Pop', category: 'red' },
  { hex: '#B22222', name: 'Brick Dust', category: 'red' },
  { hex: '#8B0000', name: 'Deep Garnet', category: 'red' },
  { hex: '#DC143C', name: 'Cardinal Sin', category: 'red' },
  { hex: '#FF6B6B', name: 'Coral Blush', category: 'red' },
  { hex: '#A52A2A', name: 'Rustic Clay', category: 'red' },

  // ============ ORANGES (10) ============
  { hex: '#FF6D00', name: 'Tiger Lily', category: 'orange' },
  { hex: '#E85D04', name: 'Autumn Blaze', category: 'orange' },
  { hex: '#FF8C00', name: 'Tangerine Dream', category: 'orange' },
  { hex: '#F77F00', name: 'Mango Tango', category: 'orange' },
  { hex: '#FF9F1C', name: 'Golden Sunrise', category: 'orange' },
  { hex: '#FB8500', name: 'Pumpkin Spice', category: 'orange' },
  { hex: '#ED6A5A', name: 'Salmon Kiss', category: 'orange' },
  { hex: '#CC5500', name: 'Burnt Copper', category: 'orange' },
  { hex: '#FF7F50', name: 'Coral Reef', category: 'orange' },
  { hex: '#E07020', name: 'Amber Glow', category: 'orange' },

  // ============ YELLOWS (10) ============
  { hex: '#FFD60A', name: 'Sunshine', category: 'yellow' },
  { hex: '#FFC300', name: 'Golden Hour', category: 'yellow' },
  { hex: '#FFEA00', name: 'Electric Lemon', category: 'yellow' },
  { hex: '#FFB703', name: 'Honeycomb', category: 'yellow' },
  { hex: '#F4D35E', name: 'Buttercup', category: 'yellow' },
  { hex: '#FFE066', name: 'Canary Song', category: 'yellow' },
  { hex: '#E9C46A', name: 'Sandy Beach', category: 'yellow' },
  { hex: '#DAA520', name: 'Goldenrod', category: 'yellow' },
  { hex: '#FFDD00', name: 'Taxi Yellow', category: 'yellow' },
  { hex: '#F5DEB3', name: 'Wheat Field', category: 'yellow' },

  // ============ GREENS (12) ============
  { hex: '#2D6A4F', name: 'Forest Deep', category: 'green' },
  { hex: '#40916C', name: 'Emerald Isle', category: 'green' },
  { hex: '#52B788', name: 'Jade Garden', category: 'green' },
  { hex: '#74C69D', name: 'Mint Fresh', category: 'green' },
  { hex: '#95D5B2', name: 'Seafoam', category: 'green' },
  { hex: '#1B4332', name: 'Pine Shadow', category: 'green' },
  { hex: '#38A169', name: 'Clover Luck', category: 'green' },
  { hex: '#68D391', name: 'Spring Leaf', category: 'green' },
  { hex: '#228B22', name: 'Forest Fern', category: 'green' },
  { hex: '#32CD32', name: 'Lime Zest', category: 'green' },
  { hex: '#7CB518', name: 'Kiwi Burst', category: 'green' },
  { hex: '#006400', name: 'Deep Moss', category: 'green' },

  // ============ CYANS (8) ============
  { hex: '#00CED1', name: 'Tropical Tide', category: 'cyan' },
  { hex: '#20B2AA', name: 'Lagoon Blue', category: 'cyan' },
  { hex: '#40E0D0', name: 'Turquoise Dream', category: 'cyan' },
  { hex: '#48D1CC', name: 'Aqua Marine', category: 'cyan' },
  { hex: '#00FFFF', name: 'Electric Cyan', category: 'cyan' },
  { hex: '#5F9EA0', name: 'Cadet Mist', category: 'cyan' },
  { hex: '#008B8B', name: 'Deep Teal', category: 'cyan' },
  { hex: '#66CDAA', name: 'Seafoam Mint', category: 'cyan' },

  // ============ BLUES (12) ============
  { hex: '#0077B6', name: 'Ocean Depths', category: 'blue' },
  { hex: '#00B4D8', name: 'Sky Bright', category: 'blue' },
  { hex: '#0096C7', name: 'Azure Wave', category: 'blue' },
  { hex: '#023E8A', name: 'Midnight Sea', category: 'blue' },
  { hex: '#4361EE', name: 'Electric Blue', category: 'blue' },
  { hex: '#3A86FF', name: 'Cornflower', category: 'blue' },
  { hex: '#4895EF', name: 'Crystal Lake', category: 'blue' },
  { hex: '#90E0EF', name: 'Powder Blue', category: 'blue' },
  { hex: '#1E3A8A', name: 'Sapphire Night', category: 'blue' },
  { hex: '#2563EB', name: 'Cobalt Spark', category: 'blue' },
  { hex: '#60A5FA', name: 'Baby Blue', category: 'blue' },
  { hex: '#1D4ED8', name: 'Royal Velvet', category: 'blue' },

  // ============ PURPLES (12) ============
  { hex: '#7209B7', name: 'Grape Royale', category: 'purple' },
  { hex: '#9D4EDD', name: 'Orchid Bloom', category: 'purple' },
  { hex: '#B5179E', name: 'Magenta Magic', category: 'purple' },
  { hex: '#560BAD', name: 'Deep Violet', category: 'purple' },
  { hex: '#8B5CF6', name: 'Lavender Dream', category: 'purple' },
  { hex: '#A855F7', name: 'Amethyst Glow', category: 'purple' },
  { hex: '#C77DFF', name: 'Lilac Mist', category: 'purple' },
  { hex: '#6B21A8', name: 'Plum Shadow', category: 'purple' },
  { hex: '#9333EA', name: 'Violet Storm', category: 'purple' },
  { hex: '#7C3AED', name: 'Iris Petal', category: 'purple' },
  { hex: '#DF00FF', name: 'Phlox', category: 'purple' },
  { hex: '#4B0082', name: 'Indigo Night', category: 'purple' },

  // ============ PINKS (10) ============
  { hex: '#FF006E', name: 'Hot Pink', category: 'pink' },
  { hex: '#F72585', name: 'Fuchsia Pop', category: 'pink' },
  { hex: '#FF69B4', name: 'Bubblegum', category: 'pink' },
  { hex: '#FF1493', name: 'Deep Rose', category: 'pink' },
  { hex: '#DB7093', name: 'Dusty Rose', category: 'pink' },
  { hex: '#FFB6C1', name: 'Cotton Candy', category: 'pink' },
  { hex: '#FF85A1', name: 'Flamingo', category: 'pink' },
  { hex: '#E91E63', name: 'Raspberry', category: 'pink' },
  { hex: '#F06292', name: 'Peony Blush', category: 'pink' },
  { hex: '#EC407A', name: 'Carnation', category: 'pink' },

  // ============ BROWNS (8) ============
  { hex: '#8D6E63', name: 'Cocoa Dust', category: 'brown' },
  { hex: '#6F4E37', name: 'Coffee Bean', category: 'brown' },
  { hex: '#A0522D', name: 'Sienna Earth', category: 'brown' },
  { hex: '#8B4513', name: 'Saddle Tan', category: 'brown' },
  { hex: '#CD853F', name: 'Desert Sand', category: 'brown' },
  { hex: '#D2691E', name: 'Cinnamon', category: 'brown' },
  { hex: '#BC8F8F', name: 'Dusty Rose Brown', category: 'brown' },
  { hex: '#C4A484', name: 'Warm Taupe', category: 'brown' },

  // ============ GRAYS (8) ============
  { hex: '#4A5568', name: 'Storm Cloud', category: 'gray' },
  { hex: '#718096', name: 'Steel Mist', category: 'gray' },
  { hex: '#A0AEC0', name: 'Silver Lining', category: 'gray' },
  { hex: '#2D3748', name: 'Charcoal', category: 'gray' },
  { hex: '#1A202C', name: 'Obsidian', category: 'gray' },
  { hex: '#E2E8F0', name: 'Moonstone', category: 'gray' },
  { hex: '#94A3B8', name: 'Slate Blue', category: 'gray' },
  { hex: '#64748B', name: 'Pewter', category: 'gray' },
];

// ============================================================================
// Color Achievability - Check if colors can be matched with RGB sliders
// ============================================================================

/**
 * Calculate what the best achievable match is for a given target color
 * using our RGB additive mixing system
 */
function calculateAchievability(targetHex: string): {
  achievable: boolean;
  bestScore: number;
  optimalSliders: { r: number; g: number; b: number };
} {
  const targetRgb = chroma(targetHex).rgb();
  
  // For additive RGB mixing where each slider directly controls its channel:
  // Optimal sliders = target RGB values scaled to 0-100
  const optimalSliders = {
    r: Math.round((targetRgb[0] / 255) * 100),
    g: Math.round((targetRgb[1] / 255) * 100),
    b: Math.round((targetRgb[2] / 255) * 100),
  };
  
  // Mix the optimal sliders
  const mixedR = Math.round((optimalSliders.r / 100) * 255);
  const mixedG = Math.round((optimalSliders.g / 100) * 255);
  const mixedB = Math.round((optimalSliders.b / 100) * 255);
  const mixedHex = chroma(mixedR, mixedG, mixedB).hex();
  
  // Calculate CIEDE2000 difference
  const deltaE = chroma.deltaE(targetHex, mixedHex);
  
  // Convert deltaE to score using improved scoring curve
  // (Must match the curve in colorPhysics.ts)
  let score: number;
  if (deltaE <= 1) {
    // Perfect match zone: 98-100
    score = 100 - (deltaE * 2);
  } else if (deltaE <= 2) {
    // Near-perfect zone: 96-98
    score = 98 - ((deltaE - 1) * 2);
  } else if (deltaE <= 5) {
    // Excellent zone: 90-96 (ΔE 5 → 90)
    score = 96 - ((deltaE - 2) * 2);
  } else if (deltaE <= 10) {
    // Great zone: 75-90
    score = 90 - ((deltaE - 5) * 3);
  } else {
    // Good and below
    score = 75 - ((deltaE - 10) * 2.5);
  }
  
  score = Math.max(0, Math.min(100, score));
  
  return {
    achievable: score >= 90, // Must be able to score 90+ to be considered achievable
    bestScore: score,
    optimalSliders,
  };
}

// Pre-calculate achievability for all colors
const COLORS_WITH_ACHIEVABILITY: (GameColor & { achievable: boolean; bestScore: number })[] = 
  GAME_COLORS.map(color => {
    const result = calculateAchievability(color.hex);
    return {
      ...color,
      achievable: result.achievable,
      bestScore: result.bestScore,
    };
  });

// Filter to only achievable colors for gameplay
export const ACHIEVABLE_COLORS: GameColor[] = COLORS_WITH_ACHIEVABILITY
  .filter(c => c.achievable)
  .map(({ bestScore, ...color }) => color);

// Log warning if too many colors are filtered out
const achievableCount = ACHIEVABLE_COLORS.length;
const totalCount = GAME_COLORS.length;
if (achievableCount < totalCount * 0.5) {
  console.warn(`Warning: Only ${achievableCount}/${totalCount} colors are achievable. Consider adjusting the palette.`);
}

// ============================================================================
// Color Filtering Functions
// ============================================================================

/**
 * Filter colors that are good for gameplay (not too dark, not too light)
 */
export function getGameplayColors(): GameColor[] {
  return GAME_COLORS.filter(color => {
    const r = parseInt(color.hex.slice(1, 3), 16);
    const g = parseInt(color.hex.slice(3, 5), 16);
    const b = parseInt(color.hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Exclude very dark or very light colors for better gameplay
    return luminance > 0.08 && luminance < 0.92;
  });
}

export const GAMEPLAY_COLORS: GameColor[] = getGameplayColors();

/**
 * Get achievable gameplay colors (intersection of both filters)
 * This is the primary color list for gameplay
 */
export function getAchievableGameColors(): GameColor[] {
  return ACHIEVABLE_COLORS.filter(color => {
    const r = parseInt(color.hex.slice(1, 3), 16);
    const g = parseInt(color.hex.slice(3, 5), 16);
    const b = parseInt(color.hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.08 && luminance < 0.92;
  });
}

export const ACHIEVABLE_GAMEPLAY_COLORS: GameColor[] = getAchievableGameColors();

// ============================================================================
// Color Selection Functions
// ============================================================================

/**
 * Get a random color from achievable gameplay-suitable colors
 */
export function getRandomGameColor(): GameColor {
  const colors = GAMEPLAY_COLORS;
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get a random color that is guaranteed achievable
 */
export function getAchievableRandomColor(): GameColor {
  const colors = ACHIEVABLE_GAMEPLAY_COLORS;
  if (colors.length === 0) {
    // Fallback to gameplay colors if no achievable colors
    return getRandomGameColor();
  }
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get a color by index (for seeded/deterministic selection)
 */
export function getGameColorByIndex(index: number): GameColor {
  const colors = GAMEPLAY_COLORS;
  const safeIndex = ((index % colors.length) + colors.length) % colors.length;
  return colors[safeIndex];
}

/**
 * Get an achievable color by index (for seeded/deterministic selection)
 */
export function getAchievableColorByIndex(index: number): GameColor {
  const colors = ACHIEVABLE_GAMEPLAY_COLORS;
  if (colors.length === 0) {
    return getGameColorByIndex(index);
  }
  const safeIndex = ((index % colors.length) + colors.length) % colors.length;
  return colors[safeIndex];
}

/**
 * Get the daily color using deterministic seed based on date
 */
export function getDailyGameColor(date: Date = new Date()): GameColor {
  // Create a deterministic seed from the date
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed << 5) - seed) + dateStr.charCodeAt(i);
    seed = seed & seed; // Convert to 32-bit integer
  }
  
  // Use the seed to pick a color
  const index = Math.abs(seed) % GAMEPLAY_COLORS.length;
  return GAMEPLAY_COLORS[index];
}

/**
 * Get the daily color from achievable colors only
 * Ensures players can always achieve a high score on daily challenges
 */
export function getAchievableDailyColor(date: Date = new Date()): GameColor {
  const colors = ACHIEVABLE_GAMEPLAY_COLORS;
  if (colors.length === 0) {
    return getDailyGameColor(date);
  }
  
  // Create a deterministic seed from the date
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed << 5) - seed) + dateStr.charCodeAt(i);
    seed = seed & seed; // Convert to 32-bit integer
  }
  
  // Use the seed to pick a color
  const index = Math.abs(seed) % colors.length;
  return colors[index];
}

/**
 * Get all colors in a category
 */
export function getColorsByCategory(category: GameColor['category']): GameColor[] {
  return GAME_COLORS.filter(c => c.category === category);
}

/**
 * Get achievable colors in a category
 */
export function getAchievableColorsByCategory(category: GameColor['category']): GameColor[] {
  return ACHIEVABLE_COLORS.filter(c => c.category === category);
}

/**
 * Total count of all colors
 */
export const GAME_COLOR_COUNT = GAME_COLORS.length;
export const ACHIEVABLE_COLOR_COUNT = ACHIEVABLE_COLORS.length;

// ============================================================================
// COLOR NAME MATCHING
// ============================================================================

// Convert hex to LAB for perceptual color matching
function hexToLab(hex: string): { L: number; a: number; b: number } {
  // Hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  // RGB to XYZ (sRGB with D65 illuminant)
  const toLinear = (c: number) => c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);
  
  const x = (rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375) / 0.95047;
  const y = (rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750);
  const z = (rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041) / 1.08883;
  
  // XYZ to LAB
  const f = (t: number) => t > 0.008856 ? Math.pow(t, 1/3) : (7.787 * t) + (16 / 116);
  
  const L = (116 * f(y)) - 16;
  const a = 500 * (f(x) - f(y));
  const bVal = 200 * (f(y) - f(z));
  
  return { L, a, b: bVal };
}

// Calculate Delta E (CIE76) - perceptual color difference
function deltaE(lab1: { L: number; a: number; b: number }, lab2: { L: number; a: number; b: number }): number {
  return Math.sqrt(
    Math.pow(lab1.L - lab2.L, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
}

// Pre-compute LAB values for all colors for fast matching
const COLORS_LAB = GAME_COLORS.map(color => ({
  color,
  lab: hexToLab(color.hex)
}));

/**
 * Find the closest color to a given hex color
 */
export function findClosestGameColor(hex: string): { color: GameColor; distance: number } {
  const targetLab = hexToLab(hex);
  
  let closest = COLORS_LAB[0];
  let minDistance = deltaE(targetLab, closest.lab);
  
  for (const { color, lab } of COLORS_LAB) {
    const distance = deltaE(targetLab, lab);
    if (distance < minDistance) {
      minDistance = distance;
      closest = { color, lab };
    }
  }
  
  return { color: closest.color, distance: minDistance };
}

/**
 * Get the color name for any hex color
 * Returns the name of the closest matching color
 */
export function getGameColorName(hex: string): string {
  const match = findClosestGameColor(hex);
  return match.color.name;
}

// ============================================================================
// Debug/Dev Utilities
// ============================================================================

/**
 * Get achievability stats for debugging
 */
export function getAchievabilityStats(): {
  total: number;
  achievable: number;
  percentage: number;
  byCategory: Record<string, { total: number; achievable: number }>;
} {
  const byCategory: Record<string, { total: number; achievable: number }> = {};
  
  for (const color of COLORS_WITH_ACHIEVABILITY) {
    if (!byCategory[color.category]) {
      byCategory[color.category] = { total: 0, achievable: 0 };
    }
    byCategory[color.category].total++;
    if (color.achievable) {
      byCategory[color.category].achievable++;
    }
  }
  
  return {
    total: totalCount,
    achievable: achievableCount,
    percentage: Math.round((achievableCount / totalCount) * 100),
    byCategory,
  };
}
