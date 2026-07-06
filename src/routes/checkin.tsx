import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../lib/auth-context';
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { dashboardService } from '../services/dashboard.service';
import { 
  CheckCircle2, XCircle, AlertTriangle, Loader2, QrCode, 
  MonitorSmartphone, Camera, MonitorX, Dumbbell, Flame, CheckCircle, RefreshCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/checkin')({
  component: CheckInPage,
});

const GYM_QR_PAYLOAD = 'ELEVATE_FITNESS_CHECKIN';

function CheckInPage() {
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'checking' | 'success' | 'error'>('idle');
  const [errorType, setErrorType] = useState<'camera_denied' | 'invalid_qr' | 'membership_pending' | 'membership_expired' | 'duplicate' | 'network_error' | 'unauthorized' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Device detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure user is logged in
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate({ to: '/login', search: { redirect: '/checkin' } });
    } else if (isMobile && status === 'idle') {
      setStatus('scanning');
    }
  }, [isAuthLoading, user, isMobile, status, navigate]);

  // Mobile-only queries (disabled on desktop)
  const isEligibleToQuery = isMobile === true && profile !== null && status === 'success';

  const { data: dashboardData } = useQuery({
    queryKey: ['member-dashboard', profile?.id],
    queryFn: () => dashboardService.getMemberDashboard(profile!.id),
    enabled: isEligibleToQuery,
  });

  const { data: streakData } = useQuery({
    queryKey: ['member-streak', profile?.id],
    queryFn: () => attendanceService.getMemberStreak(profile!.id),
    enabled: isEligibleToQuery,
  });

  const checkInMutation = useMutation({
    mutationFn: () => attendanceService.checkIn(profile!.id, 'qr', navigator.userAgent),
    onSuccess: () => {
      setStatus('success');
    },
    onError: (error: any) => {
      setStatus('error');
      if (error.message === 'ALREADY_CHECKED_IN') {
        setErrorType('duplicate');
        setErrorMessage('You have already checked in for today.');
      } else if (!navigator.onLine) {
        setErrorType('network_error');
        setErrorMessage('Network connection lost. Please check your internet connection.');
      } else {
        setErrorType('network_error');
        setErrorMessage(error.message || 'An unexpected error occurred during check-in.');
      }
    }
  });

  // Scanner Initialization
  useEffect(() => {
    if (status === 'scanning' && isMobile && profile) {
      // Check membership status first
      if (profile.membership_status === 'pending') {
        setStatus('error');
        setErrorType('membership_pending');
        setErrorMessage('Your membership is pending approval.');
        return;
      }
      if (profile.membership_status === 'expired' || profile.membership_status === 'suspended' || profile.membership_status === 'rejected') {
        setStatus('error');
        setErrorType('membership_expired');
        setErrorMessage(`Your account is ${profile.membership_status}.`);
        return;
      }
      if (profile.role === 'admin') {
        setStatus('error');
        setErrorType('unauthorized');
        setErrorMessage('Staff and Administrators do not need to check in.');
        return;
      }

      const initScanner = () => {
        try {
          if (!document.getElementById('qr-reader')) return;
          
          console.log('[CHECKIN] Initializing scanner');
          
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
            }).catch(console.error);
          }

          const html5QrCode = new Html5Qrcode("qr-reader");
          scannerRef.current = html5QrCode;

          console.log('[CHECKIN] Requesting camera permission');
          
          html5QrCode.start(
            { facingMode: "environment" },
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              // Pause immediately to prevent multiple scans
              if (html5QrCode.getState() === 2) { // 2 = SCANNING
                 html5QrCode.pause();
              }
              
              console.log('[CHECKIN] Scanned QR payload:', decodedText);

              // Validate payload robustly
              let isValidQR = false;
              if (decodedText === GYM_QR_PAYLOAD) {
                isValidQR = true;
              } else {
                try {
                  const url = new URL(decodedText);
                  // Check if the URL path relates to checkin
                  if (url.pathname.includes('checkin')) {
                    isValidQR = true;
                  }
                } catch (e) {
                  // Fallback for non-URL strings or missing protocols
                  if (decodedText.toLowerCase().includes('checkin')) {
                    isValidQR = true;
                  }
                }
              }
              
              if (isValidQR) {
                html5QrCode.stop().catch(console.error).finally(() => {
                  setStatus('checking');
                  checkInMutation.mutate();
                });
              } else {
                html5QrCode.stop().catch(console.error).finally(() => {
                  setStatus('error');
                  setErrorType('invalid_qr');
                  setErrorMessage('This QR code does not belong to Elevate Fitness. Please scan the front desk code.');
                });
              }
            },
            (error) => {
              // Ignore standard scan errors (e.g. no QR found yet)
            }
          ).then(() => {
             console.log('[CHECKIN] Camera permission granted');
          }).catch((err) => {
             console.log('[CHECKIN] Camera permission denied', err);
             console.log('[CHECKIN] Camera initialization failed');
             setStatus('error');
             setErrorType('camera_denied');
             setErrorMessage('Camera access was denied or is unavailable. Please check your browser permissions.');
          });
        } catch (err) {
          console.error("Camera permission error or scanner init failed:", err);
          console.log('[CHECKIN] Camera initialization failed');
          setStatus('error');
          setErrorType('camera_denied');
          setErrorMessage('Camera access was denied or is unavailable. Please check your browser permissions.');
        }
      };

      // Slight delay to ensure DOM element exists
      setTimeout(initScanner, 100);

      return () => {
        if (scannerRef.current) {
          try {
            if (scannerRef.current.getState() === 2) {
              scannerRef.current.stop().catch(() => {});
            }
          } catch(e) {}
          scannerRef.current = null;
        }
      };
    }
  }, [status, isMobile, profile]);

  const resetScanner = () => {
    setStatus('scanning');
    setErrorType(null);
    setErrorMessage('');
  };

  if (isAuthLoading || isMobile === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // DESKTOP BLOCKER
  if (!isMobile) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full border-border shadow-xl text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto bg-indigo-500/10 p-4 rounded-full mb-4 w-20 h-20 flex items-center justify-center">
              <MonitorX className="h-10 w-10 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl font-black">Mobile Check-In Only</CardTitle>
            <CardDescription className="text-base mt-2">
              For security and accuracy, the check-in scanner is only available on mobile devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground pb-8">
            Please log into Elevate Fitness on your smartphone and navigate to the Check-In page to scan the gym's QR code at the front desk.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper to format success time
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });

  // Weekly split extraction for Today's Workout
  let todayWorkout = 'Rest Day';
  if (profile) {
    try {
      const saved = localStorage.getItem(`weekly_split_${profile.id}`);
      if (saved) {
        const split = JSON.parse(saved);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
        if (split[dayName]) {
          todayWorkout = split[dayName];
        }
      }
    } catch(e) {}
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center pt-8 pb-16 px-4">
      <AnimatePresence mode="wait">
        
        {/* SCANNING STATE */}
        {status === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <div className="text-center mb-8 space-y-2">
              <h1 className="text-2xl font-black text-foreground">Scan to Check In</h1>
              <p className="text-muted-foreground text-sm">Align the front desk QR code within the frame to record your attendance.</p>
            </div>
            
            <div className="w-full aspect-square bg-card rounded-3xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 relative">
              <div id="qr-reader" className="w-full h-full [&>div]:border-none [&_video]:object-cover" />
              {/* Overlay targeting crosshairs */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-background/80 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-indigo-500 rounded-xl relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              <Camera className="h-4 w-4" /> Camera active
            </div>
            {/* Dev helper to simulate scan */}
            {import.meta.env.DEV && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-6"
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear();
                  setStatus('checking');
                  checkInMutation.mutate();
                }}
              >
                Simulate Successful Scan (Dev)
              </Button>
            )}
          </motion.div>
        )}

        {/* CHECKING STATE */}
        {status === 'checking' && (
          <motion.div 
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-6" />
            <h2 className="text-xl font-bold">Verifying Membership...</h2>
            <p className="text-muted-foreground text-sm mt-2">Processing your check-in securely.</p>
          </motion.div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <Card className="border-red-900/30 shadow-xl shadow-red-900/10 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
              <CardContent className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">
                  {errorType === 'duplicate' ? 'Already Checked In' : 'Check-In Failed'}
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {errorMessage}
                </p>
                <Button 
                  onClick={resetScanner} 
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  size="lg"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <Card className="border-emerald-900/30 shadow-xl shadow-emerald-900/10 overflow-hidden relative bg-gradient-to-b from-emerald-950/20 to-card">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
              
              <CardHeader className="text-center pb-2 pt-8">
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                  className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 text-emerald-50"
                >
                  <CheckCircle className="h-10 w-10" />
                </motion.div>
                <CardTitle className="text-3xl font-black text-foreground tracking-tight">Access Granted</CardTitle>
                <p className="text-emerald-500 font-bold uppercase tracking-wider text-xs mt-2">Active Member</p>
              </CardHeader>
              
              <CardContent className="pt-6 pb-8 px-6 space-y-6">
                <div className="bg-background/50 border border-border rounded-xl p-5 space-y-4 shadow-inner">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Member</p>
                    <p className="font-bold text-lg text-foreground">{profile?.first_name} {profile?.last_name}</p>
                  </div>
                  
                  <div className="h-px w-full bg-border" />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Time</p>
                      <p className="font-bold text-foreground">{timeString}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</p>
                      <p className="font-bold text-foreground text-sm">{dateString}</p>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-border" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" /> Streak
                      </p>
                      <p className="font-bold text-foreground">{streakData?.currentStreak || 1} Days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                        <Dumbbell className="h-3 w-3 text-indigo-500" /> Today
                      </p>
                      <p className="font-bold text-foreground truncate">{todayWorkout}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate({ to: '/dashboard' })}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
