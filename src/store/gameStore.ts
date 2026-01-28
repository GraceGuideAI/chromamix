import { create } from 'zustand';
import { 
  mixColorsSubtractive, 
  calculateColorScore, 
  generateRandomColor,
  getDailyTargetColor,
  type TargetColor,
} from '@/utils/colorPhysics';

export type GameMode = 'menu' | 'daily' | 'rush';

interface ColorSlider {
  id: string;
  label: string;
  baseColor: string;
  amount: number;
}

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_match', name: 'First Steps', description: 'Submit your first color mix', icon: '🎨' },
  { id: 'perfect_match', name: 'Perfect Eye', description: 'Score 95 or higher', icon: '👁️' },
  { id: 'great_match', name: 'Color Savant', description: 'Score 90 or higher', icon: '✨' },
  { id: 'streak_3', name: 'On Fire', description: 'Get a 3-day streak', icon: '🔥' },
  { id: 'streak_7', name: 'Dedicated Artist', description: 'Get a 7-day streak', icon: '🏆' },
  { id: 'streak_30', name: 'Master Mixer', description: 'Get a 30-day streak', icon: '👑' },
  { id: 'rush_100', name: 'Speed Demon', description: 'Score 100+ in Rush Mode', icon: '⚡' },
  { id: 'rush_500', name: 'Rush Master', description: 'Score 500+ in Rush Mode', icon: '🚀' },
  { id: 'rush_1000', name: 'Legendary', description: 'Score 1000+ in Rush Mode', icon: '💎' },
  { id: 'combo_3', name: 'Combo Starter', description: 'Get a 3x combo in Rush', icon: '🔗' },
  { id: 'combo_5', name: 'Combo King', description: 'Get a 5x combo in Rush', icon: '⛓️' },
  { id: 'daily_complete', name: 'Daily Devotee', description: 'Complete a daily challenge', icon: '📅' },
];

// Score threshold labels
export type ScoreLabel = 'PERFECT!' | 'Great!' | 'Good' | 'Try again';

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 95) return 'PERFECT!';
  if (score >= 80) return 'Great!';
  if (score >= 60) return 'Good';
  return 'Try again';
}

export function getScoreLabelColor(label: ScoreLabel): string {
  switch (label) {
    case 'PERFECT!': return 'from-yellow-400 to-amber-500';
    case 'Great!': return 'from-green-400 to-emerald-500';
    case 'Good': return 'from-blue-400 to-cyan-500';
    case 'Try again': return 'from-gray-400 to-gray-500';
  }
}

// Persistence types
interface DailyStats {
  date: string; // YYYY-MM-DD
  attempts: number;
  bestScore: number;
  completed: boolean;
  sliderSnapshot?: { red: number; yellow: number; blue: number; white?: number };
}

interface PersistentData {
  dailyStats: Record<string, DailyStats>;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  rushHighScore: number;
  rushTotalScore: number;
  achievements: Record<string, { unlocked: boolean; unlockedAt?: number }>;
  totalGamesPlayed: number;
}

// Storage helpers
const STORAGE_KEY = 'chromamix_data';

function loadPersistentData(): PersistentData {
  if (typeof window === 'undefined') {
    return getDefaultPersistentData();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load persistent data:', e);
  }
  
  return getDefaultPersistentData();
}

function getDefaultPersistentData(): PersistentData {
  return {
    dailyStats: {},
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    rushHighScore: 0,
    rushTotalScore: 0,
    achievements: {},
    totalGamesPlayed: 0,
  };
}

function savePersistentData(data: PersistentData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save persistent data:', e);
  }
}

function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

