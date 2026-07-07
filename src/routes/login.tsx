import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export const Route = createFileRoute('/login')({
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
    <div className="min-h-screen bg-[#080809] text-[#F0EDE6] flex flex-col justify-center items-center px-6 selection:bg-[#BEFF00] selection:text-[#080809]">
      {/* Background grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Logo" className="h-10 object-contain hover:opacity-80 transition-opacity" />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/40" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Portal</span>
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
          </div>
        </div>

        {(error || authError) && (
          <div className="mb-8 p-4 border border-[#FF3366]/20 bg-[#FF3366]/5 text-[#FF3366] text-center" style={{ fontFamily: "Inter", fontSize: "12px" }}>
            {error || authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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

          <div className="space-y-1 group relative">
            <div className="flex items-center justify-between">
              <label className="block text-[#F0EDE6]/50 transition-colors group-focus-within:text-[#BEFF00]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Password
              </label>
              <Link to="/forgot-password" className="text-[#F0EDE6]/30 hover:text-[#BEFF00] transition-colors" style={{ fontFamily: "Inter", fontSize: "10px" }}>
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-[#F0EDE6]/20 px-0 py-3 pr-10 text-lg text-[#F0EDE6] focus:outline-none focus:border-[#BEFF00] transition-colors rounded-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F0EDE6]/50 hover:text-[#BEFF00] transition-colors p-2"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-[#BEFF00] text-[#080809] py-4 flex items-center justify-center gap-3 hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <span>&rarr;</span>}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[#F0EDE6]/30" style={{ fontFamily: "Inter", fontSize: "11px", lineHeight: "1.6" }}>
            Don't have an account? <Link to="/signup" className="text-[#F0EDE6]/60 hover:text-[#BEFF00] transition-colors border-b border-[#F0EDE6]/20 pb-0.5">Apply for Membership</Link>
          </p>
        </div>
      </div>
    </div>
  );
}