import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';

export const Route = createFileRoute('/forgot-password')({
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
    <div className="min-h-screen bg-[#080809] text-[#F0EDE6] flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block font-display text-[26px] tracking-tight leading-none text-[#F0EDE6] hover:text-[#BEFF00] transition-colors">
            XYZ Fitness
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/40" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Recovery</span>
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
          </div>
        </div>

        {status === 'error' && (
          <div className="mb-8 p-4 border border-[#FF3366]/20 bg-[#FF3366]/5 text-[#FF3366] text-center" style={{ fontFamily: "Inter", fontSize: "12px" }}>
            {errorMessage}
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center border border-[#BEFF00]/20 bg-[#BEFF00]/5 p-8">
            <h3 className="text-[#BEFF00] font-display text-2xl mb-4">Check your email</h3>
            <p className="text-[#F0EDE6]/60 mb-8" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.6" }}>
              We've sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="text-[#BEFF00] hover:text-white transition-colors" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <p className="text-[#F0EDE6]/50 mb-8 text-center" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.6" }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="space-y-1 group">
              <label className="block text-[#F0EDE6]/50 transition-colors group-focus-within:text-[#BEFF00]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[#F0EDE6]/20 px-0 py-3 text-lg text-[#F0EDE6] focus:outline-none focus:border-[#BEFF00] transition-colors rounded-none placeholder:text-[#F0EDE6]/20"
                placeholder="member@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-8 bg-[#BEFF00] text-[#080809] py-4 flex items-center justify-center gap-3 hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="mt-8 text-center">
              <Link to="/login" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}