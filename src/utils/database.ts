// Local persistent simulation of JhonxDatabaseHelper (table_progress & table_history)

export interface PhonicsProgressRecord {
  id: number;
  phonics_group: number;
  letter: string;
  mastery_percentage: number;
}

export interface ReadingHistoryRecord {
  id: number;
  word: string;
  date_read: string;
  audio_path: string;
  was_perfect: number; // 1 or 0
}

export interface PhonicsChallengeStats {
  accuracy: number;
  totalAttempts: number;
  correctAttempts: number;
  currentStreak: number;
  bestStreak: number;
  currentLevel: number;
}

const STORAGE_KEY_PROGRESS = 'jhonx_db_table_progress';
const STORAGE_KEY_HISTORY = 'jhonx_db_table_history';
const STORAGE_KEY_CHALLENGE_STATS = 'jhonx_db_challenge_stats';

// Resilient in-memory fallback if iframe blocks localStorage access
const memoryStore: Record<string, string> = {};

export function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return memoryStore[key] ?? null;
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
  memoryStore[key] = value;
}

const DEFAULT_CHALLENGE_STATS: PhonicsChallengeStats = {
  accuracy: 100,
  totalAttempts: 0,
  correctAttempts: 0,
  currentStreak: 0,
  bestStreak: 0,
  currentLevel: 1,
};

const DEFAULT_PROGRESS: PhonicsProgressRecord[] = [
  // Group 1 (SATPIN)
  { id: 1, phonics_group: 1, letter: 'S', mastery_percentage: 95 },
  { id: 2, phonics_group: 1, letter: 'A', mastery_percentage: 92 },
  { id: 3, phonics_group: 1, letter: 'T', mastery_percentage: 88 },
  { id: 4, phonics_group: 1, letter: 'P', mastery_percentage: 78 },
  { id: 5, phonics_group: 1, letter: 'I', mastery_percentage: 82 },
  { id: 6, phonics_group: 1, letter: 'N', mastery_percentage: 75 },
  // Group 2 (CKEHRMD)
  { id: 7, phonics_group: 2, letter: 'C', mastery_percentage: 96 },
  { id: 8, phonics_group: 2, letter: 'K', mastery_percentage: 65 },
  { id: 9, phonics_group: 2, letter: 'E', mastery_percentage: 72 },
  { id: 10, phonics_group: 2, letter: 'H', mastery_percentage: 68 },
  { id: 11, phonics_group: 2, letter: 'R', mastery_percentage: 85 },
  { id: 12, phonics_group: 2, letter: 'M', mastery_percentage: 80 },
  { id: 13, phonics_group: 2, letter: 'D', mastery_percentage: 76 },
];

const DEFAULT_HISTORY: ReadingHistoryRecord[] = [
  {
    id: 1,
    word: 'CAT',
    date_read: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    audio_path: 'Live Voice Verified (No file saved)',
    was_perfect: 1,
  },
  {
    id: 2,
    word: 'SAT',
    date_read: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    audio_path: 'Live Voice Verified (No file saved)',
    was_perfect: 1,
  },
  {
    id: 3,
    word: 'PIN',
    date_read: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    audio_path: 'Live Voice Verified (No file saved)',
    was_perfect: 0,
  },
  {
    id: 4,
    word: 'TAP',
    date_read: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    audio_path: 'Live Voice Verified (No file saved)',
    was_perfect: 1,
  },
];

class DatabaseService {
  // Get all letter mastery progress
  public getProgress(): PhonicsProgressRecord[] {
    const stored = safeGetItem(STORAGE_KEY_PROGRESS);
    if (!stored) {
      safeSetItem(STORAGE_KEY_PROGRESS, JSON.stringify(DEFAULT_PROGRESS));
      return DEFAULT_PROGRESS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PROGRESS;
    }
  }

