#!/usr/bin/env npx tsx
/**
 * ChromaMix Color Matching Validation Script
 * 
 * Comprehensive test suite to validate:
 * 1. All 100 palette colors are achievable with 98%+ score
 * 2. Perfect match tests (100/100 possible)
 * 3. Edge cases (pure primary, secondary, tertiary colors)
 * 4. Specific palette colors like "Mint Fresh", "Phlox"
 * 5. Scoring algorithm correctness
 * 
 * Run with: npx tsx scripts/validate-color-matching.ts
 */

import chroma from 'chroma-js';
import { GAME_COLORS, GAMEPLAY_COLORS, ACHIEVABLE_COLORS, getAchievabilityStats } from '../src/data/colors';
import { 
  mixColorsRGB, 
  calculateColorScore, 
  calculateBestAchievableScore,
  isColorAchievable,
  colorToSliderValues 
} from '../src/utils/colorPhysics';

// ============================================================================
// Test Configuration
// ============================================================================

const PASS_THRESHOLD = 98; // Minimum score to pass
const PERFECT_THRESHOLD = 99.5; // Score for "perfect" match
const PRIMARY_COLORS = ['#FF0000', '#00FF00', '#0000FF'];
const SECONDARY_COLORS = ['#FFFF00', '#FF00FF', '#00FFFF'];
const TERTIARY_COLORS = ['#FF8000', '#80FF00', '#00FF80', '#0080FF', '#8000FF', '#FF0080'];

