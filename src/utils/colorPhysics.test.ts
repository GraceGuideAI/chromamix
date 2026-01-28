/**
 * Tests for colorPhysics improvements
 * Run with: npx tsx src/utils/colorPhysics.test.ts
 */

import {
  getDailyTargetColor,
  getDailyColorInfo,
  calculateColorScore,
  mixColorsRGB,
  SCORE_TIERS,
} from './colorPhysics';

// ============================================================================
// Test Mulberry32 PRNG Distribution
// ============================================================================

console.log('='.repeat(60));
console.log('TEST 1: Daily Color Distribution (Mulberry32 PRNG)');
console.log('='.repeat(60));

// Generate colors for 30 days
const startDate = new Date('2025-01-01');
const dailyColors: { date: string; hex: string; name: string; h: number; s: number; l: number }[] = [];

for (let i = 0; i < 30; i++) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + i);
  const info = getDailyColorInfo(date);
  dailyColors.push({
    date: info.date,
    hex: info.hex,
    name: info.name,
    h: info.hsl.h,
    s: info.hsl.s,
    l: info.hsl.l
  });
}

console.log('\nFirst 10 days:');
dailyColors.slice(0, 10).forEach(c => {
  console.log(`  ${c.date}: ${c.hex} "${c.name}" (H:${c.h.toString().padStart(3)}° S:${c.s}% L:${c.l}%)`);
});

// Check hue distribution
const hueDistribution = { 
  red: 0, orange: 0, yellow: 0, green: 0, cyan: 0, blue: 0, purple: 0 
};

dailyColors.forEach(c => {
  if (c.h < 30 || c.h >= 330) hueDistribution.red++;
  else if (c.h < 60) hueDistribution.orange++;
  else if (c.h < 90) hueDistribution.yellow++;
  else if (c.h < 150) hueDistribution.green++;
  else if (c.h < 210) hueDistribution.cyan++;
  else if (c.h < 270) hueDistribution.blue++;
  else hueDistribution.purple++;
});

console.log('\nHue distribution (30 days):');
Object.entries(hueDistribution).forEach(([hue, count]) => {
  const bar = '█'.repeat(count);
  console.log(`  ${hue.padEnd(7)}: ${bar} (${count})`);
});

// Verify determinism
const testDate = new Date('2025-06-15');
const color1 = getDailyTargetColor(testDate);
const color2 = getDailyTargetColor(testDate);
console.log(`\nDeterminism test (same date): ${color1.hex} === ${color2.hex} → ${color1.hex === color2.hex ? '✅ PASS' : '❌ FAIL'}`);

// Check uniqueness
const uniqueColors = new Set(dailyColors.map(c => c.hex));
console.log(`Uniqueness: ${uniqueColors.size}/${dailyColors.length} unique colors → ${uniqueColors.size === dailyColors.length ? '✅ PASS' : '⚠️ Some duplicates'}`);

// ============================================================================
// Test Tiered Scoring
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST 2: Tiered CIEDE2000 Scoring');
console.log('='.repeat(60));

const testCases = [
  { c1: '#FF0000', c2: '#FF0000', desc: 'Identical' },
  { c1: '#FF0000', c2: '#FF0505', desc: 'Nearly identical' },
  { c1: '#FF0000', c2: '#FF1010', desc: 'Very close' },
  { c1: '#FF0000', c2: '#FF3030', desc: 'Close' },
  { c1: '#FF0000', c2: '#FF6060', desc: 'Somewhat close' },
  { c1: '#FF0000', c2: '#FF9090', desc: 'Getting far' },
  { c1: '#FF0000', c2: '#FFCCCC', desc: 'Far' },
  { c1: '#FF0000', c2: '#00FF00', desc: 'Very different' },
  { c1: '#FF0000', c2: '#0000FF', desc: 'Opposite' },
];

