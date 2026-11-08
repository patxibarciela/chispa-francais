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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1">
      <div className="rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-200/80 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left info: category badge + title + description inline */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold shrink-0 border border-purple-200/50">
            <CategoryIcon className="w-3.5 h-3.5 text-purple-600" />
            <span>{categoryBadge}</span>
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug truncate">
              {title}
            </h1>
            <p className="text-xs text-slate-500 leading-normal line-clamp-1 hidden sm:block">
              {description}
            </p>
          </div>
        </div>

        {/* Right metrics: sleek inline pill chips */}
        {metrics && metrics.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-50/90 rounded-xl px-2.5 py-1 border border-slate-200/70 text-center flex items-center gap-1.5"
              >
                <span className={`text-xs font-bold ${m.colorClass || 'text-purple-600'}`}>
                  {m.value}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
