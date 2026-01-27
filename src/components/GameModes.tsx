'use client';

import { motion } from 'framer-motion';
import { Calendar, Zap, Trophy } from 'lucide-react';
import useGameStore from '@/store/gameStore';

export default function GameModes() {
  const { setMode, bestScore } = useGameStore();

  const modes = [
    {
      id: 'daily',
      title: 'Daily Target',
      description: 'Same color challenge for everyone today',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'rush',
      title: 'Rush Mode',
      description: '60 seconds to match as many colors as possible',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Logo / Title */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-3"
      >
        <h1 className="text-6xl font-black text-white tracking-tight">
          ChromaMix
        </h1>
        <p className="text-xl text-white/70">
          Mix colors, match targets, master the palette
        </p>
      </motion.div>

      {/* Best Score */}
      {bestScore > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-300" />
            <div>
              <div className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Best Score
              </div>
              <div className="text-3xl font-bold text-white">
                {bestScore}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Mode Selection */}
      <div className="space-y-4">
        {modes.map((mode, idx) => {
          const Icon = mode.icon;
          
          return (
            <motion.button
              key={mode.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode(mode.id as any)}
              className={`w-full bg-gradient-to-r ${mode.gradient} p-6 rounded-3xl shadow-2xl text-left space-y-2 group`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">
                    {mode.title}
                  </h3>
                  <p className="text-white/80">
                    {mode.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* How to Play */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-3"
      >
        <h3 className="text-lg font-bold text-white">How to Play</h3>
        <ul className="space-y-2 text-white/80">
          <li className="flex items-start gap-3">
            <span className="text-2xl">🎨</span>
            <span>Adjust the Red, Yellow, and Blue sliders to mix your color</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <span>Try to match the target color as closely as possible</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl">⭐</span>
            <span>Score 90+ for a perfect match and confetti celebration!</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