console.log('\nScoring curve:');
testCases.forEach(tc => {
  const result = calculateColorScore(tc.c1, tc.c2);
  console.log(`  ${tc.desc.padEnd(18)} ΔE=${result.deltaE.toString().padStart(5)} → Score: ${result.score.toString().padStart(5)} ${result.label} ${'⭐'.repeat(result.stars)}`);
});

// Test tier boundaries
console.log('\nTier boundaries:');
Object.entries(SCORE_TIERS).forEach(([tier, info]) => {
  console.log(`  ${tier.padEnd(10)}: ≥${info.minScore.toString().padStart(2)} score, ≤${info.maxDeltaE === Infinity ? '∞' : info.maxDeltaE.toString().padStart(2)} ΔE → ${info.label}`);
});

// ============================================================================
// Test RGB Additive Mixing
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST 3: RGB Additive Color Mixing');
console.log('='.repeat(60));

const mixTests = [
  { 
    name: 'Red + Green',
    colors: [{ hex: '#FF0000', amount: 100 }, { hex: '#00FF00', amount: 100 }],
    expected: 'Yellow (additive)'
  },
  { 
    name: 'Red + Blue',
    colors: [{ hex: '#FF0000', amount: 100 }, { hex: '#0000FF', amount: 100 }],
    expected: 'Magenta (additive)'
  },
  { 
    name: 'Green + Blue',
    colors: [{ hex: '#00FF00', amount: 100 }, { hex: '#0000FF', amount: 100 }],
    expected: 'Cyan (additive)'
  },
  { 
    name: 'All RGB primaries',
    colors: [
      { hex: '#FF0000', amount: 100 }, 
      { hex: '#00FF00', amount: 100 }, 
      { hex: '#0000FF', amount: 100 }
    ],
    expected: 'White (additive)'
  },
  {
    name: 'Red 100% only',
    colors: [{ hex: '#FF0000', amount: 100 }],
    expected: 'Pure Red'
  },
  {
    name: 'Half Red',
    colors: [{ hex: '#FF0000', amount: 50 }],
    expected: 'Half-brightness Red'
  }
];

console.log('\nRGB Additive mixing:');
mixTests.forEach(test => {
  const result = mixColorsRGB(test.colors);
  console.log(`  ${test.name.padEnd(20)} → ${result}  (expect: ${test.expected})`);
});

// ============================================================================
// Test Edge Cases
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST 4: Edge Cases');
console.log('='.repeat(60));

// Empty mix
const emptyMix = mixColorsRGB([]);
console.log(`Empty mix: ${emptyMix} → ${emptyMix === '#000000' ? '✅ PASS (black)' : '❌ FAIL'}`);

// Zero amounts
const zeroMix = mixColorsRGB([{ hex: '#FF0000', amount: 0 }]);
console.log(`Zero amounts: ${zeroMix} → ${zeroMix === '#000000' ? '✅ PASS (black)' : '❌ FAIL'}`);

// Single color at full
const singleMix = mixColorsRGB([{ hex: '#FF5500', amount: 100 }]);
console.log(`Single color 100%: ${singleMix} → ${singleMix.toUpperCase() === '#FF5500' ? '✅ PASS' : '⚠️ Got ' + singleMix}`);

// Unequal weights
const weightedMix = mixColorsRGB([
  { hex: '#FF0000', amount: 75 },
  { hex: '#0000FF', amount: 25 }
]);
console.log(`75% Red + 25% Blue: ${weightedMix} (should be magenta-ish, more red)`);

// Color names test
console.log('\n' + '='.repeat(60));
console.log('TEST 5: Color Names');
console.log('='.repeat(60));

const sampleColors = dailyColors.slice(0, 5);
console.log('\nSample color names:');
sampleColors.forEach(c => {
  console.log(`  ${c.hex} → "${c.name}"`);
});

console.log('\n' + '='.repeat(60));
console.log('All tests completed!');
console.log('='.repeat(60));
