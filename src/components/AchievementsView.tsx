import React from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  CheckCircle2, 
  Clock, 
  Award, 
  Printer, 
  GraduationCap, 
  BookOpen, 
  Sparkles
} from 'lucide-react';
import { UserProfile, Flashcard } from '../types';
import { calculateLevel, getAchievements } from '../utils/storage';
import { SectionBanner } from './SectionBanner';

interface AchievementsViewProps {
  profile: UserProfile;
  cards: Flashcard[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ profile, cards }) => {
  const isSwedish = profile.supportLanguage === 'sv';
  const { level, title, currentLevelXp, nextLevelXp } = calculateLevel(profile.totalXp);
  const achievements = getAchievements(profile, cards);

  const masteredWords = cards.filter((c) => c.box === 3).length;
  const learningWords = cards.filter((c) => c.box === 2).length;

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div>
      {/* Unified Section Header matching Chispa style */}
      <SectionBanner
        categoryBadge={isSwedish ? 'FRAMSTEG & UTMÄRKELSER' : 'PROGRESO & RECOMPENSAS'}
        categoryIcon={Trophy}
        title={isSwedish ? 'Mina Utmärkelser & Mål' : 'Mis Logros y Medallas'}
        description={
          isSwedish
            ? 'Följ din progression i årskurs 6, samla erfarenhetspoäng och lås upp officiella medaljer.'
            : 'Sigue tu progresión paso a paso en Årskurs 6, acumula puntos de experiencia y desbloquea insignias.'
        }
        metrics={[
          { value: `${profile.totalXp} XP`, label: isSwedish ? 'Total XP' : 'XP Total', colorClass: 'text-purple-600' },
          { value: `${profile.completedLessonIds.length}`, label: isSwedish ? 'Lektioner' : 'Pasos hechos', colorClass: 'text-emerald-600' },
          { value: `${profile.streakDays}d`, label: isSwedish ? 'Svit' : 'Racha', colorClass: 'text-amber-600' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Profile & Level Spotlight */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0">
            {level}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Niveau {level}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSwedish ? 'Moderna språk · Franska årskurs 6' : 'Francés Moderna språk · Årskurs 6'}
            </p>

            {/* Level XP Progress Bar */}
            <div className="mt-3 w-64 max-w-full">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>{currentLevelXp} XP</span>
                <span>{nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentLevelXp / nextLevelXp) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1 fill-amber-500" />
            <span className="text-lg font-bold text-slate-900 block tabular-nums">
              {profile.streakDays}
            </span>
            <span className="text-[11px] text-slate-500">{isSwedish ? 'Dagar i rad' : 'Días racha'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <Star className="w-5 h-5 text-indigo-500 mx-auto mb-1 fill-indigo-500" />
            <span className="text-lg font-bold text-slate-900 block tabular-nums">
              {profile.totalXp}
            </span>
            <span className="text-[11px] text-slate-500">Total XP</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <BookOpen className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <span className="text-lg font-bold text-slate-900 block tabular-nums">
              {masteredWords}
            </span>
            <span className="text-[11px] text-slate-500">{isSwedish ? 'Behärskade ord' : 'Palabras dom.'}</span>
          </div>
        </div>
      </div>

      {/* Badges / Trophées Grid */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>{isSwedish ? 'Dina utmärkelser & troféer' : 'Tus trofeos y logros'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'bg-white border-amber-200/80 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                    ach.unlocked
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{ach.title}</h3>
                    {ach.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                      <span>Framsteg</span>
                      <span>
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{
                          width: `${(ach.progress / ach.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Study Report Card for School */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm print:bg-white print:text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>{isSwedish ? 'Skolrapport · Moderna språk' : 'Informe de Estudio para la Escuela'}</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Rapport d'apprentissage · Français Åk 6
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSwedish
                ? 'Visa för din lärare eller spara för att följa dina framsteg under terminen.'
                : 'Muestra este resumen a tu profesor/a de la escuela o a tus padres para certificar tus sesiones.'}
            </p>
          </div>

          <button
            onClick={handlePrintCertificate}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>{isSwedish ? 'Skriv ut / Spara PDF' : 'Imprimir Informe'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1">
              {isSwedish ? 'Slutförda lektioner' : 'Lecciones completadas'}
            </span>
            <span className="text-lg font-bold text-white block">
              {profile.completedLessonIds.length} lektioner
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1">
              {isSwedish ? '30-minuters pass' : 'Sesiones de 30 min'}
            </span>
            <span className="text-lg font-bold text-white block">
              {profile.completedSessionIds.length} pass
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1">
              {isSwedish ? 'Ordförråd (Låda 2+3)' : 'Vocabulario activo'}
            </span>
            <span className="text-lg font-bold text-white block">
              {learningWords + masteredWords} ord
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1">
              {isSwedish ? 'Nivåstatus' : 'Nivel alcanzado'}
            </span>
            <span className="text-lg font-bold text-emerald-400 block">
              A1.1 Grund
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
