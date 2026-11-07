import React from 'react';
import { 
  Compass, 
  Brain, 
  MessageSquare, 
  Trophy, 
  Zap,
  Target
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: 'roadmap' | 'cards' | 'tutor' | 'achievements';
  setActiveTab: (tab: 'roadmap' | 'cards' | 'tutor' | 'achievements') => void;
  profile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
}) => {
  const isEs = profile.supportLanguage === 'es';

  // Calculate weekly goal (e.g. 1 out of 5 days based on streak or study dates)
  const daysThisWeek = Math.min(5, Math.max(1, profile.streakDays % 7 || 1));
  const weeklyPercent = Math.round((daysThisWeek / 5) * 100);

  const navItems = [
    {
      id: 'roadmap' as const,
      label: isEs ? 'Ruta de Aprendizaje' : 'Inlärningsväg',
      icon: Compass,
      subtitle: isEs ? 'Unidades y sesiones' : 'Enheter och lektioner',
    },
    {
      id: 'cards' as const,
      label: isEs ? 'Repetición Espaciada' : 'Repetition (Leitner)',
      icon: Brain,
      subtitle: isEs ? 'Vocabulario activo' : 'Aktivt ordförråd',
    },
    {
      id: 'tutor' as const,
      label: isEs ? 'Charla con Camille' : 'Samtal med Camille',
      icon: MessageSquare,
      subtitle: isEs ? 'Compañera de francés' : 'Fransk samtalspartner',
    },
    {
      id: 'achievements' as const,
      label: isEs ? 'Mis Logros' : 'Prestationer & Mål',
      icon: Trophy,
      subtitle: isEs ? 'Medallas y progreso' : 'Medaljer & XP',
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-200/90 bg-white/95 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4">
      {/* Top Menu Section */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block px-3 mb-3">
            {isEs ? 'Aprender y practicar' : 'Lär och träna'}
          </span>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20 translate-x-1'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/70 hover:translate-x-0.5 font-semibold'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 group-hover:bg-purple-100/70 text-slate-600 group-hover:text-purple-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block text-sm tracking-tight truncate leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={`block text-[11px] truncate leading-tight mt-0.5 ${
                        isActive ? 'text-purple-100 font-normal' : 'text-slate-400 group-hover:text-purple-600/70 font-normal'
                      }`}
                    >
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Weekly Goal Card (matching Chispa Español screenshot) */}
      <div className="pt-4">
        <div className="rounded-2xl bg-gradient-to-br from-purple-50/80 via-indigo-50/60 to-pink-50/80 p-3.5 border border-purple-100/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-black text-purple-900 text-[10px] tracking-wider uppercase flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              {isEs ? 'Meta semanal' : 'Veckomål'}
            </span>
            <span className="font-bold text-purple-700 text-xs">
              {weeklyPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-purple-200/60 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyPercent}%` }}
            />
          </div>

          <p className="text-[11px] font-medium text-purple-900/80 leading-tight">
            {isEs 
              ? `¡${daysThisWeek} de 5 días completados!` 
              : `${daysThisWeek} av 5 dagar klara!`}
          </p>
        </div>
      </div>
    </aside>
  );
};
