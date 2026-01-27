/**
 * Tests for colorPhysics improvements
 * Run with: npx tsx src/utils/colorPhysics.test.ts
 */

import {
  getDailyTargetColor,
  getDailyColorInfo,
  calculateColorScore,
  mixColorsSubtractive,
  mixColorsKubelkaMunk,
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
const dailyColors: { date: string; hex: string; h: number; s: number; l: number }[] = [];

for (let i = 0; i < 30; i++) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + i);
  const info = getDailyColorInfo(date);
  dailyColors.push({
    date: info.date,
    hex: info.hex,
    h: info.hsl.h,
    s: info.hsl.s,
    l: info.hsl.l
  });
}

console.log('\nFirst 10 days:');
dailyColors.slice(0, 10).forEach(c => {
  console.log(`  ${c.date}: ${c.hex} (H:${c.h.toString().padStart(3)}° S:${c.s}% L:${c.l}%)`);
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
console.log(`\nDeterminism test (same date): ${color1} === ${color2} → ${color1 === color2 ? '✅ PASS' : '❌ FAIL'}`);

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
// Test Mixing Modes
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST 3: Color Mixing Modes (CMYK vs Kubelka-Munk)');
console.log('='.repeat(60));

const mixTests = [
  { 
    name: 'Red + Yellow',
    colors: [{ hex: '#FF0000', amount: 1 }, { hex: '#FFFF00', amount: 1 }],
    expected: 'Orange-ish'
  },
  { 
    name: 'Blue + Yellow',
    colors: [{ hex: '#0000FF', amount: 1 }, { hex: '#FFFF00', amount: 1 }],
    expected: 'Green-ish (subtractive)'
  },
  { 
    name: 'Red + Blue',
    colors: [{ hex: '#FF0000', amount: 1 }, { hex: '#0000FF', amount: 1 }],
    expected: 'Purple-ish'
  },
  { 
    name: 'All primaries',
    colors: [
      { hex: '#FF0000', amount: 1 }, 
      { hex: '#00FF00', amount: 1 }, 
      { hex: '#0000FF', amount: 1 }
    ],
    expected: 'Dark/muddy'
  },
  {
    name: 'Cyan + Magenta',
    colors: [{ hex: '#00FFFF', amount: 1 }, { hex: '#FF00FF', amount: 1 }],
    expected: 'Blue-ish'
  }
];

console.log('\nMixing comparison:');
mixTests.forEach(test => {
  const cmykResult = mixColorsSubtractive(test.colors, 'cmyk');
  const kmResult = mixColorsSubtractive(test.colors, 'kubelka-munk');
  console.log(`  ${test.name.padEnd(16)} → CMYK: ${cmykResult}  K-M: ${kmResult}  (expect: ${test.expected})`);
});

// ============================================================================
// Test Edge Cases
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('TEST 4: Edge Cases');
console.log('='.repeat(60));

// Empty mix
const emptyMix = mixColorsSubtractive([]);
console.log(`Empty mix: ${emptyMix} → ${emptyMix === '#808080' ? '✅ PASS' : '❌ FAIL'}`);

// Zero amounts
const zeroMix = mixColorsSubtractive([{ hex: '#FF0000', amount: 0 }]);
console.log(`Zero amounts: ${zeroMix} → ${zeroMix === '#808080' ? '✅ PASS' : '❌ FAIL'}`);

// Single color
const singleMix = mixColorsSubtractive([{ hex: '#FF5500', amount: 5 }]);
console.log(`Single color: ${singleMix} → ${singleMix.toUpperCase() === '#FF5500' ? '✅ PASS' : '⚠️ Got ' + singleMix}`);

// Unequal weights
const weightedMix = mixColorsSubtractive([
  { hex: '#FF0000', amount: 3 },
  { hex: '#0000FF', amount: 1 }
]);
console.log(`3:1 Red:Blue: ${weightedMix} (should be more red)`);

console.log('\n' + '='.repeat(60));
console.log('All tests completed!');
console.log('='.repeat(60));
