'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bookmark, Menu, X, Compass, SlidersHorizontal, User, Flame } from 'lucide-react';
import { getLocalSavedEvents } from '@/lib/store/local-storage';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCount, setSavedCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getLocalSavedEvents().length);
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 1500);
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const navLinks = [
    { label: 'Explore', href: '/explore' },
    { label: 'Hackathons', href: '/explore?category=hackathon' },
    { label: 'Conferences', href: '/explore?category=conference' },
    { label: 'Workshops', href: '/explore?category=workshop' },
    { label: 'Meetups', href: '/explore?category=meetup' },
    { label: 'For You', href: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-canvas border-b border-hairline-soft shadow-hairline-bottom">
      <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="w-8 h-8 bg-ink rounded-full flex items-center justify-center text-canvas font-black tracking-tighter text-sm group-hover:scale-105 transition-transform">
              ES
            </div>
            <span className="font-display tracking-wider text-2xl text-ink font-semibold">
              EVENTSCOUT
            </span>
          </Link>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]) && link.href.includes(pathname));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`py-5 transition-colors relative hover:text-ink ${
                  isActive ? 'text-ink font-semibold' : 'text-mute'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Search Pill, Bookmarks, Profile */}
        <div className="flex items-center gap-3">
          {/* Search Pill */}
          <form
            onSubmit={handleSearchSubmit}
            className="search-pill-container hidden sm:flex items-center w-48 lg:w-64"
          >
            <Search className="w-4 h-4 text-mute mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search tech events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
            />
          </form>

          {/* Bookmarks link with counter */}
          <Link
            href="/saved"
            aria-label="View saved events"
            className="btn-icon-circular relative text-ink hover:text-ink"
          >
            <Bookmark className="w-4 h-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-ink text-canvas text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Dashboard / Preferences */}
          <Link
            href="/preferences"
            aria-label="User preferences"
            className="btn-icon-circular hidden sm:inline-flex text-ink"
            title="Discovery Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Link>

          {/* Auth Button */}
          <Link
            href="/auth"
            className="hidden sm:inline-flex btn-primary !h-10 !px-5 !text-sm"
          >
            Sign In
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-icon-circular md:hidden text-ink"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-canvas border-b border-hairline px-6 py-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="search-pill-container w-full">
            <Search className="w-4 h-4 text-mute mr-2" />
            <input
              type="text"
              placeholder="Search hackathons, workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
            />
          </form>
          <div className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-ink hover:text-mute py-1 border-b border-hairline-soft"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/preferences"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink hover:text-mute py-1 border-b border-hairline-soft flex items-center justify-between"
            >
              <span>Personalized Matching</span>
              <SlidersHorizontal className="w-4 h-4 text-mute" />
            </Link>
            <Link
              href="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-ink hover:text-mute py-1 border-b border-hairline-soft flex items-center justify-between"
            >
              <span>Saved Events & Reminders</span>
              <span className="bg-ink text-canvas text-xs px-2 py-0.5 rounded-full font-bold">
                {savedCount}
              </span>
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary w-full text-center mt-2"
            >
              Sign In to EventScout
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
