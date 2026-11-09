import React, { useState, useEffect, useRef } from 'react';
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

  // Sync with Firestore whenever user signs in or changes
  useEffect(() => {
    if (!user) return;

    let isCancelled = false;
    async function syncFromCloud() {
      try {
        const cloudData = await loadCloudData(user!.uid);
        if (isCancelled || !cloudData) return;

        const local = profileRef.current;
        const remoteProfile = cloudData.profile;

        let merged: UserProfile;
        if (!remoteProfile) {
          // New user, write initial profile to cloud
          merged = {
            ...local,
            id: user!.uid,
            name: user!.displayName || local.name,
            email: user!.email || undefined,
            photoURL: user!.photoURL || undefined,
            accountType: 'google',
          };
        } else {
          // Union of completed lessons and sessions
          const mergedLessons = Array.from(
            new Set([...(local.completedLessonIds || []), ...(remoteProfile.completedLessonIds || [])])
          );
          const mergedSessions = Array.from(
            new Set([...(local.completedSessionIds || []), ...(remoteProfile.completedSessionIds || [])])
          );

          const candidate: UserProfile = {
            ...local,
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
            currentGrade: remoteProfile.currentGrade || local.currentGrade,
            chatMemory: remoteProfile.chatMemory || local.chatMemory,
          };

          merged = syncProfileStreakOnLoad(candidate);
        }

        saveUserProfile(merged);
        setProfile(merged);

        let finalCards = cardsRef.current;
        if (cloudData.cards && cloudData.cards.length > 0) {
          finalCards = cloudData.cards;
          setCards(cloudData.cards);
          saveFlashcards(cloudData.cards);
        }

        if (!remoteProfile) {
          saveCloudData(merged, finalCards);
        }
      } catch (err) {
        console.warn('Could not sync cloud data initially:', err);
      }
    }

    syncFromCloud();

    return () => {
      isCancelled = true;
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
      saveCloudData(next, cardsRef.current);
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
      saveCloudData(next, cardsRef.current);
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
      saveCloudData(next, cardsRef.current);
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
      saveCloudData(next, cardsRef.current);
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
