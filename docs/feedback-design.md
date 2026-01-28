# Rush Mode Feedback Design Spec

> Visual and audio feedback system for ChromaMix Rush Mode time extensions, combos, and urgency indicators.

## Table of Contents
1. [Time Extension Feedback](#1-time-extension-feedback)
2. [Combo Announcements](#2-combo-announcements)
3. [Urgency Indicators](#3-urgency-indicators)
4. [Audio Hooks](#4-audio-hooks)
5. [Confetti Integration](#5-confetti-integration)
6. [Implementation Notes](#6-implementation-notes)

---

## 1. Time Extension Feedback

When a player earns bonus time through high-scoring matches, provide multi-layered feedback to make the moment feel rewarding.

### Time Bonus Tiers

| Score Range | Time Bonus | Tier Name | Feedback Intensity |
|-------------|------------|-----------|-------------------|
| 70-79       | +3s        | Good      | Subtle            |
| 80-89       | +5s        | Great     | Medium            |
| 90-94       | +8s        | Excellent | Strong            |
| 95-100      | +12s       | Perfect   | Maximum           |

### 1.1 Screen Flash Effect

**Purpose:** Instant visual acknowledgment that time was earned.

```
┌─────────────────────────────────────┐
│                                     │
│   ████████████████████████████████  │
│   █  Full-screen color overlay    █ │
│   █  Opacity: 0 → 0.3 → 0         █ │
│   █  Duration: 200ms              █ │
│   ████████████████████████████████  │
│                                     │
└─────────────────────────────────────┘
```

**Color by Tier:**
- Good (+3s): `#4ADE80` (Green-400) — subtle pulse
- Great (+5s): `#60A5FA` (Blue-400) — satisfying glow
- Excellent (+8s): `#A78BFA` (Purple-400) — exciting flash
- Perfect (+12s): `#FACC15` (Yellow-400) — golden burst

**Animation:**
```css
@keyframes timeFlash {
  0%   { opacity: 0; }
  30%  { opacity: 0.35; }
  100% { opacity: 0; }
}

.time-flash {
  animation: timeFlash 200ms ease-out;
  pointer-events: none;
  mix-blend-mode: screen; /* Adds light, never darkens */
}
```

**Framer Motion Implementation:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: [0, 0.35, 0] }}
  transition={{ duration: 0.2, ease: "easeOut" }}
  style={{ backgroundColor: tierColor }}
  className="fixed inset-0 pointer-events-none z-40"
/>
```

### 1.2 Timer Bar Expansion Animation

**Purpose:** Show the timer bar physically grow to reinforce the time addition.

```
BEFORE:  ████████░░░░░░░░░░░░░░░░░░░░░░░  (15s left)
                     ↓ spring animation
AFTER:   ███████████████████░░░░░░░░░░░░  (20s after +5s)
```

**Animation Spec:**
- Easing: Spring (`stiffness: 300, damping: 20`)
- Duration: ~400ms (spring determines actual)
- Overshoot: Slight overshoot (5-10%) then settle
- Scale pulse on the bar during expansion

**Implementation:**
```tsx
<motion.div 
  className="timer-bar"
  animate={{ 
    width: `${(timeRemaining / 60) * 100}%`,
    scaleY: timeJustAdded ? [1, 1.2, 1] : 1 
  }}
  transition={{ 
    width: { type: "spring", stiffness: 300, damping: 20 },
    scaleY: { duration: 0.3 }
  }}
/>
```

### 1.3 Floating Time Numbers

**Purpose:** Clear numerical feedback showing exactly how much time was earned.

```
                    "+5s!"
                      ↑
                     ⟋ ⟍ (slight random drift left/right)
                   ↗     ↖
                  Start position: Above timer bar
```

**Visual Design:**
- Font: Bold, slightly condensed
- Size: `2rem` base, scales with tier
- Color: White with colored glow matching tier
- Motion blur: Apply `filter: blur(1px)` during fast upward motion

**Animation Sequence:**
```
Time:     0ms      →     150ms     →     400ms     →     800ms
Scale:    0.5      →      1.3      →      1.0      →      0.8
Y:        0        →      -20px    →      -60px    →      -120px
Opacity:  0        →      1        →      1        →      0
Blur:     2px      →      0px      →      0px      →      0px
```

**Framer Motion:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 0, scale: 0.5, filter: "blur(2px)" }}
  animate={{ 
    opacity: [0, 1, 1, 0],
    y: [0, -20, -60, -120],
    scale: [0.5, 1.3, 1.0, 0.8],
    filter: ["blur(2px)", "blur(0px)", "blur(0px)", "blur(0px)"]
  }}
  transition={{ 
    duration: 0.8,
    times: [0, 0.2, 0.5, 1],
    ease: "easeOut"
  }}
  style={{
    textShadow: `0 0 20px ${tierColor}, 0 0 40px ${tierColor}50`
  }}
>
  +{timeBonus}s!
</motion.div>
```

### 1.4 Particle Effects (High Bonuses)

**Trigger:** Only for +8s and +12s bonuses.

**Particle Design:**
```
        ✦   ✧   ✦
      ✧   ★   ★   ✧
    ✦   ★  TIMER  ★   ✦
      ✧   ★   ★   ✧
        ✦   ✧   ✦
```

**Spec for +8s (Excellent):**
- Particle count: 15-20
- Particle type: Small circles + sparkles
- Colors: Purple gradient (#A78BFA → #C4B5FD)
- Spread: 120° arc upward from timer
- Lifetime: 600ms

**Spec for +12s (Perfect):**
- Particle count: 30-40
- Particle type: Stars + circles + small confetti
- Colors: Gold gradient + rainbow accents
- Spread: 180° arc (full semicircle)
- Lifetime: 1000ms
- Extra: Subtle light rays emanating from center

**Canvas Confetti Config:**
```tsx
// +8s Excellent
confetti({
  particleCount: 20,
  spread: 60,
  origin: { y: 0.3, x: 0.5 },
  colors: ['#A78BFA', '#C4B5FD', '#DDD6FE'],
  gravity: 0.8,
  ticks: 100
});

// +12s Perfect (layered)
confetti({
  particleCount: 40,
  spread: 90,
  origin: { y: 0.3, x: 0.5 },
  colors: ['#FACC15', '#FDE047', '#FEF08A', '#FFFFFF'],
  gravity: 0.6,
  ticks: 150
});
// Add star-shaped particles
confetti({
  particleCount: 15,
  spread: 50,
  shapes: ['star'],
  origin: { y: 0.3, x: 0.5 },
  colors: ['#FACC15'],
  gravity: 0.4,
  ticks: 200
});
```

---

## 2. Combo Announcements

Escalating visual feedback as players build higher combos.

### 2.1 Combo Milestone Text

```
┌──────────────────────────────────────────────┐
│                                              │
│            ╔═══════════════════╗             │
│            ║     D O U B L E   ║             │
│            ║        2x         ║             │
│            ╚═══════════════════╝             │
│                                              │
│   [Target]              [Your Mix]           │
│                                              │
└──────────────────────────────────────────────┘

Position: Centered, overlaid above game board
Duration: 800ms visible, then fade
```

### Milestone Definitions

| Combo | Text | Size | Colors | Special Effects |
|-------|------|------|--------|-----------------|
| 2x | "DOUBLE!" | 3rem | Blue (#3B82F6) | Bounce in |
| 3x | "TRIPLE!" | 3.5rem | Purple (#8B5CF6) | Bounce + glow |
| 4x | "ON FIRE!" | 4rem | Orange→Red gradient | Bounce + flames + shake |
| 5x+ | "UNSTOPPABLE!" | 4.5rem | Gold + rainbow shimmer | Everything + screen pulse |

### Animation Patterns

**2x DOUBLE! (Confident):**
```tsx
<motion.div
  initial={{ scale: 0, rotate: -10 }}
  animate={{ scale: [0, 1.2, 1], rotate: [-10, 5, 0] }}
  exit={{ scale: 0, opacity: 0 }}
  transition={{ duration: 0.4, ease: "backOut" }}
>
  DOUBLE!
</motion.div>
```

**3x TRIPLE! (Exciting):**
```tsx
<motion.div
  initial={{ scale: 0, y: 50 }}
  animate={{ 
    scale: [0, 1.3, 1.1, 1.2, 1],
    y: [50, -10, 0]
  }}
  style={{
    textShadow: "0 0 30px #8B5CF6, 0 0 60px #8B5CF650"
  }}
  transition={{ duration: 0.5, ease: "backOut" }}
>
  TRIPLE!
</motion.div>
```

**4x+ ON FIRE! (Maximum Juice):**
```tsx
<motion.div
  initial={{ scale: 0, y: 100, rotate: -20 }}
  animate={{ 
    scale: [0, 1.5, 1.2, 1.3, 1.2],
    y: [100, -20, 0, -10, 0],
    rotate: [-20, 10, -5, 5, 0]
  }}
  transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
  className="relative"
>
  {/* Flame particles behind text */}
  <FlameParticles />
  
  {/* Main text with animated gradient */}
  <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 
                   bg-clip-text text-transparent animate-gradient-x">
    ON FIRE! 🔥
  </span>
</motion.div>
```

### 2.2 Streak Counter Display

**Design Decision:** Hybrid approach — persistent badge + transient celebration.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   [⚡ 1,240]  [🎯 15]  [🔥 4x] ← Persistent badge   │
│                                                     │
│              ╭─────────────╮                        │
│              │  TRIPLE!    │ ← Transient (fades)   │
│              │    3x       │                        │
│              ╰─────────────╯                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Persistent Badge (Top Stats Bar):**
- Always visible during rush mode
- Shows current combo multiplier
- Pulses on increment
- Changes color based on combo level:
  - 0-1x: Gray (neutral)
  - 2x: Blue
  - 3x: Purple
  - 4x: Orange
  - 5x+: Gold with shimmer

```tsx
<motion.div 
  className="combo-badge"
  animate={{ 
    scale: comboJustIncreased ? [1, 1.2, 1] : 1,
    backgroundColor: getComboColor(combo)
  }}
>
  <Flame className={combo >= 4 ? "animate-pulse" : ""} />
  <span className="tabular-nums">{combo}x</span>
</motion.div>
```

**Transient Milestone:**
- Appears centered on combo milestones (2, 3, 4, 5)
- Automatically dismisses after 800ms
- Does not interrupt gameplay (pointer-events: none)

### 2.3 Combo Break Feedback

When combo resets (score < 70):

```
┌─────────────────────────────┐
│                             │
│     💔 Combo Lost           │
│        (subtle, quick)      │
│                             │
└─────────────────────────────┘
```

**Visual Spec:**
- Shake the combo badge briefly
- Badge dims to gray
- Optional: Brief red tint on badge
- NO large overlay (don't punish too harshly)

```tsx
// On combo break
<motion.div
  animate={{ 
    x: [0, -5, 5, -5, 5, 0],
    backgroundColor: ["currentColor", "#EF4444", "gray"]
  }}
  transition={{ duration: 0.3 }}
/>
```

---

## 3. Urgency Indicators

Progressive urgency feedback as time runs low.

### Visual Urgency Levels

```
Time Remaining    Visual State
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 10s             Normal - no urgency indicators
≤ 10s             Warning - pulsing border, amber tint  
≤ 5s              Critical - heartbeat, vignette
≤ 3s              Panic - screen shake, rapid pulse
```

### 3.1 Warning State (≤ 10s)

**Pulsing Border:**
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
╎                                         ╎
╎   Game content remains calm             ╎
╎                                         ╎
╎   Border: Amber (#F59E0B)               ╎
╎   Pulse: 1s cycle, opacity 0.3→0.8      ╎
╎                                         ╎
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

```css
@keyframes warningPulse {
  0%, 100% { 
    box-shadow: inset 0 0 0 3px rgba(245, 158, 11, 0.3);
  }
  50% { 
    box-shadow: inset 0 0 0 4px rgba(245, 158, 11, 0.8);
  }
}

.warning-state {
  animation: warningPulse 1s ease-in-out infinite;
}
```

**Timer Enhancement:**
- Timer text turns amber
- Slight scale pulse on timer number

### 3.2 Critical State (≤ 5s)

**Heartbeat Effect:**
```
Time:    |    0ms    |   200ms   |   400ms   |   1000ms  |
         |           |           |           |           |
Scale:   |    1.0    |    1.05   |    1.0    |    1.0    |
         |     ●     |     ◉     |     ●     |     ●     |
         |           |           |           |           |
         └───────────┴───────────┴───────────┴───────────┘
                    Heartbeat pattern (repeats)
```

```css
@keyframes heartbeat {
  0%, 40%, 100% { transform: scale(1); }
  15% { transform: scale(1.05); }
  30% { transform: scale(1.02); }
}

.critical-timer {
  animation: heartbeat 1s ease-in-out infinite;
  color: #EF4444; /* Red-500 */
}
```

**Screen Vignette:**
```
┌─────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░                               ░░░░│
│░░                                ░░░│
│░░     Content area (clear)       ░░│
│░░                                ░░░│
│░░                               ░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────┘

Vignette: Radial gradient from transparent center
          to semi-transparent red at edges
Opacity: Pulses with heartbeat
```

```tsx
<motion.div
  className="fixed inset-0 pointer-events-none z-30"
  style={{
    background: "radial-gradient(ellipse at center, transparent 50%, rgba(239, 68, 68, 0.3) 100%)"
  }}
  animate={{
    opacity: [0.3, 0.5, 0.3]
  }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

### 3.3 Panic State (≤ 3s)

**Screen Shake:**
- Subtle shake — just enough to create urgency without hindering play
- Horizontal only (easier on the eyes)
- Magnitude: ±2-3px
- Frequency: ~15Hz (every ~66ms)

```tsx
<motion.div
  animate={{
    x: timeRemaining <= 3 ? [0, -2, 2, -2, 2, 0] : 0
  }}
  transition={{
    duration: 0.3,
    repeat: timeRemaining <= 3 ? Infinity : 0,
    ease: "linear"
  }}
>
  {/* Game content */}
</motion.div>
```

**Rapid Timer Pulse:**
- Timer blinks more rapidly (2x heartbeat speed)
- Deeper red color
- Bold/heavy font weight

**IMPORTANT: Accessibility Consideration**
- All shake/pulse effects should respect `prefers-reduced-motion`
- Provide toggle in settings to disable urgency animations
- Screen reader: Announce "10 seconds", "5 seconds", "3 seconds" at milestones

```tsx
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Skip animations if reduced motion preferred
if (!prefersReducedMotion) {
  // Apply urgency effects
}
```

---

## 4. Audio Hooks

Define trigger points and characteristics. Actual sound design handled by audio team/assets.

### 4.1 Time Added Sound

**Trigger:** When time bonus is applied (score ≥ 70).

**Sound Characteristics:**
| Tier | Time | Sound Concept | Pitch | Duration |
|------|------|---------------|-------|----------|
| Good | +3s | Soft whoosh | Low | 200ms |
| Great | +5s | Rising whoosh | Medium | 300ms |
| Excellent | +8s | Dramatic whoosh | High | 400ms |
| Perfect | +12s | Whoosh + sparkle | Highest + harmonics | 600ms |

**Implementation Hook:**
```tsx
// audio-events.ts
export const AUDIO_EVENTS = {
  TIME_ADDED: 'time_added',
  COMBO_MILESTONE: 'combo_milestone',
  LOW_TIME_WARNING: 'low_time_warning',
  COMBO_BREAK: 'combo_break',
} as const;

// Usage
playSound(AUDIO_EVENTS.TIME_ADDED, { 
  pitch: getTimeBonusPitch(timeBonus), // 0.8 - 1.5
  volume: 0.7 
});

function getTimeBonusPitch(bonus: number): number {
  if (bonus <= 3) return 0.8;
  if (bonus <= 5) return 1.0;
  if (bonus <= 8) return 1.2;
  return 1.4;
}
```

### 4.2 Combo Milestone Sound

**Trigger:** When combo reaches 2, 3, 4, 5+.

**Sound Characteristics:**
| Combo | Sound Concept | Notes |
|-------|---------------|-------|
| 2x | Single chime | Clean, clear |
| 3x | Double chime (ascending) | +2 semitones |
| 4x | Triple chime (ascending) | +4 semitones, add reverb |
| 5x+ | Chord flourish | Major chord, slight delay |

**Pitch Mapping:**
```tsx
function getComboChimePitch(combo: number): number[] {
  switch(combo) {
    case 2: return [1.0];           // C
    case 3: return [1.0, 1.12];     // C, D
    case 4: return [1.0, 1.12, 1.26]; // C, D, E
    default: return [1.0, 1.26, 1.5]; // C, E, G (major chord)
  }
}
```

### 4.3 Low Time Warning

**Trigger:** When timer crosses threshold (10s, 5s, 3s).

| Threshold | Sound Concept | Behavior |
|-----------|---------------|----------|
| 10s | Single soft tick | Once |
| 5s | Ticking clock | Loop at 1Hz |
| 3s | Rapid ticking | Loop at 2Hz, increasing urgency |

**Implementation:**
```tsx
useEffect(() => {
  if (timeRemaining === 10) {
    playSound('tick_warning', { volume: 0.4 });
  } else if (timeRemaining === 5) {
    startTickingLoop(1000); // 1 tick per second
  } else if (timeRemaining === 3) {
    updateTickingSpeed(500); // 2 ticks per second
  } else if (timeRemaining === 0) {
    stopTickingLoop();
    playSound('time_up', { volume: 0.6 });
  }
}, [timeRemaining]);
```

### 4.4 Combo Break Sound

**Trigger:** When score < 70 and combo was > 0.

**Sound Characteristics:**
- Subtle "break" or "snap" sound
- Low pitch, slightly muted
- Short duration (100-150ms)
- Volume: Lower than positive sounds (0.3-0.4)
- Should not feel punishing, just informative

```tsx
// Only play if there was actually a combo to lose
if (previousCombo > 0 && newCombo === 0) {
  playSound('combo_break', { volume: 0.35, pitch: 0.8 });
}
```

### 4.5 Audio Master Control

```tsx
interface AudioSettings {
  masterVolume: number;    // 0-1
  sfxEnabled: boolean;
  musicEnabled: boolean;
  urgencyAudioEnabled: boolean; // Separate toggle for anxiety-inducing sounds
}

// Respect user preferences
function playSound(event: string, options?: SoundOptions) {
  const settings = getAudioSettings();
  
  if (!settings.sfxEnabled) return;
  if (event.includes('warning') && !settings.urgencyAudioEnabled) return;
  
  const volume = (options?.volume ?? 1) * settings.masterVolume;
  // ... play sound
}
```

---

## 5. Confetti Integration

Enhance existing confetti system with time bonus visuals.

### 5.1 Current Confetti Triggers (Existing)

| Score | Current Behavior |
|-------|------------------|
| ≥ 90 | 150 particles, wide spread |
| ≥ 80 | 80 particles, medium spread |

### 5.2 Enhanced Perfect 100 Score

When player achieves perfect 100 score:

```
Layer 1: Existing confetti (from center)
    +
Layer 2: Time bonus particles (from timer area)
    +
Layer 3: Golden star burst (delayed 200ms)
```

```tsx
// Perfect 100 celebration sequence
if (score === 100) {
  // Layer 1: Main confetti burst
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFA500', '#FF6347', '#7B68EE', '#00CED1']
  });
  
  // Layer 2: Timer bonus visual (shoots from timer position)
  confetti({
    particleCount: 30,
    spread: 45,
    origin: { y: 0.15, x: 0.5 }, // Timer position
    startVelocity: 45,
    gravity: 1.2,
    colors: ['#FACC15', '#FEF08A', '#FFFFFF']
  });
  
  // Layer 3: Delayed star burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 360,
      shapes: ['star'],
      origin: { y: 0.5 },
      startVelocity: 30,
      colors: ['#FACC15', '#FBBF24'],
      ticks: 200
    });
  }, 200);
}
```

### 5.3 Time Bonus Visual Connection

When time is added, shoot small confetti burst from score display TO timer bar:

```
    [TIMER: 23s]  ← Particles land here
         ↗
       ↗
     ↗  Particle trajectory
   ↗
[Score: 92] ← Particles originate here
```

**Implementation:**
```tsx
function celebrateTimeBonus(bonus: number, scoreOrigin: {x: number, y: number}) {
  const timerOrigin = { x: 0.5, y: 0.1 }; // Approximate timer position
  
  // Calculate angle from score to timer
  const angle = Math.atan2(
    timerOrigin.y - scoreOrigin.y,
    timerOrigin.x - scoreOrigin.x
  );
  
  confetti({
    particleCount: bonus * 3, // More particles for bigger bonuses
    angle: (angle * 180 / Math.PI) + 90, // Convert to degrees, adjust for confetti coords
    spread: 20,
    origin: scoreOrigin,
    startVelocity: 40,
    gravity: 0.8,
    colors: getTimeBonusColors(bonus),
    ticks: 60
  });
}
```

---

## 6. Implementation Notes

### State Additions to gameStore.ts

```tsx
interface RushFeedbackState {
  // Time extension feedback
  lastTimeBonus: number | null;      // null when no recent bonus
  timeJustAdded: boolean;            // true for ~500ms after time added
  
  // Combo feedback  
  comboJustIncreased: boolean;       // true for ~300ms after combo++
  comboJustBroke: boolean;           // true for ~300ms after combo reset
  lastComboMilestone: number | null; // 2, 3, 4, 5 - for announcement
  
  // Urgency state
  urgencyLevel: 'none' | 'warning' | 'critical' | 'panic';
}
```

### Computed Urgency Level

```tsx
function getUrgencyLevel(timeRemaining: number): UrgencyLevel {
  if (timeRemaining > 10) return 'none';
  if (timeRemaining > 5) return 'warning';
  if (timeRemaining > 3) return 'critical';
  return 'panic';
}
```

### Performance Considerations

1. **Particle limits:** Cap concurrent particles at 300 to prevent slowdown
2. **Animation batching:** Group DOM updates for smooth 60fps
3. **Reduced motion:** Always check `prefers-reduced-motion` before animations
4. **Audio pooling:** Pre-load and pool audio instances to avoid latency

### Accessibility Checklist

- [ ] All animations respect `prefers-reduced-motion`
- [ ] Screen reader announces time warnings (10s, 5s, 3s)
- [ ] Combo milestones announced to screen readers
- [ ] Urgency audio can be disabled independently
- [ ] Visual urgency indicators have sufficient color contrast
- [ ] Shake effects are subtle and don't impede gameplay

### File Structure

```
src/
├── components/
│   ├── MixingBoard.tsx          # Main game board
│   ├── feedback/
│   │   ├── TimeExtensionFlash.tsx
│   │   ├── FloatingTimeBonus.tsx
│   │   ├── ComboAnnouncement.tsx
│   │   ├── UrgencyOverlay.tsx
│   │   └── index.ts
│   └── ...
├── hooks/
│   ├── useUrgencyState.ts       # Manages urgency level
│   ├── useFeedbackAnimations.ts # Coordinates animations
│   └── useAudio.ts              # Audio playback
├── utils/
│   └── confetti.ts              # Confetti configurations
└── store/
    └── gameStore.ts             # Add feedback state
```

---

## Mockup Descriptions

### Mockup 1: Time Bonus +5s (Great Match)
```
┌─────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────┐   │
│ │  ⚡ 847   🎯 12   🔥 3x                   │   │
│ │  ████████████████░░░░░░░░░░░░  28s        │   │
│ └─┬─────────────────────────────────────────┘   │
│   │                                             │
│   │        "+5s!"  ← floating up, fading        │
│   │          ↑                                  │
│ ┌─┴─────────────────────────────────────────┐   │
│ │                                           │   │
│ │   [Blue flash overlay, fading out]        │   │
│ │                                           │   │
│ │   Target         Your Mix                 │   │
│ │   ┌─────┐        ┌─────┐                  │   │
│ │   │Ocean│        │     │                  │   │
│ │   │Blue │        │     │                  │   │
│ │   └─────┘        └─────┘                  │   │
│ │                                           │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │  ✨ Great!                      92/100    │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Mockup 2: Combo Milestone (4x - ON FIRE!)
```
┌─────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────┐   │
│ │  ⚡ 1,240  🎯 18  🔥 4x (pulsing orange)  │   │
│ │  ██████████████████████░░░░░░  35s        │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│           ╔═══════════════════════╗             │
│           ║                       ║             │
│           ║    🔥 ON FIRE! 🔥    ║             │
│           ║        4x COMBO       ║             │
│           ║                       ║             │
│           ╚═══════════════════════╝             │
│            (orange/red gradient,                │
│             flame particles rising)             │
│                                                 │
│   Target              Your Mix                  │
│   ┌─────────┐        ┌─────────┐               │
│   │ Coral   │        │         │               │
│   │ Pink    │        │         │               │
│   └─────────┘        └─────────┘               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Mockup 3: Critical Urgency (5 seconds left)
```
┌─────────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░ ┌───────────────────────────────────────┐ ░░░│
│░░ │  ⚡ 890   🎯 14   🔥 2x               │ ░░░│
│░░ │  ███░░░░░░░░░░░░░░░░░░░░░░░░  5s     │ ░░░│
│░░ └──────────────────────────────┬────────┘ ░░░│
│░░                                │          ░░░│
│░░     Red vignette overlay       │ Timer:   ░░░│
│░░     (edges darkened)           │ RED      ░░░│
│░░                                │ PULSING  ░░░│
│░░   Target         Your Mix      │ LARGE    ░░░│
│░░   ┌─────┐        ┌─────┐       │          ░░░│
│░░   │     │        │     │       ▼          ░░░│
│░░   │     │        │     │   (heartbeat     ░░░│
│░░   └─────┘        └─────┘    animation)    ░░░│
│░░                                           ░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│                                                 │
│   Border: Pulsing red glow                      │
│   Audio: Ticking clock (1 tick/sec)             │
└─────────────────────────────────────────────────┘
```

### Mockup 4: Perfect 100 with Full Celebration
```
┌─────────────────────────────────────────────────┐
│       ✦  ★  ✧  ✦  ★  ✧  ✦  ★  ✧               │
│    ★       ╔═══════════════════╗      ★        │
│  ✧    ✦    ║                   ║    ✦    ✧    │
│       ★    ║     "+12s!"       ║    ★          │
│    ✧       ║                   ║       ✧       │
│            ╚═══════════════════╝               │
│     ★   ✦                          ✦   ★      │
│  Golden flash overlay                          │
│  Confetti everywhere                           │
│  ✧      ★      ✦      ✧      ★      ✦    ✧   │
│                                                 │
│   Target              Your Mix                  │
│   ┌─────────┐        ┌─────────┐               │
│   │ Sunset  │   =    │ Sunset  │ PERFECT!     │
│   │ Orange  │        │ Orange  │               │
│   └─────────┘        └─────────┘               │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │  🏆 PERFECT!                     100/100    ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│   Stars, circles, sparkles falling everywhere   │
│   Audio: Whoosh + sparkle + chord flourish     │
└─────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Implement feedback state** in `gameStore.ts`
2. **Create feedback components** in `src/components/feedback/`
3. **Add audio hook system** (placeholder sounds first)
4. **Wire up urgency indicators** in `MixingBoard.tsx`
5. **Test with reduced motion** preference
6. **Add settings toggle** for urgency audio

---

*Document created: January 27, 2025*
*Author: Feedback & Juice Engineer Subagent*
*Status: Design Spec Complete — Ready for Implementation*
