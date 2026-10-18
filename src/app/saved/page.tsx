'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Calendar, Clock, Trash2, Bell, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { EventItem, EventReminder } from '@/lib/types/event';
import { getLocalSavedEvents, toggleLocalSavedEvent, getLocalReminders, removeLocalReminder } from '@/lib/store/local-storage';
import { DEMO_EVENTS } from '@/lib/events/demo-events';
import { ReminderModal } from '@/components/events/ReminderModal';

export default function SavedEventsPage() {
  const [savedEvents, setSavedEvents] = useState<EventItem[]>([]);
  const [reminders, setReminders] = useState<EventReminder[]>([]);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<EventItem | null>(null);

  useEffect(() => {
    const savedIds = getLocalSavedEvents();
    const matched = DEMO_EVENTS.filter((e) => savedIds.includes(e.id));
    setSavedEvents(matched);
    setReminders(getLocalReminders());
  }, []);

  const handleRemove = (eventId: string) => {
    toggleLocalSavedEvent(eventId);
    setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleRemoveReminder = (reminderId: string) => {
    removeLocalReminder(reminderId);
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 space-y-10">
      {/* Header with Local vs Cloud indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-mute">
              Your Watchlist
            </span>
            <span className="inline-flex items-center gap-1 bg-soft-cloud text-ink text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-hairline">
              <ShieldCheck className="w-3 h-3 text-success" />
              <span>Local Session Synced</span>
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Saved Events & Deadline Reminders
          </h1>
        </div>

        <Link href="/explore" className="btn-secondary !h-10 !px-5 !text-xs self-start sm:self-auto">
          <span>Find More Events</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Active Reminders Banner */}
      {reminders.length > 0 && (
        <section className="bg-soft-cloud border border-hairline p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-ink" />
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Scheduled Deadline Reminders ({reminders.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reminders.map((rem) => {
              const matchedEvent = DEMO_EVENTS.find((e) => e.id === rem.eventId);
              return (
                <div
                  key={rem.id}
                  className="bg-canvas border border-hairline-soft p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-ink block truncate max-w-[180px]">
                      {matchedEvent ? matchedEvent.title : 'Saved Event'}
                    </span>
                    <span className="text-mute">
                      Alert {rem.daysBefore} day{rem.daysBefore > 1 ? 's' : ''} prior ({new Date(rem.scheduledFor).toLocaleDateString()})
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveReminder(rem.id)}
                    className="text-mute hover:text-sale p-1"
                    title="Cancel reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Saved Events Listing */}
      {savedEvents.length === 0 ? (
        <div className="text-center py-20 bg-soft-cloud border border-hairline p-8 space-y-4">
          <div className="w-12 h-12 bg-canvas rounded-full flex items-center justify-center text-mute mx-auto shadow-sm">
            <Bookmark className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-medium text-ink">You haven&apos;t bookmarked any events yet</h2>
          <p className="text-sm text-mute max-w-md mx-auto leading-relaxed">
            Click the bookmark icon on any hackathon, workshop, or conference card to save it here, monitor deadlines, and receive reminder notifications.
          </p>
          <Link href="/explore" className="btn-primary inline-flex mt-2">
            Browse Hackathons & Conferences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-mute font-medium">
            Showing {savedEvents.length} bookmarked opportunity{savedEvents.length > 1 ? 'ies' : ''}
          </div>

          <div className="divide-y divide-hairline border border-hairline bg-canvas">
            {savedEvents.map((event) => (
              <div
                key={event.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-soft-cloud/40 transition-colors"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-mute">
                    <span className="font-semibold text-ink uppercase tracking-wider">
                      {event.category}
                    </span>
                    <span>·</span>
                    <span>{event.organizer}</span>
                    <span>·</span>
                    <span className="font-medium text-ink">{event.mode}</span>
                  </div>

                  <Link href={`/events/${event.slug}`} className="hover:underline">
                    <h3 className="text-base font-semibold text-ink">{event.title}</h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-mute" />
                      <span>{new Date(event.startDate || '').toLocaleDateString()}</span>
                    </span>

                    {event.registrationDeadline && (
                      <span className="flex items-center gap-1 text-sale font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                      </span>
                    )}

                    <span>
                      {event.isFree ? (
                        <span className="text-success font-semibold">Free</span>
                      ) : (
                        `Fee: ${event.currency} ${event.fee}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {event.registrationDeadline && (
                    <button
                      onClick={() => setSelectedEventForReminder(event)}
                      className="btn-secondary !h-9 !px-3.5 !text-xs flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Reminder</span>
                    </button>
                  )}

                  <Link
                    href={`/events/${event.slug}`}
                    className="btn-primary !h-9 !px-4 !text-xs"
                  >
                    Details
                  </Link>

                  <button
                    onClick={() => handleRemove(event.id)}
                    className="btn-icon-circular text-mute hover:text-sale"
                    title="Remove from saved"
                    aria-label="Remove saved event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEventForReminder && (
        <ReminderModal
          event={selectedEventForReminder}
          isOpen={true}
          onClose={() => {
            setSelectedEventForReminder(null);
            setReminders(getLocalReminders());
          }}
        />
      )}
    </div>
  );
}
