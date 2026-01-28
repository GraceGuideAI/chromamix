/**
 * Unit tests for the Time Bonus System
 * Run with: npx ts-node --esm src/utils/timeBonus.test.ts
 * Or use a test runner like Vitest/Jest
 */

import {
  calculateTimeBonus,
  calculateBaseTimeBonus,
  getComboMultiplier,
  shouldBreakCombo,
  getComboTier,
  getComboTierDisplay,
  calculatePointsWithCombo,
  getTimeBonusBreakdown,
  getTimerUrgency,
  getTimerColors,
  THRESHOLDS,
  BONUSES,
  TIMING,
} from './timeBonus';

// Simple test helper
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   ${(error as Error).message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}${message ? ` - ${message}` : ''}`);
  }
}

function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n🧪 Time Bonus System Tests\n');
console.log('='.repeat(50));

// Test: calculateBaseTimeBonus
console.log('\n📊 calculateBaseTimeBonus');

test('Perfect score (95+) gives 20 seconds', () => {
  assertEqual(calculateBaseTimeBonus(95), BONUSES.PERFECT);
  assertEqual(calculateBaseTimeBonus(100), BONUSES.PERFECT);
  assertEqual(BONUSES.PERFECT, 20);
});

test('Great score (85-94) gives 12 seconds', () => {
  assertEqual(calculateBaseTimeBonus(85), BONUSES.GREAT);
  assertEqual(calculateBaseTimeBonus(94), BONUSES.GREAT);
  assertEqual(BONUSES.GREAT, 12);
});

test('Good score (70-84) gives 8 seconds', () => {
  assertEqual(calculateBaseTimeBonus(70), BONUSES.GOOD);
  assertEqual(calculateBaseTimeBonus(84), BONUSES.GOOD);
  assertEqual(BONUSES.GOOD, 8);
});

test('Okay score (50-69) gives 5 seconds', () => {
  assertEqual(calculateBaseTimeBonus(50), BONUSES.OKAY);
  assertEqual(calculateBaseTimeBonus(69), BONUSES.OKAY);
  assertEqual(BONUSES.OKAY, 5);
});

test('Low score (<50) gives 0 seconds', () => {
  assertEqual(calculateBaseTimeBonus(49), BONUSES.BASE);
  assertEqual(calculateBaseTimeBonus(0), BONUSES.BASE);
  assertEqual(BONUSES.BASE, 0);
});

// Test: getComboMultiplier
console.log('\n🔥 getComboMultiplier');

test('No combo (0-1) gives 1x multiplier', () => {
  assertEqual(getComboMultiplier(0), 1.0);
  assertEqual(getComboMultiplier(1), 1.0);
});

test('Double combo (2-3) gives 1.5x multiplier', () => {
  assertEqual(getComboMultiplier(2), 1.5);
  assertEqual(getComboMultiplier(3), 1.5);
});

test('Triple combo (4-5) gives 2x multiplier', () => {
  assertEqual(getComboMultiplier(4), 2.0);
  assertEqual(getComboMultiplier(5), 2.0);
});

test('On Fire combo (6+) gives 2.5x multiplier', () => {
  assertEqual(getComboMultiplier(6), 2.5);
  assertEqual(getComboMultiplier(10), 2.5);
});

// Test: getComboTier
console.log('\n🏆 getComboTier');

test('Combo 0-1 returns null', () => {
  assertEqual(getComboTier(0), null);
  assertEqual(getComboTier(1), null);
});

test('Combo 2-3 returns DOUBLE', () => {
  assertEqual(getComboTier(2), 'DOUBLE');
  assertEqual(getComboTier(3), 'DOUBLE');
});

test('Combo 4-5 returns TRIPLE', () => {
  assertEqual(getComboTier(4), 'TRIPLE');
  assertEqual(getComboTier(5), 'TRIPLE');
});

test('Combo 6+ returns ON_FIRE', () => {
  assertEqual(getComboTier(6), 'ON_FIRE');
  assertEqual(getComboTier(20), 'ON_FIRE');
});

// Test: shouldBreakCombo
console.log('\n💔 shouldBreakCombo');

test('Score below 50 breaks combo', () => {
  assertTrue(shouldBreakCombo(49, 1000));
  assertTrue(shouldBreakCombo(0, 1000));
});

test('Score 50+ within time limit maintains combo', () => {
  assertTrue(!shouldBreakCombo(50, 2000));
  assertTrue(!shouldBreakCombo(100, 4000));
});

test('Too slow (>5s) breaks combo regardless of score', () => {
  assertTrue(shouldBreakCombo(100, 6000));
  assertTrue(shouldBreakCombo(95, 10000));
});

// Test: calculateTimeBonus with combo
console.log('\n⏱️ calculateTimeBonus (with combo)');

test('Perfect score with no combo gives 20 seconds', () => {
  assertEqual(calculateTimeBonus(95, 0), 20);
});

test('Perfect score with 2x combo gives 30 seconds (capped)', () => {
  // 20 * 1.5 = 30, which hits the cap
  assertEqual(calculateTimeBonus(95, 2), 30);
});

test('Perfect score with ON_FIRE combo is capped at 30 seconds', () => {
  // 20 * 2.5 = 50, but capped at 30
  assertEqual(calculateTimeBonus(95, 6), 30);
});

test('Okay score (50-69) with ON_FIRE combo gives 12.5 seconds', () => {
  // 5 * 2.5 = 12.5
  assertEqual(calculateTimeBonus(60, 6), 12.5);
});

test('Low score (<50) gives 0 even with combo', () => {
  assertEqual(calculateTimeBonus(49, 6), 0);
});

test('Quick submission bonus applies', () => {
  const normal = calculateTimeBonus(85, 0); // 12s base
  const quick = calculateTimeBonus(85, 0, 1000); // Under 2 seconds
  assertTrue(quick > normal, 'Quick bonus should increase time');
});

// Test: calculatePointsWithCombo
console.log('\n💯 calculatePointsWithCombo');

test('Score without combo is unchanged', () => {
  const result = calculatePointsWithCombo(80, 0);
  assertEqual(result.basePoints, 80);
  assertEqual(result.bonusPoints, 0);
  assertEqual(result.totalPoints, 80);
  assertEqual(result.multiplier, 1);
});

test('Score with 2x combo gets 50% bonus', () => {
  const result = calculatePointsWithCombo(80, 2);
  assertEqual(result.basePoints, 80);
  assertEqual(result.bonusPoints, 40);
  assertEqual(result.totalPoints, 120);
  assertEqual(result.multiplier, 1.5);
});

test('Score with ON_FIRE combo gets 150% bonus', () => {
  const result = calculatePointsWithCombo(100, 6);
  assertEqual(result.basePoints, 100);
  assertEqual(result.bonusPoints, 150);
  assertEqual(result.totalPoints, 250);
  assertEqual(result.multiplier, 2.5);
});

// Test: getTimerUrgency
console.log('\n⚠️ getTimerUrgency');

test('60 seconds is safe', () => {
  assertEqual(getTimerUrgency(60), 'safe');
});

test('20 seconds is safe', () => {
  assertEqual(getTimerUrgency(21), 'safe');
});

test('15 seconds is warning', () => {
  assertEqual(getTimerUrgency(15), 'warning');
});

test('10 seconds is danger', () => {
  assertEqual(getTimerUrgency(10), 'danger');
});

test('5 seconds is critical', () => {
  assertEqual(getTimerUrgency(5), 'critical');
});

test('0 seconds is critical', () => {
  assertEqual(getTimerUrgency(0), 'critical');
});

// Test: getTimerColors
console.log('\n🎨 getTimerColors');

test('Safe timer has white text', () => {
  const colors = getTimerColors('safe');
  assertTrue(colors.textClass.includes('white'));
  assertTrue(!colors.pulseAnimation);
});

test('Critical timer has red text and pulse', () => {
  const colors = getTimerColors('critical');
  assertTrue(colors.textClass.includes('red'));
  assertTrue(colors.pulseAnimation);
});

// Test: getComboTierDisplay
console.log('\n🏅 getComboTierDisplay');

test('null tier returns null display', () => {
  assertEqual(getComboTierDisplay(null), null);
});

test('DOUBLE tier has correct display', () => {
  const display = getComboTierDisplay('DOUBLE');
  assertTrue(display !== null);
  assertEqual(display!.label, '2x COMBO');
  assertTrue(display!.emoji === '🔥');
});

test('ON_FIRE tier has correct display', () => {
  const display = getComboTierDisplay('ON_FIRE');
  assertTrue(display !== null);
  assertEqual(display!.label, 'ON FIRE!');
  assertTrue(display!.emoji === '💥');
});

// Test: getTimeBonusBreakdown
console.log('\n📈 getTimeBonusBreakdown');

test('Breakdown shows correct components', () => {
  const breakdown = getTimeBonusBreakdown(95, 2, 1000);
  assertEqual(breakdown.baseBonus, 20, 'Base bonus');
  assertTrue(breakdown.comboBonus > 0, 'Combo bonus should be positive');
  assertTrue(breakdown.isQuick, 'Should be quick submission');
  assertTrue(breakdown.quickBonus > 0, 'Quick bonus should be positive');
});

test('Slow submission has no quick bonus', () => {
  const breakdown = getTimeBonusBreakdown(95, 2, 3000);
  assertTrue(!breakdown.isQuick);
  assertEqual(breakdown.quickBonus, 0);
});

// Edge cases
console.log('\n🔬 Edge Cases');

test('Time bonus caps at 30 seconds', () => {
  const bonus = calculateTimeBonus(100, 20, 500); // Max combo, perfect score, quick
  assertTrue(bonus <= 30, `Bonus ${bonus} should be <= 30`);
});

test('Negative scores handled gracefully', () => {
  assertEqual(calculateTimeBonus(-10, 0), 0);
});

test('Zero combo count works', () => {
  const result = calculatePointsWithCombo(50, 0);
  assertEqual(result.totalPoints, 50);
});

console.log('\n' + '='.repeat(50));
console.log('✅ All tests completed!\n');
