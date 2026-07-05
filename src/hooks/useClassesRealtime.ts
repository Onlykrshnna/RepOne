import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useClassesRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Subscribe to classes changes
    const classesChannel = supabase
      .channel('public:classes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'classes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['classes'] });
          queryClient.invalidateQueries({ queryKey: ['class-dashboard-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        }
      )
      .subscribe();

    // 2. Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('public:class_bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'class_bookings' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['class-bookings'] });
          queryClient.invalidateQueries({ queryKey: ['member-bookings'] });
          queryClient.invalidateQueries({ queryKey: ['today-class-attendance'] });
          queryClient.invalidateQueries({ queryKey: ['class-dashboard-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
          
          if (payload.new && 'class_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['class-attendees', payload.new.class_id] });
          }
          if (payload.new && 'member_id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['member-dashboard', payload.new.member_id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(classesChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [queryClient]);
}
