'use client';

import React from 'react';

interface CategoryChipsProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryChips({ selectedCategory, onSelect }: CategoryChipsProps) {
  const chips = [
    { label: 'All Opportunities', value: 'all' },
    { label: 'Hackathons', value: 'hackathon' },
    { label: 'Conferences', value: 'conference' },
    { label: 'Workshops', value: 'workshop' },
    { label: 'Meetups', value: 'meetup' },
    { label: 'Competitions', value: 'competition' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
      {chips.map((chip) => {
        const isActive = selectedCategory === chip.value;
        return (
          <button
            key={chip.value}
            onClick={() => onSelect(chip.value)}
            className={`filter-chip ${isActive ? 'filter-chip-active' : ''}`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
