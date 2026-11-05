import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricItem {
  value: string | number;
  label: string;
  colorClass?: string;
}

interface SectionBannerProps {
  categoryBadge: string;
  categoryIcon: LucideIcon;
  title: string;
  description: string;
  metrics?: MetricItem[];
}

export const SectionBanner: React.FC<SectionBannerProps> = ({
  categoryBadge,
  categoryIcon: CategoryIcon,
  title,
  description,
  metrics,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-100/90 via-indigo-50/80 to-pink-50/90 border border-indigo-100 p-6 sm:p-8 shadow-xs">
        {/* Subtle decorative background symbols matching Chispa */}
        <div className="absolute right-4 top-4 text-3xl opacity-20 select-none pointer-events-none">
          🪐
        </div>
        <div className="absolute right-24 bottom-3 text-2xl opacity-20 select-none pointer-events-none">
          ✨
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Header Info */}
          <div className="space-y-2 max-w-2xl">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-purple-800 text-xs font-bold shadow-2xs border border-purple-200/60">
              <CategoryIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>{categoryBadge}</span>
            </div>

            {/* Big Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Metrics Group matching Chispa Español */}
          {metrics && metrics.length > 0 && (
            <div className="flex items-center gap-2.5 sm:gap-3 self-start md:self-auto shrink-0 flex-wrap">
              {metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white/95 rounded-2xl px-4 py-3 border border-slate-200/80 shadow-2xs text-center min-w-[85px] sm:min-w-[95px]"
                >
                  <span className={`block text-xl font-black ${m.colorClass || 'text-purple-600'}`}>
                    {m.value}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
