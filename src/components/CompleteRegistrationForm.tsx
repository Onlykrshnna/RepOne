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
          membership_status: 'none' // Ensure they route to choose membership next
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
    <div className="min-h-screen bg-[#080809] text-[#F0EDE6] flex flex-col justify-center items-center px-6 selection:bg-[#BEFF00] selection:text-[#080809]">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px" }} />
      
      <div className="w-full max-w-sm relative z-10 py-12">
        <div className="text-center mb-12">
          <img src="/logo.png" alt="Logo" className="h-20 object-contain hover:opacity-80 transition-opacity mx-auto" />
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
            <span className="text-[#F0EDE6]/40" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.26em", textTransform: "uppercase" }}>Complete Profile</span>
            <span className="block h-[1px] w-6 bg-[#F0EDE6]/15" />
          </div>
          <p className="text-xs text-[#F0EDE6]/50 mt-4 max-w-xs mx-auto leading-relaxed text-center">
            Please choose a unique username and provide a contact number to finish setting up your account.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 border border-[#FF3366]/20 bg-[#FF3366]/5 text-[#FF3366] text-center text-xs" style={{ fontFamily: "Inter" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-1 group">
            <label className="block text-[#F0EDE6]/50 transition-colors group-focus-within:text-[#BEFF00]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="w-full bg-transparent border-b border-[#F0EDE6]/20 px-0 py-3 text-lg text-[#F0EDE6] focus:outline-none focus:border-[#BEFF00] transition-colors rounded-none placeholder:text-[#F0EDE6]/20"
              placeholder="e.g. john_doe"
              required
            />
          </div>

          <div className="space-y-1 group">
            <label className="block text-[#F0EDE6]/50 transition-colors group-focus-within:text-[#BEFF00]" style={{ fontFamily: "Inter", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent border-b border-[#F0EDE6]/20 px-0 py-3 text-lg text-[#F0EDE6] focus:outline-none focus:border-[#BEFF00] transition-colors rounded-none placeholder:text-[#F0EDE6]/20"
              placeholder="e.g. +1 555-0100"
              required
            />
          </div>

          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#BEFF00] text-[#080809] py-4 flex items-center justify-center gap-3 hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter", fontSize: "12px", letterSpacing: "0.26em", textTransform: "uppercase", fontWeight: 500 }}
            >
              {isLoading ? 'Saving...' : 'Finish Setup'}
              {!isLoading && <span>&rarr;</span>}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="w-full border border-[#F0EDE6]/10 text-[#F0EDE6]/55 hover:text-white py-3 hover:border-white/30 transition-colors"
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
