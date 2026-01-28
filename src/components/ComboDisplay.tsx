'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Target, TrendingUp } from 'lucide-react';
import { getComboTier, getComboTierDisplay, getComboMultiplier } from '@/utils/timeBonus';

interface ComboDisplayProps {
  comboCount: number;
  maxCombo: number;
  streakCount: number;
  isActive?: boolean;
}

export default function ComboDisplay({ 
  comboCount, 
  maxCombo, 
  streakCount,
  isActive = true,
}: ComboDisplayProps) {
  const tier = getComboTier(comboCount);
  const tierDisplay = tier ? getComboTierDisplay(tier) : null;
  const multiplier = getComboMultiplier(comboCount);

  return (
    <div className="flex items-center gap-3">
      {/* Combo Counter with Tier Badge */}
      <div className="relative">
        <motion.div
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            ${tierDisplay 
              ? `bg-gradient-to-r ${tierDisplay.colorClass}` 
              : 'bg-white/10'
            }
            transition-all duration-300
          `}
          animate={tierDisplay && isActive ? {
            boxShadow: [
              `0 0 0 0 ${tierDisplay.glowColor}`,
              `0 0 15px 3px ${tierDisplay.glowColor}`,
              `0 0 0 0 ${tierDisplay.glowColor}`,
            ],
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Flame 
            size={16} 
            className={tierDisplay ? 'text-white' : 'text-purple-400'}
            aria-hidden="true"
          />
          <span 
            className={`
              text-lg font-bold tabular-nums
              ${tierDisplay ? 'text-white' : 'text-purple-400'}
            `}
          >
            {comboCount}x
          </span>
          
          {/* Multiplier Badge */}
          {multiplier > 1 && (
            <span className="text-xs font-semibold text-white/80 ml-1">
              ({multiplier}×pts)
            </span>
          )}
        </motion.div>
        
        {/* Tier Label - Floating */}
        <AnimatePresence>
          {tierDisplay && isActive && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: -8, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span className="text-xs font-black text-white drop-shadow-lg">
                {tierDisplay.emoji} {tierDisplay.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Max Combo Indicator */}
      {maxCombo > 0 && maxCombo > comboCount && (
        <div 
          className="flex items-center gap-1 text-sm text-white/50"
          title={`Best combo this session: ${maxCombo}x`}
        >
          <TrendingUp size={12} aria-hidden="true" />
          <span className="tabular-nums">{maxCombo}x</span>
        </div>
      )}
      
      {/* Streak Indicator */}
      {streakCount > 0 && (
        <div 
          className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-lg"
          title={`Successful matches in a row: ${streakCount}`}
        >
          <Target size={14} className="text-orange-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-orange-400 tabular-nums">
            {streakCount}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact combo badge for inline display
 */
interface ComboBadgeProps {
  comboCount: number;
  showLabel?: boolean;
}

export function ComboBadge({ comboCount, showLabel = false }: ComboBadgeProps) {
  const tier = getComboTier(comboCount);
  const tierDisplay = tier ? getComboTierDisplay(tier) : null;

  if (comboCount < 2) {
    return null;
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        text-xs font-bold
        ${tierDisplay 
          ? `bg-gradient-to-r ${tierDisplay.colorClass} text-white` 
          : 'bg-purple-500/30 text-purple-300'
        }
      `}
    >
      {tierDisplay?.emoji || '🔥'} 
      {showLabel && tierDisplay ? tierDisplay.label : `${comboCount}x`}
    </motion.span>
  );
}

/**
 * Combo Announcement - Full-screen overlay for major combo milestones
 */
interface ComboAnnouncementProps {
  tier: ReturnType<typeof getComboTier>;
  isVisible: boolean;
  comboCount: number;
}

