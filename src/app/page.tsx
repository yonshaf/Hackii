'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sparkles, SlidersHorizontal, Flame, Compass, Calendar, ShieldCheck } from 'lucide-react';
import { HeroCampaign } from '@/components/home/HeroCampaign';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { LiveDiscoveryBanner } from '@/components/home/LiveDiscoveryBanner';
import { EventCard } from '@/components/events/EventCard';
import { DEMO_EVENTS } from '@/lib/events/demo-events';

export default function HomePage() {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const popularTags = ['Artificial Intelligence', 'React & Next.js', 'Rust', 'Web3', 'Autonomous Agents', 'DevOps & Cloud', 'Python', 'WebGPU'];

  const featuredEvents = DEMO_EVENTS.slice(0, 6);

  return (
    <div className="w-full flex flex-col space-y-12 sm:space-y-16">
      {/* 1. Full-Bleed Editorial Campaign Hero */}
      <HeroCampaign />

      {/* 2. Interactive Discovery Search & Category Strip */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-canvas border border-hairline shadow-md p-4 sm:p-6">
          <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="search-pill-container flex-1 !h-12 !px-4">
              <Search className="w-5 h-5 text-mute mr-3 shrink-0" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search by topic, university, hackathon name, or city..."
                className="bg-transparent border-none outline-none text-base text-ink placeholder:text-mute w-full"
              />
            </div>
            <button type="submit" className="btn-primary !h-12 !px-8 text-sm shrink-0">
              <span>Find Events</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Technology Chips */}
          <div className="mt-4 pt-4 border-t border-hairline-soft flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-mute uppercase tracking-wider mr-2">
              Popular Tags:
            </span>
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-soft-cloud hover:bg-hairline text-ink rounded-full text-xs font-medium transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Upcoming Events Section */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-hairline pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-sale" />
              <span>Verified & Registration Open</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Featured Global Opportunities
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-sm font-semibold text-ink hover:underline self-start sm:self-auto flex items-center gap-1"
          >
            <span>Explore All {DEMO_EVENTS.length}+ Events</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* 3-Up Event Card Grid strictly following design.md */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 lg:gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* 4. Live Discovery with TinyFish Autonomous Web Agents */}
      <LiveDiscoveryBanner />

      {/* 5. Category Tracks with 4:5 Aspect Ratio */}
      <CategoryTiles />

      {/* 6. Personalized Matching Promotion */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
        <div className="bg-ink text-canvas p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-hairline">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-purple-soft">
              Deterministic Matching Engine
            </span>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wider text-canvas leading-none">
              Never Miss a Crucial Registration Deadline
            </h2>
            <p className="text-sm sm:text-base text-stone leading-relaxed">
              Configure your preferred programming languages, budget, travel radius, and event formats. EventScout transparently scores every opportunity and alerts you 7, 3, or 1 day before registration closes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/preferences"
              className="btn-outline-on-image !bg-canvas !text-ink !h-12 !px-8 hover:!bg-soft-cloud"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Customize Preferences</span>
            </Link>
            <Link
              href="/saved"
              className="btn-secondary !bg-ink/50 !text-canvas border border-stone !h-12 !px-8 hover:!bg-ink"
            >
              <span>Saved Bookmarks</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
