import { create } from 'zustand';
import { 
  mixColorsSubtractive, 
  calculateColorScore, 
  generateRandomColor,
  getDailyTargetColor 
} from '@/utils/colorPhysics';

export type GameMode = 'menu' | 'daily' | 'rush';

interface ColorSlider {
  id: string;
  label: string;
  baseColor: string;
  amount: number;
}

interface GameState {
  // Game mode
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  
  // Target color
  targetColor: string;
  
  // Color sliders (Red, Yellow, Blue primary colors)
  sliders: ColorSlider[];
  updateSlider: (id: string, amount: number) => void;
  
  // Current mixed color
  currentMix: string;
  updateMix: () => void;
  
  // Score
  currentScore: number;
  bestScore: number;
  
  // Rush mode timer
  timeRemaining: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  
  // Actions
  submitMix: () => void;
  newRound: () => void;
  resetGame: () => void;
}

const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  mode: 'menu',
  targetColor: getDailyTargetColor(),
  
  sliders: [
    { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
    { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
    { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
  ],
  
  currentMix: '#808080',
  currentScore: 0,
  bestScore: 0,
  
  timeRemaining: 60,
  isTimerRunning: false,
  
  // Actions
  setMode: (mode) => {
    const state = get();
    
    if (mode === 'daily') {
      set({ 
        mode, 
        targetColor: getDailyTargetColor(),
        timeRemaining: 0,
        isTimerRunning: false,
      });
    } else if (mode === 'rush') {
      set({ 
        mode, 
        targetColor: generateRandomColor(),
        timeRemaining: 60,
        isTimerRunning: false,
      });
    } else {
      set({ mode });
    }
    
    // Reset sliders
    get().resetGame();
  },
  
  updateSlider: (id, amount) => {
    set((state) => ({
      sliders: state.sliders.map(s => 
        s.id === id ? { ...s, amount: Math.max(0, Math.min(100, amount)) } : s
      ),
    }));
    get().updateMix();
  },
  
  updateMix: () => {
    const { sliders } = get();
    
    const colors = sliders
      .filter(s => s.amount > 0)
      .map(s => ({ hex: s.baseColor, amount: s.amount }));
    
    if (colors.length === 0) {
      set({ currentMix: '#FFFFFF' });
      return;
    }
    
    const mixed = mixColorsSubtractive(colors);
    set({ currentMix: mixed });
  },
  
  submitMix: () => {
    const { currentMix, targetColor, bestScore } = get();
    const score = calculateColorScore(currentMix, targetColor);
    
    set({ 
      currentScore: score,
      bestScore: Math.max(bestScore, score),
    });
  },
  
  newRound: () => {
    const { mode } = get();
    
    set({
      targetColor: mode === 'daily' ? getDailyTargetColor() : generateRandomColor(),
      sliders: [
        { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
        { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
        { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
      ],
      currentMix: '#FFFFFF',
      currentScore: 0,
    });
    
    if (mode === 'rush') {
      set({ timeRemaining: 60 });
      get().startTimer();
    }
  },
  
  resetGame: () => {
    set({
      sliders: [
        { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
        { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
        { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
      ],
      currentMix: '#FFFFFF',
      currentScore: 0,
      timeRemaining: 60,
      isTimerRunning: false,
    });
  },
  
  startTimer: () => {
    set({ isTimerRunning: true });
  },
  
  stopTimer: () => {
    set({ isTimerRunning: false });
  },
  
  tickTimer: () => {
    const { timeRemaining, isTimerRunning } = get();
    
    if (isTimerRunning && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
      
      if (timeRemaining - 1 <= 0) {
        get().stopTimer();
      }
    }
  },
}));

export default useGameStore;
