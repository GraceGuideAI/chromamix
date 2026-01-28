/**
 * Time Bonus System for ChromaMix Rush Mode
 * 
 * Rewards good performance with time extensions and combo multipliers.
 */

export type ComboTier = 'DOUBLE' | 'TRIPLE' | 'ON_FIRE' | null;

/**
 * Score thresholds for different bonuses
 */
const SCORE_THRESHOLDS = {
  PERFECT: 95,   // Maximum time bonus (+20s PERFECT!)
  GREAT: 85,     // Large time bonus (+12s)
  GOOD: 70,      // Good time bonus (+8s)
  OKAY: 50,      // Small time bonus (+5s)
  MINIMUM: 50,   // No bonus below 50, but maintains combo
} as const;

/**
 * Time bonus values in seconds based on score quality
 */
const TIME_BONUSES = {
  PERFECT: 20,   // +20 seconds for 95+ (PERFECT!)
  GREAT: 12,     // +12 seconds for 85-94
  GOOD: 8,       // +8 seconds for 70-84
  OKAY: 5,       // +5 seconds for 50-69
  BASE: 0,       // No bonus below 50
} as const;

/**
 * Combo multipliers for time bonuses
 */
const COMBO_MULTIPLIERS = {
  BASE: 1.0,
  DOUBLE: 1.5,   // 2-3 combo
  TRIPLE: 2.0,   // 4-5 combo
  ON_FIRE: 2.5,  // 6+ combo
} as const;

/**
 * Time limits for combo maintenance (in milliseconds)
 */
const COMBO_TIMING = {
  MAX_DELAY: 5000,       // 5 seconds max between rounds to maintain combo
  QUICK_BONUS: 2000,     // Under 2 seconds = quick bonus
  QUICK_MULTIPLIER: 1.2, // 20% extra for quick submissions
} as const;

/**
 * Calculate the base time bonus for a given score
 * Higher scores = more time earned
 */
export function calculateBaseTimeBonus(score: number): number {
  if (score >= SCORE_THRESHOLDS.PERFECT) {
    return TIME_BONUSES.PERFECT;
  }
  if (score >= SCORE_THRESHOLDS.GREAT) {
    return TIME_BONUSES.GREAT;
  }
  if (score >= SCORE_THRESHOLDS.GOOD) {
    return TIME_BONUSES.GOOD;
  }
  if (score >= SCORE_THRESHOLDS.OKAY) {
    return TIME_BONUSES.OKAY;
  }
  return TIME_BONUSES.BASE;
}

/**
 * Get the combo multiplier based on current combo count
 */
export function getComboMultiplier(comboCount: number): number {
  if (comboCount >= 6) {
    return COMBO_MULTIPLIERS.ON_FIRE;
  }
  if (comboCount >= 4) {
    return COMBO_MULTIPLIERS.TRIPLE;
  }
  if (comboCount >= 2) {
    return COMBO_MULTIPLIERS.DOUBLE;
  }
  return COMBO_MULTIPLIERS.BASE;
}

/**
 * Calculate the final time bonus including combo multipliers
 * @param score - The match score (0-100)
 * @param comboCount - Current combo count
 * @param timeSinceLastRound - Time in ms since last successful round (optional)
 */
export function calculateTimeBonus(
  score: number, 
  comboCount: number,
  timeSinceLastRound?: number
): number {
  const baseBonus = calculateBaseTimeBonus(score);
  
  if (baseBonus === 0) {
    return 0;
  }
  
  const comboMultiplier = getComboMultiplier(comboCount);
  let finalBonus = baseBonus * comboMultiplier;
  
  // Quick submission bonus
  if (timeSinceLastRound !== undefined && timeSinceLastRound < COMBO_TIMING.QUICK_BONUS) {
    finalBonus *= COMBO_TIMING.QUICK_MULTIPLIER;
  }
  
  // Round to nearest 0.5 and cap at reasonable maximum
  // Max cap raised to 30s to accommodate generous new bonuses while preventing abuse
  return Math.min(Math.round(finalBonus * 2) / 2, 30);
}

/**
 * Determine if the combo should be broken based on score and timing
 * @param score - The match score (0-100)
 * @param timeSinceLastRound - Time in ms since last successful round
 */
export function shouldBreakCombo(score: number, timeSinceLastRound: number): boolean {
  // Too slow between rounds
  if (timeSinceLastRound > COMBO_TIMING.MAX_DELAY) {
    return true;
  }
  
  // Score too low to maintain combo
  if (score < SCORE_THRESHOLDS.MINIMUM) {
    return true;
  }
  
  return false;
}

