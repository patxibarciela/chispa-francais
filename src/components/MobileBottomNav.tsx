import React from 'react';
import { Compass, Brain, MessageSquare, Trophy } from 'lucide-react';
import { LanguagePreference } from '../types';

interface MobileBottomNavProps {
  activeTab: 'roadmap' | 'cards' | 'tutor' | 'achievements';
  setActiveTab: (tab: 'roadmap' | 'cards' | 'tutor' | 'achievements') => void;
  supportLanguage: LanguagePreference;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  supportLanguage,
}) => {
  const isEs = supportLanguage === 'es';

  const navItems = [
    {
      id: 'roadmap' as const,
      label: isEs ? 'Inicio' : 'Start',
      icon: Compass,
    },
    {
      id: 'cards' as const,
      label: isEs ? 'Repaso' : 'Repetera',
      icon: Brain,
    },
    {
      id: 'tutor' as const,
      label: 'Camille',
      icon: MessageSquare,
    },
    {
      id: 'achievements' as const,
      label: isEs ? 'Logros' : 'Mål',
      icon: Trophy,
    },
  ];

  return (
    <nav
      aria-label={isEs ? 'Navegación principal móvil' : 'Mobilnavigering'}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl transition-colors active:scale-95"
            >
              <div
                className={`px-3.5 py-1 rounded-full transition-all duration-150 flex items-center justify-center ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.9]'}`} />
              </div>
              <span
                className={`text-[11px] leading-tight tracking-tight truncate max-w-full ${
                  isActive ? 'text-purple-700 font-bold' : 'text-slate-600 font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
