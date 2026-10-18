'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, ShieldCheck, Compass } from 'lucide-react';

export function UtilityBar() {
  return (
    <aside aria-label="Quick utility bar" className="w-full bg-soft-cloud border-b border-hairline-soft h-9 text-xs font-medium text-ink hidden sm:flex items-center justify-between px-6 lg:px-12">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 text-mute">
          <Sparkles className="w-3.5 h-3.5 text-ink" />
          <span>TinyFish Autonomous Web Extraction Active</span>
        </span>
        <span className="text-hairline">|</span>
        <span className="flex items-center gap-1.5 text-mute">
          <ShieldCheck className="w-3.5 h-3.5 text-success" />
          <span>Verified Dates & Provenance Guaranteed</span>
        </span>
      </div>

      <nav aria-label="Utility links" className="flex items-center gap-4 text-mute">
        <Link href="/explore" className="hover:text-ink transition-colors flex items-center gap-1">
          <Compass className="w-3 h-3" />
          <span>Browse All</span>
        </Link>
        <span>·</span>
        <Link href="/dashboard" className="hover:text-ink transition-colors">
          Recommendations
        </Link>
        <span>·</span>
        <Link href="/saved" className="hover:text-ink transition-colors">
          Saved Deadlines
        </Link>
        <span>·</span>
        <Link href="/auth" className="hover:text-ink text-ink font-semibold transition-colors">
          Sign In
        </Link>
      </nav>
    </aside>
  );
}
