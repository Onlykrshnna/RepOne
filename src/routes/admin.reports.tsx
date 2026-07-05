import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';
import { getDateRangeInterval, exportToCSV, exportToExcel, triggerPrint } from '../services/analytics.utils';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { 
  BarChart2, Calendar, DollarSign, Users, Award, TrendingUp, Download, 
  Printer, ArrowUpRight, Clock, Activity, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/admin/reports')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Calculate Date Interval based on state
  const interval = getDateRangeInterval(dateFilter, customStart, customEnd);

  // 2. Fetch Aggregated Report
  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['analytics-report', dateFilter, customStart, customEnd],
    queryFn: () => analyticsService.getAnalyticsReport(interval),
    enabled: !!profile && profile.role === 'admin'
  });

  // 3. Setup Realtime triggers for invalidation
  useEffect(() => {
    const channels = [
      supabase.channel('analytics-profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => queryClient.invalidateQueries({ queryKey: ['analytics-report'] })),
      supabase.channel('analytics-payments').on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => queryClient.invalidateQueries({ queryKey: ['analytics-report'] })),
      supabase.channel('analytics-attendance').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => queryClient.invalidateQueries({ queryKey: ['analytics-report'] })),
      supabase.channel('analytics-bookings').on('postgres_changes', { event: '*', schema: 'public', table: 'class_bookings' }, () => queryClient.invalidateQueries({ queryKey: ['analytics-report'] })),
      supabase.channel('analytics-progress').on('postgres_changes', { event: '*', schema: 'public', table: 'progress_tracking' }, () => queryClient.invalidateQueries({ queryKey: ['analytics-report'] }))
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  // Export functions
  const handleCSVExport = (type: string) => {
    if (!report) return;
    
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `gym_${type}_report_${dateFilter}`;

    switch (type) {
      case 'attendance':
        headers = ['Date/Time', 'Check-ins'];
        rows = report.attendance.daily.map(d => [d.date, d.count]);
        break;
      case 'members':
        headers = ['Metric', 'Count'];
        rows = [
          ['Total Members', report.kpis.totalMembers],
          ['Active Members', report.kpis.activeMembers],
          ['Pending Members', report.kpis.pendingMembers],
          ['Expired Members', report.kpis.expiredMembers],
          ['New Members This Month', report.kpis.newMembersThisMonth]
        ];
        break;
      case 'payments':
        headers = ['Date', 'Amount'];
        rows = report.payments.dailyRevenue.map(r => [r.date, r.revenue]);
        break;
      case 'classes':
        headers = ['Class Name', 'Booking Count'];
        rows = report.classes.mostPopularClasses.map(c => [c.title, c.count]);
        break;
      default:
        return;
    }

    exportToCSV(headers, rows, filename);
  };

  const handleExcelExport = (type: string) => {
    if (!report) return;
    
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `gym_${type}_report_${dateFilter}`;

    switch (type) {
      case 'revenue':
        headers = ['Month', 'Revenue'];
        rows = report.payments.monthlyRevenue.map(m => [m.month, m.revenue]);
        break;
      case 'memberships':
        headers = ['Plan Name', 'Subscribers'];
        rows = report.memberships.activePlans.map(p => [p.planName, p.count]);
        break;
      case 'progress':
        headers = ['Metric', 'Value'];
        rows = [
          ['Updated This Month', report.progress.updatedThisMonth],
          ['Overdue Updates', report.progress.overdueUpdates],
          ['Average Weight Change (kg)', report.progress.averageWeightChangeKg],
          ['Completion Percent', report.progress.progressCompletionPercent]
        ];
        break;
      default:
        return;
    }

    exportToExcel(headers, rows, filename);
  };

  const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (!report) return null;

  const kpisList = [
    { title: 'Total Members', value: report.kpis.totalMembers, desc: 'Overall registrations', icon: Users, color: 'text-indigo-600' },
    { title: 'Active Members', value: report.kpis.activeMembers, desc: 'Currently checked active', icon: Users, color: 'text-emerald-500' },
    { title: 'Pending Members', value: report.kpis.pendingMembers, desc: 'Awaiting approval', icon: Clock, color: 'text-amber-500' },
    { title: 'Expired Members', value: report.kpis.expiredMembers, desc: 'Lapsed subscriptions', icon: AlertCircle, color: 'text-rose-500' },
    { title: 'New Members', value: report.kpis.newMembersThisMonth, desc: 'Joined this month', icon: Users, color: 'text-blue-500' },
    { title: 'Today\'s Check-ins', value: report.kpis.todayAttendance, desc: 'Live gym entries', icon: Activity, color: 'text-emerald-500' },
    { title: 'Weekly Check-ins', value: report.kpis.weeklyAttendance, desc: 'Check-ins past 7 days', icon: Activity, color: 'text-indigo-600' },
    { title: 'Monthly Check-ins', value: report.kpis.monthlyAttendance, desc: 'Check-ins past 30 days', icon: Activity, color: 'text-blue-500' },
    { title: 'Active Plans', value: report.kpis.activeMemberships, desc: 'Valid member packages', icon: FileText, color: 'text-indigo-600' },
    { title: 'Pending Payments', value: report.kpis.pendingPayments, desc: 'Pending approvals', icon: DollarSign, color: 'text-amber-500' },
    { title: 'Today\'s Revenue', value: `₹${report.kpis.todayRevenue}`, desc: 'Earned today', icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Monthly Revenue', value: `₹${report.kpis.monthlyRevenue}`, desc: 'Earned this month', icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Yearly Revenue', value: `₹${report.kpis.yearlyRevenue}`, desc: 'Earned since Jan 1', icon: DollarSign, color: 'text-indigo-600' },
    { title: 'ARPU', value: `₹${report.kpis.averageRevenuePerMember}`, desc: 'Avg revenue/member', icon: DollarSign, color: 'text-blue-500' },
    { title: 'Renewal Rate', value: `${report.kpis.membershipRenewalRate}%`, desc: 'Average renewal success', icon: TrendingUp, color: 'text-emerald-500' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:p-0 print:space-y-4">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 print:border-0 print:pb-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Reports & Analytics</h2>
          <p className="text-muted-foreground">Actionable business insights, revenue distributions, and attendances.</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button onClick={triggerPrint} variant="outline" className="border-border text-foreground/80 bg-card hover:bg-muted/50">
            <Printer className="h-4 w-4 mr-2" /> Print PDF
          </Button>
          <Button onClick={() => refetch()} variant="outline" className="border-border text-foreground/80 bg-card hover:bg-muted/50">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Date Filters Control - Hidden on prints */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4 print:hidden">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <span className="text-sm font-semibold text-foreground/80">Date Range Filter:</span>
          <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg border border-border">
            {[
              { id: 'today', name: 'Today' },
              { id: 'yesterday', name: 'Yesterday' },
              { id: '7days', name: '7 Days' },
              { id: '30days', name: '30 Days' },
              { id: 'this_month', name: 'This Month' },
              { id: 'last_month', name: 'Last Month' },
              { id: 'this_year', name: 'This Year' },
              { id: 'custom', name: 'Custom Range' }
            ].map(f => (
              <Button 
                key={f.id} 
                size="sm" 
                variant={dateFilter === f.id ? 'secondary' : 'ghost'} 
                className={dateFilter === f.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}
                onClick={() => setDateFilter(f.id)}
              >
                {f.name}
              </Button>
            ))}
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="flex gap-4 items-center bg-background p-3 rounded-lg border border-border/50 max-w-md">
            <div className="space-y-1 flex-1">
              <Label htmlFor="custom_start">Start Date</Label>
              <Input id="custom_start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-card border-border" />
            </div>
            <div className="space-y-1 flex-1">
              <Label htmlFor="custom_end">End Date</Label>
              <Input id="custom_end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-card border-border" />
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted border border-border p-1 rounded-lg w-full sm:w-auto print:hidden">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Dashboard KPIs</TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Attendance</TabsTrigger>
          <TabsTrigger value="finance" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Finance & Growth</TabsTrigger>
          <TabsTrigger value="classes" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Classes</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Body Progress</TabsTrigger>
        </TabsList>

        {/* ====================================================
            1. OVERVIEW TAB: KPI CARDS
        ==================================================== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {kpisList.map((kpi, idx) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="bg-card border border-border shadow-sm hover:shadow transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-black text-foreground tracking-tight">{kpi.value}</div>
                    <p className="text-[10px] text-muted-foreground/75 font-medium mt-1">{kpi.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Quick Export Cards */}
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Data Exports</CardTitle>
                <CardDescription>Download compiled spreadsheets (.csv / .xls).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="text-sm font-semibold text-foreground/90">Members database</div>
                  <Button onClick={() => handleCSVExport('members')} variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    <Download className="h-4 w-4 mr-1" /> CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="text-sm font-semibold text-foreground/90">Daily check-ins logs</div>
                  <Button onClick={() => handleCSVExport('attendance')} variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    <Download className="h-4 w-4 mr-1" /> CSV
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="text-sm font-semibold text-foreground/90">Income statements</div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleCSVExport('payments')} variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      CSV
                    </Button>
                    <Button onClick={() => handleExcelExport('revenue')} variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      Excel
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-background border border-border/50 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="text-sm font-semibold text-foreground/90">Active membership plans</div>
                  <Button onClick={() => handleExcelExport('memberships')} variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                    <Download className="h-4 w-4 mr-1" /> Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Demographics Card */}
            <Card className="bg-card border-border text-foreground md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Gender & Age Distributions</CardTitle>
                <CardDescription>Quick demographics audit of active member registrations.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={report.insights.genderDistribution} 
                        dataKey="count" 
                        nameKey="gender" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={60} 
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {report.insights.genderDistribution.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.insights.ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====================================================
            2. ATTENDANCE ANALYTICS TAB
        ==================================================== */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card border-border text-foreground md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Check-in Trends</CardTitle>
                <CardDescription>Daily client check-ins log representation.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.attendance.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="Check-ins" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Peak Checking-in Hours</CardTitle>
                <CardDescription>Average hourly entrance frequencies.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.attendance.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Members" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Most Active */}
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Most Active Members</CardTitle>
                <CardDescription>Clients with the highest check-in counts inside range.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Member</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-right text-muted-foreground">Check-ins</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.attendance.mostActiveMembers.map((m, idx) => (
                      <TableRow key={idx} className="border-border hover:bg-slate-50/50">
                        <TableCell className="font-bold text-foreground">{m.name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.email}</TableCell>
                        <TableCell className="text-right font-extrabold text-indigo-600">{m.checkIns}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Least Active */}
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Least Active Members</CardTitle>
                <CardDescription>Clients with the lowest check-in logs.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Member</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-right text-muted-foreground">Check-ins</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.attendance.leastActiveMembers.map((m, idx) => (
                      <TableRow key={idx} className="border-border hover:bg-slate-50/50">
                        <TableCell className="font-bold text-foreground">{m.name}</TableCell>
                        <TableCell className="text-muted-foreground">{m.email}</TableCell>
                        <TableCell className="text-right font-semibold text-muted-foreground">{m.checkIns}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====================================================
            3. FINANCE & GROWTH TAB
        ==================================================== */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card border-border text-foreground md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Revenue Growth</CardTitle>
                <CardDescription>Daily revenue trends within selected filters.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.payments.dailyRevenue}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#4F46E5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Payment Methods</CardTitle>
                <CardDescription>Collection channels distribution.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={report.payments.methodDistribution} 
                      dataKey="count" 
                      nameKey="method" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={45}
                      outerRadius={65} 
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {report.payments.methodDistribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Membership Growth */}
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Membership Growth</CardTitle>
                <CardDescription>Growth of total registered active memberships.</CardDescription>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={report.memberships.growth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="members" name="Members" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Popular Plans */}
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Most Popular Plans</CardTitle>
                <CardDescription>Comparison of plan selections.</CardDescription>
              </CardHeader>
              <CardContent className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.memberships.mostPopularPlans}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="planName" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Subscribers" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====================================================
            4. CLASSES TAB
        ==================================================== */}
        <TabsContent value="classes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Class Bookings & Popularity</CardTitle>
                <CardDescription>Most popular group workout classes by reservations count.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.classes.mostPopularClasses}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="title" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Bookings" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Trainer Performance</CardTitle>
                <CardDescription>Average client occupancy rate per trainer.</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.classes.trainerPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis dataKey="trainerName" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                    <Tooltip />
                    <Bar dataKey="occupancyRate" name="Occupancy %" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ====================================================
            5. BODY PROGRESS TAB
        ==================================================== */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card border-border text-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Updates Completion</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-24">
                <div className="text-3xl font-extrabold text-indigo-600 mb-2">{report.progress.progressCompletionPercent}%</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${report.progress.progressCompletionPercent}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Average Weight Loss</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center h-24">
                <div className="text-3xl font-extrabold text-emerald-500">{report.progress.averageWeightChangeKg} kg</div>
                <div className="text-xs text-muted-foreground/75">Mean change per member</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">BMI Mean Shift</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center h-24">
                <div className="text-3xl font-extrabold text-blue-500">{report.progress.averageBmiChange}</div>
                <div className="text-xs text-muted-foreground/75">Mean BMI variation</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border text-foreground">
            <CardHeader>
              <CardTitle>Body Fat Percentage Trend</CardTitle>
              <CardDescription>Gym averages over the last few months.</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report.progress.bodyFatTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="averageFat" name="Body Fat %" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
