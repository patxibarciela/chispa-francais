import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDocFromServer,
  setDoc, 
  collection, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { auth, db, firebaseConfig, googleProvider, handleFirestoreError, OperationType } from '../firebase';
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

/**
 * Executes a promise with an automatic timeout guard so network stalls
 * never cause the UI to hang indefinitely.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = 15000,
  fallbackMsg: string = 'Tiempo de espera agotado al conectar con el servidor'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(fallbackMsg));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Firestore REST API v1 value encoders/decoders.
 * Used as an ultra-fast stateless HTTPS fallback if the Firestore SDK stream stalls
 * behind restrictive mobile carriers, proxies, or Safari ITP.
 */
function toFirestoreRestValue(val: any): Record<string, any> {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreRestValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreRestValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreRestValue(val: any): any {
  if (!val || typeof val !== 'object') return undefined;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    const vals = val.arrayValue?.values;
    return Array.isArray(vals) ? vals.map(fromFirestoreRestValue) : [];
  }
  if ('mapValue' in val) {
    const fields = val.mapValue?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = fromFirestoreRestValue(v);
    }
    return out;
  }
  return undefined;
}

function parseRawDocToProfile(raw: Record<string, any>): Partial<UserProfile> {
  const rawXp = typeof raw.xp === 'number' ? raw.xp : (typeof raw.totalXp === 'number' ? raw.totalXp : 0);
  const rawStreak = typeof raw.streak === 'number' ? raw.streak : (typeof raw.streakDays === 'number' ? raw.streakDays : 0);
  const rawLessons = Array.isArray(raw.completedLessons)
    ? raw.completedLessons
    : (Array.isArray(raw.completedLessonIds) ? raw.completedLessonIds : []);
  const rawSessions = Array.isArray(raw.completedSessions)
    ? raw.completedSessions
    : (Array.isArray(raw.completedSessionIds) ? raw.completedSessionIds : []);

  return {
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

async function restGetUserDoc(uid: string): Promise<{ exists: boolean; data: Record<string, any> | null }> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuario no autenticado');
  const idToken = await currentUser.getIdToken();
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${encodeURIComponent(dbId)}/documents/users/${encodeURIComponent(uid)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${idToken}` },
      signal: controller.signal,
    });
    if (res.status === 404) {
      return { exists: false, data: null };
    }
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    const fields = json?.fields || {};
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = fromFirestoreRestValue(v);
    }
    return { exists: true, data: out };
  } finally {
    clearTimeout(timer);
  }
}

async function restPatchUserDoc(uid: string, payload: Record<string, any>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Usuario no autenticado');
  const idToken = await currentUser.getIdToken();
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  const keys = Object.keys(payload);
  const maskParams = keys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${encodeURIComponent(dbId)}/documents/users/${encodeURIComponent(uid)}?${maskParams}`;
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined) {
      fields[k] = toFirestoreRestValue(v);
    }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  lastCloudError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveCloudData: (profile: UserProfile, cards?: Flashcard[], options?: { throwOnError?: boolean }) => Promise<void>;
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

    // 1. Fetch user profile from Firestore server (with stateless REST fallback)
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await withTimeout(
        getDocFromServer(userRef),
        5000,
        'Tiempo de espera agotado al consultar Firestore'
      );

      docExists = userSnap.exists();
      const raw = userSnap.data();
      rawDoc = raw || null;

      if (docExists && raw) {
        profileData = parseRawDocToProfile(raw);
      }
    } catch (sdkError: any) {
      const sdkMsg = sdkError instanceof Error ? sdkError.message : String(sdkError);
      console.warn('Firestore SDK getDocFromServer failed, trying direct REST fallback:', sdkMsg);
      try {
        const restResult = await restGetUserDoc(uid);
        docExists = restResult.exists;
        rawDoc = restResult.data;
        if (restResult.exists && restResult.data) {
          profileData = parseRawDocToProfile(restResult.data);
        }
        profileError = false;
        errorMessage = undefined;
      } catch (restErr: any) {
        const errText = restErr instanceof Error ? restErr.message : String(restErr);
        console.warn('Could not fetch user profile from Firestore (SDK & REST):', errText);
        errorMessage = errText;
        setLastCloudError(errText);
        handleFirestoreError(sdkError, OperationType.GET, userDocPath);
        profileError = true;
      }
    }

    // 2. Fetch Leitner cards in an isolated try-catch with 3.5s timeout so it NEVER blocks profile XP/lesson sync
    try {
      const cardsSnap = await withTimeout(
        getDocs(collection(db, 'users', uid, 'flashcards')),
        3500,
        'Tiempo de espera agotado al cargar tarjetas'
      );
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

  const saveCloudData = useCallback(async (profile: UserProfile, cards?: Flashcard[], options?: { throwOnError?: boolean }) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userDocPath = `users/${uid}`;

    setSyncStatus('saving');
    try {
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

      // Fast foreground write: user document with SDK, falling back to stateless REST if SDK stalls
      try {
        await withTimeout(
          setDoc(userRef, sanitizedPayload, { merge: true }),
          5000,
          'Tiempo de espera agotado al guardar en Firestore'
        );
      } catch (sdkWriteErr: any) {
        console.warn('Firestore SDK setDoc stalled/failed, retrying via direct REST API:', sdkWriteErr?.message);
        await restPatchUserDoc(uid, sanitizedPayload);
      }

      // Save flashcards subcollection asynchronously in background so it NEVER blocks UI or sync completion
      if (cards && cards.length > 0) {
        (async () => {
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
            console.warn('Could not save flashcards subcollection in background (non-fatal):', cardSaveErr);
          }
        })();
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
      if (options?.throwOnError) {
        throw error;
      }
    }
  }, []);

  const forcePushToCloud = useCallback(async (profile: UserProfile, cards?: Flashcard[]) => {
    if (!auth.currentUser) {
      return { success: false, xpSaved: 0, error: 'No hay usuario autenticado con Google' };
    }
    const uid = auth.currentUser.uid;
    setSyncStatus('saving');
    try {
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
      try {
        await withTimeout(
          setDoc(userRef, sanitizedPayload, { merge: true }),
          5000,
          'Tiempo de espera agotado al subir a la nube'
        );
      } catch (sdkPushErr: any) {
        console.warn('Firestore SDK forcePush failed/stalled, retrying via REST API:', sdkPushErr?.message);
        await restPatchUserDoc(uid, sanitizedPayload);
      }

      // Save flashcards subcollection asynchronously in background
      if (cards && cards.length > 0) {
        (async () => {
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
            console.warn('Subcollection batch warning in background:', e);
          }
        })();
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
      let docExists = false;
      let raw: Record<string, any> | null = null;

      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await withTimeout(
          getDocFromServer(userRef),
          5000,
          'Tiempo de espera agotado al descargar de la nube'
        );
        docExists = userSnap.exists();
        raw = userSnap.data() || null;
      } catch (sdkPullErr: any) {
        console.warn('Firestore SDK forcePull failed/stalled, retrying via REST API:', sdkPullErr?.message);
        const restResult = await restGetUserDoc(uid);
        docExists = restResult.exists;
        raw = restResult.data;
      }

      if (!docExists || !raw) {
        setLastSyncedAt(new Date());
        setSyncStatus('synced');
        setLastCloudError(null);
        return { success: true, profile: undefined };
      }

      const profileData = parseRawDocToProfile(raw);

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

