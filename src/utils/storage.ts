import { UserProfile, Flashcard, Achievement } from '../types';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

const STORAGE_KEY_PROFILE = 'chispa_francais_profile_v1';
const STORAGE_KEY_CARDS = 'chispa_francais_cards_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Élève',
  streakDays: 1,
  lastStudyDate: new Date().toISOString().split('T')[0],
  totalXp: 45,
  completedLessonIds: [],
  completedSessionIds: [],
  currentGrade: 'ak6',
  soundEnabled: true,
  voiceSpeed: 0.9,
  supportLanguage: 'es', // Default Spanish, can toggle to 'sv' (Svenska)
  dailyGoalMinutes: 30,
  minutesToday: 12,
};

const STORAGE_KEY_PROFILES_LIST = 'chispa_francais_profiles_list_v1';
const STORAGE_KEY_ACTIVE_ID = 'chispa_francais_active_profile_id_v1';

export function loadSavedProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES_LIST);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveLocalProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedProfiles();
    const id = profile.id || `profile_${Date.now()}`;
    const fullProfile = { ...profile, id, accountType: profile.accountType || 'local' };
    const filtered = existing.filter((p) => p.id !== id);
    const updatedList = [fullProfile, ...filtered];
    localStorage.setItem(STORAGE_KEY_PROFILES_LIST, JSON.stringify(updatedList));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(fullProfile));
  } catch (e) {
    console.error('Failed to save local profile:', e);
  }
}

export function deleteLocalProfile(profileId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadSavedProfiles();
    const updated = existing.filter((p) => p.id !== profileId);
    localStorage.setItem(STORAGE_KEY_PROFILES_LIST, JSON.stringify(updated));
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (activeId === profileId) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      localStorage.removeItem(STORAGE_KEY_PROFILE);
    }
  } catch (e) {
    console.error('Failed to delete profile:', e);
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
}

export function setActiveProfileId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (!id) {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
  } else {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    const existing = loadSavedProfiles();
    const found = existing.find((p) => p.id === id);
    if (found) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(found));
    }
  }
}

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const lastDate = parsed.lastStudyDate || today;
    const diffDays = Math.floor(
      (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Studied yesterday, keep streak
    } else if (diffDays > 1) {
      // Streak broken, reset to 1
      parsed.streakDays = 1;
    }

    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    // Also sync in profiles list if it has an id
    if (profile.id) {
      const existing = loadSavedProfiles();
      const updated = existing.map((p) => (p.id === profile.id ? { ...p, ...profile } : p));
      localStorage.setItem(STORAGE_KEY_PROFILES_LIST, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function loadFlashcards(): Flashcard[] {
  if (typeof window === 'undefined') return INITIAL_VOCABULARY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CARDS);
    if (!raw) return INITIAL_VOCABULARY;
    const cards = JSON.parse(raw);
    return Array.isArray(cards) && cards.length > 0 ? cards : INITIAL_VOCABULARY;
  } catch {
    return INITIAL_VOCABULARY;
  }
}

export function saveFlashcards(cards: Flashcard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save cards:', e);
  }
}

/**
 * Leitner Spaced Repetition review interval calculation
 * Box 1: daily (1 day)
 * Box 2: every 3 days
 * Box 3: every 7 days (mastered)
 */
export function updateCardReview(
  card: Flashcard,
  outcome: 'easy' | 'good' | 'hard'
): Flashcard {
  let newBox = card.box;
  let correctStreak = card.correctStreak;

  if (outcome === 'easy') {
    newBox = Math.min(3, card.box + 1) as 1 | 2 | 3;
    correctStreak += 1;
  } else if (outcome === 'good') {
    if (card.box === 1) newBox = 2;
    correctStreak += 1;
  } else {
    // Hard / Failed: reset to box 1 for immediate review
    newBox = 1;
    correctStreak = 0;
  }

  const daysToAdd = newBox === 3 ? 7 : newBox === 2 ? 3 : 1;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);

  return {
    ...card,
    box: newBox,
    correctStreak,
    timesReviewed: card.timesReviewed + 1,
    nextReviewDate: nextDate.toISOString(),
  };
}

export function calculateLevel(xp: number): { level: number; title: string; currentLevelXp: number; nextLevelXp: number } {
  // Levels every 100 XP
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const nextLevelXp = 100;

  const titles = [
    'Débutant Curieux', // Level 1
    'Explorateur des Mots', // Level 2
    'Ami de Molière', // Level 3
    'Champion de Français', // Level 4
    'Étoile Polyglotte', // Level 5
    'Maître de Paris', // Level 6+
  ];

  const title = titles[Math.min(level - 1, titles.length - 1)];
  return { level, title, currentLevelXp, nextLevelXp };
}

export function getAchievements(profile: UserProfile, cards: Flashcard[]): Achievement[] {
  const masteredCount = cards.filter((c) => c.box === 3).length;
  const sessionsCount = profile.completedSessionIds.length;
  const lessonsCount = profile.completedLessonIds.length;

  return [
    {
      id: 'first-step',
      title: 'Premier Pas',
      description: 'Completa tu primera lección de francés',
      icon: 'Footprints',
      unlocked: lessonsCount >= 1,
      progress: Math.min(lessonsCount, 1),
      maxProgress: 1,
    },
    {
      id: 'streak-3',
      title: 'Flamme d\'Or',
      description: 'Mantén una racha de 3 días consecutivos',
      icon: 'Flame',
      unlocked: profile.streakDays >= 3,
      progress: Math.min(profile.streakDays, 3),
      maxProgress: 3,
    },
    {
      id: 'session-master',
      title: 'Séance Complète',
      description: 'Termina una sesión guiada de 30 minutos',
      icon: 'Clock',
      unlocked: sessionsCount >= 1,
      progress: Math.min(sessionsCount, 1),
      maxProgress: 1,
    },
    {
      id: 'vocab-master',
      title: 'Boîte de Vocabulaire',
      description: 'Domina 5 palabras en la Caja 3 de repetición espaciada',
      icon: 'Brain',
      unlocked: masteredCount >= 5,
      progress: Math.min(masteredCount, 5),
      maxProgress: 5,
    },
    {
      id: 'xp-collector',
      title: 'Collecteur d\'Étoiles',
      description: 'Alcanza 150 puntos de experiencia (XP)',
      icon: 'Trophy',
      unlocked: profile.totalXp >= 150,
      progress: Math.min(profile.totalXp, 150),
      maxProgress: 150,
    },
  ];
}
