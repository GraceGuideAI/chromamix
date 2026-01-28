'use client';

import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import useGameStore from '@/store/gameStore';
import GameModes from '@/components/GameModes';
import MixingBoard from '@/components/MixingBoard';

export default function Home() {
  const { mode, setMode } = useGameStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Back Button (when in game) - Compact on mobile */}
      {mode !== 'menu' && (
        <motion.button
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setMode('menu')}
          className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full text-white hover:bg-white/30 transition-colors z-50"
          aria-label="Back to menu"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}

      {/* Main Content - Aligned to top on mobile for no scroll */}
      <div className="container mx-auto min-h-screen flex items-start sm:items-center justify-center pt-12 sm:pt-0">
        {mode === 'menu' ? (
          <GameModes />
        ) : (
          <MixingBoard />
        )}
      </div>

      {/* Footer - Hidden on mobile */}
      <div className="hidden sm:block fixed bottom-4 left-0 right-0 text-center text-white/50 text-sm">
        Made with 🎨 by ChromaMix
      </div>
    </main>
  );
}
