import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';

import { getSeoTags } from '../lib/seo';

export const Route = createFileRoute('/forgot-password')({
  head: () =>
    getSeoTags({
      title: "Account Recovery | RepOne",
      description: "Recover your gym member login credentials and reset your password on RepOne.",
      path: "/forgot-password",
      noindex: true,
    }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Need full URL for redirect back to app
      const resetUrl = `${window.location.origin}/reset-password`;
      await authService.resetPasswordForEmail(email, resetUrl);
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset link.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Logo" className="h-20 object-contain hover:opacity-80 transition-opacity" />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-border" />
            <h1 className="text-muted-foreground" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Recovery</h1>
            <span className="block h-[1px] w-6 bg-border" />
          </div>
        </div>

        {status === 'error' && (
          <div className="mb-8 p-4 border border-destructive/20 bg-destructive/10 text-destructive text-center font-semibold rounded-lg" style={{ fontFamily: "Inter", fontSize: "12px" }}>
            {errorMessage}
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center border border-primary/20 bg-primary/10 p-8 rounded-xl">
            <h3 className="text-primary font-display text-2xl mb-4">Check your email</h3>
            <p className="text-muted-foreground mb-8" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.6" }}>
              We've sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="text-primary hover:underline transition-colors" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <p className="text-muted-foreground mb-8 text-center" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.6" }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="space-y-1 group">
              <label className="block text-muted-foreground transition-colors group-focus-within:text-primary" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-border px-0 py-3 text-lg text-foreground focus:outline-none focus:border-primary transition-colors rounded-none placeholder:text-muted-foreground/50"
                placeholder="member@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-8 bg-primary text-primary-foreground py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold"
              style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase" }}
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="mt-8 text-center">
              <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}