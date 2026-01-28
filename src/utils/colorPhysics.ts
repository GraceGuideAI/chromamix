import chroma from 'chroma-js';
import { 
  getDailyPTSColor, 
  getRandomPTSColor, 
  type PTSColor 
} from '@/data/ptsColors';

// Re-export PTSColor type for consumers
export type { PTSColor };

/**
 * ColorPhysics - Advanced color mixing and scoring for ChromaMix
 * 
 * Features:
 * - Kubelka-Munk subtractive color mixing (paint-like)
 * - True Kubelka-Munk K/S theory (enhanced mode)
 * - CIEDE2000 color difference with tiered scoring
 * - Mulberry32 PRNG for deterministic daily colors
 * - Porsche PTS (Paint to Sample) color catalog integration
 */

// ============================================================================
// Type Definitions
// ============================================================================

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

interface KSCoefficients {
  K: [number, number, number]; // Absorption coefficients (R, G, B)
  S: [number, number, number]; // Scattering coefficients (R, G, B)
}

export type MixingMode = 'cmyk' | 'kubelka-munk';

/**
 * Target color with name information (alias for PTSColor)
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
// Color Space Conversions
// ============================================================================

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

function cmykToRGB(cmyk: CMYKColor): RGBColor {
  const r = 255 * (1 - cmyk.c) * (1 - cmyk.k);
  const g = 255 * (1 - cmyk.m) * (1 - cmyk.k);
  const b = 255 * (1 - cmyk.y) * (1 - cmyk.k);

  return { 
    r: Math.round(Math.max(0, Math.min(255, r))), 
    g: Math.round(Math.max(0, Math.min(255, g))), 
    b: Math.round(Math.max(0, Math.min(255, b))) 
  };
}

// ============================================================================
// Kubelka-Munk Theory - True Pigment Mixing
// ============================================================================

/**
 * Convert reflectance to K/S ratio (Kubelka-Munk function)
 * K/S = (1 - R)² / (2R)
 */
function reflectanceToKS(R: number): number {
  // Clamp R to avoid division by zero and negative values
  const r = Math.max(0.001, Math.min(0.999, R));
  return Math.pow(1 - r, 2) / (2 * r);
}

/**
 * Convert K/S ratio back to reflectance
 * R = 1 + K/S - √((K/S)² + 2(K/S))
 */
function ksToReflectance(ks: number): number {
  const k = Math.max(0, ks);
  return 1 + k - Math.sqrt(k * k + 2 * k);
}

/**
 * Convert RGB color to K/S coefficients
 * Approximates pigment absorption/scattering from color appearance
 * 
 * Uses a modified K-M model tuned for game-friendly results:
 * - Higher base scattering prevents overly dark mixes
 * - Adjusted absorption curve maintains color vibrancy
 */
function rgbToKS(rgb: RGBColor): KSCoefficients {
  // Convert to reflectance (0-1 scale) with gamma correction
  const gamma = 2.2;
  const R = [
    Math.pow(rgb.r / 255, gamma),
    Math.pow(rgb.g / 255, gamma),
    Math.pow(rgb.b / 255, gamma)
  ] as [number, number, number];
  
  // Convert each channel to K/S with modified curve
  // Use sqrt to reduce absorption aggressiveness
  const KS = R.map(r => {
    const clamped = Math.max(0.02, Math.min(0.98, r));
    // Modified K/S function: gentler absorption for better mixing
    return Math.pow(reflectanceToKS(clamped), 0.5);
  }) as [number, number, number];
  
  // Variable scattering: brighter colors scatter more
  const avgR = (R[0] + R[1] + R[2]) / 3;
  const scatterFactor = 0.8 + avgR * 0.4; // Range: 0.8-1.2
  
  return {
    K: KS,
    S: [scatterFactor, scatterFactor, scatterFactor]
  };
}

/**
 * Convert K/S coefficients back to RGB
 */
function ksToRGB(ks: KSCoefficients): RGBColor {
  // Calculate K/S ratio for each channel
  const ratios = ks.K.map((k, i) => k / ks.S[i]);
  
  // Convert to reflectance with inverse of the modified curve
  const R = ratios.map(r => {
    // Inverse of the sqrt modification
    const ksValue = r * r;
    return ksToReflectance(ksValue);
  });
  
  // Apply inverse gamma correction
  const gamma = 2.2;
  const invGamma = 1 / gamma;
  
  return {
    r: Math.round(Math.max(0, Math.min(255, Math.pow(R[0], invGamma) * 255))),
    g: Math.round(Math.max(0, Math.min(255, Math.pow(R[1], invGamma) * 255))),
    b: Math.round(Math.max(0, Math.min(255, Math.pow(R[2], invGamma) * 255)))
  };
}

