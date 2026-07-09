import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { membersService } from '../services/members.service';
import { useAuth } from '../lib/auth-context';
import { 
  AlertTriangle, AlertCircle, Clock, Dumbbell, Scan, Activity, CalendarCheck, CreditCard, Lock 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { WeeklySplitCard } from '../components/WeeklySplitCard';
import { motion } from 'framer-motion';

import { useEffect } from 'react';

export const Route = createFileRoute('/_member/dashboard')({
  component: MemberDashboardPage,
});

function MemberDashboardPage() {
  const { profile } = useAuth();

  useEffect(() => {
    // Cleanup hook removed to prevent testing race conditions
  }, []);
  
  if (!profile) return null;

  return <MemberDashboard profile={profile} />;
}

function MemberDashboard({ profile }: { profile: any }) {
  const { data: latestProfile } = useQuery({
    queryKey: ['member-profile', profile.id],
    queryFn: () => membersService.getMemberById(profile.id),
    initialData: profile,
  });

  const displayProfile = latestProfile || profile;

  const { data, isLoading } = useQuery({
    queryKey: ['member-dashboard', displayProfile.id],
    queryFn: () => dashboardService.getMemberDashboard(displayProfile.id),
  });

  const BYPASS_STATUS_BLOCKS = false; // Set to true to allow testing all features with dummy data

  // --- STATE MACHINE ---
  const status = displayProfile.membership_status || 'pending';

  // Calculate if the membership has expired based on expiry date
  let hasExpiredPlan = false;
  if (data?.activePlan?.expiry_date) {
    const expiryDate = new Date(data.activePlan.expiry_date);
    const now = new Date();
    // Reset hours to compare dates accurately
    expiryDate.setHours(23, 59, 59, 999);
    hasExpiredPlan = expiryDate.getTime() < now.getTime();
  }
  
  const isNone = !BYPASS_STATUS_BLOCKS && (status === 'none' || status === 'unpaid' || status === 'pending') && !data?.hasPendingPayment;
  const isPending = !BYPASS_STATUS_BLOCKS && data?.hasPendingPayment;
  const isRejected = !BYPASS_STATUS_BLOCKS && status === 'rejected';
  const isExpired = !BYPASS_STATUS_BLOCKS && (status === 'expired' || hasExpiredPlan);
  const isSuspended = !BYPASS_STATUS_BLOCKS && status === 'suspended';
  const isActive = !BYPASS_STATUS_BLOCKS && status === 'active' && !hasExpiredPlan;
  
  const isLocked = !isActive;

  // Add Dashboard Lifecycle Logging
  useEffect(() => {
    if (!isLoading) {
      console.log('[DASHBOARD STATUS]', JSON.stringify({
        membership_status: status,
        payment_status: data?.hasPendingPayment ? 'pending' : 'none',
        member_row_exists: !!displayProfile.members && displayProfile.members.length > 0
      }, null, 2));
    }
  }, [status, data?.hasPendingPayment, displayProfile.members, isLoading]);

  if (isLoading && !BYPASS_STATUS_BLOCKS) {
    return <div className="space-y-6"><Skeleton className="h-[200px] w-full bg-background" /></div>;
  }

  // --- SUSPENDED EARLY RETURN ---
  if (!BYPASS_STATUS_BLOCKS && isSuspended) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto mt-10">
        <Card className="bg-destructive/10 border-destructive/20 text-foreground text-center py-10 shadow-lg">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]" />
          <CardTitle className="text-3xl mb-2 text-destructive">Account Suspended</CardTitle>
          <CardDescription className="text-muted-foreground max-w-md mx-auto text-base">
            Your account is currently suspended. Please contact support for more information.
            {displayProfile.admin_notes && (
              <div className="mt-6 p-4 bg-card border border-border rounded-lg text-left text-sm text-foreground">
                <strong className="text-foreground block mb-1">Admin Notes:</strong>
                {displayProfile.admin_notes}
              </div>
            )}
          </CardDescription>
          <Button asChild variant="destructive" className="mt-8 font-medium px-8 h-12">
            <Link to="/support-tickets">Contact Support</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // --- EXPIRED ---
  if (!BYPASS_STATUS_BLOCKS && isExpired) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto mt-10">
        <Card className="bg-card border-border text-foreground shadow-lg">
          <CardHeader className="text-center pb-2 pt-10">
            <AlertCircle className="h-16 w-16 text-amber-800 dark:text-amber-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
            <CardTitle className="text-3xl text-amber-800 dark:text-amber-400">Membership Expired</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-2">
              Your membership plan has ended.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4 pb-10">
            <p className="text-base text-muted-foreground mb-8 max-w-lg mx-auto">
              To continue accessing our facilities and booking classes, please renew your membership.
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium h-12 px-8">
              <Link to="/buy-membership">Renew Membership</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- ACTIVE ---
  const daysLeft = data?.daysRemaining;
  const isExpiringSoon = typeof daysLeft === 'number' && daysLeft <= 7;
  
  const activePlanName = data?.activePlan?.membership_plans?.name;
  const activePlanEndDate = data?.activePlan?.end_date;

  const recentCheckins = data?.recentCheckins || [];
  const upcomingClasses = data?.upcomingClasses || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-1">Hello, {displayProfile.first_name} {displayProfile.last_name || ''}</h2>
          <p className="text-xs font-semibold text-primary">@{displayProfile.username || 'member'}</p>
          <p className="text-muted-foreground text-xs mt-1">Ready to crush your goals today?</p>
        </div>
        <Badge className={`px-4 py-1.5 text-xs font-semibold tracking-wide uppercase rounded-full ${
          isNone ? 'bg-muted text-muted-foreground border border-border' : 
          isPending ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20' :
          isRejected ? 'bg-destructive/10 text-destructive border border-destructive/20' :
          isExpired ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20' :
          isSuspended ? 'bg-destructive/10 text-destructive border border-destructive/20' :
          isActive ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
          'bg-muted text-muted-foreground border border-border'
        }`}>
          {
            isNone ? 'Incomplete Registration' : 
            isPending ? 'Pending Approval' : 
            isRejected ? 'Payment Rejected' : 
            isExpired ? 'Expired' : 
            isSuspended ? 'Suspended' :
            isActive ? 'Active Member' : 
            'Incomplete Registration'
          }
        </Badge>
      </div>

      {isNone && (
        <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-900/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 dark:bg-emerald-900/20 p-2 rounded-full">
              <CreditCard className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-emerald-800 dark:text-emerald-400 font-bold text-lg">Complete Registration</h4>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm">Purchase a membership plan to unlock all gym features.</p>
            </div>
          </div>
          <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-md w-full md:w-auto border-none">
            <Link to="/buy-membership">View Plans</Link>
          </Button>
        </div>
      )}

      {isPending && (
        <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 dark:bg-amber-900/20 p-2 rounded-full">
              <Clock className="h-6 w-6 text-amber-800 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-amber-800 dark:text-amber-400 font-bold text-lg">Payment Submitted</h4>
              <p className="text-amber-700 dark:text-amber-400 text-sm">Waiting for Admin Approval. Your access will unlock shortly!</p>
            </div>
          </div>
          <Button disabled className="opacity-50 cursor-not-allowed bg-muted text-muted-foreground w-full md:w-auto font-medium shadow-md border-none">
            Purchase Disabled
          </Button>
        </div>
      )}

      {isRejected && (
        <div className="bg-destructive/10 dark:bg-red-950/20 border border-destructive/20 dark:border-red-900/30 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-destructive/20 dark:bg-red-900/20 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h4 className="text-destructive dark:text-red-400 font-bold text-lg">Payment Rejected</h4>
              <p className="text-destructive dark:text-red-400 text-sm">
                Your recent payment was rejected. 
                {displayProfile.admin_notes && <span className="font-semibold block mt-1">Admin notes: {displayProfile.admin_notes}</span>}
              </p>
            </div>
          </div>
          <Button asChild className="bg-destructive text-destructive-foreground hover:bg-destructive/95 font-medium shadow-md w-full md:w-auto border-none">
            <Link to="/buy-membership">Resubmit Payment</Link>
          </Button>
        </div>
      )}



      {isExpiringSoon && (
        <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 p-5 rounded-xl flex items-center justify-between shadow-lg transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 dark:bg-amber-900/20 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-amber-800 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-amber-800 dark:text-amber-400 font-bold text-lg">Membership Expiring Soon</h4>
              <p className="text-amber-700 dark:text-amber-400">You have {daysLeft} days remaining on your active plan.</p>
            </div>
          </div>
          <Button asChild className="bg-amber-600 text-white hover:bg-amber-700 font-medium shadow-md border-none">
            <Link to="/buy-membership">Renew Now</Link>
          </Button>
        </div>
      )}

      {/* Primary Feature Cards Grid - Redesigned for fast access with award-winning animations */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          {isLocked ? (
            <div className="group block h-full cursor-not-allowed">
              <Card className="bg-card/50 border-border/50 text-foreground/50 h-full overflow-hidden relative shadow-sm">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                  <div className="bg-background p-3 rounded-full shadow-lg border border-border">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10 opacity-50">
                  <div className="p-4 bg-background rounded-full">
                    <Scan className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Check In</h3>
                    <p className="text-xs mt-1">Scan your QR code</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Link to="/checkin" className="group block h-full">
              <Card className="bg-card border-border text-foreground h-full hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-primary/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10">
                  <div className="p-4 bg-background rounded-full group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    <Scan className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Check In</h3>
                    <p className="text-xs text-muted-foreground mt-1">Scan your QR code</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </motion.div>
        
        <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          {isLocked ? (
            <div className="group block h-full cursor-not-allowed">
              <Card className="bg-card/50 border-border/50 text-foreground/50 h-full overflow-hidden relative shadow-sm">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                  <div className="bg-background p-3 rounded-full shadow-lg border border-border">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10 opacity-50">
                  <div className="p-4 bg-background rounded-full">
                    <Dumbbell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Book Class</h3>
                    <p className="text-xs mt-1">Reserve your spot</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Link to="/classes" className="group block h-full">
              <Card className="bg-card border-border text-foreground h-full hover:border-emerald-500/50 hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-emerald-500/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10">
                  <div className="p-4 bg-background rounded-full group-hover:bg-emerald-500/10 group-hover:scale-110 transition-all duration-300">
                    <Dumbbell className="h-8 w-8 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">Book Class</h3>
                    <p className="text-xs text-muted-foreground mt-1">Reserve your spot</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </motion.div>

        <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          <Link to="/progress" className="group block h-full">
            <Card className="bg-card border-border text-foreground h-full hover:border-blue-500/50 hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-blue-500/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10">
                <div className="p-4 bg-background rounded-full group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-300">
                  <Activity className="h-8 w-8 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">Log Progress</h3>
                  <p className="text-xs text-muted-foreground mt-1">Track measurements</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          {isPending ? (
            <div className="group block h-full cursor-not-allowed">
              <Card className="bg-card/50 border-border/50 text-foreground/50 h-full overflow-hidden relative shadow-sm">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                  <div className="bg-background p-3 rounded-full shadow-lg border border-border">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10 opacity-50">
                  <div className="p-4 bg-background rounded-full">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Membership</h3>
                    <p className="text-xs mt-1">Approval pending</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Link to="/buy-membership" className="group block h-full">
              <Card className="bg-card border-border text-foreground h-full hover:border-purple-500/50 hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-purple-500/10 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4 relative z-10">
                  <div className="p-4 bg-background rounded-full group-hover:bg-purple-500/10 group-hover:scale-110 transition-all duration-300">
                    <CreditCard className="h-8 w-8 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">Membership</h3>
                    <p className="text-xs text-muted-foreground mt-1">View or renew plan</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </motion.div>
      </motion.div>

      <div className="mb-6">
        <WeeklySplitCard />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Membership Details */}
        <Card className="bg-card border-border text-foreground md:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Current Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-background p-5 rounded-xl border border-border gap-4">
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">{activePlanName || 'No Active Plan'}</div>
                {activePlanEndDate && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    Valid until {new Date(activePlanEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="text-left md:text-right bg-card px-4 py-3 rounded-lg border border-border min-w-[120px]">
                <div className="text-3xl font-black text-primary leading-none mb-1">{daysLeft !== undefined ? daysLeft : '-'}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Days Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Info: Upcoming Classes */}
        <Card className="bg-card border-border text-foreground">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
             {upcomingClasses.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingClasses.map((cls: any) => (
                    <li key={cls.id} className="flex justify-between items-center bg-background p-3 rounded-lg border border-border">
                      <div>
                        <div className="font-medium text-foreground">{cls.title}</div>
                        <div className="text-xs text-muted-foreground">{cls.time}</div>
                      </div>
                      <Badge variant="outline" className={`${cls.color} ${cls.bg} border-transparent font-medium`}>
                        {cls.instructor}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No upcoming classes.</div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
         {/* Recent Check-ins List */}
         <Card className="bg-card border-border text-foreground">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
             {recentCheckins.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {recentCheckins.map((checkin: any) => (
                    <li key={checkin.id} className="flex justify-between items-center text-sm border border-border bg-background p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded text-muted-foreground">
                           <CalendarCheck className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">
                           {new Date(checkin.check_in_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                      <Badge variant="outline" className="text-muted-foreground uppercase text-[10px] border-border font-semibold tracking-wider bg-card">
                        {checkin.method}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No recent check-ins.</div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
