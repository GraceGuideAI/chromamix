/**
 * Color Achievability Analysis Script
 * 
 * Tests which target colors in the ChromaMix palette can actually be achieved
 * through RGB additive mixing, and measures the "perception gap" between
 * CIEDE2000 scores and intuitive color similarity.
 */

import chroma from 'chroma-js';
import { GAME_COLORS, GAMEPLAY_COLORS } from '../src/data/colors';

// RGB primaries used in the game
const RGB_PRIMARIES = {
  red: '#FF0000',
  green: '#00FF00', 
  blue: '#0000FF'
};

interface MixResult {
  r: number;
  g: number;
  b: number;
  hex: string;
  deltaE: number;
  score: number;
}

interface ColorAnalysis {
  targetHex: string;
  targetName: string;
  bestMix: MixResult;
  achievable: boolean;  // Can score >= 90?
  maxPossibleScore: number;
  minDeltaE: number;
  rgbDistance: number;
  hslDistance: number;
  notes: string[];
}

/**
 * Convert CIEDE2000 deltaE to game score (matching colorPhysics.ts)
 */
function deltaEToScore(deltaE: number): number {
  let score: number;
  
  if (deltaE <= 1) {
    score = 100 - (deltaE * 2);
  } else if (deltaE <= 3) {
    score = 98 - ((deltaE - 1) * 4);
  } else if (deltaE <= 7) {
    score = 90 - ((deltaE - 3) * 3.75);
  } else if (deltaE <= 15) {
    score = 75 - ((deltaE - 7) * 3.125);
  } else if (deltaE <= 30) {
    score = 50 - ((deltaE - 15) * 1.667);
  } else {
    score = Math.max(0, 25 * Math.exp(-(deltaE - 30) / 20));
  }
  
  return Math.round(score * 10) / 10;
}

/**
 * Mix RGB colors additively with given intensities
 */
function mixRGB(r: number, g: number, b: number): string {
  const rVal = Math.min(255, Math.round(255 * (r / 100)));
  const gVal = Math.min(255, Math.round(255 * (g / 100)));
  const bVal = Math.min(255, Math.round(255 * (b / 100)));
  return chroma(rVal, gVal, bVal).hex();
}

/**
 * Calculate RGB Euclidean distance (0-442 range normalized to 0-100)
 */
function rgbDistance(hex1: string, hex2: string): number {
  const rgb1 = chroma(hex1).rgb();
  const rgb2 = chroma(hex2).rgb();
  const dist = Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
  // Max possible distance is sqrt(255^2 * 3) ≈ 441.67
  return (dist / 441.67) * 100;
}

/**
 * Calculate HSL distance with hue wraparound handling
 */
function hslDistance(hex1: string, hex2: string): number {
  const hsl1 = chroma(hex1).hsl();
  const hsl2 = chroma(hex2).hsl();
  
  // Handle undefined hue (grayscale)
  const h1 = hsl1[0] || 0;
  const h2 = hsl2[0] || 0;
  const s1 = hsl1[1] || 0;
  const s2 = hsl2[1] || 0;
  const l1 = hsl1[2] || 0;
  const l2 = hsl2[2] || 0;
  
  // Hue distance with wraparound (0-180 range)
  let hueDiff = Math.abs(h1 - h2);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;
  
  // Normalize: hue to 0-100, sat and lum already 0-1
  const hDist = (hueDiff / 180) * 100;
  const sDist = Math.abs(s1 - s2) * 100;
  const lDist = Math.abs(l1 - l2) * 100;
  
  // Weighted combination (hue matters less when saturation is low)
  const avgSat = (s1 + s2) / 2;
  return Math.sqrt(
    Math.pow(hDist * avgSat, 2) +
    Math.pow(sDist, 2) +
    Math.pow(lDist, 2)
  );
}

/**
 * Brute-force search for the best RGB mix to match a target color
 * Tests all combinations at 5% intervals (21^3 = 9261 combinations)
 */
