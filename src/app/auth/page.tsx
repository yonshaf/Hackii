'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, UserCheck, Key, Mail, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const isSupabaseConfigured = Boolean(supabase);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!isSupabaseConfigured) {
      // In guest / demo mode, simulate successful session
      setTimeout(() => {
        router.push('/dashboard');
      }, 600);
      return;
    }

    try {
      if (isRegister) {
        const { error } = await supabase!.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 bg-ink text-canvas rounded-full flex items-center justify-center font-bold text-sm mx-auto">
          ES
        </div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">
          {isRegister ? 'Create Your EventScout Account' : 'Sign in to EventScout'}
        </h1>
        <p className="text-xs text-mute">
          Synchronize saved hackathons, reminder notifications, and custom scoring weights.
        </p>
      </div>

      <div className="bg-canvas border border-hairline p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Environment status banner */}
        {!isSupabaseConfigured && (
          <div className="p-3 bg-soft-cloud border border-hairline text-xs text-mute flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
            <div>
              <strong className="text-ink block">Guest Session Active</strong>
              <span>
                Supabase credentials not configured in local environment. You can test sign in or continue as Guest — bookmarks and preferences are fully saved in this session.
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 text-sale text-xs border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="search-pill-container !h-11">
              <Mail className="w-4 h-4 text-mute mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="search-pill-container !h-11">
              <Lock className="w-4 h-4 text-mute mr-2 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent border-none outline-none text-sm text-ink placeholder:text-mute w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !h-11 text-sm font-semibold !mt-6 disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-hairline-soft flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-mute hover:text-ink underline"
          >
            {isRegister ? 'Already have an account? Sign In' : 'New here? Create Account'}
          </button>

          <Link href="/dashboard" className="text-ink font-semibold hover:underline flex items-center gap-1">
            <span>Continue as Guest</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
