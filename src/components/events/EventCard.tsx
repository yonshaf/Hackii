'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Bookmark, Sparkles, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { EventItem } from '@/lib/types/event';
import { isLocalEventSaved, toggleLocalSavedEvent } from '@/lib/store/local-storage';

interface EventCardProps {
  event: EventItem;
  onBookmarkToggle?: (saved: boolean) => void;
  showMatchReasons?: boolean;
}

export function EventCard({ event, onBookmarkToggle, showMatchReasons = false }: EventCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(isLocalEventSaved(event.id));
  }, [event.id]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleLocalSavedEvent(event.id);
    setIsSaved(result.isSaved);
    if (onBookmarkToggle) onBookmarkToggle(result.isSaved);
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Date to be announced';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Calculate deadline urgency
  const getDeadlineStatus = () => {
    if (!event.registrationDeadline) return null;
    const diff = new Date(event.registrationDeadline).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Registration Closed', urgent: false, closed: true };
    if (days === 0) return { label: 'Closes Today!', urgent: true, closed: false };
    if (days <= 5) return { label: `${days}d left to register`, urgent: true, closed: false };
    return { label: `Deadline: ${formatDate(event.registrationDeadline)}`, urgent: false, closed: false };
  };

  const deadline = getDeadlineStatus();

  return (
    <article className="group bg-canvas flex flex-col h-full border-b border-hairline sm:border-none pb-6 sm:pb-0">
      {/* 1:1 Aspect Ratio Full-Bleed Image Stage */}
      <div className="relative aspect-square w-full bg-soft-cloud overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-soft-cloud">
            <span className="font-display text-4xl text-stone uppercase tracking-wider">
              {event.category}
            </span>
            <span className="text-xs text-mute mt-2">{event.organizer}</span>
          </div>
        )}

        {/* Promo Badge Top-Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="bg-canvas/95 backdrop-blur-sm text-ink text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border border-hairline/80 shadow-sm">
            {event.category}
          </span>
          <span className="bg-ink text-canvas text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm">
            {event.mode}
          </span>
        </div>

        {/* Bookmark Action Top-Right */}
        <button
          onClick={handleBookmark}
          aria-label={isSaved ? 'Remove bookmark' : 'Save event'}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-canvas/90 backdrop-blur-sm flex items-center justify-center text-ink border border-hairline/80 shadow-sm hover:scale-105 active:scale-95 transition-all z-10"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-ink text-ink' : 'text-ink'}`} />
        </button>

        {/* Transparent Relevance Score Badge if present */}
        {event.relevanceScore !== undefined && (
          <div className="absolute bottom-3 left-3 bg-canvas/95 backdrop-blur-sm text-ink px-3 py-1 rounded-full border border-hairline text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-accent-teal" />
            <span>{event.relevanceScore}% Match</span>
          </div>
        )}
      </div>

      {/* Metadata Section - 8px spacing scale strictly adhering to design.md */}
      <div className="pt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Swatch & Tag preview row */}
          <div className="flex items-center gap-2 mb-1.5 text-xs text-mute">
            <span className="font-medium text-ink truncate">{event.organizer}</span>
            {event.city && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-mute" />
                  <span>{event.city}</span>
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block group-hover:underline">
            <h3 className="text-base font-medium text-ink leading-snug line-clamp-2">
              {event.title}
            </h3>
          </Link>

          {/* Date & Deadline */}
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-charcoal">
              <Calendar className="w-3.5 h-3.5 text-mute shrink-0" />
              <span>{formatDate(event.startDate)}</span>
            </div>

            {deadline && (
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  deadline.urgent ? 'text-sale' : deadline.closed ? 'text-mute line-through' : 'text-mute'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{deadline.label}</span>
              </div>
            )}
          </div>

          {/* Technology tags */}
          {event.technologies && event.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {event.technologies.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="bg-soft-cloud text-ink text-[11px] font-medium px-2 py-0.5 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {event.technologies.length > 3 && (
                <span className="text-[10px] text-mute self-center">
                  +{event.technologies.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Optional match reason */}
          {showMatchReasons && event.matchReasons && event.matchReasons.length > 0 && (
            <p className="mt-2 text-[11px] text-accent-teal font-medium line-clamp-1">
              ✓ {event.matchReasons[0]}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-hairline-soft flex items-center justify-between">
          <div className="text-sm font-semibold text-ink">
            {event.isFree ? (
              <span className="text-success font-semibold">Free Registration</span>
            ) : event.fee !== null ? (
              <span>
                {event.currency} {event.fee}
              </span>
            ) : (
              <span className="text-mute font-normal text-xs">Fee not specified</span>
            )}
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="text-xs font-semibold text-ink hover:underline flex items-center gap-1"
          >
            <span>View Details</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
