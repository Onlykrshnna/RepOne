export interface AdminNotification {
  id: string;
  type: 'request' | 'ticket' | 'payment' | 'system' | 'member';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const NOTIFS_STORAGE_KEY = 'elevate_fitness_notifications';

const getInitialNotifications = (): AdminNotification[] => {
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

let MOCK_ADMIN_NOTIFICATIONS: AdminNotification[] = getInitialNotifications();

const saveNotifications = (notifs: AdminNotification[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
  }
};

type AdminNotificationListener = (notifications: AdminNotification[]) => void;
const listeners = new Set<AdminNotificationListener>();

export const adminNotificationsService = {
  subscribe(listener: AdminNotificationListener) {
    listeners.add(listener);
    // Initial emit
    listener([...MOCK_ADMIN_NOTIFICATIONS]);
    return () => {
      listeners.delete(listener);
    };
  },

  privateNotify() {
    listeners.forEach(l => l([...MOCK_ADMIN_NOTIFICATIONS]));
  },

  addNotification(type: AdminNotification['type'], title: string, message: string): AdminNotification {
    const newNotif: AdminNotification = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      type,
      title,
      message,
      date: new Date().toISOString(),
      read: false
    };
    MOCK_ADMIN_NOTIFICATIONS = [newNotif, ...MOCK_ADMIN_NOTIFICATIONS];
    saveNotifications(MOCK_ADMIN_NOTIFICATIONS);
    this.privateNotify();
    return newNotif;
  },

  markAllRead() {
    MOCK_ADMIN_NOTIFICATIONS = MOCK_ADMIN_NOTIFICATIONS.map(n => ({ ...n, read: true }));
    saveNotifications(MOCK_ADMIN_NOTIFICATIONS);
    this.privateNotify();
  },

  getUnreadCount(): number {
    return MOCK_ADMIN_NOTIFICATIONS.filter(n => !n.read).length;
  },

  async checkGuestPassExpirations() {
    try {
      const { guestPassService } = await import('./guest-pass.service');
      const passes = await guestPassService.getPasses();
      const now = new Date();
      
      passes.forEach(pass => {
        // If expired and not used
        const isExpired = !pass.is_used && new Date(pass.valid_until) < now;
        if (isExpired) {
          const exists = MOCK_ADMIN_NOTIFICATIONS.some(n => 
            n.type === 'ticket' && 
            n.title === 'Guest Pass Expired' && 
            n.message.includes(pass.guest_name)
          );
          
          if (!exists) {
            this.addNotification(
              'ticket',
              'Guest Pass Expired',
              `Guest pass for ${pass.guest_name} (${pass.pass_code}) has expired without being used.`
            );
          }
        }
      });
    } catch (e) {
      console.warn('Error checking guest pass expirations:', e);
    }
  },

  async checkPendingPayments() {
    try {
      const { paymentService } = await import('./payment.service');
      const payments = await paymentService.getAdminPayments({ status: 'pending' });
      
      payments.forEach(p => {
        const name = p.profiles ? `${p.profiles.first_name} ${p.profiles.last_name}` : 'A member';
        const planName = p.membership_plans?.name || 'Package';
        const amount = p.amount;
        
        const exists = MOCK_ADMIN_NOTIFICATIONS.some(n => 
          n.type === 'payment' && 
          (n.message.includes(p.transaction_reference || '') || n.message.includes(p.id))
        );
        
        if (!exists) {
          this.addNotification(
            'payment',
            'Pending Payment Review',
            `${name} has requested approval for ${planName} (₹${amount}) with transaction ref: ${p.transaction_reference || 'N/A'}.`
          );
        }
      });
    } catch (e) {
      console.warn('Error checking pending payments:', e);
    }
  }
};
