'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '@/store/gameStore';
import { getColorName } from '@/utils/colorPhysics';
import confetti from 'canvas-confetti';

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
  } = useGameStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Timer effect for rush mode
  useEffect(() => {
    if (mode === 'rush' && isTimerRunning) {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [mode, isTimerRunning, tickTimer]);

  // Canvas animation for color mixing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    gradient.addColorStop(0.5, currentMix + '88'); // Semi-transparent
    gradient.addColorStop(1, currentMix + '44');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [currentMix]);

  const handleSubmit = () => {
    submitMix();
    
    // Confetti for high scores
    if (currentScore > 85) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Timer for Rush Mode */}
      {mode === 'rush' && (
        <motion.div 
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className={`text-4xl font-bold ${timeRemaining < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeRemaining}s
          </div>
        </motion.div>
      )}

      {/* Target Color Display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 space-y-3"
      >
        <div className="text-center text-sm font-medium text-white/60 uppercase tracking-wide">
          Target Color
        </div>
        <div 
          className="w-full h-32 rounded-2xl shadow-2xl border-4 border-white/20"
          style={{ backgroundColor: targetColor }}
        />
        <div className="text-center text-lg font-semibold text-white">
          {getColorName(targetColor)}
        </div>
      </motion.div>

      {/* Color Mixing Canvas */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 space-y-3"
      >
        <div className="text-center text-sm font-medium text-white/60 uppercase tracking-wide">
          Your Mix
        </div>
        <div className="relative w-full h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
          <canvas
            ref={canvasRef}
            width={400}
            height={128}
            className="w-full h-full"
          />
        </div>
        <div className="text-center text-lg font-semibold text-white">
          {getColorName(currentMix)}
        </div>
      </motion.div>

      {/* Color Sliders */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {sliders.map((slider, idx) => (
          <motion.div
            key={slider.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">{slider.label}</span>
              <span className="text-white/80 font-mono">{slider.amount}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={slider.amount}
                onChange={(e) => updateSlider(slider.id, Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${slider.baseColor} 0%, ${slider.baseColor}88 ${slider.amount}%, #ffffff22 ${slider.amount}%, #ffffff22 100%)`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Score Display */}
      {currentScore > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 shadow-2xl"
        >
          <div className="text-sm font-medium text-white/80 uppercase tracking-wide mb-2">
            Match Score
          </div>
          <div className="text-5xl font-bold text-white">
            {currentScore}
            <span className="text-2xl">/100</span>
          </div>
          {currentScore >= 90 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-lg font-semibold text-white"
            >
              🎨 Perfect Mix!
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={timeRemaining === 0 && mode === 'rush'}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Match
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={newRound}
          className="flex-1 bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-6 rounded-2xl shadow-xl"
        >
          New Round
        </motion.button>
      </div>
    </div>
  );
}
