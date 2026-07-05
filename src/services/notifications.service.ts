import { supabase } from '../lib/supabase';

export interface MemberNotification {
  id: string;
  type: 'class' | 'plan' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const NOTIFS_STORAGE_KEY = 'elevate_fitness_member_notifications';

const getInitialNotifications = (): MemberNotification[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(NOTIFS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored notifications', e);
    }
  }
  return [];
};

let MOCK_NOTIFICATIONS: MemberNotification[] = getInitialNotifications();

const saveNotifications = (notifs: MemberNotification[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
  }
};

type NotificationListener = (notifications: MemberNotification[]) => void;
const listeners = new Set<NotificationListener>();

export const notificationsService = {
  subscribe(listener: NotificationListener) {
    listeners.add(listener);
    // Emit initial values
    listener([...MOCK_NOTIFICATIONS]);
    return () => {
      listeners.delete(listener);
    };
  },

  privateNotify() {
    listeners.forEach(l => l([...MOCK_NOTIFICATIONS]));
  },

  async getNotifications(): Promise<MemberNotification[]> {
    return [...MOCK_NOTIFICATIONS];
  },

  addNotification(type: 'class' | 'plan' | 'announcement', title: string, message: string): MemberNotification {
    const newNotif: MemberNotification = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      type,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    };
    MOCK_NOTIFICATIONS = [newNotif, ...MOCK_NOTIFICATIONS];
    saveNotifications(MOCK_NOTIFICATIONS);
    this.privateNotify();
    return newNotif;
  },

  markAllRead() {
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n => ({ ...n, read: true }));
    saveNotifications(MOCK_NOTIFICATIONS);
    this.privateNotify();
  },

  getUnreadCount(): number {
    return MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  }
};
