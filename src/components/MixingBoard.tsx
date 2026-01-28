'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Clock, Zap, Target, Flame } from 'lucide-react';
import useGameStore, { getScoreLabel, getScoreLabelColor, getTimeUntilNewDaily } from '@/store/gameStore';
import { getColorName, calculateColorScore, type ColorScoreResult } from '@/utils/colorPhysics';
import { getGameColorName } from '@/data/colors';
import { ColorFeedback, RGBComparison, ColorDifferenceBar } from './ColorFeedback';
import confetti from 'canvas-confetti';
import Timer, { TimeExtensionPopup } from './Timer';
import ComboDisplay, { ComboAnnouncement, RushStatsBar } from './ComboDisplay';
import { getComboTier } from '@/utils/timeBonus';

// Accessible slider component with enhanced tactile feedback
interface AccessibleSliderProps {
  id: string;
  label: string;
  value: number;
  baseColor: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function AccessibleSlider({ id, label, value, baseColor, onChange, disabled = false }: AccessibleSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate descriptive value text for screen readers
  const getValueText = useCallback((val: number) => {
    if (val === 0) return `${label}: none, 0 percent`;
    if (val <= 25) return `${label}: light amount, ${val} percent`;
    if (val <= 50) return `${label}: moderate amount, ${val} percent`;
    if (val <= 75) return `${label}: strong amount, ${val} percent`;
    return `${label}: maximum intensity, ${val} percent`;
  }, [label]);

  // Keyboard fine-tune controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let newValue = value;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(100, value + (e.shiftKey ? 10 : 1));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(0, value - (e.shiftKey ? 10 : 1));
        break;
      case 'Home':
        e.preventDefault();
        newValue = 0;
        break;
      case 'End':
        e.preventDefault();
        newValue = 100;
        break;
      case 'PageUp':
        e.preventDefault();
        newValue = Math.min(100, value + 10);
        break;
      case 'PageDown':
        e.preventDefault();
        newValue = Math.max(0, value - 10);
        break;
      default:
        return;
    }
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  return (
    <div 
      className={`slider-container bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 space-y-2 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
      } ${isDragging ? 'scale-[1.02] shadow-lg' : ''} ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-center">
        <label 
          htmlFor={`slider-${id}`}
          className="text-white font-semibold text-base sm:text-lg flex items-center gap-2"
        >
          {/* Color indicator dot */}
          <span 
            className="w-4 h-4 rounded-full border-2 border-white/30 shadow-inner"
            style={{ backgroundColor: baseColor }}
            aria-hidden="true"
          />
          {label}
        </label>
        <output 
          htmlFor={`slider-${id}`}
          className="text-white/90 font-mono text-base sm:text-lg tabular-nums min-w-[4ch] text-right font-bold"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}%
        </output>
      </div>
      
      {/* Visual track with enhanced feedback */}
      <div className="relative slider-track-container h-10 sm:h-12 flex items-center">
        {/* Background track */}
        <div 
          className="absolute inset-x-0 rounded-full h-3 sm:h-4 bg-white/20"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
          aria-hidden="true"
        />
        
        {/* Filled portion with glow effect */}
        <motion.div 
          className="absolute h-3 sm:h-4 rounded-full"
          style={{ 
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${value}%`,
            backgroundColor: baseColor,
            boxShadow: isDragging 
              ? `0 0 24px ${baseColor}aa, 0 0 48px ${baseColor}44`
              : value > 0 
                ? `0 0 12px ${baseColor}66`
                : 'none'
          }}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          aria-hidden="true"
        />
        
