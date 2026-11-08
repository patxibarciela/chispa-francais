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
  writeBatch 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Flashcard } from '../types';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

export type SyncStatus = 'guest' | 'synced' | 'saving' | 'offline' | 'error';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveCloudData: (profile: UserProfile, cards?: Flashcard[]) => Promise<void>;
  loadCloudData: (uid: string) => Promise<{ profile: Partial<UserProfile> | null; cards: Flashcard[] | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('guest');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      await signInWithPopup(auth, googleProvider);
      setSyncStatus('synced');
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      setSyncStatus(user ? 'error' : 'guest');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setSyncStatus('guest');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  const loadCloudData = useCallback(async (uid: string): Promise<{ profile: Partial<UserProfile> | null; cards: Flashcard[] | null }> => {
    const userDocPath = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      let profileData: Partial<UserProfile> | null = null;
      if (userSnap.exists()) {
        const raw = userSnap.data();
        profileData = {
          name: raw.displayName || 'Élève',
          totalXp: typeof raw.xp === 'number' ? raw.xp : undefined,
          streakDays: typeof raw.streak === 'number' ? raw.streak : undefined,
          lastStudyDate: raw.lastActivityDate,
          completedLessonIds: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
          completedSessionIds: Array.isArray(raw.completedSessions) ? raw.completedSessions : [],
          currentGrade: raw.currentGrade || 'ak6',
          chatMemory: raw.chatMemory || undefined,
        };
      }

      // Fetch Leitner cards subcollection
      const cardsColPath = `users/${uid}/flashcards`;
      const cardsSnap = await getDocs(collection(db, 'users', uid, 'flashcards'));
      let cardsData: Flashcard[] | null = null;
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

      setLastSyncedAt(new Date());
      setSyncStatus('synced');
      return { profile: profileData, cards: cardsData };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userDocPath);
      setSyncStatus('offline');
      return { profile: null, cards: null };
    }
  }, []);

  const saveCloudData = useCallback(async (profile: UserProfile, cards?: Flashcard[]) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userDocPath = `users/${uid}`;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save to batch rapid actions and avoid setState during render
    saveTimeoutRef.current = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const userRef = doc(db, 'users', uid);
        const payload = {
          uid,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || profile.name || 'Élève',
          photoURL: auth.currentUser?.photoURL || '',
          currentGrade: profile.currentGrade,
          streak: profile.streakDays,
          lastActivityDate: profile.lastStudyDate,
          xp: profile.totalXp,
          completedLessons: profile.completedLessonIds,
          completedSessions: profile.completedSessionIds,
          chatMemory: profile.chatMemory || null,
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, payload, { merge: true });

        // Save flashcards subcollection if modified
        if (cards && cards.length > 0) {
          const batch = writeBatch(db);
          // Only save top cards or modified cards to stay well within limits
          cards.slice(0, 50).forEach((card) => {
            const cardRef = doc(db, 'users', uid, 'flashcards', card.id);
            batch.set(cardRef, {
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
            }, { merge: true });
          });
          await batch.commit();
        }

        setLastSyncedAt(new Date());
        setSyncStatus('synced');
      } catch (error) {
        setSyncStatus('offline');
        handleFirestoreError(error, OperationType.WRITE, userDocPath);
      }
    }, 600);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        lastSyncedAt,
        signInWithGoogle,
        signOut,
        saveCloudData,
        loadCloudData,
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
