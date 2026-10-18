'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function CategoryTiles() {
  const tiles = [
    {
      title: 'Hackathons',
      subtitle: '48h building sprints, $100k+ prize pools & team creation',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      href: '/explore?category=hackathon',
      badge: 'High Energy',
    },
    {
      title: 'Conferences',
      subtitle: 'Global keynotes, core maintainer panels & deep-dives',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      href: '/explore?category=conference',
      badge: 'Industry Leading',
    },
    {
      title: 'Workshops',
      subtitle: 'Hands-on live coding, LLM agent architectures & cloud labs',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      href: '/explore?category=workshop',
      badge: 'Skill Mastery',
    },
    {
      title: 'Competitions',
      subtitle: 'Algorithmic challenges, data science leagues & hack challenges',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      href: '/explore?category=competition',
      badge: 'Global Ranking',
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-mute block mb-1">
            Browse By Focus
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Curated Opportunity Tracks
          </h2>
        </div>
        <Link
          href="/explore"
          className="text-sm font-semibold text-ink hover:underline self-start sm:self-auto"
        >
          View All Tracks →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className="group relative aspect-[4/5] w-full bg-soft-cloud overflow-hidden flex flex-col justify-end p-6 border border-hairline/40"
          >
            {/* Background Image */}
            <Image
              src={tile.image}
              alt={tile.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center brightness-[0.6] group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

            {/* Top Tag */}
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-canvas/90 backdrop-blur-sm text-ink text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border border-hairline/60">
                {tile.badge}
              </span>
            </div>

            {/* Bottom Content with Outline Button on Image per design.md */}
            <div className="relative z-10 space-y-2">
              <h3 className="font-display text-3xl sm:text-4xl text-canvas uppercase tracking-wider leading-none">
                {tile.title}
              </h3>
              <p className="text-xs text-stone line-clamp-2 leading-relaxed">
                {tile.subtitle}
              </p>
              <div className="pt-2">
                <Link
                  href={tile.href}
                  className="btn-outline-on-image !text-xs !py-2.5 !px-5 group-hover:!bg-soft-cloud"
                >
                  Explore Track
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
