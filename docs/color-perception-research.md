# Color Perception Research: CIEDE2000 vs Human Intuition in ChromaMix

**Research Date:** January 28, 2026  
**Researcher:** Claude (subagent)  
**Status:** Complete

---

## Executive Summary

Players report that ChromaMix scores don't match visual perception: high scores (95+) don't look similar, while colors that "look close" score poorly. After extensive analysis, **the root cause is NOT color achievability** (all palette colors can be matched with 98%+ scores), but rather:

1. **CIEDE2000 is designed for industrial precision**, not game-feel
2. **The scoring curve is too aggressive** for the 3-10 ΔE range
3. **Human "color intuition" differs from perceptual uniformity**

### Key Recommendations (TL;DR)
1. ✅ Flatten scoring curve (let ΔE 5 score 90+)
2. ✅ Consider hybrid metric (CIEDE2000 + RGB/HSL blend)
3. ✅ Add "close enough" celebrations at 85+
4. ⚠️ Keep current palette (all achievable)

---

## Part 1: Understanding the Problem

### 1.1 What Players Report
- "I got a 95 but the colors look nothing alike"
- "This looks identical and I only got 72"
- "I trust my eyes more than the score"

### 1.2 What We're Measuring
ChromaMix uses **CIEDE2000** (ΔE00), the industry-standard color difference formula. It measures perceptual difference in LAB color space with corrections for:
- Hue rotation (blue region fixes)
- Lightness compensation
- Chroma compensation
- Hue compensation

**CIEDE2000 was designed for:**
- Industrial color matching (paint, textiles, printing)
- Detecting *just noticeable differences* (JND)
- Laboratory-grade precision

**CIEDE2000 was NOT designed for:**
- Game scoring where "close enough" should feel rewarding
- Matching colors through additive RGB light mixing
- Casual users without color training

---

## Part 2: Achievability Analysis

### 2.1 Methodology
We performed a brute-force search across all RGB slider combinations (0-100% at 1% intervals) for each target color to find the theoretical maximum score.

### 2.2 Results: All Colors Are Achievable!

```
Total colors analyzed: 100
Achievable (score >= 90): 100 (100%)
Not achievable: 0 (0%)
```

**Achievability by category:**
| Category | Achievable | Avg Max Score |
|----------|------------|---------------|
| Red      | 10/10      | 99.6          |
| Orange   | 10/10      | 99.6          |
| Yellow   | 10/10      | 99.6          |
| Green    | 12/12      | 99.4          |
| Cyan     | 8/8        | 99.5          |
| Blue     | 12/12      | 99.5          |
| Purple   | 12/12      | 99.7          |
| Pink     | 10/10      | 99.6          |
| Brown    | 8/8        | 99.4          |
| Gray     | 8/8        | 99.1          |

### 2.3 Conclusion
**The problem is NOT achievability.** Every color in the palette can theoretically be matched with 98.8%+ scores. The issue is the gap between:
- What players CAN achieve with optimal slider positions
- What players DO achieve with normal gameplay precision

---

## Part 3: CIEDE2000 Sensitivity Analysis

### 3.1 How Small Changes Affect Scores

