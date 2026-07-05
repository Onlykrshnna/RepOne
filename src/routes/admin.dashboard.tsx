import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { bookingsService } from '../services/bookings.service';
import { adminNotificationsService, AdminNotification } from '../services/admin-notifications.service';
import { 
  Users, CalendarCheck, CreditCard, Activity, AlertTriangle, AlertCircle, 
  Clock, Dumbbell, Scan, UserPlus, ShieldCheck, Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { membersService } from '../services/members.service';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    // One-time system test data cleanup to provide a blank slate for Razorpay testing
    if (typeof window !== 'undefined' && !localStorage.getItem('system_cleaned_july6_v3')) {
      const runCleanup = async () => {
        try {
          const { supabase } = await import('../lib/supabase');
          // Delete other profiles that are not the two real users/admins
          await supabase
            .from('profiles')
            .delete()
            .not('email', 'in', '("krpris9211@gmail.com","krpris1922@gmail.com","krishsharma01m@gmail.com")');

          // Fallback update in case delete is restricted by DB constraints or RLS
          await supabase
            .from('profiles')
            .update({
              membership_status: 'unpaid',
              admin_notes: null,
              membership_requested_at: null,
              approved_by: null,
              approved_at: null,
              payment_verified_at: null
            })
            .not('email', 'in', '("krpris9211@gmail.com","krpris1922@gmail.com","krishsharma01m@gmail.com")');
            
          localStorage.removeItem('elevate_fitness_members');
          localStorage.removeItem('elevate_fitness_payments');
          localStorage.removeItem('elevate_fitness_notifications');
          localStorage.removeItem('elevate_fitness_unread_notifications');
          localStorage.setItem('system_cleaned_july6_v3', 'true');
          window.location.reload();
        } catch (err) {
          console.warn('One-time cleanup failed:', err);
        }
      };
      runCleanup();
      return;
    }

    adminNotificationsService.checkGuestPassExpirations();
    adminNotificationsService.checkPendingPayments();
    return adminNotificationsService.subscribe(setNotifications);
  }, []);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardService.getMetrics,
  });

  const { data: classMetrics } = useQuery({
    queryKey: ['class-dashboard-metrics'],
    queryFn: bookingsService.getClassDashboardMetrics,
  });

  const recentMembers = metrics?.recentMembers?.length ? metrics.recentMembers : [];
  const totalMembers = metrics?.totalMembers ?? 0;
  const todaysCheckIns = metrics?.todaysCheckIns ?? 0;
  const activeMemberships = metrics?.activeMemberships ?? 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'request': return <Users className="h-4 w-4 text-indigo-600" />;
      case 'ticket': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-2 border-b border-border/55">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
          <p className="text-muted-foreground mt-1">Welcome to your operational dashboard. Here's what's happening today.</p>
        </div>
        <div className="relative">
          <Link to="/admin/notifications">
            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full border border-border bg-card">
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white ring-2 ring-background animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Quick Action Cards linking to /admin paths */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/members/add" className="group block h-full">
          <Card className="bg-card border-border text-foreground h-full hover:border-emerald-500/50 hover:bg-muted/50 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3 bg-background rounded-full group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                <UserPlus className="h-6 w-6 text-muted-foreground group-hover:text-emerald-500" />
              </div>
              <div className="font-medium">Add Member</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/attendance" className="group block h-full">
          <Card className="bg-card border-border text-foreground h-full hover:border-gold/50 hover:bg-muted/50 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3 bg-background rounded-full group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                <Scan className="h-6 w-6 text-muted-foreground group-hover:text-gold" />
              </div>
              <div className="font-medium">Scan QR</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/classes" className="group block h-full">
          <Card className="bg-card border-border text-foreground h-full hover:border-blue-500/50 hover:bg-muted/50 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3 bg-background rounded-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                <Dumbbell className="h-6 w-6 text-muted-foreground group-hover:text-blue-500" />
              </div>
              <div className="font-medium">Manage Classes</div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/membership-requests" className="group block h-full">
          <Card className="bg-card border-border text-foreground h-full hover:border-purple-500/50 hover:bg-muted/50 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="p-3 bg-background rounded-full group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-colors">
                <ShieldCheck className="h-6 w-6 text-muted-foreground group-hover:text-purple-500" />
              </div>
              <div className="font-medium">Review Requests</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Members */}
        <Link to="/admin/members" search={{ status: 'active' }} className="group block">
          <Card className="bg-card border-border text-foreground overflow-hidden relative h-full hover:border-indigo-500/50 hover:bg-muted/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground/75" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
        </Link>

        {/* Today's Check-ins */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Check-ins</CardTitle>
            <CalendarCheck className="h-4 w-4 text-gold/70" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold">{todaysCheckIns}</div>
          </CardContent>
        </Card>

        {/* Active Memberships */}
        <Link to="/admin/members" search={{ status: 'active' }} className="group block">
          <Card className="bg-card border-border text-foreground overflow-hidden relative h-full hover:border-emerald-500/50 hover:bg-muted/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Memberships</CardTitle>
              <CreditCard className="h-4 w-4 text-emerald-500/70" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{activeMemberships}</div>
            </CardContent>
          </Card>
        </Link>

        {/* System Status */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <Activity className="h-4 w-4 text-blue-500/70" />
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-center justify-between mt-1">
              <div className="text-xl font-bold text-emerald-500 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Operational
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                onClick={async () => {
                  if (confirm("Reset all test data (payments, checkouts, and profiles)?")) {
                    await membersService.resetSystemTestData();
                    toast.success("Test data reset successfully!");
                    setTimeout(() => window.location.reload(), 800);
                  }
                }}
              >
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 mt-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground/90">Classes & Bookings Today</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Today's Classes */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Classes</CardTitle>
            <Dumbbell className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classMetrics?.todaysClasses ?? 0}</div>
          </CardContent>
        </Card>
        {/* Active Classes */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Classes</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classMetrics?.activeClasses ?? 0}</div>
          </CardContent>
        </Card>
        {/* Today's Bookings */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Bookings</CardTitle>
            <CalendarCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classMetrics?.todayBookings ?? 0}</div>
          </CardContent>
        </Card>
        {/* Available Seats */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Seats</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classMetrics?.availableSeats ?? 0}</div>
          </CardContent>
        </Card>
        {/* Waiting List */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waiting List</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{classMetrics?.waitingList ?? 0}</div>
          </CardContent>
        </Card>
        {/* No Shows */}
        <Card className="bg-card border-border text-foreground overflow-hidden relative shadow-sm hover:shadow transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">No Shows</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{classMetrics?.noShows ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card border-border text-foreground flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="text-lg font-bold">System Alerts & Notifications</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Recent membership actions and payment requests.</CardDescription>
            </div>
            <Link to="/admin/notifications" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto max-h-[300px] space-y-3 mt-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 text-muted-foreground/30 animate-pulse" />
                <p className="text-xs font-semibold">All systems nominal. No alerts.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                    notif.read 
                      ? 'bg-transparent border-border/55' 
                      : 'bg-indigo-500/5 border-indigo-500/10'
                  }`}
                >
                  <div className="p-1.5 rounded-full bg-background border border-border h-fit shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-foreground truncate">{notif.title}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">{new Date(notif.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-muted-foreground text-[10px] leading-relaxed line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card border-border text-foreground flex flex-col">
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
            <CardDescription className="text-muted-foreground">Latest signups to your gym.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentMembers.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-slate-300 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{member.first_name} {member.last_name}</span>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/75 bg-card px-2 py-1 rounded">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
