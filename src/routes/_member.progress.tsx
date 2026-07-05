import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService, ProgressEntry } from '../services/progress.service';
import { calculateTrend, formatMeasurement } from '../services/progress.utils';
import { useAuth } from '../lib/auth-context';
import { DUMMY_PROGRESS } from '../lib/dummy-data';
import { Activity, ArrowDown, ArrowUp, ChevronLeft, Plus, Scale, Target, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export const Route = createFileRoute('/_member/progress')({
  component: ProgressPage,
});

function ProgressPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === 'admin';

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Set default member id for non-admins once profile loads
  useEffect(() => {
    if (profile && profile.role !== 'admin' && !selectedMemberId) {
      setSelectedMemberId(profile.id);
    }
  }, [profile]);

  const [selectedMemberName, setSelectedMemberName] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProgressEntry>>({});

  // Admin Overview Query
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['progress-overview'],
    queryFn: () => progressService.getAdminProgressOverview(),
    enabled: isAdmin && !selectedMemberId,
  });

  // Member History Query
  const { data: rawHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['progress-history', selectedMemberId],
    queryFn: () => progressService.getMemberProgressHistory(selectedMemberId!),
    enabled: !!selectedMemberId,
  });

  const history = rawHistory && rawHistory.length > 0 ? rawHistory : (historyLoading ? [] : DUMMY_PROGRESS as any[]);


  const addMutation = useMutation({
    mutationFn: (data: Partial<ProgressEntry>) => progressService.addProgress(data),
    onSuccess: () => {
      toast.success('Progress logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['progress-history', selectedMemberId] });
      if (isAdmin) queryClient.invalidateQueries({ queryKey: ['progress-overview'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to save progress')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => progressService.deleteProgress(id),
    onSuccess: () => {
      toast.success('Record deleted');
      queryClient.invalidateQueries({ queryKey: ['progress-history', selectedMemberId] });
    }
  });

  const handleSave = () => {
    addMutation.mutate({
      ...formData,
      member_id: selectedMemberId!
    });
  };

  const openLogDialog = () => {
    // Pre-fill with previous data if exists
    const last = history && history.length > 0 ? history[history.length - 1] : null;
    setFormData({
      weight_kg: last?.weight_kg || undefined,
      height_cm: last?.height_cm || undefined,
      body_fat_percentage: last?.body_fat_percentage || undefined,
      chest_cm: last?.chest_cm || undefined,
      waist_cm: last?.waist_cm || undefined,
      shoulders_cm: last?.shoulders_cm || undefined,
    });
    setDialogOpen(true);
  };

  // ----------------------------------------------------
  // ADMIN OVERVIEW VIEW
  // ----------------------------------------------------
  if (isAdmin && !selectedMemberId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking Overview</h2>
          <p className="text-muted-foreground">Monitor member measurements and identify who needs updates.</p>
        </div>

        <Card className="bg-card border-border text-foreground">
          <CardHeader>
            <CardTitle>Member Roster</CardTitle>
            <CardDescription className="text-muted-foreground">Members needing updates are sorted to the top.</CardDescription>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="space-y-4"><Skeleton className="h-12 w-full bg-background" /><Skeleton className="h-12 w-full bg-background" /></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overview?.map((o) => (
                  <div key={o.member.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border ${o.needsUpdate ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-background'} cursor-pointer hover:bg-muted transition-colors`}
                    onClick={() => {
                      setSelectedMemberId(o.member.id);
                      setSelectedMemberName(o.member.name);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-300">
                        <AvatarImage src={o.member.avatar} />
                        <AvatarFallback className="bg-muted text-xs">{o.member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{o.member.name}</div>
                        <div className="text-xs text-muted-foreground/75">
                          {o.latest ? `Last logged: ${new Date(o.latest.recorded_at).toLocaleDateString()}` : 'No records'}
                        </div>
                      </div>
                    </div>
                    {o.needsUpdate && <Activity className="h-5 w-5 text-amber-500" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // INDIVIDUAL MEMBER PROGRESS VIEW
  // ----------------------------------------------------
  
  // Calculate trends for KPI cards
  const latest = history && history.length > 0 ? history[history.length - 1] : null;
  const previous = history && history.length > 1 ? history[history.length - 2] : null;

  const weightTrend = calculateTrend(latest?.weight_kg, previous?.weight_kg);
  const fatTrend = calculateTrend(latest?.body_fat_percentage, previous?.body_fat_percentage);

  // Format data for Recharts
  const chartData = useMemo(() => {
    if (!history) return [];
    return history.map(h => ({
      date: new Date(h.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: h.weight_kg,
      bmi: h.bmi,
      fat: h.body_fat_percentage,
    }));
  }, [history]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isAdmin && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground" onClick={() => setSelectedMemberId(null)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <h2 className="text-2xl font-bold tracking-tight">
              {isAdmin ? `${selectedMemberName}'s Progress` : 'My Body Progress'}
            </h2>
          </div>
          <p className="text-muted-foreground">Track measurements, weight, and body composition over time.</p>
        </div>
        <Button onClick={openLogDialog} className="bg-indigo-600 text-white hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" /> Log Measurement
        </Button>
      </div>

      {historyLoading ? (
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-32 bg-card" /><Skeleton className="h-32 bg-card" /><Skeleton className="h-32 bg-card" /></div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card border-border text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Weight</CardTitle>
                <Scale className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latest?.weight_kg || '--'} <span className="text-sm font-normal text-muted-foreground/75">kg</span></div>
                {weightTrend && (
                  <p className={`text-xs mt-1 flex items-center ${weightTrend.isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                    {weightTrend.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(weightTrend.value).toFixed(1)} kg since last log
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Body Fat %</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latest?.body_fat_percentage || '--'} <span className="text-sm font-normal text-muted-foreground/75">%</span></div>
                {fatTrend && (
                  <p className={`text-xs mt-1 flex items-center ${fatTrend.isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                    {fatTrend.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    {Math.abs(fatTrend.value).toFixed(1)}% since last log
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">BMI</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{latest?.bmi || '--'}</div>
                <p className="text-xs mt-1 text-muted-foreground/75">
                  {latest?.bmi ? (latest.bmi < 18.5 ? 'Underweight' : latest.bmi < 25 ? 'Normal' : latest.bmi < 30 ? 'Overweight' : 'Obese') : 'Not calculated'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle>Weight & Body Fat Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }}/>
                      <Line yAxisId="left" type="monotone" name="Weight (kg)" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" name="Body Fat %" dataKey="fat" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/75">No data available for chart</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Weight</TableHead>
                      <TableHead className="text-muted-foreground">Fat %</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history?.length === 0 ? (
                      <TableRow className="border-border"><TableCell colSpan={4} className="text-center text-muted-foreground/75 h-24">No records found</TableCell></TableRow>
                    ) : (
                      history?.slice().reverse().map(record => (
                        <TableRow key={record.id} className="border-border">
                          <TableCell className="text-foreground/80">{new Date(record.recorded_at).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium text-foreground">{record.weight_kg ? `${record.weight_kg} kg` : '--'}</TableCell>
                          <TableCell className="text-foreground/80">{record.body_fat_percentage ? `${record.body_fat_percentage}%` : '--'}</TableCell>
                          <TableCell className="text-right">
                             {isAdmin && (
                               <Button variant="ghost" size="sm" className="h-6 text-red-400 hover:text-red-300 hover:bg-red-950/50" onClick={() => deleteMutation.mutate(record.id)}>
                                 Delete
                               </Button>
                             )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Log Progress Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Measurements</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" step="0.1" className="bg-background border-border text-foreground" value={formData.weight_kg || ''} onChange={e => setFormData({...formData, weight_kg: parseFloat(e.target.value) || null})} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" step="0.1" className="bg-background border-border text-foreground" value={formData.height_cm || ''} onChange={e => setFormData({...formData, height_cm: parseFloat(e.target.value) || null})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Body Fat (%)</Label>
                <Input type="number" step="0.1" className="bg-background border-border text-foreground" value={formData.body_fat_percentage || ''} onChange={e => setFormData({...formData, body_fat_percentage: parseFloat(e.target.value) || null})} />
              </div>
              <div className="space-y-2">
                <Label>Muscle Mass (%)</Label>
                <Input type="number" step="0.1" className="bg-background border-border text-foreground" value={formData.muscle_percentage || ''} onChange={e => setFormData({...formData, muscle_percentage: parseFloat(e.target.value) || null})} />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-indigo-600">Tape Measurements (Optional)</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground/75">Chest (cm)</Label>
                   <Input type="number" step="0.5" className="bg-background border-border text-foreground h-8 text-sm" value={formData.chest_cm || ''} onChange={e => setFormData({...formData, chest_cm: parseFloat(e.target.value) || null})} />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground/75">Waist (cm)</Label>
                   <Input type="number" step="0.5" className="bg-background border-border text-foreground h-8 text-sm" value={formData.waist_cm || ''} onChange={e => setFormData({...formData, waist_cm: parseFloat(e.target.value) || null})} />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground/75">Shoulders (cm)</Label>
                   <Input type="number" step="0.5" className="bg-background border-border text-foreground h-8 text-sm" value={formData.shoulders_cm || ''} onChange={e => setFormData({...formData, shoulders_cm: parseFloat(e.target.value) || null})} />
                 </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-border">
              <Label>Notes</Label>
              <Textarea placeholder="How did you feel this week?" className="bg-background border-border text-foreground resize-none" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground/80 hover:bg-muted">Cancel</Button>
            <Button onClick={handleSave} disabled={addMutation.isPending} className="bg-indigo-600 text-white hover:bg-gold/90">
              {addMutation.isPending ? 'Saving...' : 'Save Measurements'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
