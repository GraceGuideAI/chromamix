import chroma from 'chroma-js';
import { 
  getDailyGameColor, 
  getRandomGameColor, 
  type GameColor 
} from '@/data/colors';

// Re-export GameColor type for consumers
export type { GameColor };

/**
 * ColorPhysics - RGB Additive Color Mixing for ChromaMix
 * 
 * Features:
 * - RGB additive color mixing (light-based)
 * - Weighted average mixing with proper clamping
 * - CIEDE2000 color difference with tiered scoring
 * - Mulberry32 PRNG for deterministic daily colors
 * - Custom color catalog integration
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Target color with name information
 */
export interface TargetColor {
  hex: string;
  name: string;
  code?: string;
}

// ============================================================================
// Mulberry32 PRNG - Deterministic random number generation
// ============================================================================

/**
 * Mulberry32 PRNG - Fast, high-quality 32-bit PRNG
 * Much better distribution than Math.sin() hacks
 * https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
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
 * Create a seeded random number generator for a specific date
 */
function createDailyRNG(date: Date = new Date()): () => number {
  const seed = date.getFullYear() * 10000 + 
               (date.getMonth() + 1) * 100 + 
               date.getDate();
  return mulberry32(seed);
}

// ============================================================================
// RGB Additive Color Mixing
// ============================================================================

/**
 * Mix colors using RGB additive mixing (light-based)
 * 
 * In additive mixing:
 * - Red + Green = Yellow
 * - Red + Blue = Magenta  
 * - Green + Blue = Cyan
 * - Red + Green + Blue = White
 * - No light = Black
 * 
 * Uses weighted average with intensity normalization
 */
export function mixColorsRGB(
  colors: { hex: string; amount: number }[]
): string {
  const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
  
  if (totalAmount === 0) {
    return '#000000'; // No light = black
  }

  // Convert hex colors to RGB and weight by amount
  let mixedR = 0;
  let mixedG = 0;
  let mixedB = 0;
  
  for (const { hex, amount } of colors) {
    const rgb = chroma(hex).rgb();
    const weight = amount / 100; // Normalize to 0-1
    
    // Add weighted RGB values (additive mixing)
    mixedR += rgb[0] * weight;
    mixedG += rgb[1] * weight;
    mixedB += rgb[2] * weight;
  }
  
  // Clamp values to valid RGB range
  mixedR = Math.min(255, Math.max(0, Math.round(mixedR)));
  mixedG = Math.min(255, Math.max(0, Math.round(mixedG)));
  mixedB = Math.min(255, Math.max(0, Math.round(mixedB)));
  
  return chroma(mixedR, mixedG, mixedB).hex();
}

/**
 * Alternative RGB mixing with screen blend mode
 * Creates lighter results, more like overlapping colored lights
 * 
 * Screen formula: 1 - (1 - A) * (1 - B)
 */
export function mixColorsScreen(
  colors: { hex: string; amount: number }[]
): string {
  const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
  
  if (totalAmount === 0) {
    return '#000000';
  }

  // Start with black (no light)
  let screenR = 0;
  let screenG = 0;
  let screenB = 0;
  
  for (const { hex, amount } of colors) {
    const rgb = chroma(hex).rgb();
    const intensity = amount / 100;
    
    // Apply intensity to the color
    const r = (rgb[0] / 255) * intensity;
    const g = (rgb[1] / 255) * intensity;
    const b = (rgb[2] / 255) * intensity;
    
    // Screen blend: 1 - (1 - existing) * (1 - new)
    screenR = 1 - (1 - screenR) * (1 - r);
    screenG = 1 - (1 - screenG) * (1 - g);
    screenB = 1 - (1 - screenB) * (1 - b);
  }
  
  return chroma(
    Math.round(screenR * 255),
    Math.round(screenG * 255),
    Math.round(screenB * 255)
  ).hex();
}

// ============================================================================
// Tiered CIEDE2000 Scoring System
// ============================================================================

/**
 * Score tiers for better game feel
 * Based on perceptual color difference thresholds
 */
