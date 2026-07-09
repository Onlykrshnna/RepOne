import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';

import { getSeoTags } from '../lib/seo';

export const Route = createFileRoute('/login')({
  head: () =>
    getSeoTags({
      title: "Member Portal Login | RepOne",
      description: "Log in to the RepOne member portal to book gym slots, view schedules, and manage memberships.",
      path: "/login",
      noindex: true,
    }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login({ email, password });
      
      // The auth listener in auth-context will pick up the session and fetch the profile.
      // We will do a quick check to see if it's an admin. If so, redirect them appropriately.
      const session = await authService.getSession();
      if (session) {
        // Need to import profileService here, or just fetch dynamically
        const { profileService } = await import('../services/profile.service');
        const profile = await profileService.getProfile(session.user.id, true);
        
        if (profile?.role === 'admin') {
          // If admin logged in via member login, automatically redirect them to admin dashboard
          navigate({ to: '/admin/dashboard' });
        } else {
          // Normal member
          navigate({ to: '/dashboard' });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      await signOut(); // Ensure clean state on failure
    } finally {
      setIsLoading(false);
    }
  };

  const search = Route.useSearch() as { error?: string };
  const authError = search?.error === 'unauthorized_admin' 
    ? 'This account does not have administrator access.' 
    : '';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 selection:bg-primary/30 selection:text-foreground">
      {/* Background grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Logo" className="h-20 object-contain hover:opacity-80 transition-opacity" />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-border" />
            <h1 className="text-muted-foreground" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Portal Login</h1>
            <span className="block h-[1px] w-6 bg-border" />
          </div>
        </div>

        {(error || authError) && (
          <div className="mb-8 p-4 border border-destructive/20 bg-destructive/10 text-destructive text-center font-semibold rounded-lg" style={{ fontFamily: "Inter", fontSize: "12px" }}>
            {error || authError}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full border border-border text-foreground bg-card hover:bg-muted py-4 flex items-center justify-center transition-all duration-300 font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}
        >
          <svg className="w-4 h-4 mr-3 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.355 0 3.36 2.664 1.39 6.555l3.876 3.21z"
            />
            <path
              fill="#34A853"
              d="M16.04 15.345c-1.073.745-2.455 1.19-4.04 1.19a7.077 7.077 0 0 1-6.734-4.855L1.39 14.89C3.36 18.78 7.355 21.445 12 21.445c2.945 0 5.864-1.027 7.91-2.91l-3.87-3.19z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.275c0-.827-.073-1.627-.21-2.4H12v4.61h6.47c-.28 1.48-1.12 2.74-2.39 3.59l3.87 3.19c2.26-2.09 3.54-5.17 3.54-8.99z"
            />
            <path
              fill="#FBBC05"
              d="M5.266 11.68a7.077 7.077 0 0 1 0-2.44L1.39 6.555a11.95 11.95 0 0 0 0 8.335l3.876-3.21z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-8">
          <span className="h-[1px] flex-1 bg-border" />
          <span className="text-muted-foreground text-[9px] tracking-widest font-semibold font-sans uppercase">OR</span>
          <span className="h-[1px] flex-1 bg-border" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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

          <div className="space-y-1 group relative">
            <div className="flex items-center justify-between">
              <label className="block text-muted-foreground transition-colors group-focus-within:text-primary" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Password
              </label>
              <Link to="/forgot-password" className="text-muted-foreground/60 hover:text-primary transition-colors" style={{ fontFamily: "Inter", fontSize: "10px" }}>
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-border px-0 py-3 pr-10 text-lg text-foreground focus:outline-none focus:border-primary transition-colors rounded-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-primary text-primary-foreground py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold"
            style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase" }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <span>&rarr;</span>}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground" style={{ fontFamily: "Inter", fontSize: "11px", lineHeight: "1.6" }}>
            Don't have an account? <Link to="/signup" className="text-foreground hover:text-primary transition-colors border-b border-border pb-0.5">Apply for Membership</Link>
          </p>
        </div>
      </div>
    </div>
  );
}