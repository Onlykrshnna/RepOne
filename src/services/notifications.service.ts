import { supabase } from '../lib/supabase';

export interface MemberNotification {
  id: string;
  type: 'class' | 'plan' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

type NotificationListener = (notifications: MemberNotification[]) => void;
const listeners = new Set<NotificationListener>();

let currentNotifications: MemberNotification[] = [];

export const notificationsService = {
  subscribe(listener: NotificationListener) {
    listeners.add(listener);
    listener([...currentNotifications]);
    return () => {
      listeners.delete(listener);
    };
  },

  privateNotify() {
    listeners.forEach(l => l([...currentNotifications]));
  },

  async loadNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`profile_id.eq.${userId},profile_id.is.null`)
      .order('date', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error('Failed to load notifications:', error);
      return;
    }
    
    currentNotifications = (data || []) as MemberNotification[];
    this.privateNotify();
  },

  async getNotifications(userId: string): Promise<MemberNotification[]> {
    await this.loadNotifications(userId);
    return [...currentNotifications];
  },

  async addNotification(userId: string | null, type: 'class' | 'plan' | 'announcement', title: string, message: string) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        profile_id: userId,
        type,
        title,
        message,
        read: false,
        date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add notification:', error);
      return null;
    }

    currentNotifications = [data as MemberNotification, ...currentNotifications];
    this.privateNotify();
    return data;
  },

  async markAllRead(userId: string) {
    // Optimistically update UI
    currentNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.privateNotify();

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .or(`profile_id.eq.${userId},profile_id.is.null`)
      .eq('read', false);
      
    if (error) {
      console.error('Failed to mark all as read:', error);
      // We could reload here on failure
    }
  },

  getUnreadCount(): number {
    return currentNotifications.filter(n => !n.read).length;
  }
};
