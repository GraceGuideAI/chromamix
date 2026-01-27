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
      {/* Back Button (when in game) */}
      {mode !== 'menu' && (
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setMode('menu')}
          className="fixed top-6 left-6 bg-white/20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-white/30 transition-colors z-50"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
      )}

      {/* Main Content */}
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        {mode === 'menu' ? (
          <GameModes />
        ) : (
          <MixingBoard />
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-white/50 text-sm">
        Made with 🎨 by ChromaMix
      </div>
    </main>
  );
}