interface TestResult {
  name: string;
  targetHex: string;
  bestScore: number;
  optimalSliders: { r: number; g: number; b: number };
  resultHex: string;
  deltaE: number;
  passed: boolean;
  perfectMatch: boolean;
  notes?: string[];
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  perfectMatches: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  failedTests: TestResult[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function mixFromSliders(r: number, g: number, b: number): string {
  return mixColorsRGB([
    { hex: '#FF0000', amount: r },
    { hex: '#00FF00', amount: g },
    { hex: '#0000FF', amount: b },
  ]);
}

function testColor(name: string, targetHex: string): TestResult {
  // Use enhanced search with ±2 tolerance for better optimization
  const targetRgb = chroma(targetHex).rgb();
  const baseR = Math.round((targetRgb[0] / 255) * 100);
  const baseG = Math.round((targetRgb[1] / 255) * 100);
  const baseB = Math.round((targetRgb[2] / 255) * 100);
  
  let bestScore = 0;
  let bestSliders = { r: baseR, g: baseG, b: baseB };
  let bestMix = '';
  
  // Search ±2 around the rounded values for optimal match
  for (let dr = -2; dr <= 2; dr++) {
    for (let dg = -2; dg <= 2; dg++) {
      for (let db = -2; db <= 2; db++) {
        const r = Math.max(0, Math.min(100, baseR + dr));
        const g = Math.max(0, Math.min(100, baseG + dg));
        const b = Math.max(0, Math.min(100, baseB + db));
        const mix = mixFromSliders(r, g, b);
        const score = calculateColorScore(mix, targetHex).score;
        
        if (score > bestScore) {
          bestScore = score;
          bestSliders = { r, g, b };
          bestMix = mix;
        }
      }
    }
  }
  
  const scoreResult = calculateColorScore(bestMix, targetHex);
  
  const notes: string[] = [];
  
  // Check if it's a pure/simple color
  const rgb = chroma(targetHex).rgb();
  const zeroChannels = [rgb[0], rgb[1], rgb[2]].filter(v => v < 10).length;
  const maxChannels = [rgb[0], rgb[1], rgb[2]].filter(v => v > 245).length;
  
  if (zeroChannels >= 2 && maxChannels >= 1) {
    notes.push('Pure primary color');
  } else if (zeroChannels >= 1 && maxChannels >= 2) {
    notes.push('Secondary color');
  }
  
  // Check for problematic colors
  const hsl = chroma(targetHex).hsl();
  if (hsl[2] < 0.15) notes.push('Very dark color');
  if (hsl[2] > 0.85) notes.push('Very light color');
  if (hsl[1] > 0.9 && hsl[2] < 0.4) notes.push('Highly saturated dark');
  
  return {
    name,
    targetHex,
    bestScore,
    optimalSliders: bestSliders,
    resultHex: bestMix,
    deltaE: scoreResult.deltaE,
    passed: bestScore >= PASS_THRESHOLD,
    perfectMatch: bestScore >= PERFECT_THRESHOLD,
    notes: notes.length > 0 ? notes : undefined,
  };
}

function runTestSuite(tests: TestResult[]): TestSummary {
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;
  const perfectMatches = tests.filter(t => t.perfectMatch).length;
  const scores = tests.map(t => t.bestScore);
  
  return {
    totalTests: tests.length,
    passed,
    failed,
    perfectMatches,
    avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    minScore: Math.min(...scores),
    maxScore: Math.max(...scores),
    failedTests: tests.filter(t => !t.passed),
  };
}

// ============================================================================
// Test Suites
// ============================================================================

console.log('═'.repeat(70));
console.log('ChromaMix Color Matching Validation');
console.log('═'.repeat(70));
console.log(`Pass threshold: ${PASS_THRESHOLD}%`);
console.log(`Perfect match threshold: ${PERFECT_THRESHOLD}%`);
console.log();

// ----------------------------------------------------------------------------
// TEST 1: All 100 Palette Colors
// ----------------------------------------------------------------------------
console.log('\n📋 TEST 1: All Palette Colors (100 colors)');
console.log('─'.repeat(70));

const paletteTests: TestResult[] = GAME_COLORS.map(color => 
  testColor(color.name, color.hex)
);

const paletteSummary = runTestSuite(paletteTests);

console.log(`\n✅ Passed: ${paletteSummary.passed}/${paletteSummary.totalTests}`);
console.log(`❌ Failed: ${paletteSummary.failed}/${paletteSummary.totalTests}`);
console.log(`⭐ Perfect matches: ${paletteSummary.perfectMatches}/${paletteSummary.totalTests}`);
console.log(`📊 Score range: ${paletteSummary.minScore.toFixed(1)} - ${paletteSummary.maxScore.toFixed(1)}`);
console.log(`📈 Average score: ${paletteSummary.avgScore.toFixed(2)}`);

if (paletteSummary.failed > 0) {
  console.log('\n❌ FAILING COLORS:');
  for (const test of paletteSummary.failedTests) {
    console.log(`  • ${test.name} (${test.targetHex}): ${test.bestScore.toFixed(1)}%`);
    console.log(`    Optimal sliders: R:${test.optimalSliders.r} G:${test.optimalSliders.g} B:${test.optimalSliders.b}`);
    console.log(`    Result: ${test.resultHex} | ΔE: ${test.deltaE.toFixed(2)}`);
  }
}

// Show lowest scoring colors (even if passing)
console.log('\n📉 Lowest scoring colors (bottom 10):');
const sortedByScore = [...paletteTests].sort((a, b) => a.bestScore - b.bestScore);
for (let i = 0; i < 10; i++) {
  const t = sortedByScore[i];
  console.log(`  ${i + 1}. ${t.name}: ${t.bestScore.toFixed(1)}% | R:${t.optimalSliders.r} G:${t.optimalSliders.g} B:${t.optimalSliders.b}`);
}

// ----------------------------------------------------------------------------
// TEST 2: Primary Colors (should be achievable with single slider)
// ----------------------------------------------------------------------------
console.log('\n\n🔴🟢🔵 TEST 2: Pure Primary Colors');
console.log('─'.repeat(70));
console.log('Primary colors should be achievable with single slider at 100%\n');

const primaryTests: TestResult[] = [
  { name: 'Pure Red', hex: '#FF0000', expectedSliders: { r: 100, g: 0, b: 0 } },
  { name: 'Pure Green', hex: '#00FF00', expectedSliders: { r: 0, g: 100, b: 0 } },
  { name: 'Pure Blue', hex: '#0000FF', expectedSliders: { r: 0, g: 0, b: 100 } },
].map(({ name, hex, expectedSliders }) => {
  const result = testColor(name, hex);
  
  // Verify sliders match expected
  const slidersMatch = 
    result.optimalSliders.r === expectedSliders.r &&
    result.optimalSliders.g === expectedSliders.g &&
    result.optimalSliders.b === expectedSliders.b;
  
  console.log(`${result.passed ? '✅' : '❌'} ${name}: ${result.bestScore.toFixed(1)}%`);
  console.log(`   Optimal: R:${result.optimalSliders.r} G:${result.optimalSliders.g} B:${result.optimalSliders.b}`);
  console.log(`   Expected: R:${expectedSliders.r} G:${expectedSliders.g} B:${expectedSliders.b}`);
  console.log(`   Sliders match expected: ${slidersMatch ? '✓' : '✗'}`);
  console.log();
  
  return result;
});

// ----------------------------------------------------------------------------
// TEST 3: Secondary Colors (should be achievable with two sliders)
// ----------------------------------------------------------------------------
console.log('\n🟡🟣🔲 TEST 3: Secondary Colors');
console.log('─'.repeat(70));
console.log('Secondary colors should be achievable with two sliders at 100%\n');

const secondaryTests: TestResult[] = [
  { name: 'Yellow (R+G)', hex: '#FFFF00', expectedSliders: { r: 100, g: 100, b: 0 } },
  { name: 'Cyan (G+B)', hex: '#00FFFF', expectedSliders: { r: 0, g: 100, b: 100 } },
  { name: 'Magenta (R+B)', hex: '#FF00FF', expectedSliders: { r: 100, g: 0, b: 100 } },
].map(({ name, hex, expectedSliders }) => {
  const result = testColor(name, hex);
  
  const slidersMatch = 
    result.optimalSliders.r === expectedSliders.r &&
    result.optimalSliders.g === expectedSliders.g &&
    result.optimalSliders.b === expectedSliders.b;
  
  console.log(`${result.passed ? '✅' : '❌'} ${name}: ${result.bestScore.toFixed(1)}%`);
  console.log(`   Optimal: R:${result.optimalSliders.r} G:${result.optimalSliders.g} B:${result.optimalSliders.b}`);
  console.log(`   Expected: R:${expectedSliders.r} G:${expectedSliders.g} B:${expectedSliders.b}`);
  console.log(`   Sliders match expected: ${slidersMatch ? '✓' : '✗'}`);
  console.log();
  
  return result;
});

// ----------------------------------------------------------------------------
// TEST 4: Tertiary/Complex Colors
// ----------------------------------------------------------------------------
console.log('\n🌈 TEST 4: Tertiary & Complex Colors');
console.log('─'.repeat(70));

const tertiaryTests: TestResult[] = [
  { name: 'Orange', hex: '#FF8000' },
  { name: 'Chartreuse', hex: '#80FF00' },
  { name: 'Spring Green', hex: '#00FF80' },
  { name: 'Azure', hex: '#0080FF' },
  { name: 'Violet', hex: '#8000FF' },
  { name: 'Rose', hex: '#FF0080' },
].map(({ name, hex }) => {
  const result = testColor(name, hex);
  console.log(`${result.passed ? '✅' : '❌'} ${name}: ${result.bestScore.toFixed(1)}% | R:${result.optimalSliders.r} G:${result.optimalSliders.g} B:${result.optimalSliders.b}`);
  return result;
});

// ----------------------------------------------------------------------------
// TEST 5: Edge Cases (very dark, very light, very saturated)
// ----------------------------------------------------------------------------
console.log('\n\n⚡ TEST 5: Edge Cases');
console.log('─'.repeat(70));

const edgeCaseTests: TestResult[] = [
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Very Dark Gray', hex: '#101010' },
  { name: 'Very Light Gray', hex: '#F0F0F0' },
  { name: 'Mid Gray', hex: '#808080' },
  { name: 'Deep Saturated Red', hex: '#800000' },
  { name: 'Bright Pink', hex: '#FF69B4' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Teal', hex: '#008080' },
].map(({ name, hex }) => {
  const result = testColor(name, hex);
  const status = result.passed ? '✅' : '❌';
  console.log(`${status} ${name.padEnd(20)}: ${result.bestScore.toFixed(1).padStart(5)}% | ${result.targetHex} → ${result.resultHex}`);
  if (result.notes?.length) {
    console.log(`   Notes: ${result.notes.join(', ')}`);
  }
  return result;
});

// ----------------------------------------------------------------------------
// TEST 6: Specific Palette Colors (Mint Fresh, Phlox, etc.)
// ----------------------------------------------------------------------------
console.log('\n\n🎨 TEST 6: Specific Named Colors from Palette');
console.log('─'.repeat(70));

const specificColorNames = [
  'Mint Fresh',
  'Phlox',
  'Crimson Flame',
  'Ocean Depths',
  'Golden Hour',
  'Electric Cyan',
  'Deep Violet',
  'Coral Blush',
  'Forest Deep',
  'Obsidian',
];

const specificTests: TestResult[] = specificColorNames.map(name => {
  const color = GAME_COLORS.find(c => c.name === name);
  if (!color) {
    console.log(`❓ ${name}: NOT FOUND IN PALETTE`);
    return null;
  }
  const result = testColor(color.name, color.hex);
  console.log(`${result.passed ? '✅' : '❌'} ${color.name.padEnd(20)}: ${result.bestScore.toFixed(1)}% | ${color.hex}`);
  console.log(`   Sliders: R:${result.optimalSliders.r} G:${result.optimalSliders.g} B:${result.optimalSliders.b} → ${result.resultHex}`);
  return result;
}).filter(Boolean) as TestResult[];

// ----------------------------------------------------------------------------
// TEST 7: Scoring Algorithm Validation
// ----------------------------------------------------------------------------
console.log('\n\n📐 TEST 7: Scoring Algorithm Validation');
console.log('─'.repeat(70));

// Test that identical colors score 100
const identicalTest = calculateColorScore('#FF5500', '#FF5500');
console.log(`Identical colors: ${identicalTest.score === 100 ? '✅' : '❌'} (Score: ${identicalTest.score})`);

// Test that similar colors score high
const similarTest = calculateColorScore('#FF5500', '#FF5502');
console.log(`Nearly identical colors: ${similarTest.score >= 99 ? '✅' : '❌'} (Score: ${similarTest.score.toFixed(1)})`);

// Test that different colors score lower
const differentTest = calculateColorScore('#FF0000', '#00FF00');
console.log(`Opposite colors (red/green): ${differentTest.score < 50 ? '✅' : '❌'} (Score: ${differentTest.score.toFixed(1)})`);

// Test score tiers
console.log('\nScore tier verification:');
const tierTests = [
  { mix: '#FF5500', target: '#FF5500', expectedTier: 'PERFECT', expectedMin: 95 },
  { mix: '#FF5510', target: '#FF5500', expectedTier: 'EXCELLENT', expectedMin: 85 },
  { mix: '#FF5530', target: '#FF5500', expectedTier: 'GREAT', expectedMin: 70 },
];

for (const { mix, target, expectedTier, expectedMin } of tierTests) {
  const result = calculateColorScore(mix, target);
  const passed = result.tier === expectedTier && result.score >= expectedMin;
  console.log(`  ${passed ? '✅' : '❌'} ${mix} vs ${target}: ${result.tier} (${result.score.toFixed(1)}) - Expected: ${expectedTier}`);
}

// ----------------------------------------------------------------------------
// TEST 8: Round-Trip Verification
// ----------------------------------------------------------------------------
console.log('\n\n🔄 TEST 8: Round-Trip Verification');
console.log('─'.repeat(70));
console.log('Testing that colorToSliderValues produces correct inverse mapping\n');

const roundTripTests = [
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#808080', '#FF8000', '#8B4513', '#FFB6C1',
];

let roundTripPassed = 0;
for (const hex of roundTripTests) {
  const sliders = colorToSliderValues(hex);
  const reconstructed = mixFromSliders(sliders.r, sliders.g, sliders.b);
  const score = calculateColorScore(reconstructed, hex).score;
  const passed = score >= 98;
  if (passed) roundTripPassed++;
  console.log(`${passed ? '✅' : '❌'} ${hex} → R:${sliders.r} G:${sliders.g} B:${sliders.b} → ${reconstructed} (${score.toFixed(1)}%)`);
}
console.log(`\nRound-trip success: ${roundTripPassed}/${roundTripTests.length}`);

// ----------------------------------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------------------------------
console.log('\n\n' + '═'.repeat(70));
console.log('FINAL VALIDATION SUMMARY');
console.log('═'.repeat(70));

const allTests = [
  ...paletteTests,
  ...primaryTests,
  ...secondaryTests,
  ...tertiaryTests,
  ...edgeCaseTests,
  ...specificTests,
];

const totalPassed = allTests.filter(t => t.passed).length;
const totalFailed = allTests.filter(t => !t.passed).length;
const totalPerfect = allTests.filter(t => t.perfectMatch).length;

console.log(`\nTotal tests run: ${allTests.length}`);
console.log(`✅ Passed (≥${PASS_THRESHOLD}%): ${totalPassed} (${(totalPassed/allTests.length*100).toFixed(1)}%)`);
console.log(`❌ Failed (<${PASS_THRESHOLD}%): ${totalFailed}`);
console.log(`⭐ Perfect (≥${PERFECT_THRESHOLD}%): ${totalPerfect} (${(totalPerfect/allTests.length*100).toFixed(1)}%)`);

// Achievability stats from the colors module
console.log('\n📊 Achievability Stats from colors.ts:');
const stats = getAchievabilityStats();
console.log(`  Total colors: ${stats.total}`);
console.log(`  Achievable (≥90%): ${stats.achievable} (${stats.percentage}%)`);

console.log('\n  By category:');
for (const [category, data] of Object.entries(stats.byCategory)) {
  console.log(`    ${category.padEnd(10)}: ${data.achievable}/${data.total} achievable`);
}

// Final verdict
console.log('\n' + '─'.repeat(70));
if (totalFailed === 0 && totalPassed === allTests.length) {
  console.log('🎉 ALL TESTS PASSED! Color matching is validated.');
  console.log('   All 100 palette colors can achieve 98%+ score.');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalFailed} TEST(S) FAILED!`);
  console.log('\nFailing colors:');
  for (const test of allTests.filter(t => !t.passed)) {
    console.log(`  • ${test.name}: ${test.bestScore.toFixed(1)}%`);
  }
  process.exit(1);
}
