import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginLandingView } from './components/LoginLandingView';
import { WelcomeBanner } from './components/WelcomeBanner';
import { Sidebar } from './components/Sidebar';
import { CurriculumRoadmap } from './components/CurriculumRoadmap';
import { DailySessionView } from './components/DailySessionView';
import { LessonModal } from './components/LessonModal';
import { SpacedRepetitionDeck } from './components/SpacedRepetitionDeck';
import { AITutorChat } from './components/AITutorChat';
import { AchievementsView } from './components/AchievementsView';
import { 
  UserProfile, 
  Lesson, 
  Unit, 
  Flashcard 
} from './types';
import { 
  loadUserProfile, 
  saveUserProfile, 
  loadFlashcards, 
  saveFlashcards,
  getActiveProfileId,
  setActiveProfileId,
  resetAllProgress,
  recordStudyActivity,
  syncProfileStreakOnLoad
} from './utils/storage';
import { CURRICULUM_UNITS } from './data/curriculum';

function ChispaFrançaisApp() {
  const { user, loading, saveCloudData, loadCloudData } = useAuth();
  const [hasSelectedSession, setHasSelectedSession] = useState<boolean>(() => {
    return !!getActiveProfileId();
  });
  
  const [activeTab, setActiveTab] = useState<'roadmap' | 'cards' | 'tutor' | 'achievements'>('roadmap');
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [cards, setCards] = useState<Flashcard[]>(loadFlashcards);

  const profileRef = useRef<UserProfile>(profile);
  profileRef.current = profile;
  const cardsRef = useRef<Flashcard[]>(cards);
  cardsRef.current = cards;

  // Active lesson modal and active 30-min session unit
  const [activeLessonContext, setActiveLessonContext] = useState<{ lesson: Lesson; unit: Unit } | null>(null);
  const [activeSessionUnit, setActiveSessionUnit] = useState<Unit | null>(null);

  // If user logs in with Google, activate session automatically
  useEffect(() => {
    if (user) {
      setHasSelectedSession(true);
    }
  }, [user]);

  // Real-time synchronization with Firestore across all devices (Chromebook, mobile, desktop)
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;

    async function initialSync() {
      try {
        const cloudData = await loadCloudData(user!.uid);
        if (isCancelled || !cloudData) return;

        // If there was an error reading from cloud, do not attempt to overwrite anything
        if (cloudData.hasError) {
          console.warn('Network issue reading cloud data; skipping cloud initialization until online');
          return;
        }

        const local = profileRef.current;
        const remoteProfile = cloudData.profile;

        let finalCards = cardsRef.current;
        if (cloudData.cards && cloudData.cards.length > 0) {
          finalCards = cloudData.cards;
          setCards(cloudData.cards);
          saveFlashcards(cloudData.cards);
        }

        let merged: UserProfile;

        if (!cloudData.docExists || !remoteProfile) {
          // Brand-new account in Firestore: create initial document with current local progress
          merged = {
            ...local,
            id: user!.uid,
            name: user!.displayName || local.name,
            email: user!.email || undefined,
            photoURL: user!.photoURL || undefined,
            accountType: 'google',
          };
          saveCloudData(merged, finalCards);
        } else {
          // Document exists: union completed lessons & sessions, take max XP & streak
          const mergedLessons = Array.from(
            new Set([...(local.completedLessonIds || []), ...(remoteProfile.completedLessonIds || [])])
          );
          const mergedSessions = Array.from(
            new Set([...(local.completedSessionIds || []), ...(remoteProfile.completedSessionIds || [])])
          );

          const candidate: UserProfile = {
            ...local,
            ...remoteProfile,
            id: user!.uid,
            name: user!.displayName || remoteProfile.name || local.name,
            email: user!.email || undefined,
            photoURL: user!.photoURL || undefined,
            accountType: 'google',
            totalXp: Math.max(local.totalXp, remoteProfile.totalXp || 0),
            streakDays: Math.max(local.streakDays, remoteProfile.streakDays || 0),
            lastStudyDate: remoteProfile.lastStudyDate || local.lastStudyDate || '',
            completedLessonIds: mergedLessons,
            completedSessionIds: mergedSessions,
            currentGrade: remoteProfile.currentGrade || local.currentGrade || 'ak6',
            chatMemory: remoteProfile.chatMemory || local.chatMemory,
            supportLanguage: remoteProfile.supportLanguage || local.supportLanguage || 'es',
            frenchImmersionLevel: remoteProfile.frenchImmersionLevel || local.frenchImmersionLevel || 'balanced',
            soundEnabled: remoteProfile.soundEnabled ?? local.soundEnabled,
            voiceSpeed: remoteProfile.voiceSpeed ?? local.voiceSpeed,
          };

          merged = syncProfileStreakOnLoad(candidate);

          // If local device had lessons or sessions completed offline, sync back to Firestore
          const hasLocalDelta =
            merged.totalXp > (remoteProfile.totalXp || 0) ||
            mergedLessons.length > (remoteProfile.completedLessonIds?.length || 0) ||
            mergedSessions.length > (remoteProfile.completedSessionIds?.length || 0);

          if (hasLocalDelta) {
            saveCloudData(merged);
          }
        }

        saveUserProfile(merged);
        setProfile(merged);
      } catch (err) {
        console.warn('Initial cloud sync exception:', err);
      }
    }

    // 1. Run initial sync on sign-in
    initialSync();

    // 2. Real-time onSnapshot listener: instantly receives updates when user completes lessons on other devices
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeSnapshot = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const remote = docSnap.data();
        const current = profileRef.current;

        const remoteLessons: string[] = Array.isArray(remote.completedLessons)
          ? remote.completedLessons
          : (Array.isArray(remote.completedLessonIds) ? remote.completedLessonIds : []);
        const remoteSessions: string[] = Array.isArray(remote.completedSessions)
          ? remote.completedSessions
          : (Array.isArray(remote.completedSessionIds) ? remote.completedSessionIds : []);
        const remoteXp = typeof remote.xp === 'number'
          ? remote.xp
          : (typeof remote.totalXp === 'number' ? remote.totalXp : 0);
        const remoteStreak = typeof remote.streak === 'number'
          ? remote.streak
          : (typeof remote.streakDays === 'number' ? remote.streakDays : 0);

        const mergedLessons = Array.from(new Set([...(current.completedLessonIds || []), ...remoteLessons]));
        const mergedSessions = Array.from(new Set([...(current.completedSessionIds || []), ...remoteSessions]));

        const candidate: UserProfile = {
          ...current,
          id: user.uid,
          name: remote.displayName || user.displayName || current.name,
          email: remote.email || user.email || current.email,
          photoURL: remote.photoURL || user.photoURL || current.photoURL,
          accountType: 'google',
          totalXp: Math.max(current.totalXp, remoteXp),
          streakDays: Math.max(current.streakDays, remoteStreak),
          lastStudyDate: remote.lastActivityDate || current.lastStudyDate || '',
          completedLessonIds: mergedLessons,
          completedSessionIds: mergedSessions,
          currentGrade: remote.currentGrade || current.currentGrade || 'ak6',
          supportLanguage: remote.supportLanguage === 'sv' ? 'sv' : (remote.supportLanguage === 'es' ? 'es' : current.supportLanguage),
          frenchImmersionLevel: remote.frenchImmersionLevel || current.frenchImmersionLevel || 'balanced',
          soundEnabled: typeof remote.soundEnabled === 'boolean' ? remote.soundEnabled : current.soundEnabled,
          voiceSpeed: typeof remote.voiceSpeed === 'number' ? remote.voiceSpeed : current.voiceSpeed,
        };

        const synced = syncProfileStreakOnLoad(candidate);

        // Check if anything actually updated to prevent redundant state re-renders
        const xpChanged = synced.totalXp !== current.totalXp;
        const streakChanged = synced.streakDays !== current.streakDays;
        const lessonsChanged = JSON.stringify(synced.completedLessonIds) !== JSON.stringify(current.completedLessonIds);
        const sessionsChanged = JSON.stringify(synced.completedSessionIds) !== JSON.stringify(current.completedSessionIds);
        const langChanged = synced.supportLanguage !== current.supportLanguage;

        if (xpChanged || streakChanged || lessonsChanged || sessionsChanged || langChanged) {
          saveUserProfile(synced);
          setProfile(synced);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    // 3. Listen for tab visibility / focus (mobile unlock or switching back from another app)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        initialSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      isCancelled = true;
      unsubscribeSnapshot();
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [user, loadCloudData, saveCloudData]);

  // Save to localStorage when profile changes
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  // Save to localStorage when cards change
  useEffect(() => {
    saveFlashcards(cards);
  }, [cards]);

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const next: UserProfile = { ...profile, ...updated };
    saveUserProfile(next);
    setProfile(next);
    if (user) {
      saveCloudData(next);
    }
  };

  const handleUpdateCards = (updatedCards: Flashcard[]) => {
    setCards(updatedCards);
    saveFlashcards(updatedCards);
    if (user) {
      saveCloudData(profileRef.current, updatedCards);
    }
  };

  const handleSelectLesson = (lesson: Lesson, unit: Unit) => {
    setActiveLessonContext({ lesson, unit });
  };

  const handleSelectSession = (unit: Unit) => {
    setActiveSessionUnit(unit);
  };

  const handleCompleteLesson = (earnedXp: number) => {
    if (!activeLessonContext) return;
    const lessonId = activeLessonContext.lesson.id;

    const isAlreadyDone = profile.completedLessonIds.includes(lessonId);
    const updatedDone = isAlreadyDone ? profile.completedLessonIds : [...profile.completedLessonIds, lessonId];

    const baseUpdate: UserProfile = {
      ...profile,
      totalXp: profile.totalXp + earnedXp,
      completedLessonIds: updatedDone,
      minutesToday: profile.minutesToday + 10,
    };

    const next = recordStudyActivity(baseUpdate);

    saveUserProfile(next);
    setProfile(next);
    if (user) {
      saveCloudData(next);
    }
  };

  const handleCompleteSession = (earnedXp: number) => {
    const sessionId = activeSessionUnit?.dailySessionTemplate.id || 'session-daily';

    const baseUpdate: UserProfile = {
      ...profile,
      totalXp: profile.totalXp + earnedXp,
      completedSessionIds: profile.completedSessionIds.includes(sessionId)
        ? profile.completedSessionIds
        : [...profile.completedSessionIds, sessionId],
      minutesToday: profile.minutesToday + 30,
    };

    const next = recordStudyActivity(baseUpdate);

    saveUserProfile(next);
    setProfile(next);
    if (user) {
      saveCloudData(next);
    }
  };

  const handleRecordPracticeActivity = (earnedXp: number = 0) => {
    const baseUpdate: UserProfile = {
      ...profile,
      totalXp: profile.totalXp + earnedXp,
      minutesToday: profile.minutesToday + 2,
    };

    const next = recordStudyActivity(baseUpdate);

    saveUserProfile(next);
    setProfile(next);
    if (user) {
      saveCloudData(next);
    }
  };

  const handleSelectProfileFromLanding = (selectedProfile: UserProfile) => {
    const synced = syncProfileStreakOnLoad(selectedProfile);
    setProfile(synced);
    saveUserProfile(synced);
    if (synced.id) {
      setActiveProfileId(synced.id);
    }
    setHasSelectedSession(true);
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    setHasSelectedSession(false);
  };

  const handleResetProgress = () => {
    const { profile: cleanProfile, cards: cleanCards } = resetAllProgress();
    setProfile(cleanProfile);
    setCards(cleanCards);
    if (user) {
      saveCloudData(cleanProfile, cleanCards);
    }
  };

  // If not logged in via Google and no local profile active, show the Login / Welcome Landing screen
  if (!loading && !user && !hasSelectedSession) {
    return (
      <LoginLandingView
        onSelectProfile={handleSelectProfileFromLanding}
        supportLanguage={profile.supportLanguage}
        onToggleLanguage={() => {
          const nextLang = profile.supportLanguage === 'es' ? 'sv' : 'es';
          handleUpdateProfile({ supportLanguage: nextLang });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Universal Top Bar with Account Pill matching screenshot 2 */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveSessionUnit(null);
          setActiveTab(tab);
        }}
        profile={profile}
        cards={cards}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        onResetProgress={handleResetProgress}
      />

      {/* App Body with Left Sidebar (like Chispa Español) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {!activeSessionUnit && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveSessionUnit(null);
              setActiveTab(tab);
            }}
            profile={profile}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 pb-16 min-w-0">
          {activeSessionUnit ? (
            // Active 30-minute structured session directly within the curriculum flow
            <DailySessionView
              unit={activeSessionUnit}
              profile={profile}
              onCompleteSession={handleCompleteSession}
              onClose={() => setActiveSessionUnit(null)}
              onSelectUnit={setActiveSessionUnit}
            />
          ) : (
            <>
              {/* Top Welcome Banner from screenshot */}
              {activeTab === 'roadmap' && (
                <WelcomeBanner profile={profile} />
              )}

              {activeTab === 'roadmap' && (
                <CurriculumRoadmap
                  profile={profile}
                  onSelectLesson={handleSelectLesson}
                  onSelectSession={handleSelectSession}
                />
              )}

              {activeTab === 'cards' && (
                <SpacedRepetitionDeck
                  cards={cards}
                  onUpdateCards={handleUpdateCards}
                  profile={profile}
                  units={CURRICULUM_UNITS}
                  onRecordStudy={handleRecordPracticeActivity}
                />
              )}

              {activeTab === 'tutor' && (
                <AITutorChat 
                  profile={profile} 
                  onRecordStudy={handleRecordPracticeActivity}
                />
              )}

              {activeTab === 'achievements' && (
                <AchievementsView profile={profile} cards={cards} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Interactive Lesson Modal */}
      {activeLessonContext && (
        <LessonModal
          lesson={activeLessonContext.lesson}
          unit={activeLessonContext.unit}
          profile={profile}
          onComplete={handleCompleteLesson}
          onClose={() => setActiveLessonContext(null)}
        />
      )}

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>Chispa Français · Moderna språk Franska Åk 6</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sincronización en la nube con Google</span>
            <span>·</span>
            <span>Repetición Espaciada</span>
            <span>·</span>
            <span>Tutor Adaptativo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChispaFrançaisApp />
    </AuthProvider>
  );
}
