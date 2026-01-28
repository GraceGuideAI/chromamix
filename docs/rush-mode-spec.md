# ChromaMix Rush Mode - Time Extension System Specification

## Overview
This document specifies the time extension mechanic for Rush Mode, transforming it from a fixed 60-second experience into a skill-based survival game where players can extend their session through accurate color matching.

---

## 1. Time Extension Formula (from Time Economy Researcher)

> **[AWAITING TIME ECONOMY RESEARCHER INPUT]**
> 
> Placeholder for base time extension formula. Balance Designer recommendations below assume:
> - Base extension scales with score (0-100)
> - Combo multiplier affects extension
> - Some form of diminishing returns after extended play

### Recommended Integration Points

```typescript
interface TimeExtensionResult {
  baseExtension: number;      // From score
  comboBonus: number;         // From combo multiplier
  diminishingFactor: number;  // Reduces over time
  difficultyBonus: number;    // For harder colors
  finalExtension: number;     // Total time added
}
```

---

## 2. Difficulty Progression System

### 2.1 Color Difficulty Classification

Colors are classified into three tiers based on achievability with RGB sliders:

| Tier | Saturation | Lightness | Description | Examples |
|------|-----------|-----------|-------------|----------|
| **EASY** | >80% | 30-70% | Pure, vibrant colors close to RGB primaries/secondaries | Cherry Pop, Electric Blue, Lime Zest |
| **MEDIUM** | 50-80% | 20-80% | Require balancing multiple sliders | Coral Blush, Dusty Rose, Coffee Bean |
| **HARD** | <50% | Any | Desaturated, muddy, or extreme lightness | Storm Cloud, Pewter, Moonstone, Obsidian |

### 2.2 Classification Algorithm

```typescript
function classifyColorDifficulty(hex: string): 'easy' | 'medium' | 'hard' {
  const hsl = chroma(hex).hsl();
  const saturation = (hsl[1] || 0) * 100;
  const lightness = (hsl[2] || 0) * 100;
  
  // EASY: High saturation, mid lightness (primary/secondary colors)
  if (saturation > 80 && lightness > 30 && lightness < 70) {
    return 'easy';
  }
  
  // HARD: Low saturation (grays, browns, muted tones)
  // OR extreme lightness (very dark/light)
  if (saturation < 50 || lightness < 15 || lightness > 85) {
    return 'hard';
  }
  
  // MEDIUM: Everything else
  return 'medium';
}
```

### 2.3 Difficulty Progression Phases

| Phase | Time Elapsed | Easy % | Medium % | Hard % | Effect |
|-------|-------------|--------|----------|--------|--------|
| **Warmup** | 0:00 - 0:30 | 60% | 35% | 5% | Learn the ropes |
| **Standard** | 0:30 - 2:00 | 40% | 45% | 15% | Balanced challenge |
| **Pressure** | 2:00 - 3:00 | 20% | 50% | 30% | Skill test |
| **Endurance** | 3:00+ | 10% | 40% | 50% | Hard mode |

```typescript
function getColorPoolWeights(elapsedSeconds: number): DifficultyWeights {
  if (elapsedSeconds < 30) {
    return { easy: 0.60, medium: 0.35, hard: 0.05 };
  } else if (elapsedSeconds < 120) {
    return { easy: 0.40, medium: 0.45, hard: 0.15 };
  } else if (elapsedSeconds < 180) {
    return { easy: 0.20, medium: 0.50, hard: 0.30 };
  } else {
    return { easy: 0.10, medium: 0.40, hard: 0.50 };
  }
}
```

### 2.4 Difficulty Bonus for Time Extension

Harder colors should reward more time to compensate for difficulty:

```typescript
function getDifficultyTimeBonus(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy': return 0;      // No bonus
    case 'medium': return 0.5;  // +0.5s bonus
    case 'hard': return 1.0;    // +1.0s bonus
  }
}
```

---

## 3. Infinite Play Prevention

### 3.1 Hard Time Cap

**Maximum session length: 5 minutes (300 seconds)**

