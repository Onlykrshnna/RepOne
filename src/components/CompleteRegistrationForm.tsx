import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';

interface CompleteRegistrationFormProps {
  profile: any;
  signOut: () => Promise<void>;
}

export function CompleteRegistrationForm({ profile, signOut }: CompleteRegistrationFormProps) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refetchProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formattedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (formattedUsername.length < 3) {
      setError('Username must be at least 3 characters and contain only letters, numbers, or underscores.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Check if username is already taken
      const { data: existingUser, checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', formattedUsername)
        .maybeSingle() as any;

      if (checkError) {
        throw new Error('Error checking username availability.');
      }

      if (existingUser && existingUser.id !== profile.id) {
        setError('This username is already taken. Please choose another one.');
        setIsLoading(false);
        return;
      }

      // 2. Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formattedUsername,
          phone: phone.trim(),
          membership_status: 'pending' // Ensure they route to choose membership next
        })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      // 3. Clear profile cache and reload state
      await refetchProfile();

    } catch (err: any) {
      console.error('Failed to complete registration:', err);
      setError(err.message || 'An error occurred while updating your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 selection:bg-primary/30 selection:text-foreground">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
      
      <div className="w-full max-w-sm relative z-10 py-12">
        <div className="text-center mb-12">
          <img src="/logo.png" alt="Logo" className="h-20 object-contain hover:opacity-80 transition-opacity mx-auto" />
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-border" />
            <span className="text-muted-foreground" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Complete Profile</span>
            <span className="block h-[1px] w-6 bg-border" />
          </div>
          <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto leading-relaxed text-center">
            Please choose a unique username and provide a contact number to finish setting up your account.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-destructive/20 bg-destructive/10 text-destructive text-center text-xs font-semibold rounded-lg" style={{ fontFamily: "Inter" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-1 group">
            <label className="block text-muted-foreground transition-colors group-focus-within:text-primary" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="w-full bg-transparent border-b border-border px-0 py-3 text-lg text-foreground focus:outline-none focus:border-primary transition-colors rounded-none placeholder:text-muted-foreground/50"
              placeholder="e.g. john_doe"
              required
            />
          </div>

          <div className="space-y-1 group">
            <label className="block text-muted-foreground transition-colors group-focus-within:text-primary" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent border-b border-border px-0 py-3 text-lg text-foreground focus:outline-none focus:border-primary transition-colors rounded-none placeholder:text-muted-foreground/50"
              placeholder="e.g. +1 555-0100"
              required
            />
          </div>

          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-4 flex items-center justify-center gap-3 hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold"
              style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase" }}
            >
              {isLoading ? 'Saving...' : 'Finish Setup'}
              {!isLoading && <span>&rarr;</span>}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full border border-border text-muted-foreground hover:text-foreground py-3 hover:bg-muted/50 transition-colors rounded-xl font-medium"
              style={{ fontFamily: "Inter", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}
            >
              Cancel & Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
