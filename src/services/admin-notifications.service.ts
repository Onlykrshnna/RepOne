import { supabase } from '../lib/supabase';

export interface AdminNotification {
  id: string;
  type: 'request' | 'ticket' | 'payment' | 'system' | 'member';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

type AdminNotificationListener = (notifications: AdminNotification[]) => void;
const listeners = new Set<AdminNotificationListener>();
let currentNotifications: AdminNotification[] = [];

export const adminNotificationsService = {
  subscribe(listener: AdminNotificationListener) {
    listeners.add(listener);
    listener([...currentNotifications]);
    return () => {
      listeners.delete(listener);
    };
  },

  privateNotify() {
    listeners.forEach(l => l([...currentNotifications]));
  },
  
  async loadNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .in('type', ['request', 'ticket', 'payment', 'system', 'member'])
      .order('date', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error('Failed to load admin notifications:', error);
      return;
    }
    
    currentNotifications = (data || []) as AdminNotification[];
    this.privateNotify();
  },

  async addNotification(type: AdminNotification['type'], title: string, message: string) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        profile_id: null,
        type,
        title,
        message,
        read: false,
        date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add admin notification:', error);
      return null;
    }

    currentNotifications = [data as AdminNotification, ...currentNotifications];
    if (currentNotifications.length > 50) {
      currentNotifications = currentNotifications.slice(0, 50);
    }
    
    this.privateNotify();
    return data;
  },

  async markAllRead() {
    currentNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.privateNotify();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('type', ['request', 'ticket', 'payment', 'system', 'member'])
      .eq('read', false);
      
    if (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  getUnreadCount(): number {
    return currentNotifications.filter(n => !n.read).length;
  },

  async checkGuestPassExpirations() {
    // Optional client-side check removed to prevent UI blocking
  },

  async checkPendingPayments() {
    // The admin dashboard now reads directly from the payments queue. 
  }
};
