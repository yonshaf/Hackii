'use client';

import React, { useState } from 'react';
import { X, Bell, Calendar, Check, AlertCircle } from 'lucide-react';
import { EventItem } from '@/lib/types/event';
import { addLocalReminder } from '@/lib/store/local-storage';

interface ReminderModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function ReminderModal({ event, isOpen, onClose, onSuccess }: ReminderModalProps) {
  const [selectedInterval, setSelectedInterval] = useState<1 | 3 | 7>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;

  const handleSetReminder = async () => {
    if (!deadline) {
      setErrorMsg('No verified registration deadline available for this event.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const scheduledTime = new Date(deadline.getTime() - selectedInterval * 24 * 60 * 60 * 1000);
      if (scheduledTime.getTime() <= Date.now()) {
        setErrorMsg(`The ${selectedInterval}-day reminder threshold has already passed.`);
        setIsSubmitting(false);
        return;
      }

      // Add to local storage
      addLocalReminder(event.id, selectedInterval, event.registrationDeadline as string);

      // Call API
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          daysBefore: selectedInterval,
          deadline: event.registrationDeadline,
          userId: 'guest_user',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule');
      }

      setSuccessMsg(`Reminder active: you will be notified on ${scheduledTime.toLocaleDateString()} (${selectedInterval} days before deadline).`);
      if (onSuccess) onSuccess(`Reminder set for ${event.title}`);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error configuring reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas w-full max-w-md rounded-none border border-hairline shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="btn-icon-circular absolute top-4 right-4 text-ink"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-soft-cloud flex items-center justify-center text-ink">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink leading-tight">
              Deadline Reminder
            </h3>
            <p className="text-xs text-mute truncate max-w-xs">{event.title}</p>
          </div>
        </div>

        {deadline ? (
          <div className="space-y-4">
            <div className="bg-soft-cloud p-3 text-xs text-charcoal border border-hairline flex items-center gap-2">
              <Calendar className="w-4 h-4 text-mute shrink-0" />
              <span>
                Verified Registration Deadline: <strong className="text-ink">{deadline.toLocaleDateString()}</strong> at {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
                Select Reminder Frequency
              </label>

              <div className="grid grid-cols-3 gap-2">
                {([7, 3, 1] as const).map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSelectedInterval(days)}
                    className={`py-2.5 px-2 text-center text-xs font-medium rounded-full border transition-all ${
                      selectedInterval === days
                        ? 'bg-ink text-canvas border-ink font-semibold'
                        : 'bg-canvas text-ink border-hairline hover:border-ink'
                    }`}
                  >
                    {days} Day{days > 1 ? 's' : ''} Prior
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-sale text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-50 text-success text-xs flex items-center gap-2 border border-green-200">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary !h-10 !px-4 !text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetReminder}
                disabled={isSubmitting}
                className="btn-primary !h-10 !px-6 !text-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Scheduling...' : 'Set Reminder'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-mute">
              This event does not currently have a verified registration deadline. Once the organizer posts an official cutoff, reminder options will appear here.
            </p>
            <button onClick={onClose} className="btn-secondary mt-4 w-full">
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
