import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  MessageSquare, 
  ShieldCheck, 
  UserPlus, 
  X, 
  Loader2, 
  Sparkles,
  ChevronRight,
  Globe,
  Zap
} from 'lucide-react';
import { UserProfile, LanguagePreference } from '../types';
import { useAuth } from '../context/AuthContext';
import { loadSavedProfiles, saveLocalProfile, deleteLocalProfile } from '../utils/storage';

interface LoginLandingViewProps {
  onSelectProfile: (profile: UserProfile) => void;
  supportLanguage: LanguagePreference;
  onToggleLanguage: () => void;
}

export const LoginLandingView: React.FC<LoginLandingViewProps> = ({
  onSelectProfile,
  supportLanguage,
  onToggleLanguage,
}) => {
  const { signInWithGoogle } = useAuth();
  const [signingInGoogle, setSigningInGoogle] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentBio, setStudentBio] = useState('');
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>(loadSavedProfiles);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isEs = supportLanguage === 'es';

  const handleGoogleSignIn = async () => {
    try {
      setSigningInGoogle(true);
      setErrorMsg(null);
      await signInWithGoogle();
      // On success, AuthProvider will trigger user state and App will transition
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(isEs ? 'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo o crea un perfil local.' : 'Kunde inte logga in med Google. Försök igen eller skapa en lokal profil.');
    } finally {
      setSigningInGoogle(false);
    }
  };

  const handleCreateLocalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) {
      setErrorMsg(isEs ? 'Por favor introduce tu nombre o apodo' : 'Vänligen ange ditt namn eller smeknamn');
      return;
    }

    const newProfile: UserProfile = {
      id: `local_${Date.now()}`,
      name: trimmed,
      bio: studentBio.trim(),
      accountType: 'local',
      streakDays: 0,
      lastStudyDate: '',
      totalXp: 0,
      completedLessonIds: [],
      completedSessionIds: [],
      currentGrade: 'ak6',
      soundEnabled: true,
      voiceSpeed: 0.9,
      supportLanguage,
      dailyGoalMinutes: 30,
      minutesToday: 0,
    };

    saveLocalProfile(newProfile);
    setSavedProfiles(loadSavedProfiles());
    onSelectProfile(newProfile);
  };

  const handleSelectExisting = (profile: UserProfile) => {
    onSelectProfile(profile);
  };

  const handleDeleteProfile = (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    if (!id) return;
    deleteLocalProfile(id);
    setSavedProfiles(loadSavedProfiles());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white flex flex-col justify-between">
      {/* Decorative Top Bar Banner matching Chispa styling */}
      <div className="w-full bg-gradient-to-r from-violet-100/80 via-indigo-100/70 to-pink-100/80 border-b border-indigo-100/70 py-3 px-4 sm:px-8 relative overflow-hidden">
        {/* Subtle playful floating decorative shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-around">
          <span className="text-xl text-indigo-400 select-none animate-pulse">✦</span>
          <span className="text-2xl text-pink-400 select-none">🪐</span>
          <span className="text-xl text-purple-400 select-none">⚡</span>
          <span className="text-2xl text-emerald-400 select-none">💎</span>
          <span className="text-xl text-blue-400 select-none">✧</span>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-sm shrink-0">
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
          </div>

          {/* Language support switch */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/90 hover:bg-white text-indigo-900 shadow-xs border border-indigo-200/80 transition-all cursor-pointer"
            title={isEs ? 'Cambiar idioma de apoyo a Sueco' : 'Byt stödspråk till spanska'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isEs ? '🇪🇸 Idioma: Español' : '🇸🇪 Stödspråk: Svenska'}</span>
          </button>
        </div>
      </div>

      {/* Main Landing Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Educational Value & Features */}
          <div className="lg:col-span-7 space-y-6">
            {/* Safe badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {isEs 
                  ? 'Espacio personal por estudiante • Progreso independiente' 
                  : 'Personligt utrymme för eleven • Självständiga framsteg'}
              </span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {isEs 
                ? 'Tu estudio interactivo para practicar francés cada día' 
                : 'Din interaktiva studio för att träna franska varje dag'}
            </h1>

            {/* Subtitle explanation */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {isEs 
                ? 'Inicia sesión o crea tu cuenta personal antes de empezar. Así tus lecciones, tus sesiones guiadas de 30 minutos, tus tarjetas de repetición espaciada y tus puntos de experiencia serán exclusivamente tuyos.' 
                : 'Logga in eller skapa ett personligt konto innan du börjar. På så sätt blir dina lektioner, 30-minutersövningar, repetitionskort och XP-poäng helt dina egna.'}
            </p>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {isEs ? 'Ruta de Aprendizaje' : 'Inlärningsväg'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isEs 
                    ? 'Unidades progresivas con 3 pasos preparatorios y sesión guiada de 30 min.' 
                    : 'Enheter med 3 steg och 30-minuters lektion för Moderna språk.'}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {isEs ? 'Repetición Espaciada' : 'Spaced Repetition'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isEs 
                    ? 'Cajas de Leitner y pronunciación nativa para no olvidar el vocabulario.' 
                    : 'Leitner-systemet för att minnas glosor och uttal långsiktigt.'}
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-pink-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  {isEs ? 'Charla con Camille' : 'Samtal med Camille'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isEs 
                    ? '4 fases estructuradas: calentamiento, input, juego de rol y salida.' 
                    : '4 faser: uppvärmning, förståelse, rollspel och avslutande utmaning.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative">
              {/* Card Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isEs ? 'Entrar o crear cuenta' : 'Logga in eller skapa konto'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isEs 
                    ? 'Accede con Google para guardar tu progreso en la nube o crea un perfil rápido en este navegador.' 
                    : 'Logga in med Google för att spara i molnet eller skapa en snabb lokal profil.'}
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Primary Google Login Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={signingInGoogle}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {signingInGoogle ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                  )}
                  <span>{isEs ? 'Continuar con Google' : 'Fortsätt med Google'}</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  {isEs 
                    ? 'Recomendado si accedes desde distintos dispositivos o compartes el enlace.' 
                    : 'Rekommenderas om du använder surfplatta, mobil eller dator.'}
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {isEs ? 'O perfil local sin correo' : 'Eller lokal profil utan e-post'}
                </span>
              </div>

              {/* Profiles saved in this browser */}
              {savedProfiles.length > 0 && (
                <div className="mb-5 bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    {isEs ? 'Perfiles guardados en este navegador:' : 'Sparade profiler i denna webbläsare:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {savedProfiles.map((p) => (
                      <div
                        key={p.id || p.name}
                        onClick={() => handleSelectExisting(p)}
                        className="group flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">
                          {p.totalXp} XP
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProfile(e, p.id)}
                          className="text-slate-300 hover:text-red-500 ml-0.5 p-0.5 rounded-full transition-colors"
                          title={isEs ? 'Eliminar perfil de este navegador' : 'Ta bort profil'}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create or Enter with Local Profile Form */}
              <form onSubmit={handleCreateLocalProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isEs ? 'Tu nombre o apodo de estudiante' : 'Ditt namn eller smeknamn'}
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={isEs ? 'Ej.: Sofía, Mateo, Elin, Astrid...' : 'T.ex. Elin, Lucas, Astrid, Sofia...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isEs ? 'Sobre ti para el chat (opcional)' : 'Om dig till chatten (valfritt)'}
                  </label>
                  <input
                    type="text"
                    value={studentBio}
                    onChange={(e) => setStudentBio(e.target.value)}
                    placeholder={isEs ? 'Ej.: 13 años, elijo francés en Åk 6, me gusta el deporte...' : 'T.ex. 13 år, gillar musik och fotboll...'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isEs ? 'Crear perfil o entrar en este navegador' : 'Skapa profil eller gå in'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle Footer */}
      <div className="py-4 text-center text-xs text-slate-400 border-t border-slate-100">
        <span>Chispa Français · Moderna språk · Franska Årskurs 6</span>
      </div>
    </div>
  );
};