export const SCORE_TIERS = {
  PERFECT: { minScore: 98, maxDeltaE: 1, label: '🎯 Perfect!', stars: 5 },
  EXCELLENT: { minScore: 90, maxDeltaE: 3, label: '⭐ Excellent!', stars: 4 },
  GREAT: { minScore: 75, maxDeltaE: 7, label: '👍 Great!', stars: 3 },
  GOOD: { minScore: 50, maxDeltaE: 15, label: '👌 Good', stars: 2 },
  CLOSE: { minScore: 25, maxDeltaE: 30, label: '🔄 Close', stars: 1 },
  FAR: { minScore: 0, maxDeltaE: Infinity, label: '💪 Keep trying', stars: 0 }
} as const;

export type ScoreTier = keyof typeof SCORE_TIERS;

export interface ColorScoreResult {
  score: number;           // 0-100 numeric score
  deltaE: number;          // Raw CIEDE2000 difference
  tier: ScoreTier;         // Score tier name
  label: string;           // Human-readable tier label
  stars: number;           // 0-5 stars
  isMatch: boolean;        // Score >= 90 (considered a match)
}

/**
 * Calculate color difference using CIEDE2000 with tiered scoring
 * Returns comprehensive score result with tier information
 */
export function calculateColorScore(color1: string, color2: string): ColorScoreResult {
  try {
    const deltaE = chroma.deltaE(color1, color2);
    
    // Tiered scoring curve for better game feel
    // Uses different exponential decay rates per tier
    let score: number;
    
    if (deltaE <= 1) {
      // Perfect match zone: 98-100
      score = 100 - (deltaE * 2);
    } else if (deltaE <= 3) {
      // Excellent zone: 90-98 (gentle curve)
      score = 98 - ((deltaE - 1) * 4);
    } else if (deltaE <= 7) {
      // Great zone: 75-90 (moderate curve)
      score = 90 - ((deltaE - 3) * 3.75);
    } else if (deltaE <= 15) {
      // Good zone: 50-75 (steeper curve)
      score = 75 - ((deltaE - 7) * 3.125);
    } else if (deltaE <= 30) {
      // Close zone: 25-50 (steep curve)
      score = 50 - ((deltaE - 15) * 1.667);
    } else {
      // Far zone: 0-25 (exponential decay)
      score = Math.max(0, 25 * Math.exp(-(deltaE - 30) / 20));
    }
    
    // Round to 1 decimal
    score = Math.round(score * 10) / 10;
    
    // Determine tier
    let tier: ScoreTier;
    if (score >= SCORE_TIERS.PERFECT.minScore) tier = 'PERFECT';
    else if (score >= SCORE_TIERS.EXCELLENT.minScore) tier = 'EXCELLENT';
    else if (score >= SCORE_TIERS.GREAT.minScore) tier = 'GREAT';
    else if (score >= SCORE_TIERS.GOOD.minScore) tier = 'GOOD';
    else if (score >= SCORE_TIERS.CLOSE.minScore) tier = 'CLOSE';
    else tier = 'FAR';
    
    const tierInfo = SCORE_TIERS[tier];
    
    return {
      score,
      deltaE: Math.round(deltaE * 100) / 100,
      tier,
      label: tierInfo.label,
      stars: tierInfo.stars,
      isMatch: score >= 90
    };
  } catch (e) {
    return {
      score: 0,
      deltaE: 100,
      tier: 'FAR',
      label: SCORE_TIERS.FAR.label,
      stars: 0,
      isMatch: false
    };
  }
}

/**
 * Simple score calculation (backwards compatible)
 * Returns just the numeric score 0-100
 */
export function calculateSimpleScore(color1: string, color2: string): number {
  return calculateColorScore(color1, color2).score;
}

// ============================================================================
// Daily Color Generation (Custom Colors)
// ============================================================================

/**
 * Generate daily target color using game color palette
 * Same color for all players on the same day
 * @returns TargetColor with hex and name
 */
