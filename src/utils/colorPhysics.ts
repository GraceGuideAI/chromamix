import chroma from 'chroma-js';
import { 
  getDailyGameColor, 
  getRandomGameColor, 
  type GameColor,
  getAchievableGameColors,
  getAchievableDailyColor,
  getAchievableRandomColor,
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
 * - Achievable color filtering for fair gameplay
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

/**
 * Detailed color match feedback for UI
 */
export interface ColorMatchFeedback {
  tier: ScoreTier;
  label: string;
  emoji: string;
  description: string;
  hint?: string;
  rgbDiff: { r: number; g: number; b: number };
  dominantDiff: 'red' | 'green' | 'blue' | 'none';
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
// RGB Additive Color Mixing - Improved Algorithm
// ============================================================================

/**
 * Mix colors using RGB additive mixing (light-based)
 * 
 * IMPROVED ALGORITHM:
 * Uses intensity-weighted additive mixing that properly simulates
 * how colored lights combine. Each slider controls the intensity
 * (brightness) of its respective RGB channel.
 * 
 * In additive mixing:
 * - Red + Green = Yellow
 * - Red + Blue = Magenta  
 * - Green + Blue = Cyan
 * - Red + Green + Blue = White
 * - No light = Black
 * 
 * The amount (0-100) directly controls the output value for each channel:
 * - Red slider at 100% → R channel = 255
 * - Red slider at 50% → R channel = 127
 * - This allows for intuitive, predictable color mixing
 */
export function mixColorsRGB(
  colors: { hex: string; amount: number }[]
): string {
  const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
  
  if (totalAmount === 0) {
    return '#000000'; // No light = black
  }

  // Initialize RGB channels (0 = no light)
  let mixedR = 0;
  let mixedG = 0;
  let mixedB = 0;
  
  for (const { hex, amount } of colors) {
    const rgb = chroma(hex).rgb();
    // Amount directly scales the channel output (0-100% → 0-255)
    // This gives players direct, intuitive control
    const intensity = amount / 100;
    
    // Add the light contribution from this color
    // Each primary color contributes to its channel based on intensity
    mixedR += rgb[0] * intensity;
    mixedG += rgb[1] * intensity;
    mixedB += rgb[2] * intensity;
  }
  
  // Clamp values to valid RGB range (255 max per channel)
  // Additive mixing naturally saturates at white
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
// Tiered CIEDE2000 Scoring System - Improved Thresholds
// ============================================================================

/**
 * Score tiers for better game feel
 * IMPROVED: Adjusted thresholds based on perceptual research
 * 
 * CIEDE2000 deltaE interpretation:
 * - 0-1: Not perceptible by human eye
 * - 1-2: Perceptible through close observation
 * - 2-10: Perceptible at a glance
 * - 11-49: Colors are more similar than opposite
 * - 100: Colors are exact opposites
 */
export const SCORE_TIERS = {
  PERFECT: { minScore: 95, maxDeltaE: 2, label: '🎯 Perfect!', stars: 5 },
  EXCELLENT: { minScore: 85, maxDeltaE: 5, label: '⭐ Excellent!', stars: 4 },
  GREAT: { minScore: 70, maxDeltaE: 10, label: '👍 Great!', stars: 3 },
  GOOD: { minScore: 50, maxDeltaE: 20, label: '👌 Good', stars: 2 },
  CLOSE: { minScore: 25, maxDeltaE: 35, label: '🔄 Close', stars: 1 },
  FAR: { minScore: 0, maxDeltaE: Infinity, label: '💪 Keep trying', stars: 0 }
} as const;

export type ScoreTier = keyof typeof SCORE_TIERS;

export interface ColorScoreResult {
  score: number;           // 0-100 numeric score
  deltaE: number;          // Raw CIEDE2000 difference
  tier: ScoreTier;         // Score tier name
  label: string;           // Human-readable tier label
  stars: number;           // 0-5 stars
  isMatch: boolean;        // Score >= 85 (considered a match)
  feedback: ColorMatchFeedback; // Detailed feedback for UI
}

/**
 * Calculate color difference using CIEDE2000 with tiered scoring
 * IMPROVED: More intuitive scoring curve and detailed feedback
 * 
 * Returns comprehensive score result with tier information
 */
export function calculateColorScore(color1: string, color2: string): ColorScoreResult {
  try {
    // CIEDE2000 is the industry standard for perceptual color difference
    const deltaE = chroma.deltaE(color1, color2);
    
    // Get RGB difference for feedback
    const rgb1 = chroma(color1).rgb();
    const rgb2 = chroma(color2).rgb();
    const rgbDiff = {
      r: rgb2[0] - rgb1[0],
      g: rgb2[1] - rgb1[1],
      b: rgb2[2] - rgb1[2],
    };
    
    // Find dominant difference
    const absDiffs = [Math.abs(rgbDiff.r), Math.abs(rgbDiff.g), Math.abs(rgbDiff.b)];
    const maxDiff = Math.max(...absDiffs);
    let dominantDiff: 'red' | 'green' | 'blue' | 'none' = 'none';
    if (maxDiff > 20) {
      if (Math.abs(rgbDiff.r) === maxDiff) dominantDiff = 'red';
      else if (Math.abs(rgbDiff.g) === maxDiff) dominantDiff = 'green';
      else dominantDiff = 'blue';
    }
    
    // IMPROVED SCORING CURVE
    // Uses a smoother, more intuitive mapping from deltaE to score
    // Perfect match (deltaE ≈ 0) = 100
    // Imperceptible (deltaE ≤ 1) = 98-100
    // Very close (deltaE ≤ 5) = 85-98
    // Close (deltaE ≤ 15) = 50-85
    // Different (deltaE > 15) = 0-50
    
    let score: number;
    
    if (deltaE <= 0.5) {
      // Perfect match zone: 99-100
      score = 100 - (deltaE * 2);
    } else if (deltaE <= 2) {
      // Near-perfect zone: 95-99 (imperceptible difference)
      score = 99 - ((deltaE - 0.5) * 2.67);
    } else if (deltaE <= 5) {
      // Excellent zone: 85-95 (barely perceptible)
      score = 95 - ((deltaE - 2) * 3.33);
    } else if (deltaE <= 10) {
      // Great zone: 70-85 (noticeable but close)
      score = 85 - ((deltaE - 5) * 3);
    } else if (deltaE <= 20) {
      // Good zone: 50-70 (clearly different but similar)
      score = 70 - ((deltaE - 10) * 2);
    } else if (deltaE <= 35) {
      // Close zone: 25-50 (different colors)
      score = 50 - ((deltaE - 20) * 1.67);
    } else {
      // Far zone: 0-25 (very different)
      score = Math.max(0, 25 * Math.exp(-(deltaE - 35) / 25));
    }
    
    // Round to 1 decimal
    score = Math.round(score * 10) / 10;
    
    // Ensure score is in valid range
    score = Math.max(0, Math.min(100, score));
    
    // Determine tier
    let tier: ScoreTier;
    if (score >= SCORE_TIERS.PERFECT.minScore) tier = 'PERFECT';
    else if (score >= SCORE_TIERS.EXCELLENT.minScore) tier = 'EXCELLENT';
    else if (score >= SCORE_TIERS.GREAT.minScore) tier = 'GREAT';
    else if (score >= SCORE_TIERS.GOOD.minScore) tier = 'GOOD';
    else if (score >= SCORE_TIERS.CLOSE.minScore) tier = 'CLOSE';
    else tier = 'FAR';
    
    const tierInfo = SCORE_TIERS[tier];
    
    // Generate detailed feedback
    const feedback = generateFeedback(tier, rgbDiff, dominantDiff, deltaE);
    
    return {
      score,
      deltaE: Math.round(deltaE * 100) / 100,
      tier,
      label: tierInfo.label,
      stars: tierInfo.stars,
      isMatch: score >= 85,
      feedback,
    };
  } catch (e) {
    return {
      score: 0,
      deltaE: 100,
      tier: 'FAR',
      label: SCORE_TIERS.FAR.label,
      stars: 0,
      isMatch: false,
      feedback: {
        tier: 'FAR',
        label: 'Invalid color',
        emoji: '❌',
        description: 'Could not compare colors',
        rgbDiff: { r: 0, g: 0, b: 0 },
        dominantDiff: 'none',
      },
    };
  }
}

/**
 * Generate helpful feedback based on the color difference
 */
function generateFeedback(
  tier: ScoreTier,
  rgbDiff: { r: number; g: number; b: number },
  dominantDiff: 'red' | 'green' | 'blue' | 'none',
  deltaE: number
): ColorMatchFeedback {
  const baseInfo: Record<ScoreTier, { emoji: string; description: string }> = {
    PERFECT: { emoji: '🏆', description: 'Incredible! Nearly identical colors!' },
    EXCELLENT: { emoji: '✨', description: 'Amazing! Very close match!' },
    GREAT: { emoji: '🎯', description: 'Great job! Colors are quite similar.' },
    GOOD: { emoji: '👍', description: 'Good effort! Getting closer.' },
    CLOSE: { emoji: '🔄', description: 'On the right track!' },
    FAR: { emoji: '🤔', description: 'Keep experimenting with the sliders.' },
  };
  
  const info = baseInfo[tier];
  let hint: string | undefined;
  
  // Generate helpful hint for non-perfect matches
  if (tier !== 'PERFECT' && dominantDiff !== 'none') {
    const diff = rgbDiff[dominantDiff === 'red' ? 'r' : dominantDiff === 'green' ? 'g' : 'b'];
    const direction = diff > 0 ? 'less' : 'more';
    const colorName = dominantDiff.charAt(0).toUpperCase() + dominantDiff.slice(1);
    
    if (Math.abs(diff) > 40) {
      hint = `Try ${direction} ${colorName}`;
    } else if (Math.abs(diff) > 20) {
      hint = `Slightly ${direction} ${colorName}`;
    }
  }
  
  return {
    tier,
    label: SCORE_TIERS[tier].label,
    emoji: info.emoji,
    description: info.description,
    hint,
    rgbDiff,
    dominantDiff,
  };
}

/**
 * Simple score calculation (backwards compatible)
 * Returns just the numeric score 0-100
 */
export function calculateSimpleScore(color1: string, color2: string): number {
  return calculateColorScore(color1, color2).score;
}

// ============================================================================
// Daily Color Generation - Uses Achievable Colors Only
// ============================================================================

/**
 * Generate daily target color using achievable game color palette
 * Same color for all players on the same day
 * IMPROVED: Only returns colors that can be achieved with RGB sliders
 * @returns TargetColor with hex and name
 */
export function getDailyTargetColor(date?: Date): TargetColor {
  const gameColor = getAchievableDailyColor(date);
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
  achievable: boolean;
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
    },
    achievable: true, // Always true now that we filter
  };
}

/**
 * Generate a random target color from achievable game palette (for Rush mode)
 * IMPROVED: Only returns colors that can be achieved with RGB sliders
 * @returns TargetColor with hex and name
 */
export function generateRandomColor(): TargetColor {
  const gameColor = getAchievableRandomColor();
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
 * Calculate the best achievable score for a target color
 * Uses optimization to find the optimal RGB slider values
 */
export function calculateBestAchievableScore(targetHex: string): {
  bestScore: number;
  bestSliders: { r: number; g: number; b: number };
  bestMix: string;
} {
  const targetRgb = chroma(targetHex).rgb();
  
  // For our simple additive mixing, the optimal sliders
  // directly map to the target RGB values (scaled to 0-100)
  const optimalSliders = {
    r: Math.round((targetRgb[0] / 255) * 100),
    g: Math.round((targetRgb[1] / 255) * 100),
    b: Math.round((targetRgb[2] / 255) * 100),
  };
  
  const bestMix = mixColorsRGB([
    { hex: '#FF0000', amount: optimalSliders.r },
    { hex: '#00FF00', amount: optimalSliders.g },
    { hex: '#0000FF', amount: optimalSliders.b },
  ]);
  
  const scoreResult = calculateColorScore(bestMix, targetHex);
  
  return {
    bestScore: scoreResult.score,
    bestSliders: optimalSliders,
    bestMix,
  };
}

/**
 * Check if a color is "achievable" through mixing the available RGB palette
 * A color is achievable if optimal slider settings produce a score >= threshold
 */
export function isColorAchievable(
  targetHex: string,
  threshold: number = 90
): boolean {
  const { bestScore } = calculateBestAchievableScore(targetHex);
  return bestScore >= threshold;
}

/**
 * Get hint for how to improve the current mix
 */
export function getColorHint(
  currentMix: string,
  targetHex: string
): {
  hint: string;
  adjustments: { red: number; green: number; blue: number };
} {
  const currentRgb = chroma(currentMix).rgb();
  const targetRgb = chroma(targetHex).rgb();
  
  const adjustments = {
    red: targetRgb[0] - currentRgb[0],
    green: targetRgb[1] - currentRgb[1],
    blue: targetRgb[2] - currentRgb[2],
  };
  
  // Find the largest needed adjustment
  const absAdjustments = [
    { channel: 'red', value: Math.abs(adjustments.red) },
    { channel: 'green', value: Math.abs(adjustments.green) },
    { channel: 'blue', value: Math.abs(adjustments.blue) },
  ].sort((a, b) => b.value - a.value);
  
  const primary = absAdjustments[0];
  
  if (primary.value < 10) {
    return { hint: "You're very close! Fine-tune your mix.", adjustments };
  }
  
  const direction = adjustments[primary.channel as keyof typeof adjustments] > 0 ? 'more' : 'less';
  const hint = `Try ${direction} ${primary.channel}`;
  
  return { hint, adjustments };
}

/**
 * Get RGB values from a hex color (for display)
 */
export function hexToRgbValues(hex: string): { r: number; g: number; b: number } {
  const rgb = chroma(hex).rgb();
  return { r: rgb[0], g: rgb[1], b: rgb[2] };
}

/**
 * Calculate what slider values would produce a given color
 * (inverse of mixColorsRGB)
 */
export function colorToSliderValues(hex: string): { r: number; g: number; b: number } {
  const rgb = chroma(hex).rgb();
  return {
    r: Math.round((rgb[0] / 255) * 100),
    g: Math.round((rgb[1] / 255) * 100),
    b: Math.round((rgb[2] / 255) * 100),
  };
}
