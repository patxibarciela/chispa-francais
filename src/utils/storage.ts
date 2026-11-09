import { UserProfile, Flashcard, Achievement, StudentMemoryFacts } from '../types';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

const STORAGE_KEY_PROFILE = 'chispa_francais_profile_v2';
const STORAGE_KEY_CARDS = 'chispa_francais_cards_v2';
const STORAGE_KEY_PROFILES_LIST = 'chispa_francais_profiles_list_v2';
const STORAGE_KEY_ACTIVE_ID = 'chispa_francais_active_profile_id_v2';

// Clean up legacy v1 mock keys from localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('chispa_francais_profile_v1');
    localStorage.removeItem('chispa_francais_cards_v1');
    localStorage.removeItem('chispa_francais_profiles_list_v1');
    localStorage.removeItem('chispa_francais_active_profile_id_v1');
  } catch {
    // Ignore storage cleanup errors
  }
}

/**
 * Returns today's calendar date in local timezone as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates calendar day difference between two YYYY-MM-DD dates without DST offset errors
 */
export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  if (!fromDateStr || !toDateStr) return 999;
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return 999;

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / MS_PER_DAY);
}

/**
 * Evaluates active streak state on app load or profile load.
 * - If studied yesterday (diff === 1): streak is ACTIVE today (fixes 0 to >=1).
 * - If studied today (diff === 0): streak is ACTIVE.
 * - If missed 2 or more days (diff > 1): streak was broken -> 0.
 */
export function syncProfileStreakOnLoad(profile: UserProfile): UserProfile {
  if (!profile) return profile;

  const today = getTodayDateString();
  const lastDate = profile.lastStudyDate;
  let streak = typeof profile.streakDays === 'number' ? profile.streakDays : 0;

  if (!lastDate) {
    if ((profile.completedLessonIds && profile.completedLessonIds.length > 0) || profile.totalXp > 0) {
      streak = Math.max(1, streak);
      return { ...profile, streakDays: streak, lastStudyDate: today };
    }
    return { ...profile, streakDays: 0 };
  }

  const diff = getDaysDifference(lastDate, today);

  if (diff === 0) {
    // Studied today: active streak
    if (streak === 0 && ((profile.completedLessonIds && profile.completedLessonIds.length > 0) || profile.totalXp > 0)) {
      streak = 1;
    }
  } else if (diff === 1) {
    // Studied yesterday: streak is ACTIVE today!
    // If it was 0 due to the legacy save bug, correct it to at least 1!
    streak = Math.max(1, streak);
  } else if (diff > 1) {
    // Missed a day or more: streak broken
    streak = 0;
  } else if (diff < 0) {
    // System clock future anomaly: keep streak
    streak = Math.max(1, streak);
  }

  return {
    ...profile,
    streakDays: streak,
  };
}

/**
 * Records a study activity and increments streak correctly.
 * - If already studied today (diff === 0): keeps current streak (ensures >= 1)
 * - If studied yesterday (diff === 1): increments streak (+1)
 *   (if streak was 0 due to legacy bug, yesterday + today = 2 days!)
 * - If first time or missed days (diff > 1): starts new streak of 1 today
 */
export function recordStudyActivity(profile: UserProfile): UserProfile {
  const today = getTodayDateString();
  const lastDate = profile.lastStudyDate;
  const currentStreak = typeof profile.streakDays === 'number' ? profile.streakDays : 0;
  let newStreak = currentStreak;

  if (!lastDate) {
    newStreak = 1;
  } else {
    const diff = getDaysDifference(lastDate, today);
    if (diff === 0) {
      // Already studied today
      newStreak = Math.max(1, currentStreak);
    } else if (diff === 1) {
      // Studied yesterday -> increment streak!
      newStreak = currentStreak >= 1 ? currentStreak + 1 : 2;
    } else {
      // Missed days -> new streak starts today
      newStreak = 1;
    }
  }

  return {
    ...profile,
    streakDays: newStreak,
    lastStudyDate: today,
  };
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Élève',
  streakDays: 0,
  lastStudyDate: '',
  totalXp: 0,
  completedLessonIds: [],
  completedSessionIds: [],
  currentGrade: 'ak6',
  soundEnabled: true,
  voiceSpeed: 0.9,
  supportLanguage: 'es', // Default Spanish, can toggle to 'sv' (Svenska)
  dailyGoalMinutes: 30,
  minutesToday: 0,
};