export function ComboAnnouncement({ tier, isVisible, comboCount }: ComboAnnouncementProps) {
  const tierDisplay = tier ? getComboTierDisplay(tier) : null;

  if (!tierDisplay) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-r ${tierDisplay.colorClass}`}
            aria-hidden="true"
          />
          
          {/* Announcement Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 1],
              rotate: [-10, 5, 0],
            }}
            exit={{ 
              scale: 1.5, 
              opacity: 0,
              y: -50,
            }}
            transition={{
              duration: 0.6,
              times: [0, 0.6, 1],
              ease: 'easeOut',
            }}
            className="text-center"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{
                textShadow: [
                  `0 0 20px ${tierDisplay.glowColor}`,
                  `0 0 60px ${tierDisplay.glowColor}`,
                  `0 0 20px ${tierDisplay.glowColor}`,
                ],
              }}
              transition={{
                duration: 0.4,
                repeat: 2,
              }}
              className="space-y-1"
            >
              <div className="text-6xl" aria-hidden="true">
                {tierDisplay.emoji}
              </div>
              <div className={`
                text-4xl sm:text-5xl font-black 
                bg-gradient-to-r ${tierDisplay.colorClass} 
                bg-clip-text text-transparent
                drop-shadow-2xl
              `}>
                {tierDisplay.label}
              </div>
              <div className="text-2xl font-bold text-white/80">
                {comboCount}x Combo
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Points Earned Display - Shows base + bonus breakdown
 */
interface PointsEarnedProps {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  isVisible: boolean;
}

export function PointsEarned({ 
  basePoints, 
  bonusPoints, 
  totalPoints, 
  isVisible 
}: PointsEarnedProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-center justify-center gap-2 text-lg"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="font-semibold text-white"
          >
            +{basePoints}
          </motion.span>
          
          {bonusPoints > 0 && (
            <>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-yellow-400 font-bold"
              >
                +{bonusPoints}
              </motion.span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-yellow-400/70"
              >
                (combo)
              </motion.span>
            </>
          )}
          
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-xl font-black text-green-400 ml-2"
          >
            = {totalPoints}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Rush Stats Bar - Compact display of all rush mode statistics
 */
interface RushStatsBarProps {
  score: number;
  rounds: number;
  combo: number;
  maxCombo: number;
  totalTimeEarned: number;
}

export function RushStatsBar({ 
  score, 
  rounds, 
  combo, 
  maxCombo, 
  totalTimeEarned 
}: RushStatsBarProps) {
  const tier = getComboTier(combo);
  const tierDisplay = tier ? getComboTierDisplay(tier) : null;

  return (
    <div 
      className="flex items-center justify-between gap-2 text-sm"
      role="group"
      aria-label="Rush mode statistics"
    >
      {/* Score */}
      <div className="flex items-center gap-1">
        <Zap size={14} className="text-orange-400" aria-hidden="true" />
        <span className="font-bold text-orange-400 tabular-nums">{score}</span>
      </div>
      
      {/* Rounds */}
      <div className="flex items-center gap-1">
        <Target size={14} className="text-blue-400" aria-hidden="true" />
        <span className="font-bold text-blue-400 tabular-nums">{rounds}</span>
      </div>
      
      {/* Combo */}
      <div className={`
        flex items-center gap-1 px-2 py-0.5 rounded
        ${tierDisplay ? `bg-gradient-to-r ${tierDisplay.colorClass}` : 'bg-white/10'}
      `}>
        <Flame 
          size={14} 
          className={tierDisplay ? 'text-white' : 'text-purple-400'} 
          aria-hidden="true" 
        />
        <span className={`
          font-bold tabular-nums
          ${tierDisplay ? 'text-white' : 'text-purple-400'}
        `}>
          {combo}x
        </span>
      </div>
      
      {/* Time Earned */}
      {totalTimeEarned > 0 && (
        <div className="flex items-center gap-1 text-green-400">
          <span className="text-xs">⏱️</span>
          <span className="font-semibold tabular-nums">+{totalTimeEarned}s</span>
        </div>
      )}
    </div>
  );
}
