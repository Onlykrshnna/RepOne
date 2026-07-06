import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function usePaymentsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-revenue'] });
          
          if (payload.new && 'profile_id' in payload.new) {
             queryClient.invalidateQueries({ queryKey: ['member-payments', payload.new.profile_id] });
             queryClient.invalidateQueries({ queryKey: ['member-dashboard', payload.new.profile_id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