export function loadSavedProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES_LIST);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map((p) => syncProfileStreakOnLoad(p));
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
    const fullProfile = { ...DEFAULT_PROFILE, ...parsed };
    const synced = syncProfileStreakOnLoad(fullProfile);

    // If streak was corrected from 0 or out of sync, persist back to localStorage
    if (synced.streakDays !== parsed.streakDays || synced.lastStudyDate !== parsed.lastStudyDate) {
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(synced));
      } catch {
        // ignore
      }
    }

    return synced;
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
    if (Array.isArray(cards) && cards.length > 0) {
      const vocabMap = new Map(INITIAL_VOCABULARY.map((c) => [c.id, c]));
      
      // Hydrate all existing cards with master metadata (grade, unitId, phonetic, examples)
      // while preserving the user's box (1, 2, 3), nextReviewDate, timesReviewed, correctStreak
      const hydrated = cards.map((c: Flashcard) => {
        const master = vocabMap.get(c.id);
        if (master) {
          return {
            ...master,
            ...c,
            grade: master.grade,
            unitId: master.unitId,
            category: master.category || c.category,
            phonetic: master.phonetic || c.phonetic,
            exampleFr: master.exampleFr || c.exampleFr,
            exampleEs: master.exampleEs || c.exampleEs,
            exampleSv: master.exampleSv || c.exampleSv,
          };
        }
        return c;
      });

      // Append any new cards from INITIAL_VOCABULARY that aren't yet in storage
      const existingIds = new Set(hydrated.map((c: Flashcard) => c.id));
      const missing = INITIAL_VOCABULARY.filter((c) => !existingIds.has(c.id));
      const result = missing.length > 0 ? [...hydrated, ...missing] : hydrated;

      try {
        localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(result));
      } catch {
        // Ignore quota errors
      }
      return result;
    }
    return INITIAL_VOCABULARY;
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

export function resetAllProgress(): { profile: UserProfile; cards: Flashcard[] } {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_CARDS);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      localStorage.removeItem(STORAGE_KEY_PROFILES_LIST);
    } catch {
      // Storage error suppressed
    }
  }

  const cleanCards: Flashcard[] = INITIAL_VOCABULARY.map((c) => ({
    ...c,
    box: 1,
    correctStreak: 0,
    timesReviewed: 0,
    nextReviewDate: new Date().toISOString(),
  }));

  const cleanProfile: UserProfile = { ...DEFAULT_PROFILE };

  saveUserProfile(cleanProfile);
  saveFlashcards(cleanCards);

  return { profile: cleanProfile, cards: cleanCards };
}

/* =====================================================================
   CHAT CONVERSATION & STUDENT FACTS MEMORY PERSISTENCE
   ===================================================================== */

const STORAGE_PREFIX_CHAT = 'chispa_francais_chat_';
const STORAGE_PREFIX_FACTS = 'chispa_francais_facts_';

export function getChatStorageKey(profileId?: string): string {
  return `${STORAGE_PREFIX_CHAT}${profileId || 'default'}`;
}

export function getFactsStorageKey(profileId?: string): string {
  return `${STORAGE_PREFIX_FACTS}${profileId || 'default'}`;
}

export function loadChatHistory(profileId?: string): any[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getChatStorageKey(profileId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveChatHistory(messages: any[], profileId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep the most recent 40 messages to prevent excessive storage while ensuring rich context
    localStorage.setItem(getChatStorageKey(profileId), JSON.stringify(messages.slice(-40)));
  } catch (e) {
    console.warn('Failed to save chat history:', e);
  }
}

export function clearChatHistory(profileId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getChatStorageKey(profileId));
  } catch {}
}

export function loadStudentFacts(profileId?: string, fallbackName?: string): StudentMemoryFacts {
  const defaultFacts: StudentMemoryFacts = {
    name: fallbackName && fallbackName !== 'Élève' ? fallbackName : undefined,
    pets: [],
    favoriteFoods: [],
    hobbies: [],
    otherFacts: [],
  };

  if (typeof window === 'undefined') return defaultFacts;
  try {
    const raw = localStorage.getItem(getFactsStorageKey(profileId));
    if (!raw) return defaultFacts;
    const parsed = JSON.parse(raw);
    return {
      ...defaultFacts,
      ...parsed,
      name: parsed.name || defaultFacts.name,
    };
  } catch {
    return defaultFacts;
  }
}

