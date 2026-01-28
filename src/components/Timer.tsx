'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { getTimerUrgency, getTimerColors } from '@/utils/timeBonus';

interface TimerProps {
  timeRemaining: number;
  isRunning: boolean;
  lastTimeBonus?: number | null;
  showTimeBonus?: boolean;
}

export default function Timer({ 
  timeRemaining, 
  isRunning,
  lastTimeBonus = null,
  showTimeBonus = false,
}: TimerProps) {
  const urgency = getTimerUrgency(timeRemaining);
  const colors = getTimerColors(urgency);
  
  // Format time with leading zeros - clamp to 0 minimum to prevent negative display
  const formatTime = (seconds: number): string => {
    const clampedSeconds = Math.max(0, seconds);
    const mins = Math.floor(clampedSeconds / 60);
    const secs = clampedSeconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };
  
  // Clamped time for display
  const displayTime = Math.max(0, timeRemaining);

  return (
    <div className="relative">
      {/* Main Timer Display */}
      <motion.div
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-xl
          ${colors.bgClass}
          transition-colors duration-300
        `}
        animate={colors.pulseAnimation ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 0 0 ${colors.glowColor}`,
            `0 0 20px 4px ${colors.glowColor}`,
            `0 0 0 0 ${colors.glowColor}`,
          ],
        } : {}}
        transition={colors.pulseAnimation ? {
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        } : {}}
        role="timer"
        aria-label={`Time remaining: ${displayTime} seconds`}
      >
        {/* Clock Icon */}
        <Clock 
          size={18} 
          className={`${colors.textClass} opacity-70 transition-colors duration-300`}
          aria-hidden="true"
        />
        
        {/* Time Display */}
        <span 
          className={`
            text-2xl sm:text-3xl font-bold tabular-nums
            ${colors.textClass}
            transition-colors duration-300
          `}
          aria-hidden="true"
        >
          {formatTime(displayTime)}
        </span>
        
        {/* Screen reader text */}
        <span className="sr-only">{displayTime} seconds remaining</span>
        
        {/* Time Extension Animation */}
        <AnimatePresence>
          {showTimeBonus && lastTimeBonus && lastTimeBonus > 0 && (
            <motion.div
              key="time-bonus"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute -top-2 right-0 pointer-events-none"
            >
              <span className="text-lg font-bold text-green-400 drop-shadow-lg whitespace-nowrap">
                +{lastTimeBonus}s
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Urgency Glow Effect */}
      {(urgency === 'danger' || urgency === 'critical') && isRunning && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl"
          animate={{
            boxShadow: [
              `0 0 10px 2px ${colors.glowColor}`,
              `0 0 25px 8px ${colors.glowColor}`,
              `0 0 10px 2px ${colors.glowColor}`,
            ],
          }}
          transition={{
            duration: urgency === 'critical' ? 0.5 : 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Compact Timer variant for inline display
 */
export function TimerCompact({ 
  timeRemaining, 
  isRunning,
  lastTimeBonus = null,
  showTimeBonus = false,
}: TimerProps) {
  // Clamp to 0 minimum to prevent negative display
  const displayTime = Math.max(0, timeRemaining);
  const urgency = getTimerUrgency(displayTime);
  const colors = getTimerColors(urgency);

  return (
    <div className="relative inline-flex items-center gap-1">
      <Clock 
        size={14} 
        className={`${colors.textClass} opacity-60`}
        aria-hidden="true"
      />
      <motion.span 
        className={`
          text-lg font-bold tabular-nums
          ${colors.textClass}
        `}
        animate={colors.pulseAnimation ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={colors.pulseAnimation ? {
          duration: 0.5,
          repeat: Infinity,
        } : {}}
        role="timer"
        aria-label={`${displayTime} seconds`}
      >
        {displayTime}s
      </motion.span>
      
      {/* Floating Time Bonus */}
      <AnimatePresence>
        {showTimeBonus && lastTimeBonus && lastTimeBonus > 0 && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="ml-1 text-sm font-bold text-green-400"
          >
            +{lastTimeBonus}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Time Extension Popup - shown when time is added
 */
interface TimeExtensionPopupProps {
  seconds: number;
  isVisible: boolean;
  position?: 'center' | 'top' | 'bottom';
}

export function TimeExtensionPopup({ 
  seconds, 
  isVisible,
  position = 'center',
}: TimeExtensionPopupProps) {
  const positionClasses = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-20 left-1/2 -translate-x-1/2',
    bottom: 'bottom-20 left-1/2 -translate-x-1/2',
  };

  return (
    <AnimatePresence>
      {isVisible && seconds > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: -30,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className={`
            fixed ${positionClasses[position]} z-50 pointer-events-none
          `}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px 4px rgba(34, 197, 94, 0.3)',
                '0 0 40px 8px rgba(34, 197, 94, 0.5)',
                '0 0 20px 4px rgba(34, 197, 94, 0.3)',
              ],
            }}
            transition={{
              duration: 0.6,
              repeat: 2,
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">⏱️</span>
              <span className="text-2xl font-black text-white">
                +{seconds}s
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
