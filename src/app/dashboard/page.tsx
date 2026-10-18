'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bookmark,
  Clock,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { EventItem, UserPreferences } from '@/lib/types/event';
import { DEMO_EVENTS } from '@/lib/events/demo-events';
import { rankEvents } from '@/lib/events/rank';
import { getLocalSavedEvents, getLocalUserPreferences, getLocalReminders } from '@/lib/store/local-storage';
import { EventCard } from '@/components/events/EventCard';

export default function DashboardPage() {
  const [recommendedEvents, setRecommendedEvents] = useState<EventItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [remindersCount, setRemindersCount] = useState(0);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const prefs = getLocalUserPreferences();
    setUserPrefs(prefs);

    // Rank events using preferences
    const ranked = rankEvents([...DEMO_EVENTS], prefs);
    setRecommendedEvents(ranked);

    setSavedCount(getLocalSavedEvents().length);
    setRemindersCount(getLocalReminders().length);
  }, []);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Top Banner / Guest Activity Status */}
      <div className="bg-canvas border border-hairline p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-mute">
              Discovery Hub
            </span>
            <span className="inline-flex items-center gap-1 bg-soft-cloud text-ink text-[11px] font-semibold px-2 py-0.5 rounded-full border border-hairline">
              <ShieldCheck className="w-3 h-3 text-success" />
              <span>Guest Session Ready</span>
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Your Personalized Event Dispatch
          </h1>
          <p className="text-sm text-mute leading-relaxed">
            Events below are continuously ranked by your custom criteria ({userPrefs?.technicalInterests.slice(0, 3).join(', ')}, {userPrefs?.city || 'Global'}). Transparent match reasons explain why each opportunity is surfaced.
          </p>
        </div>

        {/* Quick Stat Tiles */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-4 bg-soft-cloud border border-hairline text-center min-w-[100px]">
            <span className="text-2xl font-bold text-ink block">{savedCount}</span>
            <span className="text-[11px] uppercase tracking-wider text-mute font-medium">Saved</span>
          </div>

          <div className="p-4 bg-soft-cloud border border-hairline text-center min-w-[100px]">
            <span className="text-2xl font-bold text-ink block">{remindersCount}</span>
            <span className="text-[11px] uppercase tracking-wider text-mute font-medium">Reminders</span>
          </div>

          <Link
            href="/preferences"
            className="btn-secondary !h-14 !px-5 text-xs font-semibold flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Tune Weights</span>
          </Link>
        </div>
      </div>

      {/* Recommended Opportunities Row */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-hairline pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-teal uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top Weighted Matches</span>
            </div>
            <h2 className="text-2xl font-semibold text-ink tracking-tight">
              Curated According to Your Interests
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-ink hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3-Up Grid of Recommended Events with match reasons shown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedEvents.slice(0, 6).map((event) => (
            <EventCard key={event.id} event={event} showMatchReasons={true} />
          ))}
        </div>
      </section>

      {/* Upcoming Critical Deadlines Callout */}
      <section className="bg-ink text-canvas p-8 sm:p-10 border border-hairline space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sale-deep" />
          <h2 className="text-lg font-semibold uppercase tracking-wider text-canvas">
            Upcoming Registration Deadlines (Next 30 Days)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedEvents
            .filter((e) => e.registrationDeadline)
            .slice(0, 3)
            .map((e) => (
              <div
                key={e.id}
                className="bg-canvas/10 border border-canvas/20 p-4 space-y-2 hover:bg-canvas/15 transition-colors"
              >
                <span className="text-[11px] font-semibold tracking-wider uppercase text-accent-purple-soft block">
                  {e.category} · {e.organizer}
                </span>
                <Link
                  href={`/events/${e.slug}`}
                  className="font-medium text-sm text-canvas hover:underline block truncate"
                >
                  {e.title}
                </Link>
                <div className="text-xs text-stone flex items-center justify-between pt-2">
                  <span>Deadline: {new Date(e.registrationDeadline!).toLocaleDateString()}</span>
                  <Link
                    href={`/events/${e.slug}`}
                    className="text-canvas underline font-semibold text-xs"
                  >
                    Register →
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
