import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { classesService } from '../services/classes.service';
import { bookingsService } from '../services/bookings.service';
import { useAuth } from '../lib/auth-context';
import { useClassesRealtime } from '../hooks/useClassesRealtime';
import { formatClassDays, formatTime12h } from '../services/classes.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Dumbbell, Plus, Edit, Trash2, Copy, Eye, Calendar, Clock, 
  MapPin, Users, Filter, Search, Award, Info, BookOpen, AlertCircle, 
  X, Check, ArrowRight, TrendingUp, BarChart2, CalendarDays, RefreshCw, ChevronLeft, ChevronRight, Ban
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths 
} from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export const Route = createFileRoute('/_member/classes')({
  component: ClassesPage,
});

function ClassesPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  useClassesRealtime(); // Activate realtime updates

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Calendar View Local States
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<Date>(new Date());
  const [calendarMode, setCalendarMode] = useState<'day' | 'week' | 'month'>('week');

  // Modal Control States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [isTrainerDetailOpen, setIsTrainerDetailOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // Queries
  const { data: dbClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['classes', search, category, trainerId, status],
    queryFn: () => classesService.getClasses({ 
      search: search || undefined, 
      category: category || undefined, 
      trainerId: trainerId || undefined,
      status: profile?.role === 'admin' ? undefined : 'active'
    }),
  });

  const classes = dbClasses && dbClasses.length > 0 ? dbClasses : [];

  const { data: dbTrainers, isLoading: trainersLoading } = useQuery({
    queryKey: ['trainers'],
    queryFn: classesService.getTrainers,
  });

  const trainers = dbTrainers && dbTrainers.length > 0 ? dbTrainers : [];

  const { data: attendees = [], refetch: refetchAttendees } = useQuery({
    queryKey: ['class-attendees', selectedClass?.id],
    queryFn: () => bookingsService.getClassAttendees(selectedClass.id),
    enabled: !!selectedClass?.id,
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['classes-report'],
    queryFn: classesService.getClassesReport,
    enabled: profile?.role === 'admin',
  });

  // Mutations
  const classMutation = useMutation({
    mutationFn: (data: { id?: string; classData: any }) => 
      data.id 
        ? classesService.updateClass(data.id, data.classData) 
        : classesService.createClass(data.classData),
    onSuccess: () => {
      toast.success(selectedClass ? 'Class updated successfully' : 'Class created successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['classes-report'] });
      setIsClassModalOpen(false);
      setSelectedClass(null);
    },
    onError: (e: any) => toast.error(e.message || 'Action failed'),
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => classesService.deleteClass(id),
    onSuccess: () => {
      toast.success('Class deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['classes-report'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete class'),
  });

  const duplicateClassMutation = useMutation({
    mutationFn: (id: string) => classesService.duplicateClass(id),
    onSuccess: () => {
      toast.success('Class duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to duplicate class'),
  });

  const cancelClassMutation = useMutation({
    mutationFn: (id: string) => classesService.cancelClass(id),
    onSuccess: () => {
      toast.success('Class cancelled! All bookings have been updated to cancelled.');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['classes-report'] });
      queryClient.invalidateQueries({ queryKey: ['class-dashboard-metrics'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to cancel class'),
  });

  const trainerMutation = useMutation({
    mutationFn: (data: { id?: string; trainerData: any }) => 
      data.id 
        ? classesService.updateTrainer(data.id, data.trainerData) 
        : classesService.createTrainer(data.trainerData),
    onSuccess: () => {
      toast.success(selectedTrainer ? 'Trainer updated successfully' : 'Trainer profile added');
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      setIsTrainerModalOpen(false);
      setSelectedTrainer(null);
    },
    onError: (e: any) => toast.error(e.message || 'Action failed'),
  });

  const deleteTrainerMutation = useMutation({
    mutationFn: (id: string) => classesService.deleteTrainer(id),
    onSuccess: () => {
      toast.success('Trainer removed successfully');
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete trainer'),
  });

  const bookMutation = useMutation({
    mutationFn: (classId: string) => bookingsService.bookClass(classId, profile!.id),
    onSuccess: (booking) => {
      if (booking.status === 'waiting') {
        toast.success(`Class is full! You have been added to the Waiting List at position #${booking.position_in_waiting_list}.`);
      } else {
        toast.success('Class booked successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to book class'),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: (data: { bookingId: string; status: 'attended' | 'no_show' | 'booked' }) => 
      bookingsService.updateAttendanceStatus(data.bookingId, data.status),
    onSuccess: () => {
      toast.success('Attendance updated');
      refetchAttendees();
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update attendance'),
  });

  // Add/Edit Forms Local States
  const [classForm, setClassForm] = useState({
    title: '',
    description: '',
    category: 'Fitness',
    room: 'Studio A',
    capacity: 20,
    duration: 60,
    difficulty_level: 'beginner' as any,
    days: [] as string[],
    start_time: '09:00',
    end_time: '10:00',
    status: 'active' as any,
    trainer_id: '',
    color_label: '#4F46E5'
  });

  const [trainerForm, setTrainerForm] = useState({
    name: '',
    specialization: '',
    experience: '',
    bio: '',
    contact: '',
    photo_url: ''
  });

  const handleOpenClassModal = (cls?: any) => {
    if (cls) {
      setSelectedClass(cls);
      setClassForm({
        title: cls.title,
        description: cls.description || '',
        category: cls.category,
        room: cls.room,
        capacity: cls.capacity,
        duration: cls.duration,
        difficulty_level: cls.difficulty_level,
        days: cls.days,
        start_time: cls.start_time.slice(0, 5),
        end_time: cls.end_time.slice(0, 5),
        status: cls.status,
        trainer_id: cls.trainer_id || '',
        color_label: cls.color_label || '#4F46E5'
      });
    } else {
      setSelectedClass(null);
      setClassForm({
        title: '',
        description: '',
        category: 'Fitness',
        room: 'Studio A',
        capacity: 20,
        duration: 60,
        difficulty_level: 'beginner',
        days: [],
        start_time: '09:00',
        end_time: '10:00',
        status: 'active',
        trainer_id: '',
        color_label: '#4F46E5'
      });
    }
    setIsClassModalOpen(true);
  };

  const handleOpenTrainerModal = (trainer?: any) => {
    if (trainer) {
      setSelectedTrainer(trainer);
      setTrainerForm({
        name: trainer.name,
        specialization: trainer.specialization || '',
        experience: trainer.experience || '',
        bio: trainer.bio || '',
        contact: trainer.contact || '',
        photo_url: trainer.photo_url || ''
      });
    } else {
      setSelectedTrainer(null);
      setTrainerForm({
        name: '',
        specialization: '',
        experience: '',
        bio: '',
        contact: '',
        photo_url: ''
      });
    }
    setIsTrainerModalOpen(true);
  };

  const toggleDay = (day: string) => {
    setClassForm(prev => {
      const updatedDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days: updatedDays };
    });
  };

  const weekdaysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const categoriesList = ['Fitness', 'Yoga', 'Pilates', 'Zumba', 'Strength', 'Cardio', 'Spinning'];

  // ====================================================
  // CALENDAR GENERATORS
  // ====================================================
  const generateMonthDays = () => {
    const startMonth = startOfMonth(calendarDate);
    const endMonth = endOfMonth(calendarDate);
    const startWeek = startOfWeek(startMonth, { weekStartsOn: 1 });
    let endWeek = endOfWeek(endMonth, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startWeek, end: endWeek });
    const missingDays = 42 - days.length;
    if (missingDays > 0) {
      endWeek = new Date(endWeek.getTime() + missingDays * 24 * 60 * 60 * 1000);
      return eachDayOfInterval({ start: startWeek, end: endWeek });
    }
    return days;
  };

  const getDayClasses = (date: Date) => {
    const dayName = format(date, 'EEEE');
    return classes.filter(c => c.days.includes(dayName) && c.status === 'active');
  };

  const nextMonth = () => setCalendarDate(addMonths(calendarDate, 1));
  const prevMonth = () => setCalendarDate(subMonths(calendarDate, 1));

  // Pie Chart Colors
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Gym Classes & Trainers</h2>
          <p className="text-muted-foreground">Book class spots, manage timings, and instructors.</p>
        </div>
        {profile?.role === 'admin' && (
          <div className="flex gap-2">
            <Button onClick={() => handleOpenTrainerModal()} variant="outline" className="border-border text-foreground/80 bg-card hover:bg-muted/50">
              <Plus className="mr-2 h-4 w-4" /> Add Trainer
            </Button>
            <Button onClick={() => handleOpenClassModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" /> Create Class
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="bg-muted border border-border w-full sm:w-auto p-1 rounded-lg flex overflow-x-auto whitespace-nowrap scrollbar-none">
          <TabsTrigger value="classes" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Classes Grid</TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Calendar View</TabsTrigger>
          <TabsTrigger value="trainers" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Trainers Directory</TabsTrigger>
          {profile?.role === 'admin' && (
            <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-muted-foreground px-4 py-2 font-medium">Reports & Insights</TabsTrigger>
          )}
        </TabsList>

        {/* --- CLASSES GRID CONTENT --- */}
        <TabsContent value="classes" className="space-y-6">
          {/* Search & Filters */}
          <div className="grid gap-4 md:grid-cols-4 bg-card border border-border p-4 rounded-xl shadow-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/75" />
              <Input
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background border-border text-foreground"
              />
            </div>
            
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <option value="">All Categories</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <select
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <option value="">All Trainers</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {profile?.role === 'admin' && (
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  <option value="active">Active Classes</option>
                  <option value="inactive">Inactive/Archived</option>
                </select>
              </div>
            )}
          </div>

          {/* Classes Grid */}
          {classesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Card key={i} className="h-60 bg-card border-border"><CardContent className="p-6"><Skeleton className="h-full w-full bg-muted" /></CardContent></Card>)}
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border border-dashed rounded-xl">
              <Dumbbell className="h-12 w-12 text-muted-foreground/75 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground/90">No classes found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try relaxing your search filter conditions.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => {
                const occupancyPercent = cls.capacity > 0 ? Math.round((cls.booked_count / cls.capacity) * 100) : 0;
                
                return (
                  <motion.div
                    key={cls.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group"
                  >
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative border-t-4" style={{ borderTopColor: cls.color_label }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground uppercase text-[10px] tracking-wide font-bold">
                            {cls.category}
                          </Badge>
                          <Badge className={`${cls.difficulty_level === 'beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : cls.difficulty_level === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'} text-[10px] uppercase font-bold border`}>
                            {cls.difficulty_level}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{cls.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-muted-foreground text-sm mt-1">{cls.description || 'No description provided.'}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground/75" />
                            <span>{formatTime12h(cls.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground/75" />
                            <span className="truncate">{formatClassDays(cls.days)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground/75" />
                            <span>{cls.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground/75" />
                            <span>{cls.duration} min</span>
                          </div>
                        </div>

                        {/* Capacity Indicator */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>Capacity: {cls.booked_count}/{cls.capacity} booked</span>
                            {cls.waiting_list_count > 0 && <span className="text-amber-600 font-semibold">{cls.waiting_list_count} waiting</span>}
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${occupancyPercent >= 100 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Instructor Info */}
                        {cls.trainers && (
                          <div 
                            className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                            onClick={() => {
                              setSelectedTrainer(cls.trainers);
                              setIsTrainerDetailOpen(true);
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-100 uppercase">
                              {cls.trainers.name[0]}
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground/75">Trainer</div>
                              <div className="text-sm font-semibold text-foreground/90">{cls.trainers.name}</div>
                            </div>
                            <Info className="h-3 w-3 text-muted-foreground/75 ml-auto" />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          {profile?.role === 'admin' ? (
                            <>
                              <Button variant="outline" size="sm" className="flex-1 text-foreground/80 border-border hover:bg-muted/50" onClick={() => handleOpenClassModal(cls)}>
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-foreground/80 border-border hover:bg-muted/50" onClick={() => duplicateClassMutation.mutate(cls.id)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-foreground/80 border-border hover:bg-muted/50" onClick={() => {
                                setSelectedClass(cls);
                                setIsAttendeesModalOpen(true);
                              }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {cls.status === 'active' ? (
                                <Button variant="outline" size="sm" className="border-amber-200 text-amber-600 hover:bg-amber-50" onClick={() => {
                                  if (confirm('Cancel this class? This will deactivate the class and cancel all active bookings.')) {
                                    cancelClassMutation.mutate(cls.id);
                                  }
                                }}>
                                  <Ban className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                  if (confirm('Are you sure you want to permanently delete this class?')) {
                                    deleteClassMutation.mutate(cls.id);
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button 
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                              onClick={() => bookMutation.mutate(cls.id)}
                              disabled={bookMutation.isPending || cls.status === 'inactive'}
                            >
                              {cls.status === 'inactive' ? 'Cancelled' : cls.booked_count >= cls.capacity ? 'Join Waiting List' : 'Book Spot'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* --- CALENDAR VIEW CONTENT --- */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="bg-card border-border text-foreground">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
              <div>
                <CardTitle>Schedule Calendar</CardTitle>
                <CardDescription>Visual schedules for fitness classes.</CardDescription>
              </div>
              <div className="flex gap-2 items-center bg-muted p-1 rounded-lg">
                <Button 
                  size="sm" 
                  variant={calendarMode === 'day' ? 'secondary' : 'ghost'} 
                  className={calendarMode === 'day' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}
                  onClick={() => setCalendarMode('day')}
                >
                  Day
                </Button>
                <Button 
                  size="sm" 
                  variant={calendarMode === 'week' ? 'secondary' : 'ghost'} 
                  className={calendarMode === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}
                  onClick={() => setCalendarMode('week')}
                >
                  Week
                </Button>
                <Button 
                  size="sm" 
                  variant={calendarMode === 'month' ? 'secondary' : 'ghost'} 
                  className={calendarMode === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}
                  onClick={() => setCalendarMode('month')}
                >
                  Month
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* --- DAILY SCHEDULE VIEW --- */}
              {calendarMode === 'day' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border/50 justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCalendarDay(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-foreground/90">{format(selectedCalendarDay, 'EEEE, MMMM d, yyyy')}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCalendarDay(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-border rounded-xl overflow-hidden bg-card">
                    {getDayClasses(selectedCalendarDay).length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground/75 italic">No classes scheduled for today.</div>
                    ) : (
                      getDayClasses(selectedCalendarDay).map(cls => (
                        <div key={cls.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: cls.color_label }}>
                              {cls.category[0]}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-foreground">{cls.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTime12h(cls.start_time)} ({cls.duration} min)</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {cls.room}</span>
                                {cls.trainers && <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" /> {cls.trainers.name}</span>}
                              </div>
                            </div>
                          </div>
                          {profile?.role === 'member' && (
                            <Button 
                              onClick={() => bookMutation.mutate(cls.id)}
                              disabled={bookMutation.isPending}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Book Class
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* --- WEEKLY SCHEDULE VIEW --- */}
              {calendarMode === 'week' && (
                <div className="grid gap-4 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-border">
                  {weekdaysList.map((day) => {
                    const dayClasses = classes.filter(c => c.days.includes(day) && c.status === 'active');
                    return (
                      <div key={day} className="pt-4 md:pt-0 md:px-3 space-y-4">
                        <div className="font-bold text-center border-b border-border pb-2 text-foreground/90 text-sm tracking-wide uppercase">
                          {day.slice(0, 3)}
                        </div>
                        <div className="space-y-3">
                          {dayClasses.length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground/75 py-4 italic">No classes</div>
                          ) : (
                            dayClasses.map(cls => (
                              <div 
                                key={cls.id} 
                                className="p-3 bg-background border border-border rounded-lg hover:border-indigo-600 hover:shadow-sm transition-all text-xs space-y-1 relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: cls.color_label }} />
                                <div className="font-bold text-foreground/90 truncate">{cls.title}</div>
                                <div className="text-muted-foreground font-medium">{formatTime12h(cls.start_time)}</div>
                                <div className="text-muted-foreground/75 truncate">{cls.room}</div>
                                {profile?.role === 'member' && (
                                  <button 
                                    onClick={() => bookMutation.mutate(cls.id)}
                                    className="mt-2 w-full bg-card hover:bg-muted text-indigo-600 font-semibold border border-indigo-200 py-1 rounded transition-colors text-[10px]"
                                  >
                                    Book
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* --- MONTHLY SCHEDULE VIEW --- */}
              {calendarMode === 'month' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-background p-3 rounded-lg border border-border/50 justify-between">
                    <Button variant="ghost" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-foreground/90">{format(calendarDate, 'MMMM yyyy')}</span>
                    <Button variant="ghost" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="overflow-x-auto w-full -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="min-w-[700px] pb-2">
                      <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
                        {/* Header */}
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <div key={day} className="bg-background p-2 text-center text-xs font-semibold text-muted-foreground border-r border-b border-border">
                            {day}
                          </div>
                        ))}
                        {/* Days */}
                        {generateMonthDays().map((day, idx) => {
                          const dayClasses = getDayClasses(day);
                          const isCurrentMonth = isSameMonth(day, calendarDate);
                          const isToday = isSameDay(day, new Date());

                          return (
                            <div 
                              key={idx} 
                              className={`min-h-[100px] p-2 border-r border-b border-border flex flex-col justify-between transition-colors ${!isCurrentMonth ? 'bg-slate-50/50 opacity-40' : 'bg-card'} ${isToday ? 'bg-indigo-50/20' : ''}`}
                            >
                              <span className={`text-[10px] font-bold self-start w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-muted-foreground/75'}`}>
                                {format(day, 'd')}
                              </span>
                              
                              <div className="space-y-1 mt-2">
                                {dayClasses.slice(0, 2).map(cls => (
                                  <div key={cls.id} className="text-[9px] font-semibold p-1 rounded border border-border/50 truncate text-foreground/90" style={{ borderLeft: `2.5px solid ${cls.color_label}` }}>
                                    {cls.title}
                                  </div>
                                ))}
                                {dayClasses.length > 2 && (
                                  <div className="text-[8px] font-bold text-muted-foreground/75 text-right">+{dayClasses.length - 2} more</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TRAINERS CONTENT --- */}
        <TabsContent value="trainers" className="space-y-6">
          {trainersLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2].map(i => <Card key={i} className="h-48 bg-card border-border"><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>)}
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border border-dashed rounded-xl">
              <Award className="h-12 w-12 text-muted-foreground/75 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground/90">No trainer profiles found</h3>
              <p className="text-muted-foreground text-sm mt-1">Add trainer profiles to assign classes.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="bg-card border-border shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 flex flex-row gap-4 items-start">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold uppercase border border-indigo-200">
                      {trainer.name[0]}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-foreground">{trainer.name}</CardTitle>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs font-semibold">
                        {trainer.specialization || 'General Fitness'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-1">
                    <p className="text-xs text-muted-foreground line-clamp-3">{trainer.bio || 'No bio provided.'}</p>
                    <div className="text-xs text-muted-foreground space-y-1 border-t border-border/50 pt-2">
                      <div><strong>Exp:</strong> {trainer.experience || 'Not specified'}</div>
                      <div><strong>Contact:</strong> {trainer.contact || 'No contact provided'}</div>
                    </div>
                  </CardContent>
                  {profile?.role === 'admin' && (
                    <div className="border-t border-border/50 p-3 bg-slate-50/50 flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="border-border text-foreground/80 bg-card hover:bg-muted/50" onClick={() => handleOpenTrainerModal(trainer)}>
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                        if (confirm('Delete this trainer profile? It will unlink them from classes.')) {
                          deleteTrainerMutation.mutate(trainer.id);
                        }
                      }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- REPORTS CONTENT (ADMIN ONLY) --- */}
        {profile?.role === 'admin' && (
          <TabsContent value="reports" className="space-y-6">
            {reportLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            ) : !reportData ? (
              <div className="text-center py-8 text-muted-foreground/75">Failed to load reports metrics data.</div>
            ) : (
              <div className="space-y-6">
                {/* Highlight Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-card border-border text-foreground shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Average Class Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div className="text-4xl font-extrabold text-indigo-600">{reportData.averageOccupancyRate}%</div>
                      <div className="text-xs text-muted-foreground/75">Roster fill rate</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border text-foreground shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cancellation Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div className="text-4xl font-extrabold text-amber-500">{reportData.cancellationRate}%</div>
                      <div className="text-xs text-muted-foreground/75">Total cancellations</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border text-foreground shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">No Show Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                      <div className="text-4xl font-extrabold text-rose-500">{reportData.noShowRate}%</div>
                      <div className="text-xs text-muted-foreground/75">Missed classes</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recharts Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Popularity Card */}
                  <Card className="bg-card border-border text-foreground">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Class Popularity</CardTitle>
                      <CardDescription>Comparison of top booked class schedules.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.mostPopularClasses}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="title" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} />
                          <Bar dataKey="bookings_count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Booking Trends Card */}
                  <Card className="bg-card border-border text-foreground">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Booking Trends</CardTitle>
                      <CardDescription>Daily reservation counts over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData.bookingTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="bookings_count" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Trainer Performance */}
                  <Card className="bg-card border-border text-foreground md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">Trainer Performance</CardTitle>
                      <CardDescription>Average client occupancy rates for active class trainers.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.trainerPerformance} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis dataKey="trainer_name" type="category" stroke="#64748b" fontSize={11} tickLine={false} width={100} />
                          <Tooltip />
                          <Bar dataKey="avg_occupancy" fill="#F59E0B" radius={[0, 4, 4, 0]}>
                            {reportData.trainerPerformance.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* ====================================================
          MODALS & DIALOGS
      ==================================================== */}

      {/* 1. Add / Edit Class Modal */}
      <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border text-foreground overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedClass ? 'Edit Class Details' : 'Create New Class'}</DialogTitle>
            <DialogDescription>Fill in Class scheduling and capacity configurations.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            classMutation.mutate({ id: selectedClass?.id, classData: classForm });
          }} className="space-y-4 pt-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class_title">Class Name *</Label>
                <Input 
                  id="class_title" 
                  value={classForm.title} 
                  onChange={(e) => setClassForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Morning Yoga Flow"
                  className="bg-background border-border text-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_category">Category *</Label>
                <select
                  id="class_category"
                  value={classForm.category}
                  onChange={(e) => setClassForm(prev => ({ ...prev, category: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                >
                  {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class_description">Description</Label>
              <textarea 
                id="class_description"
                value={classForm.description}
                onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Give details about difficulty, workouts, etc."
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="class_capacity">Capacity *</Label>
                <Input 
                  id="class_capacity" 
                  type="number"
                  value={classForm.capacity} 
                  onChange={(e) => setClassForm(prev => ({ ...prev, capacity: parseInt(e.target.value, 10) }))}
                  className="bg-background border-border text-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_duration">Duration (Minutes) *</Label>
                <Input 
                  id="class_duration" 
                  type="number"
                  value={classForm.duration} 
                  onChange={(e) => setClassForm(prev => ({ ...prev, duration: parseInt(e.target.value, 10) }))}
                  className="bg-background border-border text-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_difficulty">Difficulty Level *</Label>
                <select
                  id="class_difficulty"
                  value={classForm.difficulty_level}
                  onChange={(e) => setClassForm(prev => ({ ...prev, difficulty_level: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="class_room">Room *</Label>
                <Input 
                  id="class_room" 
                  value={classForm.room} 
                  onChange={(e) => setClassForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="e.g. Studio 3"
                  className="bg-background border-border text-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_start">Start Time *</Label>
                <Input 
                  id="class_start" 
                  type="time"
                  value={classForm.start_time} 
                  onChange={(e) => setClassForm(prev => ({ ...prev, start_time: e.target.value }))}
                  className="bg-background border-border text-foreground"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_end">End Time *</Label>
                <Input 
                  id="class_end" 
                  type="time"
                  value={classForm.end_time} 
                  onChange={(e) => setClassForm(prev => ({ ...prev, end_time: e.target.value }))}
                  className="bg-background border-border text-foreground"
                  required 
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class_trainer">Trainer</Label>
                <select
                  id="class_trainer"
                  value={classForm.trainer_id}
                  onChange={(e) => setClassForm(prev => ({ ...prev, trainer_id: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select trainer...</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color_label">Color Label</Label>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color" 
                    id="color_label" 
                    value={classForm.color_label} 
                    onChange={(e) => setClassForm(prev => ({ ...prev, color_label: e.target.value }))}
                    className="w-12 h-10 p-0 border border-border bg-transparent rounded"
                  />
                  <span className="text-xs text-muted-foreground font-mono">{classForm.color_label}</span>
                </div>
              </div>
            </div>

            {/* Days Selection */}
            <div className="space-y-2">
              <Label>Days of Week *</Label>
              <div className="flex flex-wrap gap-2">
                {weekdaysList.map(day => (
                  <Button 
                    key={day}
                    type="button"
                    variant={classForm.days.includes(day) ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 text-xs ${classForm.days.includes(day) ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'border-border text-muted-foreground bg-card hover:bg-muted/50'}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            {selectedClass && (
              <div className="space-y-2">
                <Label htmlFor="class_status">Class Status</Label>
                <select
                  id="class_status"
                  value={classForm.status}
                  onChange={(e) => setClassForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive (Archive)</option>
                </select>
              </div>
            )}

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" className="border-border text-foreground/80 bg-card" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={classMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {classMutation.isPending ? 'Saving...' : 'Save Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Add / Edit Trainer Modal */}
      <Dialog open={isTrainerModalOpen} onOpenChange={setIsTrainerModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground">
          <DialogHeader>
            <DialogTitle>{selectedTrainer ? 'Edit Trainer Profile' : 'Add Trainer Profile'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            trainerMutation.mutate({ id: selectedTrainer?.id, trainerData: trainerForm });
          }} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="trainer_name">Trainer Name *</Label>
              <Input 
                id="trainer_name" 
                value={trainerForm.name} 
                onChange={(e) => setTrainerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full Name"
                className="bg-background border-border text-foreground"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainer_spec">Specialization</Label>
              <Input 
                id="trainer_spec" 
                value={trainerForm.specialization} 
                onChange={(e) => setTrainerForm(prev => ({ ...prev, specialization: e.target.value }))}
                placeholder="e.g. Yoga, Bodybuilding"
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trainer_exp">Experience</Label>
                <Input 
                  id="trainer_exp" 
                  value={trainerForm.experience} 
                  onChange={(e) => setTrainerForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g. 5+ Years"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainer_contact">Contact Phone/Email</Label>
                <Input 
                  id="trainer_contact" 
                  value={trainerForm.contact} 
                  onChange={(e) => setTrainerForm(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Phone or email"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainer_bio">Bio / Achievements</Label>
              <textarea 
                id="trainer_bio" 
                value={trainerForm.bio} 
                onChange={(e) => setTrainerForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief summary about trainer history..."
                className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" className="border-border text-foreground/80 bg-card" onClick={() => setIsTrainerModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={trainerMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Trainer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. View Class Attendees Modal */}
      <Dialog open={isAttendeesModalOpen} onOpenChange={setIsAttendeesModalOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border text-foreground overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Attendees & Waiting List</DialogTitle>
            <DialogDescription>Class: {selectedClass?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-background p-3 font-semibold text-xs text-muted-foreground border-b border-border">
                <span className="col-span-2">Member</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-slate-100">
                {attendees.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground/75 italic">No bookings on this class yet.</div>
                ) : (
                  attendees.map(att => (
                    <div key={att.id} className="grid grid-cols-4 p-3 items-center text-sm">
                      <div className="col-span-2 flex flex-col">
                        <span className="font-bold text-foreground">{att.profiles?.first_name} {att.profiles?.last_name}</span>
                        <span className="text-xs text-muted-foreground">{att.profiles?.email}</span>
                      </div>
                      <div>
                        {att.status === 'booked' ? (
                          <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200">Booked</Badge>
                        ) : att.status === 'waiting' ? (
                          <Badge className="bg-amber-50 text-amber-600 border border-amber-200">Waitlist #{att.position_in_waiting_list}</Badge>
                        ) : att.status === 'attended' ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200">Attended</Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-200 text-red-600">No Show</Badge>
                        )}
                      </div>
                      <div className="flex gap-1 justify-end">
                        {att.status === 'booked' && (
                          <>
                            <Button variant="outline" size="sm" className="h-7 text-emerald-600 hover:bg-emerald-50 border-emerald-100" onClick={() => markAttendanceMutation.mutate({ bookingId: att.id, status: 'attended' })}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-red-600 hover:bg-red-50 border-red-100" onClick={() => markAttendanceMutation.mutate({ bookingId: att.id, status: 'no_show' })}>
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {att.status !== 'cancelled' && (
                          <Button variant="outline" size="sm" className="h-7 text-red-600 border-transparent hover:bg-red-50" onClick={() => {
                            if (confirm('Cancel this booking? It will trigger waiting list promotions.')) {
                              bookingsService.cancelBooking(att.id).then(() => {
                                toast.success('Booking cancelled');
                                refetchAttendees();
                              });
                            }
                          }}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/50">
            <Button variant="outline" className="border-border text-foreground/80 bg-card" onClick={() => setIsAttendeesModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. View Trainer Profile Detail Modal */}
      <Dialog open={isTrainerDetailOpen} onOpenChange={setIsTrainerDetailOpen}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground">
          {selectedTrainer && (
            <>
              <DialogHeader className="flex flex-row gap-4 items-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase border border-indigo-200">
                  {selectedTrainer.name[0]}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground">{selectedTrainer.name}</DialogTitle>
                  <p className="text-sm text-indigo-600 font-semibold">{selectedTrainer.specialization || 'Gym Trainer'}</p>
                </div>
              </DialogHeader>
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-muted-foreground/75 uppercase tracking-wider">Biography</h4>
                  <p className="text-sm text-foreground/80">{selectedTrainer.bio || 'No bio provided for this trainer.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border/50">
                  <div>
                    <strong>Experience:</strong>
                    <div className="text-foreground/90">{selectedTrainer.experience || 'Not specified'}</div>
                  </div>
                  <div>
                    <strong>Contact info:</strong>
                    <div className="text-foreground/90">{selectedTrainer.contact || 'No contact details'}</div>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" className="border-border text-foreground/80 bg-card w-full" onClick={() => setIsTrainerDetailOpen(false)}>Close Profile</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
