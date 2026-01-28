'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type ColorScoreResult, hexToRgbValues, getColorHint } from '@/utils/colorPhysics';

interface ColorFeedbackProps {
  scoreResult: ColorScoreResult | null;
  currentMix: string;
  targetHex: string;
  showHints?: boolean;
}

/**
 * Visual feedback component showing color match quality and hints
 */
export function ColorFeedback({ scoreResult, currentMix, targetHex, showHints = true }: ColorFeedbackProps) {
  if (!scoreResult || scoreResult.score === 0) return null;

  const { feedback, score, tier } = scoreResult;
  const hint = showHints && tier !== 'PERFECT' ? getColorHint(currentMix, targetHex) : null;

  // Get colors for visual indicators
  const tierColors: Record<string, string> = {
    PERFECT: 'from-yellow-400 to-amber-500',
    EXCELLENT: 'from-green-400 to-emerald-500',
    GREAT: 'from-blue-400 to-cyan-500',
    GOOD: 'from-purple-400 to-pink-500',
    CLOSE: 'from-orange-400 to-red-400',
    FAR: 'from-gray-400 to-gray-500',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`bg-gradient-to-r ${tierColors[tier]} rounded-xl p-3 sm:p-4 shadow-lg`}
      >
        {/* Main feedback row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Emoji and description */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl" aria-hidden="true">
              {feedback.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-white truncate">
                {feedback.label.replace(/[^\w\s!]/g, '').trim()}
              </div>
              <div className="text-xs sm:text-sm text-white/80 truncate">
                {feedback.description}
              </div>
            </div>
          </div>

          {/* Right: Score */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
              {Math.round(score)}
              <span className="text-base sm:text-lg text-white/70">/100</span>
            </div>
          </div>
        </div>

        {/* Hint row (if available) */}
        {hint && hint.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 pt-2 border-t border-white/20"
          >
            <div className="flex items-center gap-2 text-sm text-white/90">
              <span className="text-base">💡</span>
              <span>{hint.hint}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

interface RGBComparisonProps {
  currentMix: string;
  targetHex: string;
  compact?: boolean;
}

/**
 * Show RGB values comparison between current mix and target
 */
export function RGBComparison({ currentMix, targetHex, compact = false }: RGBComparisonProps) {
  const mixRgb = hexToRgbValues(currentMix);
  const targetRgb = hexToRgbValues(targetHex);

  const channels: Array<{ key: 'r' | 'g' | 'b'; label: string; color: string }> = [
    { key: 'r', label: 'R', color: 'text-red-400' },
    { key: 'g', label: 'G', color: 'text-green-400' },
    { key: 'b', label: 'B', color: 'text-blue-400' },
  ];

  const getDiffIndicator = (current: number, target: number) => {
    const diff = current - target;
    if (Math.abs(diff) <= 5) return { symbol: '✓', color: 'text-green-400' };
    if (diff > 0) return { symbol: '↓', color: 'text-orange-400' };
    return { symbol: '↑', color: 'text-orange-400' };
  };

  if (compact) {
    return (
      <div className="flex gap-2 text-xs text-white/60 justify-center">
        {channels.map(({ key, label, color }) => {
          const diff = getDiffIndicator(mixRgb[key], targetRgb[key]);
          return (
            <span key={key} className={`${color} tabular-nums`}>
              {label}:{mixRgb[key]}
              <span className={`ml-0.5 ${diff.color}`}>{diff.symbol}</span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-2 sm:p-3">
      <div className="text-xs text-white/50 text-center mb-2">RGB Comparison</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {channels.map(({ key, label, color }) => {
          const current = mixRgb[key];
          const target = targetRgb[key];
          const diff = current - target;
          const indicator = getDiffIndicator(current, target);

          return (
            <div key={key} className="space-y-1">
              <div className={`text-sm font-bold ${color}`}>{label}</div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-white/70 tabular-nums">{current}</span>
                <span className={indicator.color}>{indicator.symbol}</span>
                <span className="text-white/40 tabular-nums">{target}</span>
              </div>
              {Math.abs(diff) > 5 && (
                <div className="text-[10px] text-white/40">
                  {diff > 0 ? `-${diff}` : `+${Math.abs(diff)}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ColorDifferenceBarProps {
  score: number;
  showLabel?: boolean;
}

/**
 * Visual bar showing how close the match is
 */
export function ColorDifferenceBar({ score, showLabel = true }: ColorDifferenceBarProps) {
  const getBarColor = (score: number) => {
    if (score >= 95) return 'bg-yellow-400';
    if (score >= 85) return 'bg-green-400';
    if (score >= 70) return 'bg-blue-400';
    if (score >= 50) return 'bg-purple-400';
    if (score >= 25) return 'bg-orange-400';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-white/60">
          <span>Match Quality</span>
          <span className="tabular-nums">{Math.round(score)}%</span>
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getBarColor(score)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
      </div>
    </div>
  );
}

interface QuickFeedbackProps {
  score: number;
}

/**
 * Quick inline feedback text
 */
export function QuickFeedback({ score }: QuickFeedbackProps) {
  const getFeedback = (score: number): { text: string; emoji: string; color: string } => {
    if (score >= 95) return { text: 'Perfect!', emoji: '🏆', color: 'text-yellow-400' };
    if (score >= 85) return { text: 'Excellent!', emoji: '✨', color: 'text-green-400' };
    if (score >= 70) return { text: 'Very close!', emoji: '🎯', color: 'text-blue-400' };
    if (score >= 50) return { text: 'Getting there!', emoji: '👍', color: 'text-purple-400' };
    if (score >= 25) return { text: 'Keep trying!', emoji: '🔄', color: 'text-orange-400' };
    return { text: 'Not quite', emoji: '🤔', color: 'text-gray-400' };
  };

  const feedback = getFeedback(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1.5 ${feedback.color}`}
    >
      <span aria-hidden="true">{feedback.emoji}</span>
      <span className="font-semibold">{feedback.text}</span>
    </motion.div>
  );
}

interface ColorSwatchComparisonProps {
  currentMix: string;
  targetHex: string;
  targetName: string;
  mixName?: string;
  score?: number;
}

/**
 * Side-by-side swatch comparison with labels
 */
export function ColorSwatchComparison({
  currentMix,
  targetHex,
  targetName,
  mixName,
  score,
}: ColorSwatchComparisonProps) {
  const getContrastColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden shadow-lg">
      {/* Target */}
      <div 
        className="aspect-[4/3] flex flex-col items-center justify-center p-2"
        style={{ backgroundColor: targetHex }}
      >
        <div 
          className="text-xs uppercase tracking-wide opacity-70"
          style={{ color: getContrastColor(targetHex) }}
        >
          Target
        </div>
        <div 
          className="text-sm font-bold text-center"
          style={{ color: getContrastColor(targetHex) }}
        >
          {targetName}
        </div>
      </div>

      {/* Your Mix */}
      <div 
        className="aspect-[4/3] flex flex-col items-center justify-center p-2"
        style={{ backgroundColor: currentMix }}
      >
        <div 
          className="text-xs uppercase tracking-wide opacity-70"
          style={{ color: getContrastColor(currentMix) }}
        >
          Your Mix
        </div>
        {mixName && (
          <div 
            className="text-sm font-bold text-center"
            style={{ color: getContrastColor(currentMix) }}
          >
            {mixName}
          </div>
        )}
        {score !== undefined && score > 0 && (
          <div 
            className="text-lg font-bold mt-1"
            style={{ color: getContrastColor(currentMix) }}
          >
            {Math.round(score)}%
          </div>
        )}
      </div>
    </div>
  );
}
