'use client';

import React from 'react';
import { EventItem } from '@/lib/types/event';
import { EventCard } from './EventCard';
import { Sparkles, RefreshCw } from 'lucide-react';

interface EventGridProps {
  events: EventItem[];
  loading?: boolean;
  onRetry?: () => void;
  showMatchReasons?: boolean;
}

export function EventGrid({ events, loading = false, onRetry, showMatchReasons = false }: EventGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col space-y-3">
            <div className="aspect-square bg-soft-cloud w-full rounded-none" />
            <div className="h-4 bg-soft-cloud w-1/3 rounded" />
            <div className="h-5 bg-soft-cloud w-3/4 rounded" />
            <div className="h-4 bg-soft-cloud w-1/2 rounded" />
            <div className="h-8 bg-soft-cloud w-full rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center bg-soft-cloud border border-hairline flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-canvas rounded-full flex items-center justify-center text-mute mb-4 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-ink mb-2">No matching events found</h3>
        <p className="text-sm text-mute max-w-md mb-6 leading-relaxed">
          Try expanding your search query, switching categories, or triggering live TinyFish web discovery to scrape fresh opportunities.
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-1" />
            <span>Reset Search & Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 lg:gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} showMatchReasons={showMatchReasons} />
      ))}
    </div>
  );
}