function findBestMix(targetHex: string, step: number = 5): MixResult {
  let bestResult: MixResult = {
    r: 0, g: 0, b: 0,
    hex: '#000000',
    deltaE: 100,
    score: 0
  };
  
  for (let r = 0; r <= 100; r += step) {
    for (let g = 0; g <= 100; g += step) {
      for (let b = 0; b <= 100; b += step) {
        const mixed = mixRGB(r, g, b);
        const deltaE = chroma.deltaE(mixed, targetHex);
        const score = deltaEToScore(deltaE);
        
        if (deltaE < bestResult.deltaE) {
          bestResult = { r, g, b, hex: mixed, deltaE, score };
        }
      }
    }
  }
  
  // Fine-tune with smaller steps around the best result
  const fineStep = 1;
  for (let r = Math.max(0, bestResult.r - 5); r <= Math.min(100, bestResult.r + 5); r += fineStep) {
    for (let g = Math.max(0, bestResult.g - 5); g <= Math.min(100, bestResult.g + 5); g += fineStep) {
      for (let b = Math.max(0, bestResult.b - 5); b <= Math.min(100, bestResult.b + 5); b += fineStep) {
        const mixed = mixRGB(r, g, b);
        const deltaE = chroma.deltaE(mixed, targetHex);
        const score = deltaEToScore(deltaE);
        
        if (deltaE < bestResult.deltaE) {
          bestResult = { r, g, b, hex: mixed, deltaE, score };
        }
      }
    }
  }
  
  return bestResult;
}

/**
 * Analyze why a color might score counterintuitively
 */
function analyzePerceptionGap(targetHex: string, mixedHex: string, deltaE: number, score: number): string[] {
  const notes: string[] = [];
  const targetHSL = chroma(targetHex).hsl();
  const mixedHSL = chroma(mixedHex).hsl();
  const targetRGB = chroma(targetHex).rgb();
  const mixedRGB = chroma(mixedHex).rgb();
  
  // Check if target is outside RGB gamut-achievable colors
  const targetSat = targetHSL[1] || 0;
  const targetLum = targetHSL[2] || 0;
  
  // Highly saturated dark colors are hard to achieve with additive mixing
  if (targetSat > 0.7 && targetLum < 0.4) {
    notes.push('🔴 Deep saturated color - hard to achieve with light-based mixing');
  }
  
  // Browns, ochres, and earth tones
  if (targetLum < 0.5 && targetSat < 0.6) {
    notes.push('🟤 Earth tone/brown - requires subtractive mixing');
  }
  
  // Pastels require low intensity which means dark in additive
  if (targetSat < 0.5 && targetLum > 0.6) {
    notes.push('🌸 Pastel/muted color - appears washed out in additive');
  }
  
  // Check for hue shift issues (common with CIEDE2000)
  const targetHue = targetHSL[0] || 0;
  const mixedHue = mixedHSL[0] || 0;
  let hueDiff = Math.abs(targetHue - mixedHue);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;
  
  if (hueDiff > 15 && score > 70) {
    notes.push(`⚠️ Hue shift: ${Math.round(hueDiff)}° difference but high CIEDE2000 score`);
  }
  
  // Check for lightness dominance in CIEDE2000
  const mixedLum = mixedHSL[2] || 0;
  const lumDiff = Math.abs(targetLum - mixedLum);
  if (lumDiff < 0.1 && score < 50) {
    notes.push('💡 Similar lightness but low score - CIEDE2000 over-weighing chroma/hue');
  }
  
  // Problematic blue region (CIEDE2000 known issue around 275° hue)
  if (targetHue >= 250 && targetHue <= 290) {
    notes.push('🔵 Blue region - known CIEDE2000 problem area');
  }
  
  return notes;
}

/**
 * Main analysis function
 */
function analyzeAllColors(): ColorAnalysis[] {
  const results: ColorAnalysis[] = [];
  
  console.log('Analyzing color achievability...\n');
  
  for (const gameColor of GAMEPLAY_COLORS) {
    const bestMix = findBestMix(gameColor.hex);
    const rgbDist = rgbDistance(gameColor.hex, bestMix.hex);
    const hslDist = hslDistance(gameColor.hex, bestMix.hex);
    const notes = analyzePerceptionGap(gameColor.hex, bestMix.hex, bestMix.deltaE, bestMix.score);
    
    results.push({
      targetHex: gameColor.hex,
      targetName: gameColor.name,
      bestMix,
      achievable: bestMix.score >= 90,
      maxPossibleScore: bestMix.score,
      minDeltaE: bestMix.deltaE,
      rgbDistance: rgbDist,
      hslDistance: hslDist,
      notes
    });
  }
  
  return results;
}

/**
 * Generate summary statistics
 */