After 5 minutes, the game ends regardless of remaining time. This prevents:
- Exploitation of extension mechanics
- Player fatigue
- Score inflation
- Server/leaderboard issues

```typescript
const MAX_SESSION_LENGTH = 300; // 5 minutes in seconds
const sessionStartTime = Date.now();

function shouldEndGame(currentTime: number): boolean {
  const elapsed = (Date.now() - sessionStartTime) / 1000;
  return currentTime <= 0 || elapsed >= MAX_SESSION_LENGTH;
}
```

### 3.2 Diminishing Returns Curve

Time extensions become less effective as the game progresses:

| Elapsed Time | Extension Multiplier | Effect |
|-------------|---------------------|--------|
| 0:00 - 1:00 | 100% | Full extensions |
| 1:00 - 2:00 | 80% | Slight reduction |
| 2:00 - 3:00 | 60% | Noticeable reduction |
| 3:00 - 4:00 | 40% | Significant reduction |
| 4:00 - 5:00 | 20% | Minimal extensions |

```typescript
function getDiminishingFactor(elapsedSeconds: number): number {
  if (elapsedSeconds < 60) return 1.0;
  if (elapsedSeconds < 120) return 0.8;
  if (elapsedSeconds < 180) return 0.6;
  if (elapsedSeconds < 240) return 0.4;
  return 0.2;
}
```

### 3.3 Maximum Extension Cap per Round

Regardless of score or combo, cap single-round extensions:

| Elapsed Time | Max Extension |
|-------------|---------------|
| 0:00 - 2:00 | +5s |
| 2:00 - 3:00 | +4s |
| 3:00 - 4:00 | +3s |
| 4:00+ | +2s |

```typescript
function getMaxExtensionCap(elapsedSeconds: number): number {
  if (elapsedSeconds < 120) return 5;
  if (elapsedSeconds < 180) return 4;
  if (elapsedSeconds < 240) return 3;
  return 2;
}
```

### 3.4 Timer Ceiling

Even with perfect play, timer cannot exceed a ceiling:

```typescript
const TIMER_CEILING = 30; // Maximum time on clock

function applyTimerCeiling(currentTime: number, extension: number): number {
  return Math.min(currentTime + extension, TIMER_CEILING);
}
```

### 3.5 Theoretical Maximum Playtime Analysis

**Perfect play scenario:**
- Average round time: ~3 seconds (slider adjustment + submit)
- Starting time: 60s
- Diminishing returns kick in progressively

**Calculation:**
- 0-60s: ~20 rounds × 5s avg extension = +100s potential, capped by ceiling
- Realistic peak: 2.5-3.5 minutes for expert players
- Hard cap: 5 minutes absolute maximum

This ensures skilled players feel rewarded without creating marathon sessions.

---

## 4. Playtesting Target Scenarios

### 4.1 New Player Profile (30-60s average)
**Characteristics:**
- Unfamiliar with RGB mixing
- Scores typically 40-65
- Struggles with non-primary colors

**Expected Experience:**
- Initial 60s drains quickly
- Occasional score ≥70 extends by ~1-2s
- Small victories when hitting 70+ ("I got more time!")
- Average session: 45-60 seconds
- Can they extend at all? **Yes, but marginally**

**Balance Goal:** New players should occasionally earn small extensions to learn the mechanic exists, but not rely on it.

### 4.2 Intermediate Player Profile (90-120s average)
**Characteristics:**
- Understands RGB basics
- Scores typically 65-85
- Can handle most colors except muddy/gray

**Expected Experience:**
- Consistent 70+ scores earn reliable extensions
- Can build small combos (2-4)
- Feels in control but challenged
- Average session: 90-120 seconds
- Occasional 2-minute games: **Yes, achievable**

**Balance Goal:** Intermediate players should feel progression and occasional "flow state" moments.

### 4.3 Skilled Player Profile (2-3min ceiling)
**Characteristics:**
- Expert RGB knowledge
- Scores typically 80-95
- Can achieve difficult colors

