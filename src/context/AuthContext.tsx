import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch,
  enableNetwork 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Flashcard } from '../types';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

export type SyncStatus = 'guest' | 'synced' | 'saving' | 'offline' | 'error';

export interface CloudDataResult {
  docExists: boolean;
  profile: Partial<UserProfile> | null;
  cards: Flashcard[] | null;
  hasError?: boolean;
  errorMessage?: string;
  rawDoc?: Record<string, any> | null;
}

/**
 * Deeply sanitizes any object for Firestore:
 * Strips all undefined fields recursively so Firestore setDoc never throws
 * "Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore) as any;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as any;
  }
  return data;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  lastCloudError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveCloudData: (profile: UserProfile, cards?: Flashcard[]) => Promise<void>;
  loadCloudData: (uid: string) => Promise<CloudDataResult>;
  forcePushToCloud: (profile: UserProfile, cards?: Flashcard[]) => Promise<{ success: boolean; xpSaved: number; error?: string }>;
  forcePullFromCloud: () => Promise<{ success: boolean; profile?: Partial<UserProfile>; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('guest');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastCloudError, setLastCloudError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setSyncStatus(currentUser ? 'synced' : 'guest');
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setSyncStatus('saving');
      setLastCloudError(null);
      await signInWithPopup(auth, googleProvider);
      setSyncStatus('synced');
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      setLastCloudError(error?.message || 'Error al iniciar sesión con Google');
      setSyncStatus(user ? 'error' : 'guest');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setSyncStatus('guest');
      setLastCloudError(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const loadCloudData = useCallback(async (uid: string): Promise<CloudDataResult> => {
    const userDocPath = `users/${uid}`;
    let docExists = false;
    let profileData: Partial<UserProfile> | null = null;
    let cardsData: Flashcard[] | null = null;
    let profileError = false;
    let errorMessage: string | undefined = undefined;
    let rawDoc: Record<string, any> | null = null;

    // 1. Fetch user profile from Firestore
    try {
      enableNetwork(db).catch(() => {});
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      docExists = userSnap.exists();
      const raw = userSnap.data();
      rawDoc = raw || null;

      if (docExists && raw) {
        const rawXp = typeof raw.xp === 'number' ? raw.xp : (typeof raw.totalXp === 'number' ? raw.totalXp : 0);
        const rawStreak = typeof raw.streak === 'number' ? raw.streak : (typeof raw.streakDays === 'number' ? raw.streakDays : 0);
        const rawLessons = Array.isArray(raw.completedLessons)
          ? raw.completedLessons
          : (Array.isArray(raw.completedLessonIds) ? raw.completedLessonIds : []);
        const rawSessions = Array.isArray(raw.completedSessions)
          ? raw.completedSessions
          : (Array.isArray(raw.completedSessionIds) ? raw.completedSessionIds : []);

        profileData = {
          name: raw.displayName || raw.name || 'Élève',
          totalXp: rawXp,
          streakDays: rawStreak,
          lastStudyDate: raw.lastActivityDate || raw.lastStudyDate || '',
          completedLessonIds: rawLessons,
          completedSessionIds: rawSessions,
          currentGrade: raw.currentGrade || 'ak6',
          chatMemory: raw.chatMemory || undefined,
          supportLanguage: raw.supportLanguage === 'sv' ? 'sv' : 'es',
          frenchImmersionLevel: raw.frenchImmersionLevel || 'balanced',
          soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
          voiceSpeed: typeof raw.voiceSpeed === 'number' ? raw.voiceSpeed : 0.9,
        };
      }
    } catch (error: any) {
      const errText = error instanceof Error ? error.message : String(error);
      errorMessage = errText;
      // If it is just an offline warning on first connection, do not treat as fatal error
      if (!errText.includes('offline')) {
        setLastCloudError(errText);
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
      profileError = true;
    }

    // 2. Fetch Leitner cards in an isolated try-catch so it NEVER blocks profile XP/lesson sync
    try {
      const cardsSnap = await getDocs(collection(db, 'users', uid, 'flashcards'));
      if (!cardsSnap.empty) {
        const vocabMap = new Map(INITIAL_VOCABULARY.map((v) => [v.id, v]));
        cardsData = cardsSnap.docs.map((d) => {
          const c = d.data();
          const cardId = c.id || d.id;
          const master = vocabMap.get(cardId);
          return {
            id: cardId,
            french: c.french || master?.french || '',
            spanish: c.spanish || master?.spanish || '',
            swedish: c.swedish || master?.swedish || '',
            phonetic: c.phonetic || master?.phonetic || '',
            exampleFr: c.exampleFr || master?.exampleFr || '',
            exampleEs: c.exampleEs || master?.exampleEs || '',
            exampleSv: c.exampleSv || master?.exampleSv || '',
            category: c.category || master?.category || 'general',
            box: (c.box || 1) as 1 | 2 | 3,
            nextReviewDate: c.nextReviewDate || new Date().toISOString(),
            timesReviewed: c.timesReviewed || 0,
            correctStreak: c.correctStreak || 0,
            grade: master?.grade || c.grade,
            unitId: master?.unitId || c.unitId,
          };
        });

        // Append any new curriculum cards not yet in user's cloud collection
        const existingIds = new Set(cardsData.map((c) => c.id));
        const missingCards = INITIAL_VOCABULARY.filter((v) => !existingIds.has(v.id));
        if (missingCards.length > 0) {
          cardsData = [...cardsData, ...missingCards];
        }
      }
    } catch (cardsErr) {
      console.warn('Could not load flashcards subcollection (non-fatal, ignored):', cardsErr);
    }

    if (!profileError) {
      setLastSyncedAt(new Date());
      setSyncStatus('synced');
      setLastCloudError(null);
    } else {
      setSyncStatus('offline');
    }

    return {
      docExists,
      profile: profileData,
      cards: cardsData,
      hasError: profileError,
      errorMessage,
      rawDoc,
    };
  }, []);

  const saveCloudData = useCallback(async (profile: UserProfile, cards?: Flashcard[]) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userDocPath = `users/${uid}`;

    setSyncStatus('saving');
    try {
      enableNetwork(db).catch(() => {});
      const userRef = doc(db, 'users', uid);

      // Clean raw payload and explicitly strip any undefined values using sanitizeForFirestore
      const rawPayload = {
        uid,
        email: auth.currentUser?.email || profile.email || '',
        displayName: auth.currentUser?.displayName || profile.name || 'Élève',
        photoURL: auth.currentUser?.photoURL || profile.photoURL || '',
        currentGrade: profile.currentGrade || 'ak6',
        streak: profile.streakDays || 0,
        streakDays: profile.streakDays || 0,
        lastActivityDate: profile.lastStudyDate || '',
        lastStudyDate: profile.lastStudyDate || '',
        xp: profile.totalXp || 0,
        totalXp: profile.totalXp || 0,
        completedLessons: profile.completedLessonIds || [],
        completedLessonIds: profile.completedLessonIds || [],
        completedSessions: profile.completedSessionIds || [],
        completedSessionIds: profile.completedSessionIds || [],
        chatMemory: profile.chatMemory || null,
        supportLanguage: profile.supportLanguage || 'es',
        frenchImmersionLevel: profile.frenchImmersionLevel || 'balanced',
        soundEnabled: profile.soundEnabled ?? true,
        voiceSpeed: profile.voiceSpeed ?? 0.9,
        updatedAt: new Date().toISOString(),
      };

      const sanitizedPayload = sanitizeForFirestore(rawPayload);

      await setDoc(userRef, sanitizedPayload, { merge: true });

      // Save flashcards subcollection if explicitly passed
      if (cards && cards.length > 0) {
        try {
          const batch = writeBatch(db);
          cards.slice(0, 50).forEach((card) => {
            const cardRef = doc(db, 'users', uid, 'flashcards', card.id);
            const cardData = sanitizeForFirestore({
              id: card.id,
              userId: uid,
              french: card.french,
              spanish: card.spanish,
              swedish: card.swedish,
              box: card.box,
              nextReviewDate: card.nextReviewDate,
              timesReviewed: card.timesReviewed,
              correctStreak: card.correctStreak,
              grade: card.grade || null,
              unitId: card.unitId || null,
              lastReviewed: new Date().toISOString(),
            });
            batch.set(cardRef, cardData, { merge: true });
          });
          await batch.commit();
        } catch (cardSaveErr) {
          console.warn('Could not save flashcards subcollection (non-fatal):', cardSaveErr);
        }
      }

      setLastSyncedAt(new Date());
      setSyncStatus('synced');
      setLastCloudError(null);
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.warn('Firestore write failed:', msg);
      setLastCloudError(msg);
      setSyncStatus('offline');
      handleFirestoreError(error, OperationType.WRITE, userDocPath);
    }
  }, []);

  const forcePushToCloud = useCallback(async (profile: UserProfile, cards?: Flashcard[]) => {
    if (!auth.currentUser) {
      return { success: false, xpSaved: 0, error: 'No hay usuario autenticado con Google' };
    }
    const uid = auth.currentUser.uid;
    setSyncStatus('saving');
    try {
      enableNetwork(db).catch(() => {});
      const userRef = doc(db, 'users', uid);
      const rawPayload = {
        uid,
        email: auth.currentUser?.email || profile.email || '',
        displayName: auth.currentUser?.displayName || profile.name || 'Élève',
        photoURL: auth.currentUser?.photoURL || profile.photoURL || '',
        currentGrade: profile.currentGrade || 'ak6',
        streak: profile.streakDays || 0,
        streakDays: profile.streakDays || 0,
        lastActivityDate: profile.lastStudyDate || '',
        lastStudyDate: profile.lastStudyDate || '',
        xp: profile.totalXp || 0,
        totalXp: profile.totalXp || 0,
        completedLessons: profile.completedLessonIds || [],
        completedLessonIds: profile.completedLessonIds || [],
        completedSessions: profile.completedSessionIds || [],
        completedSessionIds: profile.completedSessionIds || [],
        chatMemory: profile.chatMemory || null,
        supportLanguage: profile.supportLanguage || 'es',
        frenchImmersionLevel: profile.frenchImmersionLevel || 'balanced',
        soundEnabled: profile.soundEnabled ?? true,
        voiceSpeed: profile.voiceSpeed ?? 0.9,
        updatedAt: new Date().toISOString(),
      };

      const sanitizedPayload = sanitizeForFirestore(rawPayload);
      await setDoc(userRef, sanitizedPayload, { merge: true });

      // Save flashcards subcollection
      if (cards && cards.length > 0) {
        try {
          const batch = writeBatch(db);
          cards.slice(0, 50).forEach((card) => {
            const cardRef = doc(db, 'users', uid, 'flashcards', card.id);
            const cardData = sanitizeForFirestore({
              id: card.id,
              userId: uid,
              french: card.french,
              spanish: card.spanish,
              swedish: card.swedish,
              box: card.box,
              nextReviewDate: card.nextReviewDate,
              timesReviewed: card.timesReviewed,
              correctStreak: card.correctStreak,
              grade: card.grade || null,
              unitId: card.unitId || null,
              lastReviewed: new Date().toISOString(),
            });
            batch.set(cardRef, cardData, { merge: true });
          });
          await batch.commit();
        } catch (e) {
          console.warn('Subcollection batch warning:', e);
        }
      }

      setLastSyncedAt(new Date());
      setSyncStatus('synced');
      setLastCloudError(null);
      return { success: true, xpSaved: profile.totalXp || 0 };
    } catch (error: any) {
      const msg = error?.message || String(error);
      setLastCloudError(msg);
      setSyncStatus('error');
      return { success: false, xpSaved: 0, error: msg };
    }
  }, []);

  const forcePullFromCloud = useCallback(async () => {
    if (!auth.currentUser) {
      return { success: false, error: 'No hay usuario autenticado con Google' };
    }
    const uid = auth.currentUser.uid;
    setSyncStatus('saving');
    try {
      enableNetwork(db).catch(() => {});
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setSyncStatus('synced');
        return { success: true, profile: undefined };
      }

      const raw = userSnap.data();
      const rawXp = typeof raw.xp === 'number' ? raw.xp : (typeof raw.totalXp === 'number' ? raw.totalXp : 0);
      const rawStreak = typeof raw.streak === 'number' ? raw.streak : (typeof raw.streakDays === 'number' ? raw.streakDays : 0);
      const rawLessons = Array.isArray(raw.completedLessons)
        ? raw.completedLessons
        : (Array.isArray(raw.completedLessonIds) ? raw.completedLessonIds : []);
      const rawSessions = Array.isArray(raw.completedSessions)
        ? raw.completedSessions
        : (Array.isArray(raw.completedSessionIds) ? raw.completedSessionIds : []);

      const profileData: Partial<UserProfile> = {
        name: raw.displayName || raw.name || 'Élève',
        totalXp: rawXp,
        streakDays: rawStreak,
        lastStudyDate: raw.lastActivityDate || raw.lastStudyDate || '',
        completedLessonIds: rawLessons,
        completedSessionIds: rawSessions,
        currentGrade: raw.currentGrade || 'ak6',
        chatMemory: raw.chatMemory || undefined,
        supportLanguage: raw.supportLanguage === 'sv' ? 'sv' : 'es',
        frenchImmersionLevel: raw.frenchImmersionLevel || 'balanced',
        soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
        voiceSpeed: typeof raw.voiceSpeed === 'number' ? raw.voiceSpeed : 0.9,
      };

      setLastSyncedAt(new Date());
      setSyncStatus('synced');
      setLastCloudError(null);
      return { success: true, profile: profileData };
    } catch (error: any) {
      const msg = error?.message || String(error);
      setLastCloudError(msg);
      setSyncStatus('error');
      return { success: false, error: msg };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        lastSyncedAt,
        lastCloudError,
        signInWithGoogle,
        signOut,
        saveCloudData,
        loadCloudData,
        forcePushToCloud,
        forcePullFromCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

