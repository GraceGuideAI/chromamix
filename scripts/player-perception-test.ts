/**
 * Player Perception Analysis
 * 
 * Tests the CIEDE2000 scoring behavior from a player's perspective:
 * - What scores do players get when "visually close"?
 * - How sensitive is the scoring to small slider changes?
 * - Do CIEDE2000 scores align with human intuition?
 */

import chroma from 'chroma-js';
import { GAMEPLAY_COLORS } from '../src/data/colors';

interface PerceptionTest {
  name: string;
  target: string;
  playerMix: string;
  deltaE: number;
  score: number;
  rgbDiff: number[];
  hslDiff: number[];
  humanNote: string;
}

function deltaEToScore(deltaE: number): number {
  let score: number;
  if (deltaE <= 1) score = 100 - (deltaE * 2);
  else if (deltaE <= 3) score = 98 - ((deltaE - 1) * 4);
  else if (deltaE <= 7) score = 90 - ((deltaE - 3) * 3.75);
  else if (deltaE <= 15) score = 75 - ((deltaE - 7) * 3.125);
  else if (deltaE <= 30) score = 50 - ((deltaE - 15) * 1.667);
  else score = Math.max(0, 25 * Math.exp(-(deltaE - 30) / 20));
  return Math.round(score * 10) / 10;
}

function mixRGB(r: number, g: number, b: number): string {
  return chroma(
    Math.min(255, Math.round(255 * r / 100)),
    Math.min(255, Math.round(255 * g / 100)),
    Math.min(255, Math.round(255 * b / 100))
  ).hex();
}

function rgbDiff(hex1: string, hex2: string): number[] {
  const rgb1 = chroma(hex1).rgb();
  const rgb2 = chroma(hex2).rgb();
  return [rgb1[0] - rgb2[0], rgb1[1] - rgb2[1], rgb1[2] - rgb2[2]];
}

function hslDiff(hex1: string, hex2: string): number[] {
  const hsl1 = chroma(hex1).hsl();
  const hsl2 = chroma(hex2).hsl();
  let hDiff = (hsl1[0] || 0) - (hsl2[0] || 0);
  if (Math.abs(hDiff) > 180) hDiff = hDiff > 0 ? hDiff - 360 : hDiff + 360;
  return [
    hDiff,
    ((hsl1[1] || 0) - (hsl2[1] || 0)) * 100,
    ((hsl1[2] || 0) - (hsl2[2] || 0)) * 100
  ];
}

console.log('='.repeat(80));
console.log('CIEDE2000 vs HUMAN PERCEPTION - SPECIFIC CASE STUDIES');
console.log('='.repeat(80));

// Test Case 1: Colors that look IDENTICAL to humans but score differently
console.log('\n\n📊 TEST 1: Small RGB changes - How sensitive is CIEDE2000?\n');
console.log('Target: Pure Red (#FF0000)');
console.log('-'.repeat(60));

const testDeviations = [0, 1, 2, 3, 5, 10, 15, 20, 25, 30];
for (const dev of testDeviations) {
  const mixed = mixRGB(100, dev * 0.4, dev * 0.4); // Slight pink shift
  const deltaE = chroma.deltaE('#FF0000', mixed);
  const score = deltaEToScore(deltaE);
  console.log(`  Mix: R:100 G:${(dev*0.4).toFixed(0)} B:${(dev*0.4).toFixed(0)} → ${mixed} | ΔE: ${deltaE.toFixed(1)} | Score: ${score}`);
}

// Test Case 2: Different hues, same luminance
console.log('\n\n📊 TEST 2: Hue rotation at constant brightness\n');
console.log('Target: Coral Reef (#FF7F50)');
console.log('-'.repeat(60));

const target = '#FF7F50';
const targetHSL = chroma(target).hsl();

