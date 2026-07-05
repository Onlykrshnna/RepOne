import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipService, MembershipPlan } from '../services/membership.service';
import { DUMMY_MEMBERSHIP_PLANS } from '../lib/dummy-data';
import { useState } from 'react';
import { Plus, Edit2, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';

export const Route = createFileRoute('/admin/memberships')({
  component: AdminMembershipPlansPage,
});

function AdminMembershipPlansPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<MembershipPlan> | null>(null);

  const { data: dbPlans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => membershipService.getPlans(true), // Include inactive
  });

  const plans = dbPlans && dbPlans.length > 0 ? dbPlans : (isLoading ? [] : DUMMY_MEMBERSHIP_PLANS as any[]);

  const saveMutation = useMutation({
    mutationFn: (plan: Partial<MembershipPlan>) => {
      if (plan.id) {
        return membershipService.updatePlan(plan.id, plan);
      }
      return membershipService.createPlan(plan);
    },
    onSuccess: () => {
      toast.success(editingPlan?.id ? 'Plan updated' : 'Plan created');
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to save plan')
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => membershipService.deletePlan(id),
    onSuccess: () => {
      toast.success('Plan archived successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to archive plan')
  });

  const openDialog = (plan?: MembershipPlan) => {
    if (plan) {
      setEditingPlan({ ...plan });
    } else {
      setEditingPlan({
        name: '',
        description: '',
        price: 0,
        duration_days: 30,
        features: ['Full Gym Access'],
        is_active: true,
        color: '#D4AF37',
        display_order: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPlan) saveMutation.mutate(editingPlan);
  };

  const updateFeature = (index: number, val: string) => {
    if (!editingPlan?.features) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = val;
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const addFeature = () => {
    if (!editingPlan) return;
    const f = editingPlan.features || [];
    setEditingPlan({ ...editingPlan, features: [...f, ''] });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan?.features) return;
    const f = [...editingPlan.features];
    f.splice(index, 1);
    setEditingPlan({ ...editingPlan, features: f });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Membership Plans</h2>
          <p className="text-muted-foreground">Manage pricing and subscription tiers.</p>
        </div>
        <Button onClick={() => openDialog()} className="bg-indigo-600 text-white hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" /> Create Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full bg-card border-border rounded-xl" />
          ))
        ) : plans?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground/75 border border-dashed border-border rounded-xl">
            No membership plans found. Create one to get started.
          </div>
        ) : (
          plans?.map((plan) => (
            <Card key={plan.id} className={`bg-card border-border text-foreground flex flex-col ${!plan.is_active ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full opacity-20" style={{ backgroundColor: plan.color || '#D4AF37' }} />
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'} className={`uppercase text-[10px] ${plan.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      {plan.is_active ? 'Active' : 'Archived'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">₹{plan.price}</span>
                    <span className="text-xs text-muted-foreground/75 block">/ {plan.duration_days} days</span>
                  </div>
                </div>
                {plan.description && <CardDescription className="text-muted-foreground mt-2">{plan.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-foreground/80">
                  {plan.features?.map((f: any, i: any) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4 border-t border-zinc-900 flex gap-2">
                <Button variant="outline" className="flex-1 border-border hover:bg-muted text-foreground/80" onClick={() => openDialog(plan)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                {plan.is_active && (
                  <Button variant="outline" className="flex-1 border-red-900/30 text-red-400 hover:bg-red-950" onClick={() => archiveMutation.mutate(plan.id)}>
                    <Archive className="h-4 w-4 mr-2" /> Archive
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan?.id ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input 
                  className="bg-background border-border text-foreground" 
                  value={editingPlan?.name || ''} 
                  onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Theme Color</Label>
                <div className="flex gap-2">
                   <Input 
                    type="color"
                    className="bg-background border-border text-foreground w-12 p-1 h-10" 
                    value={editingPlan?.color || '#D4AF37'} 
                    onChange={e => setEditingPlan({...editingPlan, color: e.target.value})}
                  />
                  <Input 
                    className="bg-background border-border text-foreground flex-1" 
                    value={editingPlan?.color || '#D4AF37'} 
                    onChange={e => setEditingPlan({...editingPlan, color: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                className="bg-background border-border text-foreground resize-none" 
                value={editingPlan?.description || ''} 
                onChange={e => setEditingPlan({...editingPlan, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input 
                  type="number"
                  className="bg-background border-border text-foreground" 
                  value={editingPlan?.price || 0} 
                  onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input 
                  type="number"
                  className="bg-background border-border text-foreground" 
                  value={editingPlan?.duration_days || 30} 
                  onChange={e => setEditingPlan({...editingPlan, duration_days: parseInt(e.target.value, 10)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Features</Label>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-indigo-600 hover:text-gold hover:bg-gold/10" onClick={addFeature}>
                  + Add Feature
                </Button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {editingPlan?.features?.map((f: any, i: any) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      className="bg-background border-border text-foreground flex-1 h-8 text-sm" 
                      value={f} 
                      onChange={e => updateFeature(i, e.target.value)}
                    />
                    <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 border-red-900/30 text-red-500 hover:bg-red-950" onClick={() => removeFeature(i)}>
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="active-toggle"
                checked={editingPlan?.is_active || false}
                onChange={e => setEditingPlan({...editingPlan, is_active: e.target.checked})}
                className="w-4 h-4 accent-gold bg-background border-border"
              />
              <Label htmlFor="active-toggle" className="cursor-pointer">Plan is Active (Visible to Members)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground/80 hover:bg-muted">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !editingPlan?.name} className="bg-indigo-600 text-white hover:bg-gold/90">
              {saveMutation.isPending ? 'Saving...' : 'Save Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
