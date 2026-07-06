import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Bell, Info, Calendar, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { notificationsService, MemberNotification } from '../services/notifications.service';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth-context';

export const Route = createFileRoute('/_member/notifications')({
  component: MemberNotificationsPage,
});

function MemberNotificationsPage() {
  const { profile } = useAuth();
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['member-notifications', profile?.id],
    queryFn: () => notificationsService.getNotifications(profile!.id),
    enabled: !!profile?.id,
  });

  const markAllRead = () => {
    notificationsService.markAllRead(profile!.id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'class': return <Calendar className="h-5 w-5 text-indigo-600" />;
      case 'plan': return <Award className="h-5 w-5 text-emerald-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h2>
          <p className="text-muted-foreground mt-1">Stay updated with class schedules and membership updates.</p>
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
              <p>No new notifications at this time.</p>
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
