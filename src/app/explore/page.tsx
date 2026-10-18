'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  Search,
  RefreshCw,
  X,
  Sparkles,
  Bot,
  Database,
  Coins,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { EventItem } from '@/lib/types/event';
import { EventGrid } from '@/components/events/EventGrid';
import { FilterSidebar } from '@/components/events/FilterSidebar';
import { CategoryChips } from '@/components/events/CategoryChips';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search Mode: 'normal' (Catalog - 0 credits) vs 'agent' (TinyFish Web Agent - Costs credits)
  const initialMode = searchParams.get('mode_type') === 'agent' ? 'agent' : 'normal';
  const [searchMode, setSearchMode] = useState<'normal' | 'agent'>(initialMode);

  // Normal Search State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [mode, setMode] = useState(searchParams.get('mode') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [isFree, setIsFree] = useState(searchParams.get('isFree') === 'true');
  const [registrationOpen, setRegistrationOpen] = useState(searchParams.get('open') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevant');
  const [selectedTech, setSelectedTech] = useState<string[]>(
    searchParams.get('tech') ? searchParams.get('tech')!.split(',') : []
  );

  const [showFilters, setShowFilters] = useState(true);

  // Agent Search Specific State
  const [agentQuery, setAgentQuery] = useState('');
  const [agentCategory, setAgentCategory] = useState('hackathon');
  const [agentCity, setAgentCity] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [agentStep, setAgentStep] = useState<number>(0);
  const [agentDiscoveredEvents, setAgentDiscoveredEvents] = useState<EventItem[]>([]);
  const [agentIsLive, setAgentIsLive] = useState<boolean | null>(null);

  // Synchronize state with URL parameters for Normal Search
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchMode === 'agent') {
      params.set('mode_type', 'agent');
    }
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    if (mode && mode !== 'all') params.set('mode', mode);
    if (city) params.set('city', city);
    if (isFree) params.set('isFree', 'true');
    if (registrationOpen) params.set('open', 'true');
    if (sortBy && sortBy !== 'relevant') params.set('sort', sortBy);
    if (selectedTech.length > 0) params.set('tech', selectedTech.join(','));

    const newQueryString = params.toString();
    const targetUrl = newQueryString ? `/explore?${newQueryString}` : '/explore';
    router.replace(targetUrl, { scroll: false });
  }, [searchMode, query, category, mode, city, isFree, registrationOpen, sortBy, selectedTech, router]);

  // Fetch events for Normal Search
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category && category !== 'all') params.set('category', category);
      if (mode && mode !== 'all') params.set('mode', mode);
      if (city) params.set('city', city);
      if (isFree) params.set('isFree', 'true');
      if (registrationOpen) params.set('registrationOpen', 'true');
      if (sortBy) params.set('sortBy', sortBy);
      if (selectedTech.length > 0) {
        selectedTech.forEach((t) => params.append('tech', t));
      }

      const res = await fetch(`/api/events/search?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.events) {
        setEvents(data.events);
        setTotalCount(data.total || data.events.length);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  }, [query, category, mode, city, isFree, registrationOpen, sortBy, selectedTech]);

  useEffect(() => {
    fetchEvents();
    updateUrlParams();
  }, [fetchEvents, updateUrlParams]);

  const handleTechToggle = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory('all');
    setMode('all');
    setCity('');
    setIsFree(false);
    setRegistrationOpen(false);
    setSortBy('relevant');
    setSelectedTech([]);
  };

  // Agent Search Trigger
  const handleLaunchAgentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAgentRunning(true);
    setAgentStep(1);
    setAgentStatus('Initializing TinyFish Search: generating discovery queries and indexing live websites...');

    try {
      // Step 2 simulation indicator
      const progressTimer = setTimeout(() => {
        setAgentStep(2);
        setAgentStatus('Deploying TinyFish remote browser agents: navigating candidate pages and extracting structured schemas...');
      }, 2500);

      const res = await fetch('/api/tinyfish/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: agentQuery.trim() || undefined,
          category: agentCategory !== 'all' ? agentCategory : undefined,
          city: agentCity.trim() || undefined,
        }),
      });

      clearTimeout(progressTimer);
      setAgentStep(3);
      setAgentStatus('Normalizing dates, verifying registration URLs, and deduplicating records...');

      const data = await res.json();
      setAgentIsLive(data.isLive);

      if (data.events && Array.isArray(data.events)) {
        setAgentDiscoveredEvents(data.events);
        setAgentStatus(data.message || `Discovered ${data.events.length} opportunities via TinyFish agent.`);
      } else {
        setAgentStatus(data.message || 'Discovery completed.');
      }
      setAgentStep(4);
    } catch (err: any) {
      setAgentStatus('Agent search error: ' + err.message);
      setAgentStep(0);
    } finally {
      setAgentRunning(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">
      {/* 1. Sub-nav Strip per design.md with Breadcrumb + Sort + Hide Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline-soft">
        <div className="flex items-center gap-2 text-xs text-mute">
          <span>Home</span>
          <span>/</span>
          <span className="text-ink font-semibold">Explore Events</span>
          <span className="bg-soft-cloud text-ink font-semibold px-2 py-0.5 rounded-full ml-2">
            {searchMode === 'normal' ? `${totalCount} Verified` : `${agentDiscoveredEvents.length} Agent Extracted`}
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {searchMode === 'normal' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink px-3 py-1.5 bg-soft-cloud rounded-full hover:bg-hairline-soft transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          )}

          {searchMode === 'normal' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-mute font-medium hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-canvas border border-hairline px-3 py-1.5 text-xs font-semibold text-ink rounded-full focus:outline-none focus:border-ink cursor-pointer"
              >
                <option value="relevant">Most Relevant</option>
                <option value="upcoming">Upcoming Soon</option>
                <option value="deadline">Registration Deadline</option>
                <option value="verified">Recently Verified</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 2. TWO SEARCH OPTIONS SELECTOR (Normal vs Agent Search) */}
      <div className="bg-soft-cloud p-1.5 rounded-none border border-hairline max-w-2xl">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Option 1: Normal Search */}
          <button
            type="button"
            onClick={() => setSearchMode('normal')}
            className={`py-2.5 px-4 text-xs font-semibold rounded-none flex items-center justify-center gap-2 transition-all ${
              searchMode === 'normal'
                ? 'bg-canvas text-ink border border-hairline shadow-sm'
                : 'text-mute hover:text-ink'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <div className="text-left">
              <span className="block font-bold">Catalog Search</span>
              <span className="text-[10px] text-mute font-normal">Instant · 0 Credits Used</span>
            </div>
          </button>

          {/* Option 2: AI Agent Search */}
          <button
            type="button"
            onClick={() => setSearchMode('agent')}
            className={`py-2.5 px-4 text-xs font-semibold rounded-none flex items-center justify-center gap-2 transition-all ${
              searchMode === 'agent'
                ? 'bg-ink text-canvas border border-ink shadow-sm'
                : 'text-mute hover:text-ink'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-accent-purple-soft" />
            <div className="text-left">
              <span className="block font-bold flex items-center gap-1.5">
                <span>AI Agent Search</span>
                <span className="bg-sale text-canvas text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold">
                  Uses Credits
                </span>
              </span>
              <span className={`text-[10px] font-normal ${searchMode === 'agent' ? 'text-stone' : 'text-mute'}`}>
                TinyFish Web Scraping · API Costs Apply
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 3A. NORMAL SEARCH VIEW */}
      {searchMode === 'normal' && (
        <div className="space-y-4 animate-fade-in">
          <div className="search-pill-container w-full !h-12 !px-4">
            <Search className="w-4 h-4 text-mute mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verified catalog by topic, organizer, university, or city (Instant & Free)..."
              className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-mute hover:text-ink p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <CategoryChips selectedCategory={category} onSelect={setCategory} />

          {/* Catalog Layout: Sidebar + Grid */}
          <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
            {showFilters && (
              <FilterSidebar
                category={category}
                onCategoryChange={setCategory}
                mode={mode}
                onModeChange={setMode}
                isFree={isFree}
                onIsFreeChange={setIsFree}
                registrationOpen={registrationOpen}
                onRegistrationOpenChange={setRegistrationOpen}
                selectedTech={selectedTech}
                onTechToggle={handleTechToggle}
                onReset={handleResetFilters}
              />
            )}

            <div className="flex-1 w-full">
              <EventGrid
                events={events}
                loading={loading}
                onRetry={handleResetFilters}
                showMatchReasons={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3B. AI AGENT SEARCH VIEW (CREDIT AWARE) */}
      {searchMode === 'agent' && (
        <div className="space-y-6 animate-fade-in">
          {/* Explicit Credit Cost & Awareness Card */}
          <div className="bg-canvas border border-ink p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-ink text-canvas flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent-purple-soft" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink flex items-center gap-2">
                    <span>Autonomous Web Agent Search</span>
                    <span className="bg-sale/10 text-sale text-xs px-2 py-0.5 rounded-full font-semibold border border-sale/20">
                      Consumes TinyFish Credits
                    </span>
                  </h2>
                  <p className="text-xs text-mute">
                    Deploys remote AI browser agents to scrape live organizer portals and university boards.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-soft-cloud text-ink text-xs font-semibold px-3 py-1.5 border border-hairline self-start sm:self-auto">
                <Coins className="w-3.5 h-3.5 text-sale" />
                <span>Cost: ~1 Agent Credit / Run</span>
              </div>
            </div>

            {/* Credit Caution Notice */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>API Credit Awareness Notice:</strong> Unlike instant catalog search, this feature triggers live HTTP calls to the TinyFish Search API and launches remote Chromium browser agents. Use this when you want fresh, unindexed opportunities from specific websites or regions.
              </div>
            </div>

            {/* Agent Search Parameters Form */}
            <form onSubmit={handleLaunchAgentSearch} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Search Query / Keywords
                  </label>
                  <input
                    type="text"
                    required
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                    placeholder="e.g. Solana Hackathon, Agentic AI Summit, Rust Workshop Europe"
                    className="w-full h-11 px-4 bg-soft-cloud border border-hairline text-sm text-ink placeholder:text-mute focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Target Category
                  </label>
                  <select
                    value={agentCategory}
                    onChange={(e) => setAgentCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-soft-cloud border border-hairline text-sm text-ink focus:outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="competition">Competition</option>
                    <option value="all">Any Category</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                    Target City / Region (Optional)
                  </label>
                  <input
                    type="text"
                    value={agentCity}
                    onChange={(e) => setAgentCity(e.target.value)}
                    placeholder="e.g. San Francisco, Berlin, Tokyo"
                    className="w-full h-11 px-4 bg-soft-cloud border border-hairline text-sm text-ink placeholder:text-mute focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-mute flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Queries TinyFish Search + Automation Engine</span>
                </div>

                <button
                  type="submit"
                  disabled={agentRunning}
                  className="btn-primary !h-12 !px-8 text-sm font-semibold w-full sm:w-auto disabled:opacity-50"
                >
                  {agentRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Scouring Web via Agent...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2 text-accent-purple-soft" />
                      <span>Deploy TinyFish Agent (Use Credit)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Step-by-Step Live Execution Progress */}
            {agentRunning && (
              <div className="bg-soft-cloud p-4 border border-hairline space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-ink">
                  <span>Agent Scraping Lifecycle</span>
                  <span className="text-accent-teal">Step {agentStep} of 4</span>
                </div>
                <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-ink h-full transition-all duration-500 ease-out"
                    style={{ width: `${(agentStep / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-charcoal flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-ink" />
                  <span>{agentStatus}</span>
                </p>
              </div>
            )}

            {/* Final Execution Status */}
            {!agentRunning && agentStatus && (
              <div
                className={`p-3.5 text-xs flex items-start gap-2.5 border ${
                  agentIsLive
                    ? 'bg-green-50 text-success border-green-200'
                    : 'bg-soft-cloud text-ink border-hairline'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Agent Search Report</strong>
                  <span>{agentStatus}</span>
                </div>
              </div>
            )}
          </div>

          {/* Discovered Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-teal" />
                <span>Agent Discovered Opportunities ({agentDiscoveredEvents.length})</span>
              </h3>
              {agentDiscoveredEvents.length > 0 && (
                <span className="text-xs text-mute font-medium">
                  Verified & Schema Normalized
                </span>
              )}
            </div>

            {agentDiscoveredEvents.length === 0 && !agentRunning ? (
              <div className="py-16 text-center bg-soft-cloud border border-hairline p-8 space-y-3">
                <Bot className="w-8 h-8 text-mute mx-auto" />
                <h4 className="text-sm font-semibold text-ink">No Agent Searches Executed Yet</h4>
                <p className="text-xs text-mute max-w-md mx-auto">
                  Enter a target topic above and click &quot;Deploy TinyFish Agent&quot; to discover fresh events directly from organizer websites across the internet.
                </p>
              </div>
            ) : (
              <EventGrid events={agentDiscoveredEvents} showMatchReasons={true} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1440px] mx-auto px-6 py-12 text-center text-mute">
          Loading event discovery catalog...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