  // Get reading history for Parent Dashboard
  public getParentDashboardData(): ReadingHistoryRecord[] {
    const stored = safeGetItem(STORAGE_KEY_HISTORY);
    if (!stored) {
      safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(DEFAULT_HISTORY));
      return DEFAULT_HISTORY;
    }
    try {
      const parsed: ReadingHistoryRecord[] = JSON.parse(stored);
      return parsed.sort(
        (a, b) => new Date(b.date_read).getTime() - new Date(a.date_read).getTime()
      );
    } catch {
      return DEFAULT_HISTORY;
    }
  }

  // Save new reading success without saving audio files to disk
  public saveReadingSuccess(word: string, audioPath?: string, wasPerfect: boolean = true) {
    try {
      const history = this.getParentDashboardData();
      const newRecord: ReadingHistoryRecord = {
        id: Date.now(),
        word: word.toUpperCase(),
        date_read: new Date().toISOString(),
        audio_path: audioPath || 'Live Voice Verified (No file saved)',
        was_perfect: wasPerfect ? 1 : 0,
      };
      const updated = [newRecord, ...history].slice(0, 15);
      safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));

      // Also update letter mastery in table_progress
      this.updateLettersMastery(word, wasPerfect);
    } catch (err) {
      console.warn('Failed to save reading success:', err);
    }
  }

  private updateLettersMastery(word: string, wasPerfect: boolean) {
    try {
      const letters = word.toUpperCase().split('');
      const progress = this.getProgress();
      const updated = progress.map((item) => {
        if (letters.includes(item.letter)) {
          const delta = wasPerfect ? 4 : -2;
          const newPct = Math.min(100, Math.max(10, item.mastery_percentage + delta));
          return { ...item, mastery_percentage: newPct };
        }
        return item;
      });
      safeSetItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to update letter mastery:', err);
    }
  }

  // Phonics Challenge Stats (Accuracy, Streaks, Difficulty Level)
  public getChallengeStats(): PhonicsChallengeStats {
    const stored = safeGetItem(STORAGE_KEY_CHALLENGE_STATS);
    if (!stored) {
      safeSetItem(STORAGE_KEY_CHALLENGE_STATS, JSON.stringify(DEFAULT_CHALLENGE_STATS));
      return DEFAULT_CHALLENGE_STATS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_CHALLENGE_STATS;
    }
  }

  // Record an attempt and automatically trigger level up upon 5 consecutive correct pronunciations
  public recordChallengeAttempt(isCorrect: boolean): { stats: PhonicsChallengeStats; isLevelUp: boolean; newLevel: number } {
    const current = this.getChallengeStats();
    const newTotal = current.totalAttempts + 1;
    const newCorrect = isCorrect ? current.correctAttempts + 1 : current.correctAttempts;
    const newAccuracy = Math.round((newCorrect / newTotal) * 100);

    let newStreak = isCorrect ? current.currentStreak + 1 : 0;
    const newBest = Math.max(current.bestStreak, newStreak);

    let isLevelUp = false;
    let newLevel = current.currentLevel;

    // Check if child achieved 5 consecutive correct words
    if (newStreak >= 5) {
      isLevelUp = true;
      if (newLevel < 4) {
        newLevel += 1;
      }
      // Reset streak after level-up so child can strive for next 5-streak
      newStreak = 0;
    }

    const updatedStats: PhonicsChallengeStats = {
      accuracy: newAccuracy,
      totalAttempts: newTotal,
      correctAttempts: newCorrect,
      currentStreak: newStreak,
      bestStreak: newBest,
      currentLevel: newLevel,
    };

    safeSetItem(STORAGE_KEY_CHALLENGE_STATS, JSON.stringify(updatedStats));

    return {
      stats: updatedStats,
      isLevelUp,
      newLevel,
    };
  }

  public setChallengeLevel(level: number): PhonicsChallengeStats {
    const current = this.getChallengeStats();
    const updated: PhonicsChallengeStats = {
      ...current,
      currentLevel: Math.min(4, Math.max(1, level)),
      currentStreak: 0,
    };
    safeSetItem(STORAGE_KEY_CHALLENGE_STATS, JSON.stringify(updated));
    return updated;
  }

  public resetDatabase() {
    safeSetItem(STORAGE_KEY_PROGRESS, JSON.stringify(DEFAULT_PROGRESS));
    safeSetItem(STORAGE_KEY_HISTORY, JSON.stringify(DEFAULT_HISTORY));
    safeSetItem(STORAGE_KEY_CHALLENGE_STATS, JSON.stringify(DEFAULT_CHALLENGE_STATS));
  }
}

export const jhonxDb = new DatabaseService();