export function saveStudentFacts(facts: StudentMemoryFacts, profileId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getFactsStorageKey(profileId), JSON.stringify(facts));
  } catch (e) {
    console.warn('Failed to save student facts:', e);
  }
}

/**
 * Intelligent client-side fact extractor:
 * Automatically captures name, age, pets, food, hobbies from the student's natural messages
 */
export function extractFactsFromUserMessage(
  text: string,
  currentFacts: StudentMemoryFacts
): { facts: StudentMemoryFacts; updated: boolean } {
  const updatedFacts: StudentMemoryFacts = {
    ...currentFacts,
    pets: [...(currentFacts.pets || [])],
    favoriteFoods: [...(currentFacts.favoriteFoods || [])],
    hobbies: [...(currentFacts.hobbies || [])],
    otherFacts: [...(currentFacts.otherFacts || [])],
  };
  let updated = false;

  const clean = text.trim();

  // 1. Name detection (e.g. "Me llamo Patxi", "Je m'appelle Patxi", "Soy Patxi", "Mi nombre es Patxi", "Jag heter Patxi")
  const nameMatch = clean.match(/(?:me llamo|je m'appelle|je mappelle|soy|mi nombre es|jag heter)\s+([A-Za-zÀ-ÿ0-9_-]+)/i);
  if (nameMatch && nameMatch[1]) {
    const extractedName = nameMatch[1].trim();
    const stopWords = ['un', 'une', 'el', 'la', 'en', 'de', 'du', 'des', 'bien', 'muy', 'amigo', 'estudiante'];
    if (!stopWords.includes(extractedName.toLowerCase()) && extractedName.length >= 2) {
      if (updatedFacts.name !== extractedName) {
        updatedFacts.name = extractedName;
        updated = true;
      }
    }
  }

  // 2. Age detection (e.g. "Tengo 13 años", "J'ai 13 ans", "Jag är 13 år")
  const ageMatch = clean.match(/(?:tengo|j'ai|jag är)\s+(\d{1,2})\s*(?:ans|años|år)/i);
  if (ageMatch && ageMatch[1]) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 5 && ageNum <= 99 && updatedFacts.age !== ageNum) {
      updatedFacts.age = ageNum;
      updated = true;
    }
  }

  // 3. Pets detection (e.g. "Tengo un perro", "J'ai un chat", "Mi perro se llama...")
  const petMatch = clean.match(/(?:tengo|j'ai|jag har|mi|mon|min)\s+(?:un|une|el|la|en|ett)?\s*(perro|chien|hund|gato|chat|katt|conejo|lapin|kanin|pájaro|oiseau|fågel|caballo|cheval|häst)/i);
  if (petMatch && petMatch[1]) {
    const pet = petMatch[1].toLowerCase();
    if (!updatedFacts.pets?.includes(pet)) {
      updatedFacts.pets = Array.from(new Set([...(updatedFacts.pets || []), pet]));
      updated = true;
    }
  }

  // 4. Favorite food detection (e.g. "Me gusta la pizza", "J'aime la pizza", "Mi comida favorita es la pasta")
  const foodMatch = clean.match(/(?:me gusta|j'aime|jag gillar|favorita es|favorit är)\s+(?:la|le|el|les|de)?\s*(pizza|pasta|queso|fromage|ost|crêpes|crepes|croissant|tacos|chocolate|chocolat|choklad|hamburguesa|burger|helado|glace|glass)/i);
  if (foodMatch && foodMatch[1]) {
    const food = foodMatch[1].toLowerCase();
    if (!updatedFacts.favoriteFoods?.includes(food)) {
      updatedFacts.favoriteFoods = Array.from(new Set([...(updatedFacts.favoriteFoods || []), food]));
      updated = true;
    }
  }

  // 5. Hobbies / activities detection
  const hobbyMatch = clean.match(/(?:me gusta|j'aime|jag gillar|juego al|je joue au|spelar)\s+(?:el|la|au|aux)?\s*(fútbol|football|fotboll|música|musique|musik|videojuegos|jeux vidéo|tv-spel|baloncesto|basket|tenis|tennis|natación|natation|simning|dibujar|dessiner|teckna)/i);
  if (hobbyMatch && hobbyMatch[1]) {
    const hobby = hobbyMatch[1].toLowerCase();
    if (!updatedFacts.hobbies?.includes(hobby)) {
      updatedFacts.hobbies = Array.from(new Set([...(updatedFacts.hobbies || []), hobby]));
      updated = true;
    }
  }

  return { facts: updatedFacts, updated };
}