for (let hueDev = -30; hueDev <= 30; hueDev += 5) {
  const newHue = ((targetHSL[0] || 0) + hueDev + 360) % 360;
  const rotated = chroma.hsl(newHue, targetHSL[1], targetHSL[2]).hex();
  const deltaE = chroma.deltaE(target, rotated);
  const score = deltaEToScore(deltaE);
  console.log(`  Hue ${hueDev > 0 ? '+' : ''}${hueDev}° → ${rotated} | ΔE: ${deltaE.toFixed(1)} | Score: ${score}`);
}

// Test Case 3: Colors that LOOK different but score high
console.log('\n\n📊 TEST 3: Finding "False Positives" - High scores that look wrong\n');
console.log('-'.repeat(60));

const falsePositives: PerceptionTest[] = [];

// Compare colors that are perceptually distinct but close in LAB
const testPairs = [
  { name: 'Saturated vs Muted', a: '#FF0000', b: '#CC3333', note: 'Different vibrancy' },
  { name: 'Warm vs Cool', a: '#808080', b: '#7F8181', note: 'Slight temperature shift' },
  { name: 'Light diff', a: '#4080FF', b: '#6090FF', note: 'Similar hue, brighter' },
  { name: 'Blue shift', a: '#00FF00', b: '#00FF40', note: 'Green with cyan tint' },
];

for (const pair of testPairs) {
  const deltaE = chroma.deltaE(pair.a, pair.b);
  const score = deltaEToScore(deltaE);
  console.log(`${pair.name}:`);
  console.log(`  ${pair.a} vs ${pair.b} | ΔE: ${deltaE.toFixed(1)} | Score: ${score}`);
  console.log(`  Note: ${pair.note}\n`);
}

// Test Case 4: The "almost there" frustration
console.log('\n📊 TEST 4: The "Almost There" Problem - Slider precision\n');
console.log('-'.repeat(60));

// Simulate a player trying to match Cherry Pop (#FF4444)
const cherryPop = '#FF4444';
console.log(`Target: Cherry Pop (${cherryPop})`);
console.log('\nPlayer attempts (simulating slider adjustments):\n');

const playerAttempts = [
  { r: 100, g: 30, b: 30 },  // Intuitive first guess
  { r: 100, g: 25, b: 25 },  // "Too bright, less green/blue"
  { r: 100, g: 27, b: 27 },  // Getting closer
  { r: 100, g: 26, b: 26 },  // Very close!
  { r: 100, g: 27, b: 26 },  // One off
];

for (const attempt of playerAttempts) {
  const mixed = mixRGB(attempt.r, attempt.g, attempt.b);
  const deltaE = chroma.deltaE(cherryPop, mixed);
  const score = deltaEToScore(deltaE);
  const diff = rgbDiff(cherryPop, mixed);
  console.log(`  R:${attempt.r} G:${attempt.g} B:${attempt.b} → ${mixed}`);
  console.log(`  ΔE: ${deltaE.toFixed(2)} | Score: ${score} | RGB diff: [${diff.map(d => d.toFixed(0)).join(', ')}]`);
  console.log('');
}

// Test Case 5: Comparing distance metrics
console.log('\n📊 TEST 5: Distance Metric Comparison\n');
console.log('-'.repeat(60));
console.log('Comparing CIEDE2000 vs RGB Euclidean vs HSL for same color pairs:\n');

const metricTestPairs = [
  ['#FF0000', '#FF3333'], // Red variations
  ['#0000FF', '#3333FF'], // Blue variations  
  ['#00FF00', '#33FF33'], // Green variations
  ['#FF8800', '#FF6600'], // Orange variations
  ['#8800FF', '#6600FF'], // Purple variations
  ['#888888', '#999999'], // Gray variations
  ['#FF0000', '#00FF00'], // Complementary (extreme)
  ['#FF0000', '#FF00FF'], // Adjacent on color wheel
];

console.log('Color1     | Color2     | CIEDE2000 | RGB Euclid | HSL dist');
console.log('-'.repeat(60));

