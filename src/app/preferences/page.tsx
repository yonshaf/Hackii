'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Check, Save, ArrowRight, Sparkles, MapPin, DollarSign, Layers } from 'lucide-react';
import { UserPreferences, EventCategory, EventMode } from '@/lib/types/event';
import { getLocalUserPreferences, saveLocalUserPreferences } from '@/lib/store/local-storage';

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(getLocalUserPreferences());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setPrefs(getLocalUserPreferences());
  }, []);

  const allInterests = [
    'AI',
    'Machine Learning',
    'React',
    'Next.js',
    'TypeScript',
    'Rust',
    'Python',
    'Web3',
    'Kubernetes',
    'Cloud',
    'WebGPU',
    'Embedded Systems',
    'Security',
  ];

  const allCategories: { label: string; value: EventCategory }[] = [
    { label: 'Hackathons', value: 'hackathon' },
    { label: 'Workshops', value: 'workshop' },
    { label: 'Conferences', value: 'conference' },
    { label: 'Meetups', value: 'meetup' },
    { label: 'Competitions', value: 'competition' },
  ];

  const allModes: { label: string; value: EventMode }[] = [
    { label: 'Online / Virtual', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'In-Person / Onsite', value: 'offline' },
  ];

  const toggleInterest = (tech: string) => {
    setPrefs((prev) => ({
      ...prev,
      technicalInterests: prev.technicalInterests.includes(tech)
        ? prev.technicalInterests.filter((t) => t !== tech)
        : [...prev.technicalInterests, tech],
    }));
  };

  const toggleCategory = (cat: EventCategory) => {
    setPrefs((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(cat)
        ? prev.preferredCategories.filter((c) => c !== cat)
        : [...prev.preferredCategories, cat],
    }));
  };

  const toggleMode = (m: EventMode) => {
    setPrefs((prev) => ({
      ...prev,
      preferredModes: prev.preferredModes.includes(m)
        ? prev.preferredModes.filter((mode) => mode !== m)
        : [...prev.preferredModes, m],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalUserPreferences(prefs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-hairline pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-mute block mb-1">
          Scoring Customization
        </span>
        <h1 className="text-3xl font-semibold text-ink tracking-tight mb-2">
          Personalized Discovery Preferences
        </h1>
        <p className="text-sm text-mute leading-relaxed max-w-2xl">
          EventScout scores every discovered event transparently using your exact preferences. No black box machine learning: your tags, city, mode, and budget directly determine match rankings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Technical Interests */}
        <div className="bg-canvas border border-hairline p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-ink" />
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Technical Interests (+25% match weight)
            </h2>
          </div>
          <p className="text-xs text-mute">
            Select technologies you build with or wish to explore:
          </p>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => {
              const selected = prefs.technicalInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                    selected
                      ? 'bg-ink text-canvas border-ink shadow-sm'
                      : 'bg-soft-cloud text-ink border-hairline hover:border-ink'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1" />}
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Preferred Categories */}
        <div className="bg-canvas border border-hairline p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-ink" />
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Event Categories (+15% match weight)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allCategories.map((cat) => {
              const selected = prefs.preferredCategories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`p-3 text-left border rounded text-xs font-medium transition-all ${
                    selected
                      ? 'bg-soft-cloud border-ink text-ink font-semibold'
                      : 'bg-canvas border-hairline text-charcoal hover:border-ink'
                  }`}
                >
                  <span className="block font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Event Modes (Online / Hybrid / In-Person) */}
        <div className="bg-canvas border border-hairline p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">
            Format Preference (+10% match weight)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {allModes.map((m) => {
              const selected = prefs.preferredModes.includes(m.value);
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleMode(m.value)}
                  className={`p-3 text-left border rounded text-xs font-medium transition-all ${
                    selected
                      ? 'bg-soft-cloud border-ink text-ink font-semibold'
                      : 'bg-canvas border-hairline text-charcoal hover:border-ink'
                  }`}
                >
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Location & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-canvas border border-hairline p-6 space-y-3">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
              Home City / Hub (+10% local bonus)
            </label>
            <div className="search-pill-container !h-11">
              <MapPin className="w-4 h-4 text-mute mr-2 shrink-0" />
              <input
                type="text"
                value={prefs.city || ''}
                onChange={(e) => setPrefs({ ...prefs, city: e.target.value })}
                placeholder="e.g. San Francisco, London, Berlin"
                className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
              />
            </div>
          </div>

          <div className="bg-canvas border border-hairline p-6 space-y-3">
            <label className="text-xs font-semibold text-ink uppercase tracking-wider block">
              Maximum Budget (USD)
            </label>
            <div className="search-pill-container !h-11">
              <DollarSign className="w-4 h-4 text-mute mr-2 shrink-0" />
              <input
                type="number"
                value={prefs.maxBudget ?? ''}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    maxBudget: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="Leave blank for any budget"
                className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
              />
            </div>
            <p className="text-[11px] text-mute">
              Events marked Free or under this budget receive priority scoring.
            </p>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 flex items-center justify-between">
          <button type="submit" className="btn-primary !h-12 !px-8">
            <Save className="w-4 h-4 mr-2" />
            <span>Save Preferences</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-semibold text-success flex items-center gap-1.5 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Preferences updated! Match scores recalculated.</span>
            </span>
          )}

          <Link href="/dashboard" className="text-xs font-semibold text-ink hover:underline flex items-center gap-1">
            <span>View Tailored Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </form>
    </div>
  );
}
