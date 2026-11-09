import React from 'react';
import { Flame, Target, Trophy, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { CURRICULUM_UNITS } from '../data/curriculum';

interface WelcomeBannerProps {
  profile: UserProfile;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ profile }) => {
  const isEs = profile.supportLanguage === 'es';
  const completedCount = profile.completedLessonIds.length;
  const sessionsCount = profile.completedSessionIds.length;
  const totalCompleted = completedCount + sessionsCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-100/70 via-indigo-50/60 to-pink-50/70 border border-indigo-100/80 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Greeting Column */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/95 text-amber-700 text-xs font-bold shadow-2xs border border-amber-200/60">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                  {isEs 
                    ? (profile.streakDays === 1 ? 'Racha de 1 día' : `Racha de ${profile.streakDays} días`)
                    : (profile.streakDays === 1 ? '1 dags svit' : `${profile.streakDays} dagars svit`)}
                </span>
              </span>

              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {isEs 
                  ? `¡Hola, ${profile.name}! ¿Qué practicamos hoy?` 
                  : `Hej ${profile.name}! Vad tränar vi på idag?`}
              </h1>
            </div>

            <p className="text-xs text-slate-600 line-clamp-1">
              {isEs 
                ? `Objetivo del día: ${Math.min(profile.totalXp, 30)}/30 XP • Tu fluidez en francés sigue progresando paso a paso.` 
                : `Dagens mål: ${Math.min(profile.totalXp, 30)}/30 XP • Fortsätt framåt med din franska träning.`}
            </p>
          </div>

          {/* Quick Stats Group - compact inline pills */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <div className="bg-white/90 rounded-xl px-2.5 py-1 border border-slate-200/80 shadow-2xs text-center flex items-center gap-1.5">
              <span className="text-xs font-bold text-indigo-600">
                {CURRICULUM_UNITS.length}
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {isEs ? 'Unidades' : 'Enheter'}
              </span>
            </div>

            <div className="bg-white/90 rounded-xl px-2.5 py-1 border border-slate-200/80 shadow-2xs text-center flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-600">
                {totalCompleted > 0 ? '100%' : '0%'}
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {isEs ? 'Precisión' : 'Precision'}
              </span>
            </div>

            <div className="bg-white/90 rounded-xl px-2.5 py-1 border border-slate-200/80 shadow-2xs text-center flex items-center gap-1.5">
              <span className="text-xs font-bold text-purple-600">
                {profile.currentGrade === 'ak7' ? 'Åk 7' : 'Åk 6'}
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {isEs ? 'Etapa' : 'Stadie'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
