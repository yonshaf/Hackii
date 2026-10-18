'use client';

import React from 'react';
import { EventCategory, EventMode } from '@/lib/types/event';
import { RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  mode: string;
  onModeChange: (m: string) => void;
  isFree: boolean;
  onIsFreeChange: (free: boolean) => void;
  registrationOpen: boolean;
  onRegistrationOpenChange: (open: boolean) => void;
  selectedTech: string[];
  onTechToggle: (tech: string) => void;
  onReset: () => void;
  counts?: Record<string, number>;
}

export function FilterSidebar({
  category,
  onCategoryChange,
  mode,
  onModeChange,
  isFree,
  onIsFreeChange,
  registrationOpen,
  onRegistrationOpenChange,
  selectedTech,
  onTechToggle,
  onReset,
  counts = {},
}: FilterSidebarProps) {
  const categories: { label: string; value: string }[] = [
    { label: 'All Opportunities', value: 'all' },
    { label: 'Hackathons', value: 'hackathon' },
    { label: 'Conferences', value: 'conference' },
    { label: 'Workshops', value: 'workshop' },
    { label: 'Meetups', value: 'meetup' },
    { label: 'Competitions', value: 'competition' },
  ];

  const modes: { label: string; value: string }[] = [
    { label: 'All Formats', value: 'all' },
    { label: 'Online / Virtual', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'In-Person / Onsite', value: 'offline' },
  ];

  const popularTechs = ['AI', 'React', 'Python', 'Rust', 'TypeScript', 'Kubernetes', 'Web3', 'Next.js'];

  const hasActiveFilters =
    category !== 'all' ||
    mode !== 'all' ||
    isFree ||
    registrationOpen ||
    selectedTech.length > 0;

  return (
    <aside aria-label="Event filters" className="w-full lg:w-56 shrink-0 space-y-6 text-sm">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <span className="font-semibold text-ink uppercase tracking-wider text-xs">
          Refine Results
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-mute hover:text-ink flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter Group */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-1">
          {categories.map((c) => {
            const isSelected = category === c.value;
            const count = counts[c.value];
            return (
              <button
                key={c.value}
                onClick={() => onCategoryChange(c.value)}
                className={`w-full flex items-center justify-between py-1.5 px-2 text-left rounded transition-colors ${
                  isSelected
                    ? 'font-semibold text-ink bg-soft-cloud'
                    : 'text-charcoal hover:text-ink hover:bg-soft-cloud/50'
                }`}
              >
                <span>{c.label}</span>
                {count !== undefined && (
                  <span className="text-xs text-mute font-normal">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Format Group */}
      <div className="space-y-2.5 pt-4 border-t border-hairline-soft">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Event Format
        </h4>
        <div className="space-y-1">
          {modes.map((m) => {
            const isSelected = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => onModeChange(m.value)}
                className={`w-full flex items-center justify-between py-1.5 px-2 text-left rounded transition-colors ${
                  isSelected
                    ? 'font-semibold text-ink bg-soft-cloud'
                    : 'text-charcoal hover:text-ink hover:bg-soft-cloud/50'
                }`}
              >
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admission & Deadlines */}
      <div className="space-y-3 pt-4 border-t border-hairline-soft">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Status & Fees
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-charcoal hover:text-ink">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => onIsFreeChange(e.target.checked)}
              className="w-4 h-4 rounded text-ink focus:ring-ink border-hairline accent-ink"
            />
            <span>Free Admission Only</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-charcoal hover:text-ink">
            <input
              type="checkbox"
              checked={registrationOpen}
              onChange={(e) => onRegistrationOpenChange(e.target.checked)}
              className="w-4 h-4 rounded text-ink focus:ring-ink border-hairline accent-ink"
            />
            <span>Registration Open Only</span>
          </label>
        </div>
      </div>

      {/* Technologies Filter */}
      <div className="space-y-2.5 pt-4 border-t border-hairline-soft">
        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Technologies
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {popularTechs.map((tech) => {
            const isSelected = selectedTech.includes(tech);
            return (
              <button
                key={tech}
                onClick={() => onTechToggle(tech)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-ink text-canvas'
                    : 'bg-soft-cloud text-charcoal hover:bg-hairline-soft'
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
