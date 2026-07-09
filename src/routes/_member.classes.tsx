import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { classesService } from '../services/classes.service';
import { bookingsService } from '../services/bookings.service';
import { useAuth } from '../lib/auth-context';
import { useClassesRealtime } from '../hooks/useClassesRealtime';
import { formatTime12h } from '../services/classes.utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Dumbbell, Search, Clock, MapPin, Award, CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';

export const Route = createFileRoute('/_member/classes')({
  component: MemberClassesPage,
});

const categoriesList = ['All', 'Today', 'Tomorrow', 'Strength', 'Yoga', 'Cardio', 'HIIT', 'Pilates', 'Functional'];

function MemberClassesPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  useClassesRealtime();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: dbClasses, isLoading, refetch: refetchClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesService.getClasses({ status: 'active' }),
  });

  const { data: memberBookings, refetch: refetchBookings } = useQuery({
    queryKey: ['member-bookings', profile?.id],
    queryFn: () => bookingsService.getMemberBookings(profile!.id),
    enabled: !!profile?.id,
  });

  const filteredClasses = useMemo(() => {
    if (!dbClasses) return [];
    
    return dbClasses.filter((cls) => {
      const matchesSearch = (cls.title || '').toLowerCase().includes(search.toLowerCase()) || 
                            (cls.trainers?.name && cls.trainers.name.toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return false;

      if (activeFilter === 'All') return true;
      
      const todayName = format(new Date(), 'EEEE');
      const tomorrowName = format(new Date(Date.now() + 86400000), 'EEEE');

      if (activeFilter === 'Today') {
        return cls.days.includes(todayName);
      }
      if (activeFilter === 'Tomorrow') {
        return cls.days.includes(tomorrowName);
      }
      
      return cls.category.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [dbClasses, search, activeFilter]);

  const bookMutation = useMutation({
    mutationFn: (classId: string) => bookingsService.bookClass(classId, profile!.id),
    onSuccess: (booking) => {
      if (booking.status === 'waiting') {
        toast.success(`Added to Waiting List!`);
      } else {
        toast.success('Class booked successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['member-bookings'] });
      refetchClasses();
      refetchBookings();
    },
    onError: (e: any) => toast.error(e.message || 'Failed to book class'),
  });

  const getBookingStatus = (classId: string) => {
    const booking = memberBookings?.find(b => b.class_id === classId);
    if (!booking) return 'none';
    if (booking.status === 'booked' || booking.status === 'attended') return 'booked';
    if (booking.status === 'waiting') return 'waiting';
    return 'none';
  };

  return (
    <div className="w-full max-w-full mx-auto min-h-screen pb-20 sm:max-w-3xl lg:max-w-5xl overflow-hidden min-w-0">
      {/* Header Container */}
      <div className="pt-4 pb-4 sticky top-0 bg-background/95 backdrop-blur-md z-30 border-b border-border -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Discover</h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Find your next workout.</p>
        </div>

        {/* Search */}
        <div className="mt-4 relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search classes or trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl py-3 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
          />
        </div>

        {/* Filters Scrollable Row */}
        <div className="flex overflow-x-auto gap-2 mt-4 pb-1 scrollbar-none snap-x max-w-full">
          {categoriesList.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground shadow-md scale-105'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Classes List */}
      <div className="mt-6 space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 w-full min-w-0">
        <AnimatePresence>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-3xl h-48 animate-pulse shadow-sm border border-border"></div>
            ))
          ) : filteredClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[45vh] text-center px-4 py-12 lg:col-span-2 w-full"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Dumbbell className="h-9 w-9 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">No classes found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => { setSearch(''); setActiveFilter('All'); }}
                className="mt-6 px-6 py-2 bg-card border border-border rounded-full text-foreground font-semibold shadow-sm hover:bg-muted transition-colors text-xs sm:text-sm"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            filteredClasses.map((cls, idx) => {
              const occupancyPercent = cls.capacity > 0 ? Math.round((cls.booked_count / cls.capacity) * 100) : 0;
              const isFull = cls.booked_count >= cls.capacity;
              const bStatus = getBookingStatus(cls.id);
              
              return (
                <motion.div
                  key={cls.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-card rounded-[2rem] p-4 sm:p-5 shadow-sm border border-border overflow-hidden relative group hover:shadow-md transition-all min-w-0 w-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: cls.color_label || '#4F46E5' }} />
                  
                  <div className="flex justify-between items-start mt-1 gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {cls.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          cls.difficulty_level === 'beginner' ? 'bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 
                          cls.difficulty_level === 'intermediate' ? 'bg-amber-500/10 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border-amber-500/20' : 
                          'bg-destructive/10 dark:bg-red-950/20 text-destructive dark:text-red-400 border-destructive/20'
                        }`}>
                          {cls.difficulty_level}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate" title={cls.title || ''}>{cls.title}</h3>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Dumbbell className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5 grid grid-cols-1 min-[380px]:grid-cols-2 gap-y-2.5 gap-x-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium min-w-0">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{formatTime12h(cls.start_time)} ({cls.duration}m)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium min-w-0">
                      <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{cls.days.slice(0,2).join(', ')}{cls.days.length>2?'...':''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium min-w-0">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{cls.room}</span>
                    </div>
                    {cls.trainers ? (
                      <div className="flex items-center gap-3 mt-4 p-2 rounded-xl bg-muted/50 border border-border">
                        {cls.trainers.photo_url ? (
                          <img 
                            src={cls.trainers.photo_url} 
                            alt={cls.trainers.name} 
                            className="w-10 h-10 object-cover rounded-full border border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold uppercase border border-primary/20">
                            {cls.trainers.name[0]}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Trainer</div>
                          <div className="text-sm font-bold text-foreground truncate">{cls.trainers.name}</div>
                          <div className="text-xs text-muted-foreground truncate font-medium">
                            {cls.trainers.specialization || 'Fitness Specialist'} • {cls.trainers.experience_years ? `${cls.trainers.experience_years}y Exp` : 'Exp not specified'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-4 p-2 rounded-xl border border-dashed border-border/70 text-muted-foreground">
                        <Award className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                        <span className="text-xs italic font-semibold">Trainer will be assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Progress / seats */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>{cls.booked_count} / {cls.capacity} Booked</span>
                      {cls.waiting_list_count > 0 && <span className="text-amber-800 dark:text-amber-400">{cls.waiting_list_count} Waiting</span>}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${occupancyPercent >= 100 ? 'bg-amber-600' : 'bg-primary'}`} 
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      onClick={() => bookMutation.mutate(cls.id)}
                      disabled={bookMutation.isPending || bStatus === 'booked' || bStatus === 'waiting'}
                      className={`w-full py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 transform active:scale-[0.98] ${
                        bStatus === 'booked'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : bStatus === 'waiting'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md'
                          : isFull
                          ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                          : 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                      }`}
                    >
                      {bookMutation.isPending ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full mx-auto" />
                      ) : bStatus === 'booked' ? (
                        'Booked ✓'
                      ) : bStatus === 'waiting' ? (
                        'On Waitlist'
                      ) : isFull ? (
                        'Join Waitlist'
                      ) : (
                        'Book Class'
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
