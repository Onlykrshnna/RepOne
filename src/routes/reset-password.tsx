import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/reset-password')({
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the recovery token in the URL hash
    supabase.auth.onAuthStateChange((event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        setStatus('idle');
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await authService.updatePassword(password);
      setStatus('success');
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#080809] text-[#F0EDE6] flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block font-display text-[26px] tracking-tight leading-none text-[#F0EDE6] hover:text-[#BEFF00] transition-colors">
            ATLAS
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/40" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Update Password</span>
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
            <h3 className="text-[#BEFF00] font-display text-2xl mb-4">Password Updated</h3>
            <p className="text-[#F0EDE6]/60 mb-8" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.6" }}>
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-1 group">
              <label className="block text-[#F0EDE6]/50 transition-colors group-focus-within:text-[#BEFF00]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-[#F0EDE6]/20 px-0 py-3 text-lg text-[#F0EDE6] focus:outline-none focus:border-[#BEFF00] transition-colors rounded-none"
                placeholder="Must be at least 6 characters"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-8 bg-[#BEFF00] text-[#080809] py-4 flex items-center justify-center gap-3 hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}