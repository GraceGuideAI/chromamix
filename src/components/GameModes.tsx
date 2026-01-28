'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, Trophy, Flame, Award, ChevronRight, Lock } from 'lucide-react';
import useGameStore, { ACHIEVEMENTS, getTimeUntilNewDaily, GameMode } from '@/store/gameStore';

export default function GameModes() {
  const { setMode, loadData, persistentData, currentStreak, longestStreak, achievements } = useGameStore();
  const [showAchievements, setShowAchievements] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilNewDaily());
  const [announcement, setAnnouncement] = useState('');
  
  const headingRef = useRef<HTMLHeadingElement>(null);
  const achievementsButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Screen reader announcement helper
  const announce = useCallback((message: string) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 50);
  }, []);

  // Load persistent data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Focus heading on mount for screen readers
  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Update countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNewDaily());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Focus management for achievements modal
  useEffect(() => {
    if (showAchievements) {
      closeButtonRef.current?.focus();
    } else {
      achievementsButtonRef.current?.focus();
    }
  }, [showAchievements]);

  // Trap focus within modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowAchievements(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const rushHighScore = persistentData.rushHighScore;
  const totalGames = persistentData.totalGamesPlayed;
  
  // Check if daily was completed today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const dailyCompleted = persistentData.dailyStats[todayStr]?.completed || false;
  const dailyBestScore = persistentData.dailyStats[todayStr]?.bestScore || 0;

  const handleModeSelect = useCallback((modeId: GameMode, modeTitle: string) => {
    announce(`Starting ${modeTitle}. Loading game board.`);
    setMode(modeId);
  }, [announce, setMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, modeId: GameMode, modeTitle: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleModeSelect(modeId, modeTitle);
    }
  }, [handleModeSelect]);

  const modes = [
    {
      id: 'daily' as GameMode,
      title: 'Daily Target',
      description: dailyCompleted 
        ? `Completed! Score: ${dailyBestScore}` 
        : 'Match today\'s target color',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      badge: dailyCompleted ? '✓' : null,
      subtitle: `New color in ${countdown.hours}h ${countdown.minutes}m`,
      shortcut: '1',
    },
    {
      id: 'rush' as GameMode,
      title: 'Rush Mode',
      description: rushHighScore > 0 
        ? `High Score: ${rushHighScore}` 
        : '60 seconds to match colors',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
      badge: null,
      subtitle: 'Combo scoring • Beat your best!',
      shortcut: '2',
    },
  ];

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if modal is open or user is typing
      if (showAchievements) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Check for mode shortcuts
      if (e.key === '1') {
        e.preventDefault();
        handleModeSelect('daily', 'Daily Target');
      } else if (e.key === '2') {
        e.preventDefault();
        handleModeSelect('rush', 'Rush Mode');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showAchievements, handleModeSelect]);

  return (
    <div 
      className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6"
      role="main"
      aria-labelledby="game-title"
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

      {/* Skip link target */}
      <div id="game-modes" tabIndex={-1} className="sr-only">
        Game mode selection
      </div>

      {/* Logo / Title - Compact */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-1 sm:space-y-2"
      >
        <h1 
          id="game-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-4xl sm:text-5xl font-black text-white tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-purple-900 rounded-lg"
        >
          ChromaMix
        </h1>
        <p className="text-sm sm:text-lg text-white/70">
          Mix colors, match targets, master the palette
        </p>
      </motion.header>

      {/* Stats Overview - Compact inline */}
      {(currentStreak > 0 || rushHighScore > 0 || totalGames > 0) && (
        <motion.section
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-2 sm:p-3"
          aria-labelledby="stats-heading"
        >
          <h2 id="stats-heading" className="sr-only">Your Statistics</h2>
          <div className="flex items-center justify-around text-center">
            {/* Streak */}
            <div role="group" aria-label={`${currentStreak} day streak`} className="flex items-center gap-1">
              <Flame size={16} className="text-orange-400" aria-hidden="true" />
              <span className="text-lg sm:text-xl font-bold tabular-nums text-white">{currentStreak}</span>
              <span className="text-xs text-white/50 hidden sm:inline">streak</span>
            </div>
            
            {/* Rush High Score */}
            <div role="group" aria-label={`Rush mode high score: ${rushHighScore}`} className="flex items-center gap-1">
              <Trophy size={16} className="text-yellow-400" aria-hidden="true" />
              <span className="text-lg sm:text-xl font-bold tabular-nums text-white">{rushHighScore}</span>
              <span className="text-xs text-white/50 hidden sm:inline">best</span>
            </div>
            
            {/* Achievements */}
            <motion.button
              ref={achievementsButtonRef}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAchievements(true);
                announce(`Opening achievements. ${unlockedCount} of ${ACHIEVEMENTS.length} unlocked.`);
              }}
              className="flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1"
              aria-label={`View achievements. ${unlockedCount} of ${ACHIEVEMENTS.length} unlocked.`}
              aria-haspopup="dialog"
            >
              <Award size={16} className="text-purple-400" aria-hidden="true" />
              <span className="text-lg sm:text-xl font-bold tabular-nums text-white">{unlockedCount}/{ACHIEVEMENTS.length}</span>
            </motion.button>
          </div>
        </motion.section>
      )}

      {/* Game Mode Selection - Compact */}
      <nav aria-label="Game mode selection">
        <h2 className="sr-only">Choose a game mode</h2>
        <ul className="space-y-2 sm:space-y-3 list-none p-0 m-0" role="list">
          {modes.map((mode, idx) => {
            const Icon = mode.icon;
            
            return (
              <motion.li
                key={mode.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
              >
                <button
                  onClick={() => handleModeSelect(mode.id, mode.title)}
                  onKeyDown={(e) => handleKeyDown(e, mode.id, mode.title)}
                  className={`game-mode-button w-full bg-gradient-to-r ${mode.gradient} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl text-left group relative overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-900 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                  aria-label={`${mode.title}: ${mode.description}. ${mode.subtitle}. Press ${mode.shortcut} as keyboard shortcut.`}
                  aria-describedby={`mode-desc-${mode.id}`}
                >
                  {/* Completed badge */}
                  {mode.badge && (
                    <div 
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/30 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold"
                      aria-hidden="true"
                    >
                      {mode.badge}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl group-hover:scale-110 group-focus-visible:scale-110 transition-transform"
                      aria-hidden="true"
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        {mode.title}
                        <kbd 
                          className="hidden sm:inline-block text-xs font-mono bg-white/20 px-1.5 py-0.5 rounded"
                          aria-hidden="true"
                        >
                          {mode.shortcut}
                        </kbd>
                      </h3>
                      <p 
                        id={`mode-desc-${mode.id}`}
                        className="text-white/80 text-xs sm:text-sm truncate"
                      >
                        {mode.description}
                      </p>
                    </div>
                    <ChevronRight 
                      className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 group-focus-visible:text-white transition-all flex-shrink-0" 
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* How to Play - Compact, collapsed on mobile */}
      <motion.section
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
        aria-labelledby="how-to-play-heading"
      >
        <h2 
          id="how-to-play-heading"
          className="text-sm sm:text-base font-bold text-white mb-2"
        >
          How to Play
        </h2>
        {/* Compact inline steps on mobile */}
        <div className="flex flex-wrap gap-2 sm:hidden text-xs text-white/70">
          <span><span aria-hidden="true">🎨</span> Mix colors</span>
          <span>→</span>
          <span><span aria-hidden="true">🎯</span> Match target</span>
          <span>→</span>
          <span><span aria-hidden="true">⭐</span> Score 80+</span>
        </div>
        {/* Full steps on larger screens */}
        <ol className="hidden sm:block space-y-2 text-white/80 list-none p-0 m-0 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0" aria-hidden="true">🎨</span>
            <span>Adjust the sliders to mix your color</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0" aria-hidden="true">🎯</span>
            <span>Match the target as closely as possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lg flex-shrink-0" aria-hidden="true">⭐</span>
            <span>Score 80+ to complete, build combos in Rush!</span>
          </li>
        </ol>
      </motion.section>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAchievements(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievements-title"
            onKeyDown={handleModalKeyDown}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
              role="document"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  id="achievements-title"
                  className="text-2xl font-bold text-white flex items-center gap-2"
                >
                  <Award className="text-purple-400" aria-hidden="true" />
                  Achievements
                </h2>
                <div className="text-white/60 text-sm" aria-live="polite">
                  {unlockedCount}/{ACHIEVEMENTS.length} unlocked
                </div>
              </div>
              
              <ul className="space-y-3 list-none p-0 m-0" role="list">
                {achievements.map((achievement, idx) => (
                  <motion.li
                    key={achievement.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                    aria-label={`${achievement.name}: ${achievement.description}. ${achievement.unlocked ? 'Unlocked' : 'Locked'}`}
                  >
                    <div 
                      className={`text-3xl ${!achievement.unlocked && 'grayscale opacity-30'}`}
                      aria-hidden="true"
                    >
                      {achievement.unlocked ? achievement.icon : <Lock size={24} className="text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>
                        {achievement.name}
                      </div>
                      <div className={`text-sm ${achievement.unlocked ? 'text-white/70' : 'text-white/30'}`}>
                        {achievement.description}
                      </div>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-purple-400 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {achievement.unlocked && (
                      <div className="text-green-400" aria-hidden="true">✓</div>
                    )}
                  </motion.li>
                ))}
              </ul>
              
              <motion.button
                ref={closeButtonRef}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAchievements(false)}
                className="w-full mt-6 bg-white/10 text-white font-bold py-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                aria-label="Close achievements dialog"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility statement - hidden on small screens */}
      <footer className="hidden sm:block text-center text-xs text-white/40 pt-2">
        <p>
          ChromaMix is designed to be accessible to all players.
        </p>
      </footer>
    </div>
  );
}
