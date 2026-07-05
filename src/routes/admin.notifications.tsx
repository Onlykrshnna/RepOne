import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Bell, ShieldCheck, Ticket, Users, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminNotificationsService, AdminNotification } from '../services/admin-notifications.service';

export const Route = createFileRoute('/admin/notifications')({
  component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    return adminNotificationsService.subscribe(setNotifications);
  }, []);

  const markAllRead = () => {
    adminNotificationsService.markAllRead();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'request': return <Users className="h-5 w-5 text-indigo-600" />;
      case 'ticket': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Console Notifications</h2>
          <p className="text-muted-foreground mt-1">Monitor operational system events, memberships, and issues.</p>
        </div>
        <button 
          onClick={markAllRead} 
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-0 divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>No operational notifications at this time.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 flex gap-4 transition-colors ${notif.read ? 'bg-transparent' : 'bg-indigo-500/5'}`}
              >
                <div className={`p-2.5 rounded-full bg-background border border-border h-fit shrink-0`}>
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-foreground text-base">{notif.title}</h4>
                    <span className="text-xs text-muted-foreground/70 shrink-0">
                      {new Date(notif.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
