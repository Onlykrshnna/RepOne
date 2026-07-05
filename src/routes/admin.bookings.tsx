import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { bookingsService } from '../services/bookings.service';
import { classesService } from '../services/classes.service';
import { DUMMY_BOOKINGS, DUMMY_CLASSES } from '../lib/dummy-data';
import { useAuth } from '../lib/auth-context';
import { useClassesRealtime } from '../hooks/useClassesRealtime';
import { formatTime12h, formatClassDays } from '../services/classes.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  CalendarDays, Calendar, Clock, MapPin, XCircle, CheckCircle, 
  AlertCircle, History, Info, Trash2, Search, ArrowRight, Check, X
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export const Route = createFileRoute('/admin/bookings')({
  component: BookingsPage,
});

function BookingsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  useClassesRealtime();

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // 1. Queries
  const { data: rawMemberBookings = [], isLoading: memberLoading } = useQuery({
    queryKey: ['member-bookings', profile?.id],
    queryFn: () => bookingsService.getMemberBookings(profile!.id),
    enabled: profile?.role === 'member',
  });

  const memberBookings = rawMemberBookings.length > 0 ? rawMemberBookings : (memberLoading ? [] : DUMMY_BOOKINGS as any[]);

  const { data: dbClasses = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesService.getClasses(),
    enabled: profile?.role === 'admin',
  });

  const classes = dbClasses.length > 0 ? dbClasses : DUMMY_CLASSES as any[];

  // Admin global bookings query (fetch bookings by joining classes)
  // For the sake of simplicity, we fetch bookings from class list
  const { data: rawAdminBookings = [], isLoading: adminLoading } = useQuery({
    queryKey: ['admin-bookings', classFilter],
    queryFn: async () => {
      if (classFilter) {
        return bookingsService.getClassAttendees(classFilter);
      }
      // If no class selected, query bookings for first available class or aggregate
      const activeClasses = await classesService.getClasses({ status: 'active' });
      if (activeClasses.length === 0) return [];
      
      const allBookingsPromises = activeClasses.slice(0, 5).map(c => bookingsService.getClassAttendees(c.id));
      const results = await Promise.all(allBookingsPromises);
      return results.flat();
    },
    enabled: profile?.role === 'admin',
  });

  const adminBookings = rawAdminBookings.length > 0 ? rawAdminBookings : (adminLoading ? [] : DUMMY_BOOKINGS as any[]);

  // 2. Mutations
  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsService.cancelBooking(id),
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['member-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to cancel booking'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: 'attended' | 'no_show' | 'booked' }) => 
      bookingsService.updateAttendanceStatus(data.id, data.status),
    onSuccess: () => {
      toast.success('Booking status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update booking status'),
  });

  const handleCancelClick = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? This slot will immediately be opened to members on the waiting list.')) {
      cancelMutation.mutate(bookingId);
    }
  };

  if (profile?.role === 'admin') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h2 className="text-3xl font-black text-foreground">Manage Class Bookings</h2>
          <p className="text-muted-foreground">Track attendances, cancel bookings, and waitlist allocations.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="relative col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/75" />
            <Input
              placeholder="Search member name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border text-foreground"
            />
          </div>
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select a Class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.title} ({c.room})</option>)}
            </select>
          </div>
        </div>

        <Card className="bg-card border-border text-foreground">
          <CardHeader>
            <CardTitle>Global Bookings List</CardTitle>
            <CardDescription>Members currently registered for active gym classes.</CardDescription>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
              </div>
            ) : adminBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground/75 italic">No bookings found for the selection. Select a class to view rosters.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Member</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Booked At</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminBookings
                    .filter(b => `${b.profiles?.first_name} ${b.profiles?.last_name}`.toLowerCase().includes(search.toLowerCase()))
                    .map(b => (
                      <TableRow key={b.id} className="border-border hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-bold text-foreground">{b.profiles?.first_name} {b.profiles?.last_name}</div>
                          <div className="text-xs text-muted-foreground/75">{b.profiles?.email}</div>
                        </TableCell>
                        <TableCell>
                          {b.status === 'booked' ? (
                            <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200">Booked</Badge>
                          ) : b.status === 'waiting' ? (
                            <Badge className="bg-amber-50 text-amber-600 border border-amber-200">Waitlist #{b.position_in_waiting_list}</Badge>
                          ) : b.status === 'attended' ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200">Attended</Badge>
                          ) : b.status === 'no_show' ? (
                            <Badge variant="outline" className="border-red-200 text-red-600">No Show</Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-300 text-muted-foreground/75">Cancelled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(b.booked_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {b.status === 'booked' && (
                              <>
                                <Button variant="outline" size="sm" className="h-8 text-emerald-600 border-emerald-100 hover:bg-emerald-50" onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'attended' })}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-100 hover:bg-red-50" onClick={() => updateStatusMutation.mutate({ id: b.id, status: 'no_show' })}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {b.status !== 'cancelled' && (
                              <Button variant="outline" size="sm" className="h-8 border-border text-foreground/80 hover:bg-muted" onClick={() => handleCancelClick(b.id)}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Member View: Split into Upcoming and Past History
  const upcomingBookings = memberBookings.filter(b => b.status === 'booked' || b.status === 'waiting');
  const pastBookings = memberBookings.filter(b => b.status === 'attended' || b.status === 'no_show' || b.status === 'cancelled');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-foreground">My Class Bookings</h2>
        <p className="text-muted-foreground">Check class reservations and past attendance logs.</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-muted border border-border p-1 rounded-lg">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Upcoming Classes ({upcomingBookings.length})</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Booking History ({pastBookings.length})</TabsTrigger>
        </TabsList>

        {/* UPCOMING BOOKINGS */}
        <TabsContent value="upcoming" className="space-y-4">
          {memberLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Card key={i} className="h-32 bg-card border-border"><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>)}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <CalendarDays className="h-10 w-10 text-slate-300 mb-2" />
                <h3 className="font-bold text-foreground/90">No upcoming bookings</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">You haven't reserved spots in classes yet. Check out the classes grid!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => {
                const cls = booking.classes;
                if (!cls) return null;
                const isWaiting = booking.status === 'waiting';

                return (
                  <motion.div key={booking.id} layout>
                    <Card className="bg-card border-border shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: cls.color_label || '#4F46E5' }} />
                      <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-950">{cls.title}</h3>
                            {isWaiting ? (
                              <Badge className="bg-amber-50 text-amber-600 border border-amber-200">Waitlist Position #{booking.position_in_waiting_list}</Badge>
                            ) : (
                              <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200">Slot Confirmed</Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground/75" /> {formatTime12h(cls.start_time)} ({cls.duration} min)</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground/75" /> {formatClassDays(cls.days)}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground/75" /> {cls.room}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            className="border-red-200 text-red-600 bg-card hover:bg-red-50 w-full md:w-auto text-sm"
                            onClick={() => handleCancelClick(booking.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" /> Cancel Reservation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* BOOKING HISTORY */}
        <TabsContent value="history" className="space-y-4">
          {memberLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full bg-background" />
            </div>
          ) : pastBookings.length === 0 ? (
            <Card className="bg-card border-border text-center p-8">
              <History className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-foreground/80">No booking history yet</div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastBookings.map((booking) => {
                const cls = booking.classes;
                if (!cls) return null;

                return (
                  <Card key={booking.id} className="bg-background border-border text-foreground opacity-80">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-foreground/90">{cls.title}</h4>
                        <p className="text-xs text-muted-foreground">{new Date(booking.booked_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        {booking.status === 'attended' ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" /> Attended</Badge>
                        ) : booking.status === 'no_show' ? (
                          <Badge className="bg-red-50 text-red-600 border border-red-200"><AlertCircle className="h-3 w-3 mr-1" /> No Show</Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-300 text-muted-foreground/75">Cancelled</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
