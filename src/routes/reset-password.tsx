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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Logo" className="h-20 object-contain hover:opacity-80 transition-opacity" />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-border" />
            <span className="text-muted-foreground" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Update Password</span>
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
            <h3 className="text-primary font-display text-2xl mb-4">Password Updated</h3>
            <p className="text-muted-foreground mb-8" style={{ fontFamily: "Inter", fontSize: "13px", lineHeight: "1.6" }}>
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-1 group">
              <label className="block text-muted-foreground transition-colors group-focus-within:text-primary" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-border px-0 py-3 text-lg text-foreground focus:outline-none focus:border-primary transition-colors rounded-none"
                placeholder="Must be at least 6 characters"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-8 bg-primary text-primary-foreground py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold"
              style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase" }}
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}