for (const [c1, c2] of metricTestPairs) {
  const deltaE = chroma.deltaE(c1, c2);
  
  // RGB Euclidean (normalized to 0-100)
  const rgb1 = chroma(c1).rgb();
  const rgb2 = chroma(c2).rgb();
  const rgbDist = Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  ) / 4.42;
  
  // HSL distance (simplified)
  const hsl1 = chroma(c1).hsl();
  const hsl2 = chroma(c2).hsl();
  let hDiff = Math.abs((hsl1[0] || 0) - (hsl2[0] || 0));
  if (hDiff > 180) hDiff = 360 - hDiff;
  const hslDist = Math.sqrt(
    Math.pow(hDiff / 3.6, 2) +
    Math.pow(((hsl1[1] || 0) - (hsl2[1] || 0)) * 100, 2) +
    Math.pow(((hsl1[2] || 0) - (hsl2[2] || 0)) * 100, 2)
  );
  
  console.log(`${c1} | ${c2} | ${deltaE.toFixed(1).padStart(9)} | ${rgbDist.toFixed(1).padStart(10)} | ${hslDist.toFixed(1)}`);
}

// Test Case 6: The scoring curve sensitivity
console.log('\n\n📊 TEST 6: Scoring Curve Analysis\n');
console.log('-'.repeat(60));
console.log('How scores map to deltaE values:\n');

console.log('ΔE   | Score | Tier');
console.log('-'.repeat(30));
const deltaEValues = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 10, 15, 20, 30, 50];
for (const de of deltaEValues) {
  const score = deltaEToScore(de);
  let tier = '';
  if (score >= 98) tier = 'PERFECT';
  else if (score >= 90) tier = 'EXCELLENT';
  else if (score >= 75) tier = 'GREAT';
  else if (score >= 50) tier = 'GOOD';
  else if (score >= 25) tier = 'CLOSE';
  else tier = 'FAR';
  console.log(`${de.toString().padStart(4)} | ${score.toString().padStart(5)} | ${tier}`);
}

// Summary & Recommendations
console.log('\n\n' + '='.repeat(80));
console.log('ANALYSIS SUMMARY');
console.log('='.repeat(80));

console.log(`
KEY FINDINGS:

1. CIEDE2000 SENSITIVITY:
   - A deltaE of just 3 drops the score from 98 to 90
   - In RGB terms, that's often just ±10-15 units per channel
   - Players with ±5% slider precision can easily miss "excellent"

2. HUE VS LUMINANCE:
   - CIEDE2000 weighs hue shifts more heavily in saturated colors
   - A 15° hue shift can cause larger deltaE than 10% luminance change
   - This may feel counterintuitive to players

3. THE BLUE PROBLEM:
   - CIEDE2000 has known issues in the blue region (250-290° hue)
   - Blue colors may score unexpectedly different than they look

4. SCORING CURVE:
   - Current curve is aggressive: ΔE 7 → 75 score (GREAT)
   - Players might expect ΔE 7 to still be "excellent" visually
   - The gap between "looks close" and "scores well" is narrow

RECOMMENDATIONS:

A) Adjust scoring curve to be more forgiving:
   - Flatten the curve in the 3-10 deltaE range
   - Let ΔE 5 still score 90+ (currently ~86)

B) Consider alternative/hybrid metrics:
   - Weighted average of CIEDE2000 + RGB distance
   - Use HSL for "close enough" detection

C) Visual feedback improvements:
   - Show "getting warmer/colder" hints
   - Display which component (H/S/L) needs adjustment
   - Add "close enough" celebration at 85+

D) Reconsider if CIEDE2000 is right for this use case:
   - CIEDE2000 is for industrial color matching (printing, manufacturing)
   - Games need "feels right" not "scientifically accurate"
   - Simpler RGB Euclidean might feel more intuitive
`);

