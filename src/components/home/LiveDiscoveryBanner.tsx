'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, ArrowRight, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EventItem } from '@/lib/types/event';
import { EventCard } from '@/components/events/EventCard';

export function LiveDiscoveryBanner() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [isRunning, setIsRunning] = useState(false);
  const [discoveredEvents, setDiscoveredEvents] = useState<EventItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const handleRunDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setStatusMessage('Launching TinyFish web agent: querying search indexes and organizer portals...');

    try {
      const res = await fetch('/api/tinyfish/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() || undefined, category }),
      });

      const data = await res.json();
      setIsConfigured(data.isLive);
      setStatusMessage(data.message);

      if (data.events && Array.isArray(data.events)) {
        setDiscoveredEvents(data.events);
      }
    } catch (err: any) {
      setStatusMessage('Discovery request error: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="w-full bg-soft-cloud border-y border-hairline py-12 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink bg-canvas px-3 py-1 rounded-full border border-hairline mb-3">
            <Globe className="w-3.5 h-3.5 text-accent-teal" />
            <span>Autonomous Web Scraping & Normalization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight mb-2">
            Real-Time Web Discovery with TinyFish
          </h2>
          <p className="text-sm sm:text-base text-mute leading-relaxed">
            Need events for a specific domain or region? TinyFish deploys autonomous browser agents to scour university schedules, developer communities, and organizer portals to extract verified event details and registration links.
          </p>
        </div>

        {/* Discovery Input Form */}
        <form
          onSubmit={handleRunDiscovery}
          className="bg-canvas border border-hairline p-4 sm:p-6 mb-8 max-w-4xl shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Target Topic or Location
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. AI Hackathons, Rust Conferences in Europe, Web3"
                className="w-full h-11 px-4 bg-soft-cloud border border-hairline rounded-none text-sm text-ink placeholder:text-mute focus:outline-none focus:border-ink"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 bg-soft-cloud border border-hairline rounded-none text-sm text-ink focus:outline-none focus:border-ink"
              >
                <option value="hackathon">Hackathons</option>
                <option value="conference">Conferences</option>
                <option value="workshop">Workshops</option>
                <option value="meetup">Meetups</option>
                <option value="competition">Competitions</option>
              </select>
            </div>

            <div className="sm:col-span-3 pt-5 sm:pt-6">
              <button
                type="submit"
                disabled={isRunning}
                className="btn-primary w-full !h-11 !text-sm disabled:opacity-60"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scouring Web...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Discovery</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`mt-4 p-3.5 text-xs flex items-start gap-2.5 border ${
                isConfigured
                  ? 'bg-green-50 text-success border-green-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {isConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">
                  {isConfigured ? 'TinyFish Agent Execution Report' : 'Verified Catalog Standby'}
                </span>
                <span>{statusMessage}</span>
              </div>
            </div>
          )}
        </form>

        {/* Live Discovered Results */}
        {discoveredEvents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
                Discovered Opportunities ({discoveredEvents.length})
              </h3>
              <span className="text-xs text-mute font-medium">
                Normalized & Deduplicated
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {discoveredEvents.slice(0, 4).map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