Testing Pure Red (#FF0000) with slight green/blue additions:

| Slider Values | Mixed Color | ΔE | Score |
|---------------|-------------|-----|-------|
| R:100 G:0 B:0 | #FF0000 | 0.0 | 100 |
| R:100 G:4 B:4 | #FF0A0A | 0.8 | 98.4 |
| R:100 G:8 B:8 | #FF1414 | 1.7 | 95.2 |
| R:100 G:12 B:12 | #FF1F1F | 3.0 | 89.8 |

**Key insight:** Just 12% on two sliders (essentially invisible to most viewers) drops score below 90!

### 3.2 Hue Rotation Impact

Testing Coral Reef (#FF7F50) with hue shifts at constant saturation/lightness:

| Hue Shift | Result | ΔE | Score |
|-----------|--------|-----|-------|
| -15° | #FF5350 | 12.5 | 57.7 |
| -10° | #FF6250 | 8.9 | 69.2 |
| -5° | #FF7050 | 4.9 | 83.0 |
| 0° | #FF7F50 | 0.0 | 100 |
| +5° | #FF8E50 | 5.4 | 80.9 |
| +10° | #FF9C50 | 10.9 | 63.0 |

**Key insight:** A 5° hue shift (imperceptible to most humans) causes ~17-20 point score drop!

### 3.3 The "Almost There" Problem

Player attempting to match Cherry Pop (#FF4444):

| Attempt | RGB Values | ΔE | Score |
|---------|------------|-----|-------|
| First guess | R:100 G:30 B:30 | 1.66 | 95.4 |
| Adjustment 1 | R:100 G:25 B:25 | 0.72 | 98.6 |
| Near optimal | R:100 G:27 B:27 | 0.18 | 99.6 |

The difference between 95 and 99.6 is just **±2% on two sliders**. This precision is frustrating for players without visual feedback.

---

## Part 4: CIEDE2000 vs Other Metrics

### 4.1 Comparison Matrix

| Color Pair | CIEDE2000 | RGB Euclidean | HSL Distance |
|------------|-----------|---------------|--------------|
| #FF0000 → #FF3333 | 6.1 | 16.3 | 10.0 |
| #0000FF → #3333FF | 5.8 | 16.3 | 10.0 |
| #00FF00 → #33FF33 | 1.5 | 16.3 | 10.0 |
| #FF8800 → #FF6600 | 10.1 | 7.7 | 2.2 |
| #888888 → #999999 | 5.7 | 6.7 | 6.7 |

### 4.2 Analysis

**CIEDE2000 quirks:**
- Red/Blue get similar ΔE for same RGB change
- **Green gets much lower ΔE** for same change (ΔE 1.5 vs 6.1!)
- Orange hue shifts score worse than equivalent brightness shifts

**RGB Euclidean:**
- Treats all channels equally
- More predictable for players
- Matches how sliders actually work

**HSL Distance:**
- Intuitive for humans ("same hue, different brightness")
- Handles saturation changes well
- Problematic with hue wraparound

---

## Part 5: The Scoring Curve Problem

### 5.1 Current Curve

```
ΔE   | Score | Tier
-----|-------|-------
0    | 100   | PERFECT
1    | 98    | PERFECT
3    | 90    | EXCELLENT
5    | 82.5  | GREAT
7    | 75    | GREAT
10   | 65.6  | GOOD
15   | 50    | GOOD
```

### 5.2 Why This Feels Wrong

The curve drops **8 points** between ΔE 3 and 5. In visual terms:
- ΔE 3: "Can only see difference if colors are side-by-side"
- ΔE 5: "Noticeable but clearly related"

Both should feel like "excellent" to casual players, but only ΔE 3 qualifies.

### 5.3 Proposed Adjusted Curve

```javascript
// More forgiving curve for game-feel
if (deltaE <= 2) {
  score = 100 - (deltaE * 1);      // 98-100 for ΔE 0-2
} else if (deltaE <= 5) {
  score = 98 - ((deltaE - 2) * 2); // 92-98 for ΔE 2-5 (was 90 at ΔE 3)
} else if (deltaE <= 10) {
  score = 92 - ((deltaE - 5) * 3.4); // 75-92 for ΔE 5-10
} else if (deltaE <= 20) {
  score = 75 - ((deltaE - 10) * 2.5); // 50-75 for ΔE 10-20
} else {
  score = Math.max(0, 50 * Math.exp(-(deltaE - 20) / 25));
}
```

**Changes:**
- ΔE 5 now scores ~92 (was 82.5)
- ΔE 7 now scores ~85 (was 75)
- "EXCELLENT" threshold effectively widens

---

## Part 6: Alternative Approaches

### 6.1 Option A: Hybrid Metric

Blend CIEDE2000 with RGB distance for more intuitive feel:

```javascript
function hybridScore(target, mixed) {
  const deltaE = chroma.deltaE(target, mixed);
  const rgbDist = rgbEuclidean(target, mixed); // 0-100 normalized
  
  // 70% CIEDE2000 (scientific accuracy)
  // 30% RGB distance (player intuition)
  const blended = (deltaE * 0.7) + (rgbDist * 0.5 * 0.3);
  
  return deltaEToScore(blended);
}
```

**Pros:**
- Retains perceptual uniformity benefits
- Adds intuitive RGB component
- Players see slider relationship

**Cons:**
- More complex to explain
- May behave unexpectedly in edge cases

### 6.2 Option B: Pure RGB Euclidean

Abandon CIEDE2000 entirely:

```javascript
function rgbScore(target, mixed) {
  const rgb1 = chroma(target).rgb();
  const rgb2 = chroma(mixed).rgb();
  
  const dist = Math.sqrt(
    (rgb1[0] - rgb2[0]) ** 2 +
    (rgb1[1] - rgb2[1]) ** 2 +
    (rgb1[2] - rgb2[2]) ** 2
  );
  
  // Max distance is ~441.67
  const normalizedDist = dist / 441.67;
  return Math.max(0, 100 - (normalizedDist * 100));
}
```

**Pros:**
- Dead simple
- Players understand RGB sliders → RGB matching
- Predictable behavior

**Cons:**
- Not perceptually uniform (green changes look smaller)
- Loses sophisticated CIEDE2000 corrections
- May feel "too easy" in some color ranges

### 6.3 Option C: Context-Aware Scoring

Use different metrics for different situations:

```javascript
function smartScore(target, mixed) {
  const deltaE = chroma.deltaE(target, mixed);
  const rgbDist = rgbEuclidean(target, mixed);
  
  // If player is "close" (ΔE < 10), be more forgiving
  if (deltaE < 10) {
    // Use the BETTER of the two scores
    return Math.max(
      deltaEToScore(deltaE),
      deltaEToScore(rgbDist * 0.8)
    );
  }
  
  return deltaEToScore(deltaE);
}
```

**Pros:**
- Best of both worlds
- Rewards "close" matches generously
- Maintains accuracy for far-off colors

**Cons:**
- Harder to explain to players
- Could feel inconsistent

---

## Part 7: UX Recommendations

### 7.1 Show Progress, Not Just Score

Instead of only showing final score, provide:
- **Direction hints:** "Add more red" / "Too much blue"
- **Temperature indicator:** "Getting warmer..." "Ice cold!"
- **Best attempt tracking:** "Your closest: 94.2"

### 7.2 Celebrate "Close Enough"

Current tiers are too strict. Proposed change:

| Old Tier | Score Range | New Tier | Score Range |
|----------|-------------|----------|-------------|
| PERFECT | 98-100 | PERFECT | 97-100 |
| EXCELLENT | 90-98 | EXCELLENT | 85-97 |
| GREAT | 75-90 | GREAT | 70-85 |
| GOOD | 50-75 | GOOD | 50-70 |

### 7.3 Visual Comparison Improvements

- Side-by-side swatches (large, adjacent)
- Difference highlight mode (show only the difference)
- Color blindness accessibility options

### 7.4 Consider "Star" System

Instead of numeric score:
- ⭐⭐⭐⭐⭐ = 95+ (Perfect)
- ⭐⭐⭐⭐ = 85-95 (Excellent)
- ⭐⭐⭐ = 70-85 (Great)
- ⭐⭐ = 50-70 (Good)
- ⭐ = 25-50 (Close)

Stars feel more "game-like" and reduce obsession over exact numbers.

---

## Part 8: Technical Recommendations

### 8.1 Immediate Fixes (Low Risk)

1. **Adjust scoring curve** (Part 5.3)
   - Widen "EXCELLENT" range to ΔE 5
   - Players scoring 82 → now score 92
   
2. **Update tier thresholds** (Part 7.2)
   - More generous tier boundaries
   - Same scoring, friendlier labels

### 8.2 Medium-Term Improvements (Medium Risk)

1. **Implement hybrid metric** (Part 6.1)
   - 70/30 CIEDE2000/RGB blend
   - A/B test with players
   
2. **Add direction hints**
   - Calculate which slider would improve score most
   - "Try adding more green"

### 8.3 Long-Term Considerations (High Risk)

1. **Switch to pure RGB** (Part 6.2)
   - Complete system change
   - Would need full rebalancing
   
2. **Machine learning approach**
   - Train on human perception data
   - "Does this look close?" surveys

---

## Appendix A: Test Scripts

Two analysis scripts were created:

1. **`scripts/color-achievability-test.ts`**
   - Brute-force search for max achievable scores
   - Analyzes all 100 palette colors
   - Outputs JSON with detailed results

2. **`scripts/player-perception-test.ts`**
   - Tests CIEDE2000 sensitivity
   - Compares metrics
   - Analyzes scoring curve behavior

Run with: `npx tsx scripts/<script-name>.ts`

---

## Appendix B: Key References

1. **CIEDE2000 Formula**
   - CIE Technical Report 142-2001
   - [Wikipedia: Color difference](https://en.wikipedia.org/wiki/Color_difference)

2. **Perceptual Color Spaces**
   - Sharma, G. (2003). Digital Color Imaging Handbook
   - [Bruce Lindbloom Color Calculator](http://brucelindbloom.com/)

3. **RGB Color Model Limitations**
   - "Use of the three primary colors is not sufficient to reproduce all colors" - Wikipedia
   - RGB gamut covers approximately 35% of visible colors

---

## Conclusion

The ChromaMix scoring system is **technically correct** but **emotionally wrong**. CIEDE2000 is overkill for a casual color-mixing game. Players don't need laboratory precision—they need feedback that validates their eyes.

**Primary recommendation:** Flatten the scoring curve to make ΔE 5 score 90+. This single change will dramatically improve player satisfaction without abandoning CIEDE2000's benefits.

**Secondary recommendation:** Add "getting warmer/colder" feedback so players understand how close they are and which direction to adjust.

The goal isn't perfect color science—it's fun color mixing. Sometimes "close enough" should feel like victory. 🎨
