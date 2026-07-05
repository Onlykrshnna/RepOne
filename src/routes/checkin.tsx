import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '../lib/auth-context';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { dashboardService } from '../services/dashboard.service';
import { guestPassService, GuestPass } from '../services/guest-pass.service';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, QrCode } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';

type CheckInSearch = {
  guestId?: string;
}

export const Route = createFileRoute('/checkin')({
  validateSearch: (search: Record<string, unknown>): CheckInSearch => {
    return {
      guestId: search.guestId as string | undefined,
    }
  },
  component: CheckInPage,
});

function CheckInPage() {
  const { guestId } = Route.useSearch();
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'success' | 'duplicate' | 'error' | 'unauthorized' | 'guest'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [guestPass, setGuestPass] = useState<GuestPass | null>(null);
  const [guestStatus, setGuestStatus] = useState<'active' | 'used' | 'expired' | 'invalid' | null>(null);

  // We fetch member dashboard data to get daysRemaining and active plan for the success screen
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['member-dashboard', profile?.id],
    queryFn: () => dashboardService.getMemberDashboard(profile!.id),
    enabled: !!profile && profile.membership_status === 'active',
  });

  const { data: streakData } = useQuery({
    queryKey: ['member-streak', profile?.id],
    queryFn: () => attendanceService.getMemberStreak(profile!.id),
    enabled: !!profile,
  });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(profile!.id, 'qr', navigator.userAgent),
    onSuccess: () => {
      setStatus('success');
    },
    onError: (error: any) => {
      if (error.message === 'ALREADY_CHECKED_IN') {
        setStatus('duplicate');
      } else {
        setStatus('error');
        setErrorMessage(error.message);
      }
    }
  });

  const markGuestUsedMutation = useMutation({
    mutationFn: () => guestPassService.markUsed(guestPass!.id, profile!.id),
    onSuccess: () => {
      setGuestStatus('used');
    }
  });

  useEffect(() => {
    if (isAuthLoading) return;

    // If it's a guest check-in, we don't require login immediately (unless they are an admin scanning it)
    if (guestId) return;

    if (!user) {
      // Not logged in -> Redirect to login and return here
      navigate({ to: '/login', search: { redirect: '/checkin' } });
      return;
    }

    if (!profile) return;

    // Check membership status
    if (profile.membership_status === 'pending') {
      setStatus('unauthorized');
      setErrorMessage('Membership pending approval.');
      return;
    }
    if (profile.membership_status === 'suspended') {
      setStatus('unauthorized');
      setErrorMessage('Account suspended. Please contact support.');
      return;
    }
    if (profile.membership_status === 'expired') {
      setStatus('unauthorized');
      setErrorMessage('Membership expired.');
      return;
    }
    if (profile.membership_status === 'rejected') {
      setStatus('unauthorized');
      setErrorMessage('Membership request was rejected.');
      return;
    }

    if (profile.role === 'admin' && !guestId) {
      setStatus('unauthorized');
      setErrorMessage('Staff and Administrators do not need to check in.');
      return;
    }

    // Active member -> Proceed to check-in
    if (status === 'checking' && !checkInMutation.isPending && !checkInMutation.isSuccess && !checkInMutation.isError && !guestId) {
      checkInMutation.mutate();
    }
  }, [isAuthLoading, user, profile, guestId]);

  useEffect(() => {
    if (guestId) {
      guestPassService.getPassById(guestId).then((pass) => {
        if (!pass) {
          setStatus('guest');
          setGuestStatus('invalid');
        } else {
          setGuestPass(pass);
          setStatus('guest');
          if (pass.is_used) {
            setGuestStatus('used');
          } else if (new Date(pass.valid_until) < new Date()) {
            setGuestStatus('expired');
          } else {
            setGuestStatus('active');
          }
        }
      });
    }
  }, [guestId]);

  if (isAuthLoading || (profile?.membership_status === 'active' && isDashboardLoading) || (guestId && status !== 'guest')) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p>Processing Check-in...</p>
        </div>
      </div>
    );
  }

  // Helper to format success time
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-card flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border text-foreground shadow-2xl">
        
        {status === 'guest' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                guestStatus === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                guestStatus === 'used' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {guestStatus === 'active' ? <QrCode className="h-8 w-8" /> : 
                 guestStatus === 'used' ? <CheckCircle2 className="h-8 w-8" /> : 
                 <XCircle className="h-8 w-8" />}
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Guest Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 space-y-4">
              {guestStatus === 'invalid' ? (
                <p className="text-red-500 font-medium">This guest pass does not exist.</p>
              ) : (
                <>
                  <div className="bg-background border border-border rounded-lg p-4 space-y-2 text-left">
                    <p className="text-sm text-muted-foreground">Guest Name</p>
                    <p className="font-bold text-lg text-foreground">{guestPass?.guest_name}</p>
                    <div className="h-px w-full bg-border my-2" />
                    <p className="text-sm text-muted-foreground">Pass Code</p>
                    <p className="font-mono text-indigo-600 font-bold">{guestPass?.pass_code}</p>
                    <div className="h-px w-full bg-border my-2" />
                    <p className="text-sm text-muted-foreground">Valid Until</p>
                    <p className="font-medium">{new Date(guestPass?.valid_until!).toLocaleString()}</p>
                  </div>

                  {guestStatus === 'used' && (
                    <p className="text-blue-500 font-medium bg-blue-50 p-2 rounded">
                      This pass has already been used.
                    </p>
                  )}
                  {guestStatus === 'expired' && (
                    <p className="text-red-500 font-medium bg-red-50 p-2 rounded">
                      This pass has expired.
                    </p>
                  )}
                  {guestStatus === 'active' && profile?.role === 'admin' && (
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-bold"
                      onClick={() => markGuestUsedMutation.mutate()}
                      disabled={markGuestUsedMutation.isPending}
                    >
                      {markGuestUsedMutation.isPending ? 'Marking...' : 'Mark Used & Allow Entry'}
                    </Button>
                  )}
                  {guestStatus === 'active' && profile?.role !== 'admin' && (
                    <p className="text-amber-600 font-medium bg-amber-50 p-2 rounded text-sm">
                      Please show this screen to a staff member to scan your QR code.
                    </p>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-background text-foreground hover:bg-muted border border-border">
                <Link to="/">Return to Home</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'success' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                 <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Check-in Successful
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 space-y-6">
              <div>
                <p className="text-muted-foreground">Welcome back,</p>
                <p className="text-xl font-medium text-foreground">{profile?.first_name} {profile?.last_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground/75 uppercase tracking-wider mb-1">Time</p>
                  <p className="font-medium">{timeString}</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground/75 uppercase tracking-wider mb-1">Streak</p>
                  <p className="font-medium text-indigo-600">{streakData?.currentStreak || 1} Days 🔥</p>
                </div>
              </div>

              {dashboardData?.activePlan && (
                <div className="text-sm text-muted-foreground/75">
                   Plan expires in <strong className="text-foreground/80">{dashboardData.daysRemaining} days</strong>
                </div>
              )}

              {/* Weekly Split Focus */}
              {(() => {
                const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const currentDay = DAYS[new Date().getDay()];
                let splitData: Record<string, string> = {
                  Sunday: 'Rest', Monday: 'Chest & Triceps', Tuesday: 'Back & Biceps', 
                  Wednesday: 'Legs & Core', Thursday: 'Rest', Friday: 'Shoulders & Arms', Saturday: 'Cardio & Abs'
                };
                
                try {
                  const saved = localStorage.getItem(`weekly_split_${profile?.id}`);
                  if (saved) {
                    splitData = JSON.parse(saved);
                  }
                } catch (e) {}

                const todaysFocus = splitData[currentDay];

                return (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mt-4 text-left">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                      Today's Focus ({currentDay})
                    </p>
                    <p className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                      💪 {todaysFocus}
                    </p>
                  </div>
                );
              })()}

              <div className="p-4 bg-background rounded-lg italic text-muted-foreground text-sm border border-border">
                "The only bad workout is the one that didn't happen."
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-indigo-600 text-white hover:bg-gold/90">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'duplicate' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                 <CheckCircle2 className="h-8 w-8 text-amber-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Already Checked In
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2 space-y-4">
              <p className="text-muted-foreground">
                You have already checked in today at {timeString}. Have a great workout!
              </p>
              {streakData && (
                 <p className="text-sm text-indigo-600 font-medium">Current Streak: {streakData.currentStreak} Days 🔥</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-background text-foreground hover:bg-muted border border-border">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {status === 'unauthorized' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                 <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              {profile?.membership_status === 'expired' && (
                <Button asChild className="w-full bg-indigo-600 text-white hover:bg-gold/90">
                  <Link to="/buy-membership">Renew Membership</Link>
                </Button>
              )}
              {profile?.membership_status === 'pending' && (
                <Button asChild variant="outline" className="w-full border-border hover:bg-muted">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button asChild className="w-full bg-indigo-600 text-white hover:bg-indigo-700 mt-4">
                  <Link to="/admin/dashboard">Go to Admin Dashboard</Link>
                </Button>
              )}
            </CardContent>
          </>
        )}

        {status === 'error' && (
          <>
             <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                 <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Check-in Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <p className="text-muted-foreground text-sm">{errorMessage}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full border-border hover:bg-muted">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
