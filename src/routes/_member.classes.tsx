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
      <div className="pt-4 pb-4 sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md z-30 border-b border-slate-100 dark:border-slate-800/80 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Discover</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Find your next workout.</p>
        </div>

        {/* Search */}
        <div className="mt-4 relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search classes or trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none scale-105'
                  : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
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
              <div key={i} className="bg-white dark:bg-slate-850 rounded-3xl h-48 animate-pulse shadow-sm border border-slate-100 dark:border-slate-800/50"></div>
            ))
          ) : filteredClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[45vh] text-center px-4 py-12 lg:col-span-2 w-full"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100/50 dark:border-indigo-900/30">
                <Dumbbell className="h-9 w-9 sm:h-10 sm:w-10 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">No classes found</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => { setSearch(''); setActiveFilter('All'); }}
                className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-xs sm:text-sm"
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
                  className="bg-white dark:bg-slate-850 rounded-[2rem] p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none border border-slate-100 dark:border-slate-800/80 overflow-hidden relative group hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:hover:border-slate-750 transition-all min-w-0 w-full"
                >
                  <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: cls.color_label || '#4F46E5' }} />
                  
                  <div className="flex justify-between items-start mt-1 gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {cls.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          cls.difficulty_level === 'beginner' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 
                          cls.difficulty_level === 'intermediate' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' : 
                          'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                        }`}>
                          {cls.difficulty_level}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate" title={cls.title || ''}>{cls.title}</h3>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/20">
                      <Dumbbell className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5 grid grid-cols-1 min-[380px]:grid-cols-2 gap-y-2.5 gap-x-3">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium min-w-0">
                      <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{formatTime12h(cls.start_time)} ({cls.duration}m)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium min-w-0">
                      <CalendarDays className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{cls.days.slice(0,2).join(', ')}{cls.days.length>2?'...':''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium min-w-0">
                      <MapPin className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium min-w-0">
                      <Award className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate">{cls.trainers?.name || 'No Trainer'}</span>
                    </div>
                  </div>

                  {/* Progress / seats */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span>{cls.booked_count} / {cls.capacity} Booked</span>
                      {cls.waiting_list_count > 0 && <span className="text-amber-500">{cls.waiting_list_count} Waiting</span>}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${occupancyPercent >= 100 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      onClick={() => bookMutation.mutate(cls.id)}
                      disabled={bookMutation.isPending || bStatus === 'booked' || bStatus === 'waiting'}
                      className={`w-full py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 transform active:scale-[0.98] ${
                        bStatus === 'booked'
                          ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none shadow-md'
                          : bStatus === 'waiting'
                          ? 'bg-amber-500 text-white shadow-amber-200 dark:shadow-none shadow-md'
                          : isFull
                          ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-slate-300 dark:shadow-none shadow-md hover:bg-slate-800 dark:hover:bg-slate-705'
                          : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none shadow-md hover:bg-indigo-700 hover:shadow-lg'
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
