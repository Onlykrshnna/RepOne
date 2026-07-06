import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth-context';
import { attendanceService } from '../services/attendance.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CalendarCheck, Clock, Flame, Trophy, Activity, ShieldAlert, Quote } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

export const Route = createFileRoute('/_member/attendance')({
  component: MemberAttendancePage,
});

const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Wake up. Work out. Look kick-ass.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "A one-hour workout is 4% of your day. No excuses."
];

function MemberAttendancePage() {
  const { profile } = useAuth();
  if (!profile) return null;
  return <MemberAttendanceBody profile={profile} />;
}

function MemberAttendanceBody({ profile }: { profile: any }) {
  const randomQuote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);

  // Fetch both check-ins and streaks in parallel
  const { data: checkins = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['member-attendance', profile.id],
    queryFn: () => attendanceService.getMemberAttendance(profile.id),
  });

  const { data: streakData, isLoading: isLoadingStreak } = useQuery({
    queryKey: ['member-streak', profile.id],
    queryFn: () => attendanceService.getMemberStreak(profile.id),
  });

  // Prepare chart data (last 14 days)
  const chartData = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];
    
    const days = [];
    const today = startOfDay(new Date());
    
    for (let i = 13; i >= 0; i--) {
      const date = subDays(today, i);
      const hasVisited = checkins.some((c: any) => isSameDay(new Date(c.check_in_time), date));
      days.push({
        dateStr: format(date, 'MMM dd'),
        dayName: format(date, 'EEE'),
        visited: hasVisited ? 1 : 0,
      });
    }
    return days;
  }, [checkins]);

  if (isLoadingLogs || isLoadingStreak) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const totalDays = streakData?.totalDays || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Motivational Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-lg border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Your Fitness Journey</h2>
            <div className="flex items-start gap-2 text-indigo-100/80 max-w-lg italic">
              <Quote className="h-5 w-5 shrink-0 text-indigo-400 opacity-50 mt-1 transform rotate-180" />
              <p className="text-lg font-medium tracking-wide leading-relaxed">{randomQuote}</p>
            </div>
          </div>
          <div className="shrink-0 hidden md:block">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
              <Activity className="h-8 w-8 text-indigo-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Streak Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <p className="text-3xl font-bold text-foreground">
                {currentStreak} <span className="text-lg font-normal text-muted-foreground lowercase">days</span>
              </p>
            </div>
            <div className={`p-3 rounded-xl ${currentStreak > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500' : 'bg-muted text-muted-foreground'}`}>
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Longest Streak</p>
              <p className="text-3xl font-bold text-foreground">
                {longestStreak} <span className="text-lg font-normal text-muted-foreground lowercase">days</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500">
              <Trophy className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Visits</p>
              <p className="text-3xl font-bold text-foreground">
                {totalDays} <span className="text-lg font-normal text-muted-foreground lowercase">days</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Section */}
        <Card className="bg-card border-border shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Activity (Last 14 Days)</CardTitle>
            <CardDescription>Your check-in consistency over the past two weeks.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="dayName" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#888888' }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 1]} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-3 text-sm">
                            <p className="font-semibold">{data.dateStr}</p>
                            <p className="text-muted-foreground mt-1">
                              {data.visited ? '✅ Visited' : '❌ Missed'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="visited" radius={[4, 4, 4, 4]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.visited ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <Card className="bg-card border-border shadow-sm flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Recent Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {checkins.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <ShieldAlert className="h-10 w-10 mb-3 text-muted-foreground/30" />
                <p className="text-sm">No recent logs.</p>
              </div>
            ) : (
              <ul className="space-y-3 h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {checkins.slice(0, 15).map((checkin: any) => (
                  <li key={checkin.id} className="flex justify-between items-center text-sm border border-border/60 bg-muted/20 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-background shadow-sm border border-border/50 p-2 rounded-lg text-foreground">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {format(new Date(checkin.check_in_time), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(checkin.check_in_time), 'hh:mm a')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider bg-primary/10 text-primary border-primary/20">
                      {checkin.method}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
