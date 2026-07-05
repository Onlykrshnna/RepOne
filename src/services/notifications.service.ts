import { supabase } from '../lib/supabase';

export interface MemberNotification {
  id: string;
  type: 'class' | 'plan' | 'announcement';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

let MOCK_NOTIFICATIONS: MemberNotification[] = [
  { id: '1', type: 'class', title: 'HIIT Class Booking Confirmed', message: 'Your booking for Morning HIIT Blast today at 6:30 PM is confirmed. Get ready to sweat!', date: new Date().toISOString(), read: false },
  { id: '2', type: 'plan', title: 'Membership Activated', message: 'Your Premium Annual Membership has been approved and activated. Welcome to the family!', date: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: '3', type: 'announcement', title: 'Streak Milestone!', message: 'Congratulations! You hit a 5-day check-in streak 🔥 Keep it up!', date: new Date(Date.now() - 3 * 86400000).toISOString(), read: true },
];

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
    this.privateNotify();
    return newNotif;
  },

  markAllRead() {
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n => ({ ...n, read: true }));
    this.privateNotify();
  },

  getUnreadCount(): number {
    return MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  }
};