/**
 * Mix colors using true Kubelka-Munk theory
 * Physically accurate pigment mixing simulation
 * 
 * The key insight: K and S mix linearly by concentration
 * K_mix = Σ(c_i × K_i), S_mix = Σ(c_i × S_i)
 */
export function mixColorsKubelkaMunk(
  colors: { hex: string; amount: number }[]
): string {
  const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
  
  if (totalAmount === 0) {
    return '#808080';
  }

  const normalized = colors.map(c => ({
    hex: c.hex,
    concentration: c.amount / totalAmount
  }));

  // Convert all colors to K/S coefficients
  const ksColors = normalized.map(c => {
    const rgb = chroma(c.hex).rgb();
    const ks = rgbToKS({ r: rgb[0], g: rgb[1], b: rgb[2] });
    return { ks, concentration: c.concentration };
  });

  // Mix K and S coefficients linearly (Kubelka-Munk mixing rule)
  const mixedKS: KSCoefficients = {
    K: [0, 0, 0],
    S: [0, 0, 0]
  };

  for (const { ks, concentration } of ksColors) {
    for (let i = 0; i < 3; i++) {
      mixedKS.K[i] += ks.K[i] * concentration;
      mixedKS.S[i] += ks.S[i] * concentration;
    }
  }

  // Convert back to RGB
  const mixedRGB = ksToRGB(mixedKS);
  
  return chroma(mixedRGB.r, mixedRGB.g, mixedRGB.b).hex();
}

// ============================================================================
// CMYK Subtractive Mixing (Simpler approximation)
// ============================================================================

/**
 * Mix colors using CMYK subtractive mixing
 * Good approximation for paint mixing, simpler than K-M
 */
export function mixColorsCMYK(
  colors: { hex: string; amount: number }[]
): string {
  const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
  
  if (totalAmount === 0) {
    return '#808080';
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

  // Weighted average in CMYK space
  const mixedCMYK: CMYKColor = {
    c: cmykColors.reduce((sum, c) => sum + c.cmyk.c * c.weight, 0),
    m: cmykColors.reduce((sum, c) => sum + c.cmyk.m * c.weight, 0),
    y: cmykColors.reduce((sum, c) => sum + c.cmyk.y * c.weight, 0),
    k: cmykColors.reduce((sum, c) => sum + c.cmyk.k * c.weight, 0),
  };

  const mixedRGB = cmykToRGB(mixedCMYK);
  
  return chroma(mixedRGB.r, mixedRGB.g, mixedRGB.b).hex();
}

// ============================================================================
// Unified Mixing API
// ============================================================================

/**
 * Mix colors using the specified mode
 * @param colors Array of colors with amounts
 * @param mode 'cmyk' (default, faster) or 'kubelka-munk' (more accurate)
 */
export function mixColorsSubtractive(
  colors: { hex: string; amount: number }[],
  mode: MixingMode = 'cmyk'
): string {
  if (mode === 'kubelka-munk') {
    return mixColorsKubelkaMunk(colors);
  }
  return mixColorsCMYK(colors);
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
// Daily Color Generation (Porsche PTS Colors)
// ============================================================================

/**
 * Generate daily target color using Porsche PTS colors
 * Same color for all players on the same day
 * @returns TargetColor with hex, name, and optional code
 */
export function getDailyTargetColor(date?: Date): TargetColor {
  const ptsColor = getDailyPTSColor(date);
  return {
    hex: ptsColor.hex,
    name: ptsColor.name,
    code: ptsColor.code,
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
 * Generate a random target color from PTS catalog (for Rush mode)
 * @returns TargetColor with hex, name, and optional code
 */
export function generateRandomColor(): TargetColor {
  const ptsColor = getRandomPTSColor();
  return {
    hex: ptsColor.hex,
    name: ptsColor.name,
    code: ptsColor.code,
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
 * Check if a color is "achievable" through mixing the available palette
 * Useful for validating daily colors
 */
export function isColorAchievable(
  targetHex: string,
  palette: string[],
  threshold: number = 15
): boolean {
  // Simple heuristic: check if target is within reasonable deltaE of any palette color
  // or could be mixed from palette colors
  const targetLab = chroma(targetHex).lab();
  
  // Check palette colors
  for (const colorHex of palette) {
    const deltaE = chroma.deltaE(targetHex, colorHex);
    if (deltaE < threshold) return true;
  }
  
  // Check basic mixes (pairs)
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const mixed = mixColorsSubtractive([
        { hex: palette[i], amount: 1 },
        { hex: palette[j], amount: 1 }
      ]);
      const deltaE = chroma.deltaE(targetHex, mixed);
      if (deltaE < threshold) return true;
    }
  }
  
  return false;
}
