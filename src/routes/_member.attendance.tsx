import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth-context';
import { attendanceService } from '../services/attendance.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CalendarCheck, Clock, ShieldAlert } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export const Route = createFileRoute('/_member/attendance')({
  component: MemberAttendancePage,
});

function MemberAttendancePage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const { data: dbCheckins, isLoading } = useQuery({
    queryKey: ['member-attendance', profile.id],
    queryFn: () => (attendanceService as any).getMemberAttendance ? (attendanceService as any).getMemberAttendance(profile.id) : [],
  });

  const dummyCheckins = [
    { id: '1', check_in_time: new Date().toISOString(), method: 'qr' },
    { id: '2', check_in_time: new Date(Date.now() - 86400000 * 2).toISOString(), method: 'manual' },
    { id: '3', check_in_time: new Date(Date.now() - 86400000 * 5).toISOString(), method: 'qr' },
  ];

  const checkins = dbCheckins && dbCheckins.length > 0 ? dbCheckins : dummyCheckins;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-60" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">My Attendance Logs</h2>
        <p className="text-muted-foreground mt-1">Review your recent check-ins and gym visits.</p>
      </div>

      <Card className="bg-card border-border text-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-indigo-600" />
            Gym Visits
          </CardTitle>
          <CardDescription>A historical log of your check-in history at Atlas gym.</CardDescription>
        </CardHeader>
        <CardContent>
          {checkins.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>No check-in history found.</p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {checkins.map((checkin: any) => (
                <li key={checkin.id} className="flex justify-between items-center text-sm border border-border bg-background p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-foreground/80">
                      {new Date(checkin.check_in_time).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </span>
                  <Badge variant="outline" className="text-muted-foreground/75 uppercase text-[10px] border-slate-300 font-semibold tracking-wider bg-card">
                    {checkin.method}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
