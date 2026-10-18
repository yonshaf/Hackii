'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, ArrowUpDown, Search, RefreshCw, X } from 'lucide-react';
import { EventItem } from '@/lib/types/event';
import { EventGrid } from '@/components/events/EventGrid';
import { FilterSidebar } from '@/components/events/FilterSidebar';
import { CategoryChips } from '@/components/events/CategoryChips';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State initialized from URL query parameters
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

  // Synchronize state with URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
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
  }, [query, category, mode, city, isFree, registrationOpen, sortBy, selectedTech, router]);

  // Fetch events from API
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 space-y-6">
      {/* 1. Sub-nav Strip per design.md with Breadcrumb + Sort + Hide Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline-soft">
        <div className="flex items-center gap-2 text-xs text-mute">
          <span>Home</span>
          <span>/</span>
          <span className="text-ink font-semibold">Explore Events</span>
          <span className="bg-soft-cloud text-ink font-semibold px-2 py-0.5 rounded-full ml-2">
            {totalCount} Found
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Hide/Show Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink px-3 py-1.5 bg-soft-cloud rounded-full hover:bg-hairline-soft transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          {/* Sort dropdown */}
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
        </div>
      </div>

      {/* 2. Search Bar & Horizontal Category Chips */}
      <div className="space-y-3">
        <div className="search-pill-container w-full !h-12 !px-4">
          <Search className="w-4 h-4 text-mute mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by keyword, title, organizer, city, or technology..."
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
      </div>

      {/* 3. Main Catalog Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start pt-2">
        {/* Filter Sidebar (220px fixed on desktop) */}
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

        {/* Product / Event Card Grid */}
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
