import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Lock, User, Eye, EyeOff,
  Check, AlertCircle, ArrowRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSEO  } from '../hooks/useSEO';

interface AuthPageProps {
  onNavigate: (page: any) => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

const SOCIAL = [
  { id: 'google',    label: 'Continue with Google',    logo: 'G',  color: '#4285F4' },
  { id: 'facebook',  label: 'Continue with Facebook',  logo: 'f',  color: '#1877F2' },
];

export function AuthPage({ onNavigate }: AuthPageProps) {
  useSEO({ title: 'Sign in', description: 'Sign in or create a Mapheane account to track orders and save your wishlist.' });

  const [mode,         setMode]        = useState<AuthMode>('login');
  const [showPassword, setShowPwd]     = useState(false);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState('');
  const [success,      setSuccess]     = useState('');

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const { login, signup, loginWithGoogle, loginWithFacebook, resetPassword } = useAuth();

  const reset = () => { setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Enter a valid email address'); return; }
    if (mode !== 'reset' && password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        const loggedInUser = await login(email.trim(), password);
        onNavigate(loggedInUser.role === 'admin' ? 'admin' : 'home');
      } else if (mode === 'signup') {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return; }
        await signup(name, email.trim(), password);
        onNavigate('home');
      } else {
        await resetPassword(email.trim());
        setSuccess(`Password reset link sent to ${email.trim()} — check your inbox.`);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong — please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: string) => {
    reset();
    setLoading(true);
    try {
      if (provider === 'google')   await loginWithGoogle();
      else if (provider === 'facebook') await loginWithFacebook();
      else setError('This sign-in method is not available.');
      // OAuth redirects away — no onNavigate needed
    } catch (err: any) {
      setError(err.message ?? 'Social sign-in unavailable — please use email');
      setLoading(false);
    }
  };

  const TITLES: Record<AuthMode, string> = {
    login:  'Welcome back.',
    signup: 'Create account.',
    reset:  'Reset password.',
  };

  const SUBS: Record<AuthMode, string> = {
    login:  'Sign in to track orders, access your wishlist, and manage your account.',
    signup: 'Join to save artworks, track purchases, and access collector previews.',
    reset:  "Enter your email address and we'll send you a reset link.",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background flex items-start justify-center pt-20 pb-16 px-5"
    >
      <div className="w-full max-w-md">

        {/* Back */}
        <button onClick={() => onNavigate('home')}
          className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted hover:text-charcoal transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Home
        </button>

        {/* Brand */}
        <div className="mb-8">
          <p className="font-serif text-4xl italic text-terracotta mb-1" style={{ letterSpacing: '-0.02em' }}>Mapheane</p>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}>
              <h1 className="font-serif text-3xl italic text-charcoal mb-2" style={{ letterSpacing: '-0.01em' }}>
                {TITLES[mode]}
              </h1>
              <p className="text-sm text-muted leading-relaxed">{SUBS[mode]}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Success state (password reset) */}
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-sage/8 border border-sage/25 p-4 mb-6">
              <Check className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="text-sm text-charcoal/75 leading-relaxed">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-terracotta/6 border border-terracotta/20 p-4 mb-6">
              <AlertCircle className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
              <p className="text-sm text-charcoal/75 leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social buttons — only for login/signup */}
        {mode !== 'reset' && (
          <>
            <div className="space-y-3 mb-7">
              {SOCIAL.map(s => (
                <button key={s.id} onClick={() => handleSocial(s.id)} disabled={loading}
                  className="w-full flex items-center gap-4 px-5 py-3.5 border border-charcoal/12 hover:border-charcoal/25 hover:bg-parchment/40 transition-all duration-300 text-sm text-charcoal/75 disabled:opacity-50">
                  <div className="w-6 h-6 flex items-center justify-center text-white text-sm font-sans font-500 flex-shrink-0"
                    style={{ background: s.color }}>
                    {s.logo}
                  </div>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-7">
              <div className="flex-1 h-px bg-charcoal/8" />
              <span className="text-xs text-muted/60 font-sans uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-charcoal/8" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Name — signup only */}
          {mode === 'signup' && (
            <div className="group">
              <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-0 top-3 w-4 h-4 text-muted/50" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-charcoal/18 py-2.5 pl-7 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic" />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="group">
            <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-0 top-3 w-4 h-4 text-muted/50" />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); reset(); }} required
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-charcoal/18 py-2.5 pl-7 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/25 placeholder:italic" />
            </div>
          </div>

          {/* Password — not on reset */}
          {mode !== 'reset' && (
            <div className="group">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-label uppercase tracking-widest text-muted group-focus-within:text-terracotta transition-colors">
                  Password
                </label>
                {mode === 'login' && (
                  <button type="button" onClick={() => { setMode('reset'); reset(); }}
                    className="text-xs text-muted hover:text-terracotta transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-0 top-3 w-4 h-4 text-muted/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); reset(); }}
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-charcoal/18 py-2.5 pl-7 pr-10 text-charcoal font-serif text-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-charcoal/40"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-0 top-3 text-muted hover:text-charcoal transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && password && password.length < 6 && (
                <p className="text-xs text-muted/60 mt-1.5">At least 6 characters</p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-terracotta text-background py-4 text-xs font-sans uppercase tracking-[0.2em] hover:bg-terracottaDark transition-colors duration-400 disabled:opacity-60 shadow-button hover:shadow-button-hover">
            {loading
              ? <div className="w-4 h-4 border border-white/50 border-t-white rounded-full animate-spin" />
              : <>
                  {mode === 'login'  && 'Sign in'}
                  {mode === 'signup' && 'Create account'}
                  {mode === 'reset'  && 'Send reset link'}
                  <ArrowRight className="w-4 h-4" />
                </>}
          </button>
        </form>

        {/* Mode switch */}
        <div className="mt-8 text-center">
          {mode === 'login' && (
            <p className="text-sm text-muted">
              No account?{' '}
              <button onClick={() => { setMode('signup'); reset(); }}
                className="text-terracotta hover:text-terracottaDark transition-colors">
                Create one free
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); reset(); }}
                className="text-terracotta hover:text-terracottaDark transition-colors">
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); reset(); }}
              className="text-sm text-muted hover:text-charcoal transition-colors flex items-center gap-1.5 mx-auto">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          )}
        </div>

        {/* Terms note */}
        {mode === 'signup' && (
          <p className="text-xs text-muted/50 text-center mt-6 leading-relaxed">
            By creating an account you agree to our{' '}
            <button onClick={() => onNavigate('terms')} className="text-muted hover:text-terracotta transition-colors underline underline-offset-2">
              Terms of Use
            </button>{' '}
            and{' '}
            <button onClick={() => onNavigate('privacy')} className="text-muted hover:text-terracotta transition-colors underline underline-offset-2">
              Privacy Policy
            </button>.
          </p>
        )}
      </div>
    </motion.div>
  );
}