// Calculate time until next daily color
export function getTimeUntilNewDaily(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

interface GameState {
  // Game mode
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  
  // Target color (now includes name from PTS catalog)
  targetColor: TargetColor;
  
  // Color sliders
  sliders: ColorSlider[];
  updateSlider: (id: string, amount: number) => void;
  
  // Current mixed color
  currentMix: string;
  updateMix: () => void;
  
  // Score
  currentScore: number;
  bestScore: number;
  
  // Rush mode
  timeRemaining: number;
  isTimerRunning: boolean;
  rushScore: number; // Accumulated score in rush mode
  rushRounds: number; // Number of rounds completed
  rushCombo: number; // Current combo multiplier
  rushMaxCombo: number; // Best combo this session
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  
  // Persistence
  persistentData: PersistentData;
  loadData: () => void;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  
  // Daily
  dailyAttempts: number;
  dailyBestScore: number;
  dailyCompleted: boolean;
  
  // Achievements
  achievements: Achievement[];
  newlyUnlockedAchievement: Achievement | null;
  clearNewAchievement: () => void;
  
  // Actions
  submitMix: () => void;
  newRound: () => void;
  resetGame: () => void;
  
  // Share
  generateShareText: () => string;
  shareResults: () => Promise<boolean>;
}

const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  mode: 'menu',
  targetColor: getDailyTargetColor(),
  
  sliders: [
    { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
    { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
    { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
    { id: 'white', label: 'White', baseColor: '#FFFFFF', amount: 0 },
  ],
  
  currentMix: '#FFFFFF',
  currentScore: 0,
  bestScore: 0,
  
  // Rush mode state
  timeRemaining: 60,
  isTimerRunning: false,
  rushScore: 0,
  rushRounds: 0,
  rushCombo: 0,
  rushMaxCombo: 0,
  
  // Persistence
  persistentData: getDefaultPersistentData(),
  
  // Streaks
  currentStreak: 0,
  longestStreak: 0,
  
  // Daily
  dailyAttempts: 0,
  dailyBestScore: 0,
  dailyCompleted: false,
  
  // Achievements
  achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
  newlyUnlockedAchievement: null,
  
  clearNewAchievement: () => set({ newlyUnlockedAchievement: null }),
  
  loadData: () => {
    const data = loadPersistentData();
    const today = getTodayString();
    const yesterday = getYesterdayString();
    
    // Calculate current streak
    let currentStreak = data.currentStreak;
    if (data.lastPlayedDate !== today && data.lastPlayedDate !== yesterday) {
      // Streak broken
      currentStreak = 0;
    }
    
    // Load today's stats
    const todayStats = data.dailyStats[today] || {
      date: today,
      attempts: 0,
      bestScore: 0,
      completed: false,
    };
    
    // Map achievements
    const achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: data.achievements[a.id]?.unlocked || false,
      unlockedAt: data.achievements[a.id]?.unlockedAt,
    }));
    
    set({
      persistentData: data,
      currentStreak,
      longestStreak: data.longestStreak,
      dailyAttempts: todayStats.attempts,
      dailyBestScore: todayStats.bestScore,
      dailyCompleted: todayStats.completed,
      bestScore: data.rushHighScore,
      achievements,
    });
  },
  
  // Actions
  setMode: (mode) => {
    const state = get();
    
    // Load persistent data when entering a mode
    state.loadData();
    
    if (mode === 'daily') {
      const today = getTodayString();
      const todayStats = state.persistentData.dailyStats[today];
      
      set({ 
        mode, 
        targetColor: getDailyTargetColor(),
        timeRemaining: 0,
        isTimerRunning: false,
        currentScore: 0,
        dailyAttempts: todayStats?.attempts || 0,
        dailyBestScore: todayStats?.bestScore || 0,
        dailyCompleted: todayStats?.completed || false,
      });
    } else if (mode === 'rush') {
      set({ 
        mode, 
        targetColor: generateRandomColor(),
        timeRemaining: 60,
        isTimerRunning: false,
        rushScore: 0,
        rushRounds: 0,
        rushCombo: 0,
        rushMaxCombo: 0,
        currentScore: 0,
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
    const state = get();
    const { currentMix, targetColor, mode, persistentData, rushCombo, rushScore, rushRounds } = state;
    const scoreResult = calculateColorScore(currentMix, targetColor.hex);
    const score = scoreResult.score;
    const today = getTodayString();
    
    // Helper to unlock achievement
    const unlockAchievement = (id: string) => {
      if (!persistentData.achievements[id]?.unlocked) {
        persistentData.achievements[id] = { unlocked: true, unlockedAt: Date.now() };
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
          set({ newlyUnlockedAchievement: { ...achievement, unlocked: true, unlockedAt: Date.now() } });
        }
      }
    };
    
    // First match achievement
    unlockAchievement('first_match');
    
    // Score-based achievements
    if (score >= 95) {
      unlockAchievement('perfect_match');
    }
    if (score >= 90) {
      unlockAchievement('great_match');
    }
    
    if (mode === 'daily') {
      // Update daily stats
      const todayStats = persistentData.dailyStats[today] || {
        date: today,
        attempts: 0,
        bestScore: 0,
        completed: false,
      };
      
      todayStats.attempts += 1;
      todayStats.bestScore = Math.max(todayStats.bestScore, score);
      todayStats.sliderSnapshot = {
        red: state.sliders.find(s => s.id === 'red')?.amount || 0,
        yellow: state.sliders.find(s => s.id === 'yellow')?.amount || 0,
        blue: state.sliders.find(s => s.id === 'blue')?.amount || 0,
        white: state.sliders.find(s => s.id === 'white')?.amount || 0,
      };
      
      if (score >= 80 && !todayStats.completed) {
        todayStats.completed = true;
        unlockAchievement('daily_complete');
        
        // Update streak
        const yesterday = getYesterdayString();
        let newStreak = 1;
        
        if (persistentData.lastPlayedDate === yesterday) {
          newStreak = persistentData.currentStreak + 1;
        } else if (persistentData.lastPlayedDate === today) {
          newStreak = persistentData.currentStreak;
        }
        
        persistentData.currentStreak = newStreak;
        persistentData.longestStreak = Math.max(persistentData.longestStreak, newStreak);
        persistentData.lastPlayedDate = today;
        
        // Streak achievements
        if (newStreak >= 3) unlockAchievement('streak_3');
        if (newStreak >= 7) unlockAchievement('streak_7');
        if (newStreak >= 30) unlockAchievement('streak_30');
        
        set({ currentStreak: newStreak, longestStreak: persistentData.longestStreak });
      }
      
      persistentData.dailyStats[today] = todayStats;
      persistentData.totalGamesPlayed += 1;
      
      set({ 
        currentScore: score,
        dailyAttempts: todayStats.attempts,
        dailyBestScore: todayStats.bestScore,
        dailyCompleted: todayStats.completed,
        persistentData,
      });
      
    } else if (mode === 'rush') {
      // Rush mode scoring with combo
      let newCombo = rushCombo;
      let pointsEarned = 0;
      
      if (score >= 70) {
        // Good match - increase combo
        newCombo = rushCombo + 1;
        
        // Points = base score + combo bonus
        const comboMultiplier = 1 + (newCombo * 0.2); // 20% bonus per combo level
        pointsEarned = Math.round(score * comboMultiplier);
      } else {
        // Poor match - reset combo
        newCombo = 0;
        pointsEarned = Math.round(score * 0.5); // Half points for bad matches
      }
      
      const newRushScore = rushScore + pointsEarned;
      const newRushRounds = rushRounds + 1;
      const newMaxCombo = Math.max(state.rushMaxCombo, newCombo);
      
      // Combo achievements
      if (newCombo >= 3) unlockAchievement('combo_3');
      if (newCombo >= 5) unlockAchievement('combo_5');
      
      set({
        currentScore: score,
        rushScore: newRushScore,
        rushRounds: newRushRounds,
        rushCombo: newCombo,
        rushMaxCombo: newMaxCombo,
      });
      
      // Auto advance to next color in rush mode
      setTimeout(() => {
        if (get().isTimerRunning && get().timeRemaining > 0) {
          set({
            targetColor: generateRandomColor(),
            sliders: [
              { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
              { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
              { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
              { id: 'white', label: 'White', baseColor: '#FFFFFF', amount: 0 },
            ],
            currentMix: '#FFFFFF',
            currentScore: 0,
          });
        }
      }, 800);
      
    } else {
      set({ 
        currentScore: score,
        bestScore: Math.max(state.bestScore, score),
      });
    }
    
    savePersistentData(persistentData);
  },
  
  newRound: () => {
    const { mode, rushScore, rushMaxCombo, persistentData } = get();
    
    if (mode === 'rush') {
      // Save rush high score if game ended
      if (!get().isTimerRunning && rushScore > 0) {
        if (rushScore > persistentData.rushHighScore) {
          persistentData.rushHighScore = rushScore;
          
          // Rush score achievements
          if (rushScore >= 100) {
            if (!persistentData.achievements['rush_100']?.unlocked) {
              persistentData.achievements['rush_100'] = { unlocked: true, unlockedAt: Date.now() };
              const achievement = ACHIEVEMENTS.find(a => a.id === 'rush_100');
              if (achievement) set({ newlyUnlockedAchievement: { ...achievement, unlocked: true } });
            }
          }
          if (rushScore >= 500) {
            if (!persistentData.achievements['rush_500']?.unlocked) {
              persistentData.achievements['rush_500'] = { unlocked: true, unlockedAt: Date.now() };
              const achievement = ACHIEVEMENTS.find(a => a.id === 'rush_500');
              if (achievement) set({ newlyUnlockedAchievement: { ...achievement, unlocked: true } });
            }
          }
          if (rushScore >= 1000) {
            if (!persistentData.achievements['rush_1000']?.unlocked) {
              persistentData.achievements['rush_1000'] = { unlocked: true, unlockedAt: Date.now() };
              const achievement = ACHIEVEMENTS.find(a => a.id === 'rush_1000');
              if (achievement) set({ newlyUnlockedAchievement: { ...achievement, unlocked: true } });
            }
          }
          
          savePersistentData(persistentData);
        }
        
        persistentData.rushTotalScore += rushScore;
        savePersistentData(persistentData);
      }
    }
    
    set({
      targetColor: mode === 'daily' ? getDailyTargetColor() : generateRandomColor(),
      sliders: [
        { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
        { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
        { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
        { id: 'white', label: 'White', baseColor: '#FFFFFF', amount: 0 },
      ],
      currentMix: '#FFFFFF',
      currentScore: 0,
    });
    
    if (mode === 'rush') {
      set({ 
        timeRemaining: 60,
        rushScore: 0,
        rushRounds: 0,
        rushCombo: 0,
        rushMaxCombo: 0,
      });
      get().startTimer();
    }
  },
  
  resetGame: () => {
    set({
      sliders: [
        { id: 'red', label: 'Red', baseColor: '#FF0000', amount: 0 },
        { id: 'yellow', label: 'Yellow', baseColor: '#FFFF00', amount: 0 },
        { id: 'blue', label: 'Blue', baseColor: '#0000FF', amount: 0 },
        { id: 'white', label: 'White', baseColor: '#FFFFFF', amount: 0 },
      ],
      currentMix: '#FFFFFF',
      currentScore: 0,
      timeRemaining: 60,
      isTimerRunning: false,
      rushScore: 0,
      rushRounds: 0,
      rushCombo: 0,
      rushMaxCombo: 0,
    });
  },
  
  startTimer: () => {
    set({ isTimerRunning: true });
  },
  
  stopTimer: () => {
    const { rushScore, persistentData } = get();
    
    // Save rush high score when timer stops
    if (rushScore > persistentData.rushHighScore) {
      persistentData.rushHighScore = rushScore;
      savePersistentData(persistentData);
    }
    
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
  
  // Share functionality
  generateShareText: () => {
    const { mode, dailyBestScore, dailyAttempts, rushScore, rushRounds, rushMaxCombo, currentStreak, targetColor } = get();
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    
    if (mode === 'daily') {
      const scoreLabel = getScoreLabel(dailyBestScore);
      const squares = getScoreSquares(dailyBestScore);
      
      return `🎨 ChromaMix Daily ${dateStr}
🚗 Porsche PTS: ${targetColor.name}

${squares}

Score: ${dailyBestScore}/100 ${scoreLabel}
Attempts: ${dailyAttempts}
${currentStreak > 1 ? `🔥 ${currentStreak} day streak!` : ''}

Play at chromamix.app`;
    } else if (mode === 'rush') {
      return `⚡ ChromaMix Rush Mode

🏆 Score: ${rushScore}
🎯 Rounds: ${rushRounds}
🔗 Max Combo: ${rushMaxCombo}x

Play at chromamix.app`;
    }
    
    return 'ChromaMix - Mix colors, match targets!';
  },
  
  shareResults: async () => {
    const text = get().generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ChromaMix Results',
          text: text,
        });
        return true;
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(text);
          return true;
        }
        return false;
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        return false;
      }
    }
  },
}));

// Helper function to generate score visualization squares
function getScoreSquares(score: number): string {
  const filled = Math.round(score / 10);
  const squares = [];
  
  for (let i = 0; i < 10; i++) {
    if (i < filled) {
      if (score >= 90) squares.push('🟨'); // Gold for excellent
      else if (score >= 70) squares.push('🟩'); // Green for good
      else squares.push('🟦'); // Blue for okay
    } else {
      squares.push('⬜');
    }
  }
  
  return squares.join('');
}

export default useGameStore;
