'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Share2,
  Bell,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Tag,
  Code2,
} from 'lucide-react';
import { EventItem } from '@/lib/types/event';
import { isLocalEventSaved, toggleLocalSavedEvent } from '@/lib/store/local-storage';
import { ReminderModal } from '@/components/events/ReminderModal';

export default function EventDetailsPage({ params }: { params: { slug: string } }) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${params.slug}`);
        if (!res.ok) {
          setEvent(null);
          return;
        }
        const data = await res.json();
        if (data.event) {
          setEvent(data.event);
          setIsSaved(isLocalEventSaved(data.event.id));
        }
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.slug]);

  const handleBookmarkToggle = () => {
    if (!event) return;
    const res = toggleLocalSavedEvent(event.id);
    setIsSaved(res.isSaved);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRefreshLive = async () => {
    if (!event) return;
    setIsRefreshing(true);
    setRefreshNotice(null);
    try {
      const res = await fetch('/api/events/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, slug: event.slug }),
      });
      const data = await res.json();
      if (res.ok && data.event) {
        setEvent(data.event);
        setRefreshNotice(data.message);
      } else {
        setRefreshNotice('Notice: ' + (data.error || 'Live site verified'));
      }
    } catch (err: any) {
      setRefreshNotice('Refresh error: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-ink border-t-transparent mb-4" />
        <p className="text-sm text-mute">Retrieving verified event details & provenance...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-ink mb-2">Event Not Found</h2>
        <p className="text-sm text-mute mb-6">
          The requested event may have expired, changed slug, or been removed.
        </p>
        <Link href="/explore" className="btn-primary">
          Back to Explore
        </Link>
      </div>
    );
  }

  const formatDateTime = (iso: string | null) => {
    if (!iso) return 'Not specified by organizer';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const hasDirectRegistration = Boolean(event.registrationUrl);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="btn-icon-circular text-ink"
            aria-label="Share event link"
            title="Copy link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copiedLink && (
            <span className="text-xs text-success font-semibold">Link copied!</span>
          )}
          <button
            onClick={handleBookmarkToggle}
            className={`btn-icon-circular ${isSaved ? 'text-ink bg-hairline-soft' : 'text-ink'}`}
            aria-label="Save event"
            title="Save event"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-ink' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Full-Bleed Media & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Visual Stage (Square 1:1 or 16:9 on Soft Cloud) */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-soft-cloud overflow-hidden border border-hairline">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-soft-cloud text-center">
                <span className="font-display text-5xl sm:text-6xl text-stone uppercase tracking-wider">
                  {event.category}
                </span>
                <span className="text-sm text-mute mt-2">{event.organizer}</span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-canvas/95 backdrop-blur-sm text-ink text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full border border-hairline shadow-sm">
                {event.category}
              </span>
              <span className="bg-ink text-canvas text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full shadow-sm">
                {event.mode}
              </span>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-ink tracking-tight">
              About This Event
            </h2>
            <div className="text-sm sm:text-base text-charcoal leading-relaxed whitespace-pre-line space-y-4">
              {event.description || 'No detailed overview provided by the organizer.'}
            </div>
          </div>

          {/* Eligibility & Requirements Block */}
          <div className="pt-6 border-t border-hairline space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
              Participation Eligibility
            </h3>
            <p className="text-sm text-charcoal bg-soft-cloud p-4 border border-hairline">
              {event.eligibility || 'Open to all technical participants. Check official registration guidelines for specific team size or student verification requirements.'}
            </p>
          </div>

          {/* Technologies & Tracks */}
          {event.technologies && event.technologies.length > 0 && (
            <div className="pt-6 border-t border-hairline space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                <Code2 className="w-4 h-4 text-mute" />
                <span>Featured Technologies & Topics</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 bg-soft-cloud text-ink rounded-full text-xs font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Provenance Section */}
          <div className="pt-6 border-t border-hairline space-y-3 text-xs text-mute">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Web Extraction Provenance</span>
              </span>
              <button
                onClick={handleRefreshLive}
                disabled={isRefreshing}
                className="text-ink hover:underline font-semibold flex items-center gap-1 text-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refetching Source...' : 'Verify Live Site'}</span>
              </button>
            </div>
            <p>
              Discovered from organizer domain: <strong className="text-ink">{new URL(event.sourceUrl).hostname}</strong>. Verified at {new Date(event.lastVerifiedAt).toLocaleString()}.
            </p>
            {refreshNotice && (
              <div className="p-3 bg-soft-cloud border border-hairline text-ink rounded-none">
                {refreshNotice}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions, Registration, Logistics (5 cols) */}
        <div className="lg:col-span-5 bg-canvas border border-hairline p-6 sm:p-8 space-y-6 sticky top-24">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-mute block mb-1">
              {event.organizer}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-ink leading-tight">
              {event.title}
            </h1>
          </div>

          {/* Price / Fee Callout */}
          <div className="py-3 px-4 bg-soft-cloud border border-hairline flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mute">
              Participation Fee
            </span>
            <span className="text-base font-bold text-ink">
              {event.isFree ? (
                <span className="text-success font-semibold">Free Registration</span>
              ) : event.fee !== null ? (
                `${event.currency} ${event.fee}`
              ) : (
                <span className="text-mute font-normal text-xs">Not specified by host</span>
              )}
            </span>
          </div>

          {/* Key Logistics List */}
          <div className="space-y-4 text-sm divide-y divide-hairline-soft">
            {/* Start & End Date */}
            <div className="pt-3 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-mute mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-ink block">Event Dates</span>
                <span className="text-charcoal text-xs">
                  {formatDateTime(event.startDate)}
                  {event.endDate && ` – ${formatDateTime(event.endDate)}`}
                </span>
              </div>
            </div>

            {/* Registration Deadline */}
            <div className="pt-3 flex items-start gap-3">
              <Clock className="w-4 h-4 text-mute mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-ink block">Registration Cutoff</span>
                <span className="text-charcoal text-xs">
                  {event.registrationDeadline
                    ? formatDateTime(event.registrationDeadline)
                    : 'Open until capacity reached / Not specified'}
                </span>
              </div>
            </div>

            {/* Venue & Location */}
            <div className="pt-3 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-mute mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-ink block">Venue / Format</span>
                <span className="text-charcoal text-xs">
                  {event.venue || (event.mode === 'online' ? 'Online Virtual Event' : 'TBD')}
                  {event.city && ` · ${event.city}`}
                  {event.country && `, ${event.country}`}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Registration CTA button adhering to Section 6.D */}
          <div className="pt-4 space-y-3">
            {hasDirectRegistration ? (
              <a
                href={event.registrationUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center text-sm font-semibold !h-12 flex items-center justify-center gap-2"
              >
                <span>Register on Official Site</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="space-y-2">
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center text-sm font-semibold !h-12 flex items-center justify-center gap-2"
                >
                  <span>Go to Organizer Source</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-mute text-center italic">
                  Note: A standalone registration form URL could not be isolated; linking directly to the verified organizer source page.
                </p>
              </div>
            )}

            {/* Set Deadline Reminder Button */}
            {event.registrationDeadline && (
              <button
                onClick={() => setIsReminderOpen(true)}
                className="btn-secondary w-full text-center text-sm font-semibold !h-11 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>Configure Deadline Reminder</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        event={event}
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
      />
    </div>
  );
}