export function getDailyTargetColor(date?: Date): TargetColor {
  const gameColor = getDailyGameColor(date);
  return {
    hex: gameColor.hex,
    name: gameColor.name,
  };
}

/**
 * Get daily color info including date, seed, and HSL values
 */
export function getDailyColorInfo(date: Date = new Date()): {
  hex: string;
  name: string;
  code?: string;
  date: string;
  seed: number;
  hsl: { h: number; s: number; l: number };
} {
  const seed = date.getFullYear() * 10000 + 
               (date.getMonth() + 1) * 100 + 
               date.getDate();
  
  const targetColor = getDailyTargetColor(date);
  const hsl = chroma(targetColor.hex).hsl();
  
  return {
    hex: targetColor.hex,
    name: targetColor.name,
    code: targetColor.code,
    date: date.toISOString().split('T')[0],
    seed,
    hsl: {
      h: Math.round(hsl[0] || 0),
      s: Math.round((hsl[1] || 0) * 100),
      l: Math.round((hsl[2] || 0) * 100)
    }
  };
}

/**
 * Generate a random target color from game palette (for Rush mode)
 * @returns TargetColor with hex and name
 */
export function generateRandomColor(): TargetColor {
  const gameColor = getRandomGameColor();
  return {
    hex: gameColor.hex,
    name: gameColor.name,
  };
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Get color name/description for UI
 */
export function getColorName(hex: string): string {
  const color = chroma(hex);
  const hsl = color.hsl();
  const hue = hsl[0] || 0;
  const sat = hsl[1] || 0;
  const light = hsl[2] || 0;

  // Achromatic colors
  if (sat < 0.1) {
    if (light > 0.9) return 'White';
    if (light < 0.1) return 'Black';
    if (light > 0.6) return 'Light Gray';
    if (light < 0.4) return 'Dark Gray';
    return 'Gray';
  }

  // Lightness modifier
  let prefix = '';
  if (light > 0.7) prefix = 'Light ';
  else if (light < 0.3) prefix = 'Dark ';

  // Hue-based color name
  let baseName: string;
  if (hue < 15 || hue >= 345) baseName = 'Red';
  else if (hue < 45) baseName = 'Orange';
  else if (hue < 70) baseName = 'Yellow';
  else if (hue < 100) baseName = 'Lime';
  else if (hue < 150) baseName = 'Green';
  else if (hue < 180) baseName = 'Teal';
  else if (hue < 210) baseName = 'Cyan';
  else if (hue < 250) baseName = 'Blue';
  else if (hue < 290) baseName = 'Purple';
  else if (hue < 320) baseName = 'Magenta';
  else baseName = 'Pink';

  return prefix + baseName;
}

/**
 * Get contrasting text color for a background
 */
export function getContrastingTextColor(bgHex: string): string {
  const luminance = chroma(bgHex).luminance();
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Check if a color is "achievable" through mixing the available RGB palette
 * Useful for validating daily colors
 */
export function isColorAchievable(
  targetHex: string,
  palette: string[] = ['#FF0000', '#00FF00', '#0000FF'],
  threshold: number = 15
): boolean {
  // Simple heuristic: check if target is within reasonable deltaE of any palette color
  // or could be mixed from palette colors
  
  // Check palette colors directly
  for (const colorHex of palette) {
    const deltaE = chroma.deltaE(targetHex, colorHex);
    if (deltaE < threshold) return true;
  }
  
  // Check basic mixes (pairs at 50/50)
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const mixed = mixColorsRGB([
        { hex: palette[i], amount: 50 },
        { hex: palette[j], amount: 50 }
      ]);
      const deltaE = chroma.deltaE(targetHex, mixed);
      if (deltaE < threshold) return true;
    }
  }
  
  // Check all three at various ratios
  const testMix = mixColorsRGB([
    { hex: palette[0], amount: 33 },
    { hex: palette[1], amount: 33 },
    { hex: palette[2], amount: 33 }
  ]);
  if (chroma.deltaE(targetHex, testMix) < threshold) return true;
  
  return false;
}
