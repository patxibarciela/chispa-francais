import React from 'react';
import { Flame, Target, Trophy, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeBannerProps {
  profile: UserProfile;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ profile }) => {
  const isEs = profile.supportLanguage === 'es';
  const completedCount = profile.completedLessonIds.length;
  const sessionsCount = profile.completedSessionIds.length;
  const totalCompleted = completedCount + sessionsCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-100/90 via-indigo-50/80 to-pink-50/90 border border-indigo-100 p-6 sm:p-8 shadow-xs">
        {/* Subtle decorative background stars */}
        <div className="absolute right-4 top-4 text-3xl opacity-20 select-none pointer-events-none">
          🪐
        </div>
        <div className="absolute right-24 bottom-3 text-2xl opacity-20 select-none pointer-events-none">
          ✨
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Greeting Column */}
          <div className="space-y-2">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-amber-700 text-xs font-bold shadow-2xs border border-amber-200/60">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>
                {isEs 
                  ? `RACHA DE ${profile.streakDays} DÍAS • Objetivo del día: ${Math.min(profile.totalXp, 30)}/30 XP` 
                  : `${profile.streakDays} DAGARS SVIT • Dagens mål: ${Math.min(profile.totalXp, 30)}/30 XP`}
              </span>
            </div>

            {/* Big Greeting */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isEs 
                ? `¡Hola, ${profile.name}! ¿Qué practicamos hoy?` 
                : `Hej ${profile.name}! Vad tränar vi på idag?`}
            </h1>

            {/* Encouraging text with French flair */}
            <p className="text-sm text-slate-600 max-w-xl">
              {isEs 
                ? `Tu racha actual: ${profile.streakDays} días seguidos practicando francés con Chispa. ¡Tu fluidez sigue progresando!` 
                : `Din aktuella svit: ${profile.streakDays} dagars träning i franska. Fortsätt framåt!`}
            </p>
          </div>

          {/* Quick Stats Group from screenshot 2 */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="bg-white/95 rounded-2xl px-4 py-3 border border-slate-200/80 shadow-2xs text-center min-w-[85px]">
              <span className="block text-xl font-black text-indigo-600">8</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isEs ? 'Unidades' : 'Enheter'}
              </span>
            </div>

            <div className="bg-white/95 rounded-2xl px-4 py-3 border border-slate-200/80 shadow-2xs text-center min-w-[85px]">
              <span className="block text-xl font-black text-emerald-600">
                {totalCompleted > 0 ? '100%' : '0%'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isEs ? 'Precisión' : 'Precision'}
              </span>
            </div>

            <div className="bg-white/95 rounded-2xl px-4 py-3 border border-slate-200/80 shadow-2xs text-center min-w-[85px]">
              <span className="block text-xl font-black text-purple-600">Åk 6</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isEs ? 'Etapa' : 'Stadie'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
