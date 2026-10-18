'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

export function HeroCampaign() {
  return (
    <section className="relative w-full bg-ink text-canvas overflow-hidden min-h-[540px] md:min-h-[640px] lg:min-h-[720px] flex items-end">
      {/* Background Editorial Photography with subtle contrast overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=85"
          alt="Hackathon and tech conference stage"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.45] scale-100 transition-transform duration-1000 ease-out hover:scale-105"
        />
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      {/* Hero Content Block with Towering 96px Futura/Bebas Uppercase per design.md */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 lg:px-12 pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-canvas/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-canvas border border-canvas/20">
            <Sparkles className="w-3.5 h-3.5 text-accent-purple-soft" />
            <span>TinyFish AI-Powered Web Discovery</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[96px] text-canvas tracking-tight uppercase leading-[0.88] select-none">
            Your Next Big Opportunity Starts Here.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-stone max-w-2xl font-normal leading-relaxed pt-2">
            The intelligent event discovery platform. Aggregating hackathons, coding competitions, technical workshops, and developer summits directly from organizer portals across the web.
          </p>

          {/* CTA Pill Buttons adhering to design.md */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/explore"
              className="btn-outline-on-image !bg-canvas !text-ink !h-12 !px-8 hover:!bg-soft-cloud"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Events</span>
            </Link>

            <Link
              href="/dashboard"
              className="btn-secondary !bg-ink/60 !backdrop-blur-md !text-canvas border border-canvas/30 !h-12 !px-8 hover:!bg-ink/80"
            >
              <span>Personalized For You</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
