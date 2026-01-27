'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Clock, Zap, Target, Flame } from 'lucide-react';
import useGameStore, { getScoreLabel, getScoreLabelColor, getTimeUntilNewDaily } from '@/store/gameStore';
import { getColorName } from '@/utils/colorPhysics';
import confetti from 'canvas-confetti';

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
      className={`slider-container bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
      } ${isDragging ? 'scale-[1.02]' : ''} ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-center">
        <label 
          htmlFor={`slider-${id}`}
          className="text-white font-semibold text-lg"
        >
          {label}
        </label>
        <output 
          htmlFor={`slider-${id}`}
          className="text-white/90 font-mono text-lg tabular-nums min-w-[4ch] text-right"
          aria-live="polite"
          aria-atomic="true"
        >
          {value}%
        </output>
      </div>
      
      {/* Visual track with enhanced feedback */}
      <div className="relative slider-track-container">
        {/* Background track */}
        <div 
          className="absolute inset-0 rounded-full bg-white/20 h-3"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
          aria-hidden="true"
        />
        
        {/* Filled portion */}
        <div 
          className="absolute h-3 rounded-full transition-all duration-75"
          style={{ 
            top: '50%',
            transform: 'translateY(-50%)',
            width: `${value}%`,
            backgroundColor: baseColor,
            boxShadow: isDragging ? `0 0 20px ${baseColor}88` : 'none'
          }}
          aria-hidden="true"
        />
        
        {/* Tick marks for orientation */}
        <div 
          className="absolute inset-0 flex justify-between px-1 pointer-events-none h-3"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
          aria-hidden="true"
        >
          {[0, 25, 50, 75, 100].map((tick) => (
            <div 
              key={tick}
              className={`w-0.5 h-full ${value >= tick ? 'bg-white/40' : 'bg-white/20'}`}
            />
          ))}
        </div>
        
        {/* Actual input */}
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
          className="slider-input relative z-10 w-full h-4 appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed"
          aria-label={`${label} color amount`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={getValueText(value)}
          aria-disabled={disabled}
          style={{ '--slider-color': baseColor } as React.CSSProperties}
        />
      </div>
      
      {/* Keyboard hint (visible on focus) */}
      {!disabled && (
        <div 
          className={`text-xs text-white/50 transition-opacity duration-200 ${
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

      gradient.addColorStop(0, currentMix);
      gradient.addColorStop(0.5, currentMix + '88');
      gradient.addColorStop(1, currentMix + '44');

      ctx.fillStyle = gradient;
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
    submitMix();
    
    // Get score after submission for confetti and announcements
    const state = useGameStore.getState();
    const score = typeof state.currentScore === 'number' ? state.currentScore : 0;
    
    // Announce score
    const scoreLabel = getScoreLabel(score);
    announce(`${scoreLabel}! Score: ${score} out of 100`);
    
    // Confetti for high scores (respects reduced motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      if (score >= 90) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#7B68EE', '#00CED1']
        });
      } else if (score >= 80) {
        confetti({
          particleCount: 80,
          spread: 60,
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
  const slidersDisabled = mode === 'rush' && (!isTimerRunning || timeRemaining === 0);

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 relative"
      role="main"
      aria-label="Color mixing game board"
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

      {/* Rush Mode Header */}
      {mode === 'rush' && (
        <motion.section
          className="space-y-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          aria-labelledby="rush-mode-title"
        >
          <h2 id="rush-mode-title" className="sr-only">Rush Mode</h2>
          
          {/* Timer */}
          <div 
            className="text-center"
            role="timer"
            aria-label={`Time remaining: ${timeRemaining} seconds`}
          >
            <div 
              className={`text-5xl font-bold tabular-nums ${timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}
              aria-hidden="true"
            >
              {timeRemaining}s
            </div>
            <span className="sr-only">{timeRemaining} seconds remaining</span>
          </div>
          
          {/* Rush Stats Bar */}
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 grid grid-cols-3 gap-4"
            role="group"
            aria-label="Rush mode statistics"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400">
                <Zap size={18} aria-hidden="true" />
                <span className="text-2xl font-bold tabular-nums">{rushScore}</span>
              </div>
              <div className="text-xs text-white/60 uppercase">Score</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400">
                <Target size={18} aria-hidden="true" />
                <span className="text-2xl font-bold tabular-nums">{rushRounds}</span>
              </div>
              <div className="text-xs text-white/60 uppercase">Rounds</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400">
                <Flame size={18} aria-hidden="true" />
                <span className="text-2xl font-bold tabular-nums">{rushCombo}x</span>
              </div>
              <div className="text-xs text-white/60 uppercase">Combo</div>
            </div>
          </div>
          
          {/* Combo Indicator */}
          {rushCombo >= 2 && isTimerRunning && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
              role="status"
              aria-live="polite"
            >
              <span className={`inline-block px-4 py-1 rounded-full font-bold text-lg ${
                rushCombo >= 5 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse' :
                rushCombo >= 3 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                'bg-blue-500/50 text-white'
              }`}>
                <span aria-hidden="true">🔥</span> {rushCombo}x Combo!
              </span>
            </motion.div>
          )}
          
          {/* Start Button (before game starts) */}
          {!isTimerRunning && timeRemaining === 60 && rushScore === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRush}
              className="game-button w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-2xl shadow-xl text-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-900"
              aria-label="Start Rush Mode - 60 seconds to match as many colors as possible"
            >
              <span aria-hidden="true">⚡</span> Start Rush Mode!
            </motion.button>
          )}
        </motion.section>
      )}

      {/* Daily Mode Header */}
      {mode === 'daily' && (
        <motion.section
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3"
          aria-labelledby="daily-mode-title"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 id="daily-mode-title" className="text-sm text-white/60 uppercase tracking-wide">
                Daily Challenge
              </h2>
              <div className="text-2xl font-bold text-white">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            {currentStreak > 0 && (
              <div className="text-right" role="status" aria-label={`${currentStreak} day streak`}>
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame size={20} aria-hidden="true" />
                  <span className="text-2xl font-bold tabular-nums">{currentStreak}</span>
                </div>
                <div className="text-xs text-white/60">day streak</div>
              </div>
            )}
          </div>
          
          {/* Daily Stats */}
          <div className="flex gap-4 text-sm" role="group" aria-label="Daily challenge statistics">
            <div className="text-white/70">
              Attempts: <span className="text-white font-bold tabular-nums">{dailyAttempts}</span>
            </div>
            {dailyBestScore > 0 && (
              <div className="text-white/70">
                Best: <span className="text-white font-bold tabular-nums">{dailyBestScore}</span>
              </div>
            )}
            {dailyCompleted && (
              <div className="text-green-400 font-bold" role="status">
                <span aria-hidden="true">✓</span> Completed
              </div>
            )}
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Clock size={14} aria-hidden="true" />
            <span>New color in {countdown.hours}h {countdown.minutes}m</span>
          </div>
        </motion.section>
      )}

      {/* Rush Mode Game Over */}
      {mode === 'rush' && !isTimerRunning && timeRemaining === 0 && (
        <motion.section
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 text-center space-y-4"
          aria-labelledby="game-over-title"
          role="region"
        >
          <h2 id="game-over-title" className="text-2xl font-bold text-white">
            <span aria-hidden="true">⏱️</span> Time&apos;s Up!
          </h2>
          <div className="grid grid-cols-3 gap-4" role="group" aria-label="Final statistics">
            <div>
              <div className="text-4xl font-bold text-white tabular-nums">{rushScore}</div>
              <div className="text-sm text-white/70">Final Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white tabular-nums">{rushRounds}</div>
              <div className="text-sm text-white/70">Rounds</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white tabular-nums">{rushMaxCombo}x</div>
              <div className="text-sm text-white/70">Best Combo</div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="game-button flex-1 bg-white/20 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
              aria-label="Share your results"
            >
              <Share2 size={20} aria-hidden="true" />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewRound}
              className="game-button flex-1 bg-white text-purple-600 font-bold py-3 px-4 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300"
              aria-label="Play another round of Rush Mode"
            >
              Play Again
            </motion.button>
          </div>
        </motion.section>
      )}

      {/* Hide game UI when rush mode ended */}
      {!(mode === 'rush' && !isTimerRunning && timeRemaining === 0) && (
        <>
          {/* Side-by-side color comparison */}
          <div 
            className="color-comparison grid grid-cols-1 md:grid-cols-2 gap-4"
            role="group"
            aria-label="Color comparison: target versus your mix"
          >
            {/* Target Color Display */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 md:p-6 space-y-3"
            >
              <h2 
                id="target-color-heading"
                className="text-center text-sm font-medium text-white/60 uppercase tracking-wide"
              >
                Target Color
              </h2>
              <div 
                className="color-swatch w-full h-24 md:h-32 rounded-2xl shadow-2xl border-4 border-white/20 flex items-center justify-center"
                style={{ backgroundColor: targetColor }}
                role="img"
                aria-label={`Target color: ${getColorName(targetColor)}`}
              >
                {/* High contrast mode: show color name inside swatch */}
                <span 
                  className="hidden high-contrast:block font-bold text-lg px-2 py-1 rounded"
                  style={{ 
                    color: getContrastColor(targetColor),
                    backgroundColor: `${getContrastColor(targetColor)}22`
                  }}
                  aria-hidden="true"
                >
                  {getColorName(targetColor)}
                </span>
              </div>
              <div className="text-center text-lg font-semibold text-white">
                {getColorName(targetColor)}
              </div>
            </motion.div>

            {/* Color Mixing Canvas */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 md:p-6 space-y-3"
            >
              <h2 
                id="mix-color-heading"
                className="text-center text-sm font-medium text-white/60 uppercase tracking-wide"
              >
                Your Mix
              </h2>
              <div 
                className="color-swatch relative w-full h-24 md:h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20"
                role="img"
                aria-label={`Your mixed color: ${getColorName(currentMix)}`}
              >
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={128}
                  className="w-full h-full"
                  aria-hidden="true"
                />
                {/* High contrast fallback */}
                <div 
                  className="absolute inset-0 hidden high-contrast:flex items-center justify-center"
                  style={{ backgroundColor: currentMix }}
                >
                  <span 
                    className="font-bold text-lg px-2 py-1 rounded"
                    style={{ 
                      color: getContrastColor(currentMix),
                      backgroundColor: `${getContrastColor(currentMix)}22`
                    }}
                    aria-hidden="true"
                  >
                    {getColorName(currentMix)}
                  </span>
                </div>
              </div>
              <div 
                className="text-center text-lg font-semibold text-white"
                aria-live="polite"
                aria-atomic="true"
              >
                {getColorName(currentMix)}
              </div>
            </motion.div>
          </div>

          {/* Color Sliders */}
          <motion.fieldset
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 border-0 p-0 m-0"
          >
            <legend className="sr-only">
              Color mixing sliders - adjust Red, Yellow, and Blue to match the target color
            </legend>
            
            {sliders.map((slider, idx) => (
              <motion.div
                key={slider.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
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

          {/* Score Display with Label */}
          <AnimatePresence>
            {currentScore > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`score-display text-center bg-gradient-to-r ${scoreLabelColor} rounded-2xl p-6 shadow-2xl`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`${scoreLabel}! Match score: ${currentScore} out of 100`}
              >
                {/* Score Label */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black text-white mb-2"
                  aria-hidden="true"
                >
                  {scoreLabel}
                </motion.div>
                
                <div className="text-sm font-medium text-white/80 uppercase tracking-wide mb-2">
                  Match Score
                </div>
                <div className="text-5xl font-bold text-white tabular-nums">
                  <span aria-hidden="true">{currentScore}</span>
                  <span className="text-2xl" aria-hidden="true">/100</span>
                  <span className="sr-only">{currentScore} out of 100</span>
                </div>
                
                {/* Emoji feedback based on score */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 text-2xl"
                  aria-hidden="true"
                >
                  {currentScore >= 95 ? '🎨✨🏆' : 
                   currentScore >= 90 ? '🎨✨' : 
                   currentScore >= 80 ? '🎯👍' : 
                   currentScore >= 60 ? '👀' : '🤔'}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-3"
            role="group"
            aria-label="Game actions"
          >
            {mode === 'rush' && isTimerRunning ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={timeRemaining === 0}
                className="game-button flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-orange-900"
                aria-label="Submit your color mix and get next target"
              >
                Submit & Next <span aria-hidden="true">→</span>
              </motion.button>
            ) : mode === 'rush' && !isTimerRunning && rushScore === 0 ? null : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="game-button flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-900"
                  aria-label="Check how well your mix matches the target color"
                >
                  Check Match
                </motion.button>
                
                {mode === 'daily' && currentScore > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="game-button bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                    aria-label="Share your daily challenge results"
                  >
                    <Share2 size={24} aria-hidden="true" />
                    <span className="sr-only">Share results</span>
                  </motion.button>
                )}
                
                {mode !== 'daily' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNewRound}
                    className="game-button flex-1 bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
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