function generateSummary(results: ColorAnalysis[]): void {
  const achievable = results.filter(r => r.achievable);
  const notAchievable = results.filter(r => !r.achievable);
  
  console.log('='.repeat(70));
  console.log('COLOR ACHIEVABILITY SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`\nTotal colors analyzed: ${results.length}`);
  console.log(`Achievable (score >= 90): ${achievable.length} (${Math.round(achievable.length/results.length*100)}%)`);
  console.log(`Not achievable: ${notAchievable.length} (${Math.round(notAchievable.length/results.length*100)}%)`);
  
  // Score distribution
  const scoreRanges = [
    { min: 95, max: 100, count: 0 },
    { min: 90, max: 95, count: 0 },
    { min: 80, max: 90, count: 0 },
    { min: 70, max: 80, count: 0 },
    { min: 60, max: 70, count: 0 },
    { min: 50, max: 60, count: 0 },
    { min: 0, max: 50, count: 0 },
  ];
  
  for (const r of results) {
    for (const range of scoreRanges) {
      if (r.maxPossibleScore >= range.min && r.maxPossibleScore < range.max) {
        range.count++;
        break;
      }
    }
  }
  
  console.log('\nMax achievable score distribution:');
  for (const range of scoreRanges) {
    const bar = '█'.repeat(range.count);
    console.log(`  ${range.min.toString().padStart(3)}-${range.max.toString().padStart(3)}: ${bar} ${range.count}`);
  }
  
  // Worst achievable colors
  console.log('\n' + '='.repeat(70));
  console.log('HARDEST COLORS TO MATCH (lowest max scores)');
  console.log('='.repeat(70));
  
  const sorted = [...results].sort((a, b) => a.maxPossibleScore - b.maxPossibleScore);
  
  for (let i = 0; i < Math.min(20, sorted.length); i++) {
    const r = sorted[i];
    console.log(`\n${r.targetName} (${r.targetHex})`);
    console.log(`  Max score: ${r.maxPossibleScore.toFixed(1)} | ΔE: ${r.minDeltaE.toFixed(1)}`);
    console.log(`  Best mix: R:${r.bestMix.r}% G:${r.bestMix.g}% B:${r.bestMix.b}% → ${r.bestMix.hex}`);
    console.log(`  RGB dist: ${r.rgbDistance.toFixed(1)} | HSL dist: ${r.hslDistance.toFixed(1)}`);
    if (r.notes.length > 0) {
      console.log(`  Notes: ${r.notes.join(', ')}`);
    }
  }
  
  // Perception gap analysis
  console.log('\n' + '='.repeat(70));
  console.log('PERCEPTION GAP ANALYSIS');
  console.log('='.repeat(70));
  
  // Find cases where RGB distance is low but CIEDE2000 score is also low
  const perceptionGaps = results
    .map(r => ({
      ...r,
      gap: r.rgbDistance - (100 - r.maxPossibleScore) // Positive = looks closer than it scores
    }))
    .filter(r => Math.abs(r.gap) > 15)
    .sort((a, b) => b.gap - a.gap);
  
  console.log('\nColors that look CLOSER than they score (potential false negatives):');
  for (const r of perceptionGaps.filter(x => x.gap > 15).slice(0, 10)) {
    console.log(`  ${r.targetName}: RGB dist ${r.rgbDistance.toFixed(0)}% but score only ${r.maxPossibleScore.toFixed(0)}`);
  }
  
  console.log('\nColors that SCORE HIGHER than they look (potential false positives):');
  for (const r of perceptionGaps.filter(x => x.gap < -15).slice(0, 10)) {
    console.log(`  ${r.targetName}: RGB dist ${r.rgbDistance.toFixed(0)}% but score ${r.maxPossibleScore.toFixed(0)}`);
  }
  
  // Category breakdown
  console.log('\n' + '='.repeat(70));
  console.log('ACHIEVABILITY BY CATEGORY');
  console.log('='.repeat(70));
  
  const categoryMap = new Map<string, ColorAnalysis[]>();
  for (const r of results) {
    const gameColor = GAMEPLAY_COLORS.find(c => c.hex === r.targetHex);
    const category = gameColor?.category || 'unknown';
    if (!categoryMap.has(category)) categoryMap.set(category, []);
    categoryMap.get(category)!.push(r);
  }
  
  for (const [category, colors] of categoryMap) {
    const achievableCount = colors.filter(c => c.achievable).length;
    const avgScore = colors.reduce((sum, c) => sum + c.maxPossibleScore, 0) / colors.length;
    console.log(`  ${category.padEnd(10)}: ${achievableCount}/${colors.length} achievable, avg max score: ${avgScore.toFixed(1)}`);
  }
}

// Run the analysis
const results = analyzeAllColors();
generateSummary(results);

// Export for potential further analysis
console.log('\n\nExporting detailed results to JSON...');
const fs = require('fs');
fs.writeFileSync(
  './color-achievability-results.json',
  JSON.stringify(results, null, 2)
);
console.log('Done! Results saved to color-achievability-results.json');