**Expected Experience:**
- High combo streaks (5-8+)
- Diminishing returns become noticeable at 2min
- Difficulty increase adds challenge
- Average session: 2-2.5 minutes
- 3-minute ceiling: **Achievable but rare**

**Balance Goal:** Skilled players should hit a satisfying skill ceiling around 2.5-3 minutes.

### 4.4 10+ Minute Prevention
**Hard caps ensure no session exceeds 5 minutes:**
- Diminishing returns reduce extensions
- Difficulty progression increases
- Max extension caps decrease
- Timer ceiling limits banking
- Absolute 5-minute hard stop

---

## 5. Score-Based Time Penalties

### 5.1 Penalty Tiers

| Score Range | Time Effect | Rationale |
|-------------|-------------|-----------|
| 95-100 | Max extension | Perfect match |
| 80-94 | Good extension | Strong performance |
| 70-79 | Small extension | Acceptable |
| 50-69 | No change | Neutral (no penalty, no bonus) |
| 0-49 | -1s penalty | Poor match drains time |

### 5.2 Penalty Implementation

```typescript
function calculateTimeChange(score: number, combo: number, elapsed: number): number {
  // Get base extension from time economy formula
  let baseExtension = getBaseTimeExtension(score); // From Time Economy Researcher
  
  // Apply difficulty bonus
  const difficulty = getCurrentTargetDifficulty();
  baseExtension += getDifficultyTimeBonus(difficulty);
  
  // Apply combo bonus
  const comboBonus = Math.min(combo * 0.3, 2.0); // Cap at +2s from combo
  baseExtension += comboBonus;
  
  // Apply diminishing returns
  baseExtension *= getDiminishingFactor(elapsed);
  
  // Apply extension cap
  baseExtension = Math.min(baseExtension, getMaxExtensionCap(elapsed));
  
  // Apply penalty for poor scores
  if (score < 50) {
    return -1; // Flat 1-second penalty for very poor matches
  }
  
  if (score < 70) {
    return 0; // No change - neutral zone
  }
  
  return Math.round(baseExtension * 10) / 10; // Round to 0.1s
}
```

### 5.3 Design Decision: No Penalty for 50-69 Range

**Rationale:**
- Creates a "safe zone" for learning
- Prevents death spiral for struggling players
- 70+ threshold matches existing combo system
- Keeps game feel positive

### 5.4 Visible Feedback

```typescript
function getTimeFeedback(change: number): TimeFeedback {
  if (change >= 3) return { text: `+${change}s`, color: 'gold', effect: 'pulse' };
  if (change >= 1) return { text: `+${change}s`, color: 'green', effect: 'pop' };
  if (change > 0) return { text: `+${change}s`, color: 'blue', effect: 'none' };
  if (change === 0) return { text: '+0s', color: 'gray', effect: 'none' };
  return { text: `${change}s`, color: 'red', effect: 'shake' };
}
```

---

## 6. Soft Fail State

### 6.1 Mid-Round Timer Expiry

**Question:** If time hits 0 while player is mixing, does the current score count?

**Recommendation: Grace Period + Final Score**

```typescript
const GRACE_PERIOD_MS = 1500; // 1.5 seconds

function handleTimerExpiry() {
  // Enter grace period - timer shows "0.0" but flashing
  setGameState('grace_period');
  
  // Start grace countdown
  setTimeout(() => {
    if (gameState === 'grace_period') {
      // Player didn't submit in time
      endGame({ lastRoundCounted: false });
    }
  }, GRACE_PERIOD_MS);
}

function handleSubmitDuringGrace(score: number) {
  // Allow the final submission
  addToScore(score);
  endGame({ lastRoundCounted: true });
}
```

### 6.2 Grace Period UX

- Timer flashes red at "0.0"
- "FINAL CHANCE!" text appears
- 1.5s to submit current mix
- If submitted: score counts, game ends
- If not submitted: game ends, round doesn't count

### 6.3 No Time Debt

Timer cannot go negative. If a penalty would bring time below 0:
```typescript
function applyTimeChange(currentTime: number, change: number): number {
  return Math.max(0, currentTime + change);
}
```

