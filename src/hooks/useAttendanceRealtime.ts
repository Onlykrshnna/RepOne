import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useAttendanceRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to all inserts, updates, and deletes on the attendance table
    const channel = supabase
      .channel('public:attendance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        (payload) => {
          // Whenever a change occurs, we invalidate the attendance queries
          // This causes the Admin dashboard and attendance lists to instantly refetch
          queryClient.invalidateQueries({ queryKey: ['today-attendance'] });
          queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
          
          // If we also want to update member-specific dashboards that are open:
          if (payload.new && 'member_id' in payload.new) {
             queryClient.invalidateQueries({ queryKey: ['member-dashboard', payload.new.member_id] });
             queryClient.invalidateQueries({ queryKey: ['member-streak', payload.new.member_id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