/**
 * Get the combo tier for display purposes
 */
export function getComboTier(comboCount: number): ComboTier {
  if (comboCount >= 6) {
    return 'ON_FIRE';
  }
  if (comboCount >= 4) {
    return 'TRIPLE';
  }
  if (comboCount >= 2) {
    return 'DOUBLE';
  }
  return null;
}

/**
 * Get display info for a combo tier
 */
export function getComboTierDisplay(tier: ComboTier): {
  label: string;
  emoji: string;
  colorClass: string;
  glowColor: string;
} | null {
  switch (tier) {
    case 'DOUBLE':
      return {
        label: '2x COMBO',
        emoji: '🔥',
        colorClass: 'from-blue-400 to-cyan-500',
        glowColor: 'rgba(59, 130, 246, 0.5)',
      };
    case 'TRIPLE':
      return {
        label: '3x COMBO',
        emoji: '⚡',
        colorClass: 'from-purple-500 to-pink-500',
        glowColor: 'rgba(168, 85, 247, 0.5)',
      };
    case 'ON_FIRE':
      return {
        label: 'ON FIRE!',
        emoji: '💥',
        colorClass: 'from-yellow-400 to-orange-500',
        glowColor: 'rgba(251, 191, 36, 0.6)',
      };
    default:
      return null;
  }
}

/**
 * Calculate points earned with combo multiplier
 */
export function calculatePointsWithCombo(score: number, comboCount: number): {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  multiplier: number;
} {
  const basePoints = score;
  const multiplier = getComboMultiplier(comboCount);
  const totalPoints = Math.round(basePoints * multiplier);
  const bonusPoints = totalPoints - basePoints;
  
  return {
    basePoints,
    bonusPoints,
    totalPoints,
    multiplier,
  };
}

/**
 * Get time bonus breakdown for display
 */
export function getTimeBonusBreakdown(
  score: number,
  comboCount: number,
  timeSinceLastRound?: number
): {
  baseBonus: number;
  comboBonus: number;
  quickBonus: number;
  totalBonus: number;
  isQuick: boolean;
} {
  const baseBonus = calculateBaseTimeBonus(score);
  const comboMultiplier = getComboMultiplier(comboCount);
  const comboBonus = baseBonus * (comboMultiplier - 1);
  
  const isQuick = timeSinceLastRound !== undefined && timeSinceLastRound < COMBO_TIMING.QUICK_BONUS;
  const quickBonus = isQuick ? (baseBonus * comboMultiplier) * (COMBO_TIMING.QUICK_MULTIPLIER - 1) : 0;
  
  const totalBonus = calculateTimeBonus(score, comboCount, timeSinceLastRound);
  
  return {
    baseBonus,
    comboBonus: Math.round(comboBonus * 10) / 10,
    quickBonus: Math.round(quickBonus * 10) / 10,
    totalBonus,
    isQuick,
  };
}

/**
 * Get urgency level based on time remaining
 */
export function getTimerUrgency(timeRemaining: number): 'safe' | 'warning' | 'danger' | 'critical' {
  if (timeRemaining <= 5) return 'critical';
  if (timeRemaining <= 10) return 'danger';
  if (timeRemaining <= 20) return 'warning';
  return 'safe';
}

/**
 * Get color classes for timer based on urgency
 */
export function getTimerColors(urgency: ReturnType<typeof getTimerUrgency>): {
  textClass: string;
  bgClass: string;
  glowColor: string;
  pulseAnimation: boolean;
} {
  switch (urgency) {
    case 'critical':
      return {
        textClass: 'text-red-500',
        bgClass: 'bg-red-500/20',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        pulseAnimation: true,
      };
    case 'danger':
      return {
        textClass: 'text-orange-500',
        bgClass: 'bg-orange-500/20',
        glowColor: 'rgba(249, 115, 22, 0.5)',
        pulseAnimation: true,
      };
    case 'warning':
      return {
        textClass: 'text-yellow-400',
        bgClass: 'bg-yellow-400/20',
        glowColor: 'rgba(250, 204, 21, 0.4)',
        pulseAnimation: false,
      };
    case 'safe':
    default:
      return {
        textClass: 'text-white',
        bgClass: 'bg-white/10',
        glowColor: 'transparent',
        pulseAnimation: false,
      };
  }
}

// Export constants for external use
export const THRESHOLDS = SCORE_THRESHOLDS;
export const BONUSES = TIME_BONUSES;
export const TIMING = COMBO_TIMING;
