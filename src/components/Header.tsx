import React, { useState } from 'react';
import { 
  Flame, 
  Star, 
  Volume2, 
  VolumeX, 
  Globe, 
  LogOut, 
  ChevronDown, 
  Gem, 
  Cloud,
  HardDrive,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { UserProfile, LanguagePreference, Flashcard } from '../types';
import { useAuth } from '../context/AuthContext';
import { AccountModal } from './AccountModal';

interface HeaderProps {
  activeTab: 'roadmap' | 'cards' | 'tutor' | 'achievements';
  setActiveTab: (tab: 'roadmap' | 'cards' | 'tutor' | 'achievements') => void;
  profile: UserProfile;
  cards?: Flashcard[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onResetProgress?: () => void;
  onManualSync?: () => Promise<any>;
  onForcePush?: () => Promise<any>;
  onForcePull?: () => Promise<any>;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  cards,
  onUpdateProfile,
  onLogout,
  onResetProgress,
  onManualSync,
  onForcePush,
  onForcePull,
}) => {
  const { user, signOut, syncStatus } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEs = profile.supportLanguage === 'es';
  const isCloud = !!user;
  const masteredGems = cards ? cards.filter((c) => c.box === 3).length : 0;

  const toggleLanguage = () => {
    const nextLang: LanguagePreference = profile.supportLanguage === 'es' ? 'sv' : 'es';
    onUpdateProfile({ supportLanguage: nextLang });
  };

  const toggleSound = () => {
    onUpdateProfile({ soundEnabled: !profile.soundEnabled });
  };

  const handleSignOutClick = async () => {
    setShowUserMenu(false);
    if (user) {
      await signOut();
    }
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top subtle decorative strip */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

      {/* Decorative background with playful floating elements matching Chispa */}
      <div className="relative overflow-hidden">
        {/* Subtle background grid & sparkles */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-around overflow-hidden select-none">
          <span className="text-lg text-purple-400">✦</span>
          <span className="text-xl text-pink-400">🪐</span>
          <span className="text-lg text-indigo-400">⚡</span>
          <span className="text-xl text-emerald-400">💎</span>
          <span className="text-lg text-purple-300">✧</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6 relative z-10">
          
          {/* Logo EXACTLY as in Chispa Español: Lightning Circle + Chispa + FRANÇAIS (no Åk 6) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            >
              {/* Purple circle with white lightning */}
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-sm shrink-0 transition-transform group-hover:scale-105">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Chispa
                </span>
                <span className="text-[10px] font-black tracking-[0.22em] text-purple-700 uppercase mt-1 leading-none">
                  FRANÇAIS
                </span>
              </div>
            </button>
          </div>

          {/* Right Status Counters, Toggles & User Account Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Streak */}
            <div 
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200/70 select-none cursor-default"
              title={isEs 
                ? (profile.streakDays === 1 ? '1 día de racha' : `${profile.streakDays} días seguidos de racha`) 
                : (profile.streakDays === 1 ? '1 dags svit' : `${profile.streakDays} dagars svit`)}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="tabular-nums">{profile.streakDays}d</span>
            </div>

            {/* Mastered / Gems */}
            <div 
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200/70 select-none cursor-default"
              title={isEs ? 'Tarjetas dominadas en Caja 3' : 'Behärskade glosor'}
            >
              <Gem className="w-3.5 h-3.5 text-purple-500" />
              <span className="tabular-nums">{masteredGems}</span>
            </div>

            {/* XP Counter */}
            <div 
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200/70 select-none cursor-default"
              title={isEs ? `${profile.totalXp} puntos de experiencia acumulados` : `${profile.totalXp} XP intjänade`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
              <span className="tabular-nums font-black">{profile.totalXp}</span>
              <span className="text-[10px] font-bold">XP</span>
            </div>

            {/* Support Language Toggle */}
            <button
              onClick={toggleLanguage}
              type="button"
              title={isEs ? 'Idioma de apoyo: Español (clic para cambiar a Svenska)' : 'Stödspråk: Svenska (klicka för spanska)'}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
            >
              <Globe className="w-3 h-3 text-indigo-600" />
              <span>{isEs ? '🇪🇸 ES' : '🇸🇪 SV'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              type="button"
              title={profile.soundEnabled ? 'Sonidos activados' : 'Sonidos silenciados'}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {profile.soundEnabled ? <Volume2 className="w-4 h-4 text-slate-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* User Account Pill matching Chispa Español */}
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setShowUserMenu(true)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-2xl bg-white hover:bg-purple-50/50 border border-slate-200/90 hover:border-purple-300 shadow-2xs transition-all cursor-pointer focus:outline-none"
                title={isEs ? 'Ver detalles de la cuenta y cerrar sesión' : 'Visa konto och logga ut'}
              >
                {/* Circular Avatar */}
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={profile.name}
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Account text block */}
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">
                      {profile.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 leading-none">
                    <span 
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        isCloud
                          ? (syncStatus === 'saving'
                              ? 'bg-amber-400 animate-pulse'
                              : (syncStatus === 'offline' ? 'bg-amber-500' : 'bg-emerald-500'))
                          : 'bg-slate-400'
                      }`} 
                    />
                    <span className="text-[10px] font-semibold text-slate-600">
                      {isCloud 
                        ? (syncStatus === 'saving' 
                            ? (isEs ? 'Guardando...' : 'Sparar...') 
                            : (syncStatus === 'offline' 
                                ? (isEs ? 'Sin conexión' : 'Offline') 
                                : (isEs ? 'En la nube' : 'I molnet'))) 
                        : (isEs ? 'En navegador' : 'I webbläsare')}
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Account Modal matching Chispa Español screenshot */}
            <AccountModal
              isOpen={showUserMenu}
              onClose={() => setShowUserMenu(false)}
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              onLogout={onLogout}
              onResetProgress={onResetProgress}
              onManualSync={onManualSync}
              onForcePush={onForcePush}
              onForcePull={onForcePull}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation when hamburger is opened */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white p-3 space-y-1 shadow-lg animate-in fade-in duration-150">
          <button
            type="button"
            onClick={() => {
              setActiveTab('roadmap');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer font-bold text-sm ${
              activeTab === 'roadmap' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{isEs ? 'Ruta de Aprendizaje' : 'Inlärningsväg'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('cards');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer font-bold text-sm ${
              activeTab === 'cards' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{isEs ? 'Repetición Espaciada' : 'Repetition (Leitner)'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('tutor');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer font-bold text-sm ${
              activeTab === 'tutor' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{isEs ? 'Charla con Camille' : 'Samtal med Camille'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('achievements');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer font-bold text-sm ${
              activeTab === 'achievements' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{isEs ? 'Mis Logros' : 'Prestationer & Mål'}</span>
          </button>
        </div>
      )}
    </header>
  );
};
