'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-canvas border-t border-hairline mt-16">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-hairline">
          {/* Col 1 */}
          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
              Explore Events
            </h2>
            <ul className="space-y-3 text-sm text-mute">
              <li>
                <Link href="/explore?category=hackathon" className="hover:text-ink transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/explore?category=conference" className="hover:text-ink transition-colors">
                  Tech Conferences
                </Link>
              </li>
              <li>
                <Link href="/explore?category=workshop" className="hover:text-ink transition-colors">
                  Coding Workshops
                </Link>
              </li>
              <li>
                <Link href="/explore?category=meetup" className="hover:text-ink transition-colors">
                  Developer Meetups
                </Link>
              </li>
              <li>
                <Link href="/explore?category=competition" className="hover:text-ink transition-colors">
                  Algorithm Competitions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
              Discovery Engine
            </h2>
            <ul className="space-y-3 text-sm text-mute">
              <li>
                <Link href="/explore?mode=online" className="hover:text-ink transition-colors">
                  Virtual & Online Events
                </Link>
              </li>
              <li>
                <Link href="/explore?isFree=true" className="hover:text-ink transition-colors">
                  Free Student Hackathons
                </Link>
              </li>
              <li>
                <Link href="/preferences" className="hover:text-ink transition-colors">
                  Personalized Recommendations
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-ink transition-colors">
                  Saved Deadlines & Reminders
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink transition-colors">
                  Candidate Activity Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
              AI Infrastructure
            </h2>
            <ul className="space-y-3 text-sm text-mute">
              <li>
                <span className="text-charcoal font-medium">TinyFish Agent API</span>
              </li>
              <li>
                <span className="text-mute text-xs">Autonomous Web Browsing & Extraction</span>
              </li>
              <li>
                <span className="text-charcoal font-medium">Supabase Database</span>
              </li>
              <li>
                <span className="text-mute text-xs">Row-Level Security & PostgreSQL</span>
              </li>
              <li>
                <span className="text-charcoal font-medium">Deterministic Heuristics</span>
              </li>
              <li>
                <span className="text-mute text-xs">Transparent Multi-Factor Scoring</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
              EventScout
            </h2>
            <p className="text-sm text-mute mb-4 leading-relaxed">
              Discover your next opportunity. Aggregating technical events from across organizer websites and community platforms.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-soft-cloud text-ink font-semibold px-2.5 py-1 rounded-full border border-hairline">
                v1.0.0 Production
              </span>
              <span className="text-xs text-success font-semibold flex items-center gap-1">
                ● Live Ready
              </span>
            </div>
          </div>
        </div>

        {/* Fine print bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-mute">
          <div className="flex items-center gap-6">
            <span>© 2026 EventScout Platform Inc. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Strict Provenance Preservation</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="hover:text-ink">Browse Catalog</Link>
            <Link href="/preferences" className="hover:text-ink">Matching Preferences</Link>
            <Link href="/auth" className="hover:text-ink">Account Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
