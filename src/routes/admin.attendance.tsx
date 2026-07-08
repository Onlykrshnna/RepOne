import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendance.service';
import { bookingsService } from '../services/bookings.service';
import { useState } from 'react';
import { formatTime12h } from '../services/classes.utils';
import { useAttendanceRealtime } from '../hooks/useAttendanceRealtime';
import { CalendarCheck, Download, Search, CheckCircle2, User, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

export const Route = createFileRoute('/admin/attendance')({
  component: AdminAttendancePage,
});

function AdminAttendancePage() {
  useAttendanceRealtime(); // Activates Realtime DB subscription for this component
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: rawTodayAttendance, isLoading: todayLoading } = useQuery({
    queryKey: ['today-attendance'],
    queryFn: attendanceService.getTodayAttendance,
  });

  const todayAttendance = rawTodayAttendance && rawTodayAttendance.length > 0
    ? rawTodayAttendance
    : [];

  const { data: classBookings = [], isLoading: classLoading } = useQuery({
    queryKey: ['today-class-attendance'],
    queryFn: bookingsService.getTodayClassAttendance,
  });

  const markClassAttendance = useMutation({
    mutationFn: (data: { bookingId: string; status: 'attended' | 'no_show' | 'booked' }) => 
      bookingsService.updateAttendanceStatus(data.bookingId, data.status),
    onSuccess: () => {
      toast.success('Attendance updated');
      queryClient.invalidateQueries({ queryKey: ['today-class-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['class-dashboard-metrics'] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to update attendance');
    }
  });

  const { data: rawHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['attendance-history', search, dateRange.start, dateRange.end],
    queryFn: () => attendanceService.getAttendanceHistory({ 
      search: search.length > 2 ? search : undefined,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined
    }),
  });

  const history = rawHistory && rawHistory.length > 0
    ? rawHistory
    : [];


  const checkOutMutation = useMutation({
    mutationFn: (id: string) => attendanceService.manualCheckOut(id),
    onSuccess: () => {
      toast.success('Member checked out');
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to check out member');
    }
  });

  const downloadCSV = () => {
    if (!history || history.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Name', 'Email', 'Check-In Time', 'Check-Out Time', 'Method'];
    const rows = history.map(r => [
      `${r.profiles?.first_name} ${r.profiles?.last_name}`,
      r.profiles?.email,
      new Date(r.check_in_time).toLocaleString(),
      r.check_out_time ? new Date(r.check_out_time).toLocaleString() : 'Active',
      r.method
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentMembersInGym = todayAttendance?.filter(a => !a.check_out_time).length || 0;
  const totalToday = todayAttendance?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Live check-ins and attendance records.</p>
        </div>
        <Button onClick={downloadCSV} variant="outline" className="border-border bg-card text-foreground hover:bg-muted/50">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Currently in Gym</CardTitle>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            {todayLoading ? <Skeleton className="h-8 w-16 bg-muted" /> : <div className="text-3xl font-bold text-emerald-500">{currentMembersInGym}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Today</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground/75" />
          </CardHeader>
          <CardContent>
            {todayLoading ? <Skeleton className="h-8 w-16 bg-muted" /> : <div className="text-3xl font-bold">{totalToday}</div>}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="live" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 text-muted-foreground">Live Check-ins</TabsTrigger>
          <TabsTrigger value="class-bookings" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 text-muted-foreground">Class Attendance</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 text-muted-foreground">History & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card className="bg-card border-border text-foreground">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" /> Today's Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Member</TableHead>
                    <TableHead className="text-muted-foreground">Check-in</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Method</TableHead>
                    <TableHead className="text-right text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayLoading ? (
                    <TableRow className="border-border"><TableCell colSpan={5} className="h-24"><Skeleton className="h-full w-full bg-background" /></TableCell></TableRow>
                  ) : todayAttendance?.length === 0 ? (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground/75">No check-ins today yet.</TableCell>
                    </TableRow>
                  ) : (
                    todayAttendance?.map((record) => {
                      const isStillIn = !record.check_out_time;
                      return (
                        <TableRow key={record.id} className="border-border hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src={record.profiles?.avatar_url} />
                                 <AvatarFallback className="bg-muted text-foreground/80 text-xs">{record.profiles?.first_name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{record.profiles?.first_name} {record.profiles?.last_name}</div>
                                {record.profiles?.membership_status !== 'active' && (
                                   <div className="text-[10px] text-amber-500 flex items-center gap-1">
                                     <AlertTriangle className="h-3 w-3" /> {record.profiles?.membership_status}
                                   </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground/80">
                            {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            {isStillIn ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">In Gym</Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-300 text-muted-foreground/75">Left at {new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-background text-muted-foreground uppercase text-[10px]">{record.method}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isStillIn ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-border hover:bg-muted text-foreground/80 h-8 text-xs"
                                onClick={() => checkOutMutation.mutate(record.id)}
                                disabled={checkOutMutation.isPending}
                              >
                                Check-out
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Checked out</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="class-bookings" className="space-y-4">
          <Card className="bg-card border-border text-foreground">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-indigo-600" /> Today's Class Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Member</TableHead>
                    <TableHead className="text-muted-foreground">Class Name</TableHead>
                    <TableHead className="text-muted-foreground">Trainer</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Room</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Mark Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classLoading ? (
                    <TableRow className="border-border"><TableCell colSpan={7} className="h-24"><Skeleton className="h-full w-full bg-background" /></TableCell></TableRow>
                  ) : classBookings.length === 0 ? (
                    <TableRow className="border-border">
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground/75">No class bookings scheduled for today.</TableCell>
                    </TableRow>
                  ) : (
                    classBookings.map((booking: any) => (
                      <TableRow key={booking.id} className="border-border hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="font-bold text-foreground">{booking.profiles?.first_name} {booking.profiles?.last_name}</div>
                          <div className="text-xs text-muted-foreground/75">{booking.profiles?.email}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground/90">
                          {booking.classes?.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                           {booking.classes?.trainers?.name || 'Trainer will be assigned'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTime12h(booking.classes?.start_time)} ({booking.classes?.duration}m)
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {booking.classes?.room}
                        </TableCell>
                        <TableCell>
                          {booking.status === 'booked' ? (
                            <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200">Booked</Badge>
                          ) : booking.status === 'attended' ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200">Attended</Badge>
                          ) : (
                            <Badge variant="outline" className="border-red-200 text-red-600">No Show</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.status === 'booked' ? (
                            <div className="flex gap-1 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                onClick={() => markClassAttendance.mutate({ bookingId: booking.id, status: 'attended' })}
                                disabled={markClassAttendance.isPending}
                              >
                                Attended
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-red-600 border-red-100 hover:bg-red-50"
                                onClick={() => markClassAttendance.mutate({ bookingId: booking.id, status: 'no_show' })}
                                disabled={markClassAttendance.isPending}
                              >
                                No Show
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-muted-foreground/75 hover:text-slate-600 text-xs"
                              onClick={() => markClassAttendance.mutate({ bookingId: booking.id, status: 'booked' })}
                              disabled={markClassAttendance.isPending}
                            >
                              Reset
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-card border-border text-foreground">
            <CardHeader>
              <CardTitle className="text-lg">Historical Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/75" />
                  <Input
                    placeholder="Search member..."
                    className="pl-9 bg-background border-border text-foreground"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Input
                  type="date"
                  className="bg-background border-border text-foreground w-full sm:w-auto "
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
                <Input
                  type="date"
                  className="bg-background border-border text-foreground w-full sm:w-auto "
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev: any) => ({ ...prev, end: e.target.value }))}
                />
              </div>

              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Member</TableHead>
                      <TableHead className="text-muted-foreground">Check-In</TableHead>
                      <TableHead className="text-muted-foreground">Check-Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                      <TableRow className="border-border"><TableCell colSpan={4} className="h-24"><Skeleton className="h-full w-full bg-background" /></TableCell></TableRow>
                    ) : history?.length === 0 ? (
                      <TableRow className="border-border">
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground/75">No records found for this period.</TableCell>
                      </TableRow>
                    ) : (
                      history?.map((record) => (
                        <TableRow key={record.id} className="border-border hover:bg-muted/50">
                          <TableCell className="text-foreground/80">
                            {new Date(record.check_in_time).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {record.profiles?.first_name} {record.profiles?.last_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
