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

  const { data: dbClasses, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesService.getClasses({ status: 'active' }),
  });

  const { data: memberBookings } = useQuery({
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
    <div className="max-w-md mx-auto min-h-screen bg-slate-50/50 pb-20 sm:max-w-3xl lg:max-w-5xl">
      {/* Header */}
      <div className="pt-6 px-4 pb-4 sticky top-0 bg-slate-50/90 backdrop-blur-md z-30">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Discover</h2>
        <p className="text-slate-500 font-medium">Find your next workout.</p>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes or trainers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 mt-4 pb-2 scrollbar-none snap-x">
          {categoriesList.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Classes List */}
      <div className="px-4 mt-2 space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <AnimatePresence>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-48 animate-pulse shadow-sm border border-slate-100"></div>
            ))
          ) : filteredClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 lg:col-span-2"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Dumbbell className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No classes found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search term.</p>
              <button 
                onClick={() => { setSearch(''); setActiveFilter('All'); }}
                className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition-colors"
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
                  className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden relative group hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow"
                >
                  <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: cls.color_label || '#4F46E5' }} />
                  
                  <div className="flex justify-between items-start mt-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {cls.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          cls.difficulty_level === 'beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          cls.difficulty_level === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {cls.difficulty_level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{cls.title}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50">
                      <Dumbbell className="h-5 w-5 text-indigo-500" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-2">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      {formatTime12h(cls.start_time)} ({cls.duration}m)
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <CalendarDays className="h-4 w-4 text-indigo-400" />
                      <span className="truncate">{cls.days.slice(0,2).join(', ')}{cls.days.length>2?'...':''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-indigo-400" />
                      <span className="truncate">{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Award className="h-4 w-4 text-indigo-400" />
                      <span className="truncate">{cls.trainers?.name || 'No Trainer'}</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>{cls.booked_count} / {cls.capacity} Booked</span>
                      {cls.waiting_list_count > 0 && <span className="text-amber-500">{cls.waiting_list_count} Waiting</span>}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${occupancyPercent >= 100 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => bookMutation.mutate(cls.id)}
                      disabled={bookMutation.isPending || bStatus === 'booked' || bStatus === 'waiting'}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 transform active:scale-[0.98] ${
                        bStatus === 'booked'
                          ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg'
                          : bStatus === 'waiting'
                          ? 'bg-amber-500 text-white shadow-amber-200 shadow-lg'
                          : isFull
                          ? 'bg-slate-900 text-white shadow-slate-300 shadow-lg hover:bg-slate-800'
                          : 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg hover:bg-indigo-700 hover:shadow-xl'
                      }`}
                    >
                      {bookMutation.isPending ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto" />
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
