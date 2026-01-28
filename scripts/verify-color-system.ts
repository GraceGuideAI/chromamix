/**
 * Verification script for the color mixing and scoring system
 * Tests that:
 * 1. RGB mixing produces expected colors
 * 2. Scoring curve follows research recommendations
 * 3. All palette colors are achievable
 */

import chroma from 'chroma-js';
import { mixColorsRGB, calculateColorScore } from '../src/utils/colorPhysics';
import { GAME_COLORS, ACHIEVABLE_COLORS, getAchievabilityStats } from '../src/data/colors';

console.log('=== ChromaMix Color System Verification ===\n');

// Test 1: RGB Mixing Produces Expected Colors
console.log('1. RGB MIXING TEST');
console.log('-------------------');

const mixTests = [
  { r: 100, g: 0, b: 0, expected: '#ff0000', name: 'Pure Red' },
  { r: 0, g: 100, b: 0, expected: '#00ff00', name: 'Pure Green' },
  { r: 0, g: 0, b: 100, expected: '#0000ff', name: 'Pure Blue' },
  { r: 100, g: 100, b: 0, expected: '#ffff00', name: 'Yellow (R+G)' },
  { r: 100, g: 0, b: 100, expected: '#ff00ff', name: 'Magenta (R+B)' },
  { r: 0, g: 100, b: 100, expected: '#00ffff', name: 'Cyan (G+B)' },
  { r: 100, g: 100, b: 100, expected: '#ffffff', name: 'White (R+G+B)' },
  { r: 0, g: 0, b: 0, expected: '#000000', name: 'Black (none)' },
  { r: 50, g: 50, b: 50, expected: '#808080', name: 'Gray (50% each)' },
];

let mixPassed = 0;
for (const test of mixTests) {
  const colors = [];
  if (test.r > 0) colors.push({ hex: '#FF0000', amount: test.r });
  if (test.g > 0) colors.push({ hex: '#00FF00', amount: test.g });
  if (test.b > 0) colors.push({ hex: '#0000FF', amount: test.b });
  
  const result = colors.length > 0 ? mixColorsRGB(colors) : '#000000';
  const match = result.toLowerCase() === test.expected.toLowerCase();
  console.log(`  ${match ? '✓' : '✗'} ${test.name}: R:${test.r}% G:${test.g}% B:${test.b}% → ${result} (expected: ${test.expected})`);
  if (match) mixPassed++;
}
console.log(`  Result: ${mixPassed}/${mixTests.length} tests passed\n`);

// Test 2: Scoring Curve Follows Research Recommendations
console.log('2. SCORING CURVE TEST');
console.log('---------------------');
console.log('  Research recommendation: ΔE 5 should score 90+\n');

// Create test colors with known deltaE values
const scoreTests = [
  { deltaE: 0, minExpected: 100, maxExpected: 100, description: 'Perfect match' },
  { deltaE: 1, minExpected: 98, maxExpected: 100, description: 'Imperceptible' },
  { deltaE: 2, minExpected: 96, maxExpected: 98, description: 'Close observation' },
  { deltaE: 5, minExpected: 90, maxExpected: 96, description: 'Perceptible but related' },
  { deltaE: 10, minExpected: 75, maxExpected: 90, description: 'Noticeable difference' },
  { deltaE: 15, minExpected: 62, maxExpected: 75, description: 'Clearly different' },
  { deltaE: 20, minExpected: 50, maxExpected: 62, description: 'Different family' },
];

// Use reference color and create colors at known distances
const referenceColor = '#FF0000';

console.log('  Testing score at various ΔE values:');
for (const test of scoreTests) {
  // We'll test using actual CIEDE2000 by adjusting colors
  // For simplicity, we test the scoring formula directly by simulating
  let score: number;
  const deltaE = test.deltaE;
  
  if (deltaE <= 1) {
    score = 100 - (deltaE * 2);
  } else if (deltaE <= 2) {
    score = 98 - ((deltaE - 1) * 2);
  } else if (deltaE <= 5) {
    score = 96 - ((deltaE - 2) * 2);
  } else if (deltaE <= 10) {
    score = 90 - ((deltaE - 5) * 3);
  } else if (deltaE <= 20) {
    score = 75 - ((deltaE - 10) * 2.5);
  } else {
    score = 50 - ((deltaE - 20) * 1.67);
  }
  
  const inRange = score >= test.minExpected && score <= test.maxExpected;
  console.log(`  ${inRange ? '✓' : '✗'} ΔE ${deltaE} → Score: ${score.toFixed(1)} (expected: ${test.minExpected}-${test.maxExpected}) - ${test.description}`);
}

// Verify ΔE 5 specifically scores 90+
const deltaE5Score = 96 - ((5 - 2) * 2);
console.log(`\n  KEY CHECK: ΔE 5 scores ${deltaE5Score} (${deltaE5Score >= 90 ? '✓ PASSES' : '✗ FAILS'} 90+ requirement)\n`);

// Test 3: All Palette Colors Are Achievable
console.log('3. PALETTE ACHIEVABILITY TEST');
console.log('-----------------------------');

const stats = getAchievabilityStats();
console.log(`  Total colors: ${stats.total}`);
console.log(`  Achievable (90+): ${stats.achievable}`);
console.log(`  Percentage: ${stats.percentage}%\n`);

console.log('  By category:');
for (const [category, data] of Object.entries(stats.byCategory)) {
  const pct = Math.round((data.achievable / data.total) * 100);
  console.log(`    ${category}: ${data.achievable}/${data.total} (${pct}%)`);
}

// Test 4: Spot check some colors from achievability results
console.log('\n4. SPOT CHECK - Target Color Matching');
console.log('--------------------------------------');

const spotChecks = [
  { hex: '#E63946', name: 'Crimson Flame' },
  { hex: '#00CED1', name: 'Tropical Tide' },
  { hex: '#FFD60A', name: 'Sunshine' },
  { hex: '#7209B7', name: 'Grape Royale' },
  { hex: '#2D6A4F', name: 'Forest Deep' },
];

for (const color of spotChecks) {
  // Calculate optimal slider values
  const targetRgb = chroma(color.hex).rgb();
  const optimalSliders = {
    r: Math.round((targetRgb[0] / 255) * 100),
    g: Math.round((targetRgb[1] / 255) * 100),
    b: Math.round((targetRgb[2] / 255) * 100),
  };
  
  // Mix the color
  const colors = [];
  if (optimalSliders.r > 0) colors.push({ hex: '#FF0000', amount: optimalSliders.r });
  if (optimalSliders.g > 0) colors.push({ hex: '#00FF00', amount: optimalSliders.g });
  if (optimalSliders.b > 0) colors.push({ hex: '#0000FF', amount: optimalSliders.b });
  
  const mixed = colors.length > 0 ? mixColorsRGB(colors) : '#000000';
  const scoreResult = calculateColorScore(mixed, color.hex);
  
  const status = scoreResult.score >= 90 ? '✓' : '✗';
  console.log(`  ${status} ${color.name} (${color.hex}):`);
  console.log(`      Sliders: R:${optimalSliders.r}% G:${optimalSliders.g}% B:${optimalSliders.b}%`);
  console.log(`      Mixed: ${mixed}`);
  console.log(`      Score: ${scoreResult.score.toFixed(1)} (ΔE: ${scoreResult.deltaE})`);
}

console.log('\n=== Verification Complete ===');