        {/* Actual input - larger touch target */}
        <input
          id={`slider-${id}`}
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="slider-input relative z-10 w-full h-10 sm:h-12 appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed touch-pan-y"
          aria-label={`${label} color intensity`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={getValueText(value)}
          aria-disabled={disabled}
          style={{ '--slider-color': baseColor } as React.CSSProperties}
        />
      </div>
      
      {/* Keyboard hint - hidden on mobile, visible on focus for desktop */}
      {!disabled && (
        <div 
          className={`hidden sm:block text-xs text-white/50 transition-opacity duration-200 ${
            isFocused ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          Use arrow keys to adjust • Shift+arrows for ±10
        </div>
      )}
    </div>
  );
}

export default function MixingBoard() {
  const { 
    sliders, 
    updateSlider, 
    currentMix, 
    targetColor,
    currentScore,
    submitMix,
    newRound,
    mode,
    timeRemaining,
    isTimerRunning,
    tickTimer,
    startTimer,
    // Rush mode
    rushScore,
    rushRounds,
    rushCombo,
    rushMaxCombo,
    // Time extension system
    comboCount,
    maxCombo,
    streakCount,
    totalTimeEarned,
    lastTimeBonus,
    showTimeBonus,
    lastComboTier,
    showComboAnnouncement,
    // Anti-exploit
    noMovementWarning,
    isSubmissionLocked,
    // Daily mode
    dailyAttempts,
    dailyBestScore,
    dailyCompleted,
    currentStreak,
    // Achievements
    newlyUnlockedAchievement,
    clearNewAchievement,
    // Share
    shareResults,
  } = useGameStore();

  // Get the closest color name for the user's mix
  const mixColorName = getGameColorName(currentMix);
  
  // Target color info
  const targetColorName = targetColor.name;
  const targetColorHex = targetColor.hex;

  // Calculate detailed score result for feedback
  const [scoreResult, setScoreResult] = useState<ColorScoreResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState(getTimeUntilNewDaily());
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareToastMessage, setShareToastMessage] = useState('');
  
  // Screen reader announcements
  const [announcement, setAnnouncement] = useState('');
  const [urgentAnnouncement, setUrgentAnnouncement] = useState('');

  // Screen reader announcement helper
  const announce = useCallback((message: string, urgent = false) => {
    if (urgent) {
      setUrgentAnnouncement('');
      setTimeout(() => setUrgentAnnouncement(message), 50);
    } else {
      setAnnouncement('');
      setTimeout(() => setAnnouncement(message), 50);
    }
  }, []);

  // Timer effect for rush mode
  useEffect(() => {
    if (mode === 'rush' && isTimerRunning) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [mode, isTimerRunning, tickTimer]);

  // Announce timer warnings using ref to avoid setState in effect
  const prevTimeRef = useRef(timeRemaining);
  useEffect(() => {
    const prevTime = prevTimeRef.current;
    prevTimeRef.current = timeRemaining;
    
    if (mode === 'rush' && isTimerRunning && prevTime !== timeRemaining) {
      // Use requestAnimationFrame to break out of the synchronous effect
      requestAnimationFrame(() => {
        if (timeRemaining === 30) {
          announce('30 seconds remaining');
        } else if (timeRemaining === 10) {
          announce('10 seconds remaining!', true);
        } else if (timeRemaining === 5) {
          announce('5 seconds!', true);
        } else if (timeRemaining === 0) {
          announce('Time is up!', true);
        }
      });
    }
  }, [timeRemaining, mode, isTimerRunning, announce]);

  // Daily countdown timer
  useEffect(() => {
    if (mode === 'daily') {
      const interval = setInterval(() => {
        setCountdown(getTimeUntilNewDaily());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [mode]);

  // Canvas animation for color mixing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (prefersReducedMotion) {
      // Simple solid fill for reduced motion
      ctx.fillStyle = currentMix;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Draw swirling gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        0,
        canvas.width / 2, 
        canvas.height / 2, 
        canvas.width / 2
      );

      // Use solid fill instead of gradient to show true mixed color
      // (transparency was causing background bleed-through)
      ctx.fillStyle = currentMix;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentMix]);

  // Auto-dismiss achievement notification
  useEffect(() => {
    if (newlyUnlockedAchievement) {
      // Use requestAnimationFrame to announce outside the sync effect
      requestAnimationFrame(() => {
        announce(`Achievement unlocked: ${newlyUnlockedAchievement.name}. ${newlyUnlockedAchievement.description}`);
      });
      const timer = setTimeout(() => {
        clearNewAchievement();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [newlyUnlockedAchievement, clearNewAchievement, announce]);

  const handleSubmit = () => {
    // Guard: prevent submission if rush mode game is over
    if (mode === 'rush' && (!isTimerRunning || timeRemaining <= 0)) {
      return;
    }
    
    // Calculate detailed score result for better feedback
    const result = calculateColorScore(currentMix, targetColorHex);
    setScoreResult(result);
    
    submitMix();
    
    // Get score after submission for confetti and announcements
    const state = useGameStore.getState();
    const score = typeof state.currentScore === 'number' ? state.currentScore : 0;
    
    // Announce score with detailed feedback
    const feedback = result.feedback;
    announce(`${feedback.label}! Score: ${score} out of 100. ${feedback.description}${feedback.hint ? ` Hint: ${feedback.hint}` : ''}`);
    
    // Confetti for high scores (respects reduced motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      if (score >= 95) {
        // Perfect match - extra celebration!
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#7B68EE', '#00CED1']
        });
      } else if (score >= 85) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4CAF50', '#8BC34A', '#CDDC39']
        });
      } else if (score >= 70) {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleShare = async () => {
    const success = await shareResults();
    if (success) {
      setShareToastMessage('Results copied to clipboard!');
      setShowShareToast(true);
      announce('Results copied to clipboard');
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const handleStartRush = () => {
    startTimer();
    announce('Rush mode started! 60 seconds on the clock. Match colors quickly!');
  };

  const handleNewRound = () => {
    setScoreResult(null); // Clear feedback for new round
    newRound();
    announce('New round started. New target color displayed.');
  };

  // Get contrast-safe text color for color swatches
  const getContrastColor = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const scoreLabel = currentScore > 0 ? getScoreLabel(typeof currentScore === 'number' ? currentScore : 0) : null;
  const scoreLabelColor = scoreLabel ? getScoreLabelColor(scoreLabel) : '';
  // Disable sliders when rush mode game is not actively running
  const slidersDisabled = mode === 'rush' && (!isTimerRunning || timeRemaining <= 0);
  // Check if rush mode game is over (timer stopped and time depleted)
  const isRushGameOver = mode === 'rush' && !isTimerRunning && timeRemaining <= 0;

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4 relative"
      role="main"
      aria-label="RGB color mixing game board"
    >
      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {urgentAnnouncement}
      </div>

      {/* Achievement Notification */}
      <AnimatePresence>
        {newlyUnlockedAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3 min-w-72"
            role="alert"
            aria-label={`Achievement unlocked: ${newlyUnlockedAchievement.name}`}
          >
            <div className="text-4xl" aria-hidden="true">{newlyUnlockedAchievement.icon}</div>
            <div>
              <div className="text-xs font-bold text-yellow-900 uppercase tracking-wide">
                Achievement Unlocked!
              </div>
              <div className="text-lg font-bold text-white">
                {newlyUnlockedAchievement.name}
              </div>
              <div className="text-sm text-yellow-100">
                {newlyUnlockedAchievement.description}
              </div>
            </div>
            <button 
              onClick={clearNewAchievement}
              className="absolute top-2 right-2 text-yellow-900/50 hover:text-yellow-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-900 rounded"
              aria-label="Dismiss achievement notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold"
            role="status"
            aria-live="polite"
          >
            {shareToastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rush Mode Header - Compact inline layout */}
      {mode === 'rush' && (
        <motion.section
          className="space-y-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          aria-labelledby="rush-mode-title"
        >
          <h2 id="rush-mode-title" className="sr-only">Rush Mode</h2>
          
          {/* Compact Rush Stats Bar with Timer */}
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3 flex items-center justify-between"
            role="group"
            aria-label="Rush mode statistics"
          >
            {/* Timer - using new Timer component */}
            <Timer 
              timeRemaining={timeRemaining}
              isRunning={isTimerRunning}
              lastTimeBonus={lastTimeBonus}
              showTimeBonus={showTimeBonus}
            />
            
            {/* Stats inline with RushStatsBar */}
            <RushStatsBar
              score={rushScore}
              rounds={rushRounds}
              combo={comboCount}
              maxCombo={maxCombo}
              totalTimeEarned={totalTimeEarned}
            />
          </div>
          
          {/* Combo Display - persistent counter with tiers */}
          {isTimerRunning && comboCount >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <ComboDisplay
                comboCount={comboCount}
                maxCombo={maxCombo}
                streakCount={streakCount}
                isActive={isTimerRunning}
              />
            </motion.div>
          )}
          
          {/* Start Button (before game starts) */}
          {!isTimerRunning && timeRemaining >= 60 && rushScore === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRush}
              className="game-button w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-xl text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-900"
              aria-label="Start Rush Mode - 60 seconds to match as many colors as possible"
            >
              <span aria-hidden="true">⚡</span> Start Rush Mode!
            </motion.button>
          )}
        </motion.section>
      )}
      
      {/* Combo Announcement Overlay */}
      <ComboAnnouncement
        tier={lastComboTier}
        isVisible={showComboAnnouncement}
        comboCount={comboCount}
      />
      
      {/* Time Extension Popup */}
      <TimeExtensionPopup
        seconds={lastTimeBonus || 0}
        isVisible={showTimeBonus && (lastTimeBonus || 0) > 0}
        position="top"
      />

      {/* No Movement Warning */}
      <AnimatePresence>
        {noMovementWarning && (
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-center"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span>Move the sliders to mix your color!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Mode Header - Compact single row */}
      {mode === 'daily' && (
        <motion.section
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3"
          aria-labelledby="daily-mode-title"
        >
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div>
                <h2 id="daily-mode-title" className="text-xs text-white/60 uppercase tracking-wide">
                  Daily
                </h2>
                <div className="text-lg sm:text-xl font-bold text-white">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              {/* Daily Stats inline */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                <span>#{dailyAttempts}</span>
                {dailyBestScore > 0 && <span>Best: {dailyBestScore}</span>}
                {dailyCompleted && <span className="text-green-400">✓</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Countdown */}
              <div className="flex items-center gap-1 text-white/50 text-xs">
                <Clock size={12} aria-hidden="true" />
                <span>{countdown.hours}h {countdown.minutes}m</span>
              </div>
              {/* Streak */}
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 text-orange-400" role="status" aria-label={`${currentStreak} day streak`}>
                  <Flame size={16} aria-hidden="true" />
                  <span className="text-lg font-bold tabular-nums">{currentStreak}</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      {/* Rush Mode Game Over - Compact */}
      {isRushGameOver && (
        <motion.section
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-center space-y-3"
          aria-labelledby="game-over-title"
          role="region"
        >
          <h2 id="game-over-title" className="text-xl font-bold text-white">
            <span aria-hidden="true">⏱️</span> Time&apos;s Up!
          </h2>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Final statistics">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{rushScore}</div>
              <div className="text-xs text-white/70">Score</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{rushRounds}</div>
              <div className="text-xs text-white/70">Rounds</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{maxCombo}x</div>
              <div className="text-xs text-white/70">Best Combo</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-300 tabular-nums">+{totalTimeEarned}s</div>
              <div className="text-xs text-white/70">Time Earned</div>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="game-button flex-1 bg-white/20 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
              aria-label="Share your results"
            >
              <Share2 size={18} aria-hidden="true" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewRound}
              className="game-button flex-1 bg-white text-purple-600 font-bold py-2.5 px-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
              aria-label="Play another round of Rush Mode"
            >
              Play Again
            </motion.button>
          </div>
        </motion.section>
      )}

      {/* Hide game UI when rush mode ended */}
      {!isRushGameOver && (
        <>
          {/* Side-by-side color comparison - Always horizontal */}
          <div 
            className="color-comparison grid grid-cols-2 gap-2 sm:gap-4"
            role="group"
            aria-label="Color comparison: target versus your mix"
          >
            {/* Target Color Display */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 space-y-1 sm:space-y-2"
            >
              <h2 
                id="target-color-heading"
                className="text-center text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wide"
              >
                Target
              </h2>
              <div 
                className="color-swatch relative w-full h-20 sm:h-28 md:h-32 rounded-xl shadow-xl border-2 sm:border-4 border-white/20 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: targetColorHex }}
                role="img"
                aria-label={`Target color: ${targetColorName}`}
              >
                {/* Color name displayed on swatch */}
                <motion.div 
                  key={targetColorName}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center px-2 py-1 rounded-md"
                  style={{ 
                    color: getContrastColor(targetColorHex),
                    backgroundColor: `${getContrastColor(targetColorHex)}12`,
                    textShadow: getContrastColor(targetColorHex) === '#ffffff' 
                      ? '0 1px 4px rgba(0,0,0,0.6)' 
                      : '0 1px 4px rgba(255,255,255,0.4)'
                  }}
                >
                  <div className="text-sm sm:text-lg md:text-xl font-bold tracking-wide leading-tight">
                    {targetColorName}
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Color Mixing Canvas */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-4 space-y-1 sm:space-y-2"
            >
              <h2 
                id="mix-color-heading"
                className="text-center text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wide"
              >
                Your Mix
              </h2>
              <div 
                className="color-swatch relative w-full h-20 sm:h-28 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 sm:border-4 border-white/20"
                role="img"
                aria-label="Your mixed color"
              >
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={128}
                  className="w-full h-full"
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          </div>

          {/* RGB Color Sliders */}
          <motion.fieldset
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-2 sm:space-y-3 border-0 p-0 m-0"
          >
            <legend className="sr-only">
              RGB color mixing sliders - adjust Red, Green, and Blue intensity to match the target color
            </legend>
            
            {sliders.map((slider, idx) => (
              <motion.div
                key={slider.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + idx * 0.08, type: 'spring', stiffness: 300 }}
              >
                <AccessibleSlider
                  id={slider.id}
                  label={slider.label}
                  value={slider.amount}
                  baseColor={slider.baseColor}
                  onChange={(value) => updateSlider(slider.id, value)}
                  disabled={slidersDisabled}
                />
              </motion.div>
            ))}
          </motion.fieldset>

          {/* Score Display with Enhanced Feedback */}
          <AnimatePresence>
            {currentScore > 0 && scoreResult && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="space-y-2"
              >
                {/* Main feedback display */}
                <ColorFeedback
                  scoreResult={scoreResult}
                  currentMix={currentMix}
                  targetHex={targetColorHex}
                  showHints={mode !== 'rush'} // Hide hints in rush mode for speed
                />
                
                {/* RGB comparison (compact, hidden in rush mode) */}
                {mode !== 'rush' && currentScore < 95 && (
                  <RGBComparison
                    currentMix={currentMix}
                    targetHex={targetColorHex}
                    compact
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Match quality bar for non-rush modes */}
          {mode !== 'rush' && currentScore > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-1"
            >
              <ColorDifferenceBar score={currentScore} />
            </motion.div>
          )}

          {/* Action Buttons - Compact horizontal layout */}
          <div 
            className="flex gap-2 sm:gap-3"
            role="group"
            aria-label="Game actions"
          >
            {mode === 'rush' && isTimerRunning && timeRemaining > 0 ? (
              // Active Rush Mode - Submit & Next button
              <motion.button
                whileHover={{ scale: isSubmissionLocked ? 1 : 1.02 }}
                whileTap={{ scale: isSubmissionLocked ? 1 : 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmissionLocked}
                className={`game-button flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-xl text-base sm:text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-900 disabled:opacity-70 disabled:cursor-not-allowed ${isSubmissionLocked ? 'animate-pulse' : ''}`}
                aria-label="Submit your color mix and get next target"
                aria-busy={isSubmissionLocked}
              >
                {isSubmissionLocked ? 'Loading...' : 'Submit & Next'} <span aria-hidden="true">→</span>
              </motion.button>
            ) : mode === 'rush' ? (
              // Rush Mode but not active (waiting to start OR game over)
              // Don't show any buttons here - game over UI or start button handles this
              null
            ) : (
              // Non-Rush modes (Daily, etc.)
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="game-button flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-900"
                  aria-label="Check how well your RGB mix matches the target color"
                >
                  Check Match
                </motion.button>
                
                {mode === 'daily' && currentScore > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="game-button bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-4 rounded-xl shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                    aria-label="Share your daily challenge results"
                  >
                    <Share2 size={20} aria-hidden="true" />
                    <span className="sr-only">Share results</span>
                  </motion.button>
                )}
                
                {mode !== 'daily' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewRound}
                    className="game-button flex-1 bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-4 rounded-xl shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                    aria-label="Start a new round with a different target color"
                  >
                    New Round
                  </motion.button>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Skip link for keyboard users */}
      <a 
        href="#game-modes"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        Skip to game mode selection
      </a>
    </div>
  );
}