---

## 7. Combo Interaction with Time Extension

### 7.1 Current Combo System (Reference)
```typescript
// Existing system - score points
if (score >= 70) {
  newCombo = combo + 1;
  const comboMultiplier = 1 + (newCombo * 0.2);
  pointsEarned = Math.round(score * comboMultiplier);
} else {
  newCombo = 0;
  pointsEarned = Math.round(score * 0.5);
}
```

### 7.2 Combo Time Bonus

**Recommendation:** Combo adds small time bonus, capped to prevent abuse.

```typescript
function getComboTimeBonus(combo: number): number {
  // +0.3s per combo level, max +2s
  return Math.min(combo * 0.3, 2.0);
}
```

### 7.3 Combo Preservation on Near-Miss

**Current:** Score <70 resets combo to 0
**Recommendation:** Add "combo grace" for scores 60-69

```typescript
function updateCombo(score: number, currentCombo: number): number {
  if (score >= 70) {
    return currentCombo + 1; // Build combo
  } else if (score >= 60 && currentCombo > 0) {
    return Math.max(1, currentCombo - 1); // Reduce but don't reset
  } else {
    return 0; // Full reset
  }
}
```

---

## 8. Implementation Checklist

### Phase 1: Core Time Extension
- [ ] Add time extension calculation to submitMix
- [ ] Implement base extension formula (awaiting Time Economy input)
- [ ] Add visual feedback for time changes
- [ ] Update timer display to show +/- changes

### Phase 2: Difficulty System
- [ ] Add difficulty classification to color generation
- [ ] Implement weighted random selection by phase
- [ ] Add difficulty bonus to time extension
- [ ] Store current color difficulty in game state

### Phase 3: Diminishing Returns
- [ ] Track session elapsed time
- [ ] Implement diminishing factor calculation
- [ ] Add extension caps by time phase
- [ ] Implement timer ceiling

### Phase 4: Polish
- [ ] Add grace period for timer expiry
- [ ] Implement time penalty for <50 scores
- [ ] Update combo system with grace zone
- [ ] Add hard cap at 5 minutes
- [ ] Playtesting and tuning

---

## 9. Constants Summary

```typescript
// Time Extension Constants
const STARTING_TIME = 60;           // Initial timer
const TIMER_CEILING = 30;           // Max time on clock
const MAX_SESSION_LENGTH = 300;     // 5 minute hard cap
const GRACE_PERIOD_MS = 1500;       // End-of-game grace

// Scoring Thresholds
const EXTENSION_THRESHOLD = 70;     // Min score for time bonus
const PENALTY_THRESHOLD = 50;       // Score below = -1s
const COMBO_GRACE_THRESHOLD = 60;   // Score that preserves partial combo

// Extension Caps by Phase
const EXTENSION_CAPS = {
  early: 5,    // 0-2 min
  mid: 4,      // 2-3 min
  late: 3,     // 3-4 min
  endgame: 2   // 4-5 min
};

// Diminishing Returns
const DIMINISHING_FACTORS = {
  0: 1.0,
  60: 0.8,
  120: 0.6,
  180: 0.4,
  240: 0.2
};

// Combo Bonuses
const COMBO_TIME_BONUS_PER_LEVEL = 0.3;
const MAX_COMBO_TIME_BONUS = 2.0;

// Difficulty Bonuses
const DIFFICULTY_TIME_BONUS = {
  easy: 0,
  medium: 0.5,
  hard: 1.0
};
```

---

## 10. Open Questions for Team

1. **Time Economy Formula:** What is the exact score-to-extension mapping? (Awaiting researcher)
2. **UI Budget:** How much screen real estate for time change animations?
3. **Audio:** Should time gains/losses have distinct sounds?
4. **Leaderboards:** Separate leaderboards for different difficulty preferences?
5. **Accessibility:** Colorblind modes affect difficulty classification?

---

*Document created by Balance & Difficulty Designer*
*Last updated: [Current Date]*
*Status: AWAITING TIME ECONOMY RESEARCHER INPUT for Section 1*
