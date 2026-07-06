import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth-context';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { membersService } from '../services/members.service';

export const Route = createFileRoute('/admin/membership-requests')({
  component: MembershipRequestsPage,
});

function MembershipRequestsPage() {
  const { profile: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'request_changes' | null>(null);
  const [searchUsername, setSearchUsername] = useState('');

  const { data: payments, isLoading } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: async () => {
      console.log('[LIFECYCLE STEP 4] Admin page fetching pending payments...');
      const response = await supabase
        .from('payments')
        .select('*, profiles!profile_id(*), membership_plans!membership_plan_id(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (response.error) {
        console.error('[LIFECYCLE ERROR] Failed fetching pending payments:', response.error);
        throw response.error;
      }
      console.log(`[LIFECYCLE STEP 5] Number of pending payments returned: ${response.data.length}`);
      if (response.data.length === 0) {
        console.log('[LIFECYCLE STEP 5.1] Zero rows returned. Complete Supabase response object:', response);
      }
      return response.data;
    },
  });

  useEffect(() => {
    console.log('[LIFECYCLE STEP 6] Realtime subscription connecting...');
    const channel = supabase.channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          console.log('[LIFECYCLE STEP 7] Realtime INSERT event received:', payload);
        } else {
          console.log('[LIFECYCLE UPDATE] Realtime event received:', payload);
        }
        queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[LIFECYCLE STEP 6] Realtime subscription connected successfully.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const approveMutation = useMutation({
    mutationFn: (memberId: string) => {
      console.log('[LIFECYCLE STEP 8] Admin approval clicked for member ID:', memberId);
      return membersService.approveMember(memberId, currentUser?.id || '');
    },
    onSuccess: () => {
      console.log('[LIFECYCLE STEP 10] RPC completed successfully. UI refreshing.');
      toast.success('Membership approved');
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
    },
    onError: (err: any) => {
      console.error('[LIFECYCLE ERROR] Admin approval failed:', err);
      toast.error(err.message || 'Failed to approve payment.');
    }
  });

  const approveByUsernameMutation = useMutation({
    mutationFn: (username: string) => membersService.approveMemberByUsername(username, currentUser?.id || ''),
    onSuccess: () => {
      toast.success('Member approved successfully by username');
      setSearchUsername('');
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to approve member.');
    }
  });

  const handleApproveByUsername = () => {
    if (!searchUsername.trim()) return;
    approveByUsernameMutation.mutate(searchUsername.trim());
  };

  const actionMutation = useMutation({
    mutationFn: (data: { paymentId: string, profileId: string, action: 'reject' | 'request_changes', notes: string }) => 
      data.action === 'reject' ? membersService.rejectMember(data.profileId, data.notes) : membersService.requestChangesMember(data.profileId, data.notes),
    onSuccess: (_, variables) => {
      toast.success(`Membership ${variables.action === 'reject' ? 'rejected' : 'changes requested'}`);
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      setDialogOpen(false);
      setNotes('');
    }
  });

  const handleActionClick = (payment: any, action: 'reject' | 'request_changes') => {
    setSelectedPayment(payment);
    setActionType(action);
    setNotes(payment.profiles?.admin_notes || '');
    setDialogOpen(true);
  };

  const submitAction = () => {
    if (!selectedPayment || !actionType) return;
    actionMutation.mutate({ 
      paymentId: selectedPayment.id, 
      profileId: selectedPayment.profile_id, 
      action: actionType, 
      notes 
    });
  };

  const pendingPayments = payments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Membership Requests</h2>
          <p className="text-muted-foreground">Review and approve new member registrations.</p>
        </div>
        <div className="bg-card border border-border p-3 rounded-md flex items-center gap-3">
          <Input 
            placeholder="Approve by Username..." 
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="w-56 bg-background text-sm"
          />
          <Button 
            onClick={handleApproveByUsername} 
            disabled={!searchUsername || approveByUsernameMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-foreground"
          >
            Approve
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">Member</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Payment Details</TableHead>
              <TableHead className="text-muted-foreground">Reference</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-10 w-[150px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px] bg-muted" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : pendingPayments.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground/75">
                  No pending requests.
                </TableCell>
              </TableRow>
            ) : (
              pendingPayments.map((payment) => {
                const member = payment.profiles;
                const plan = payment.membership_plans;
                
                return (
                  <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={member?.avatar_url || ''} />
                          <AvatarFallback className="bg-muted text-foreground/80">
                            {member?.first_name?.[0]}{member?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground/90">{member?.first_name} {member?.last_name}</span>
                          <span className="text-xs text-muted-foreground">{member?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{plan?.name || 'Unknown Plan'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {payment.currency} {payment.amount}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {payment.payment_method?.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.transaction_reference ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded border border-border">
                          {payment.transaction_reference}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-900/50 bg-red-950/20 hover:bg-red-900/50 text-red-400"
                        onClick={() => handleActionClick(payment, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-emerald-500 text-foreground hover:bg-emerald-600"
                        onClick={() => approveMutation.mutate(member?.id || '')}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'reject' ? 'Reject Membership' : 'Request Changes'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {actionType === 'reject' 
                ? 'Are you sure you want to reject this request? Please provide a reason.' 
                : 'Provide notes or instructions for the user to resolve before approval.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Enter notes here..." 
              className="bg-background border-border text-foreground min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground/80 hover:bg-muted">
              Cancel
            </Button>
            <Button 
              className={actionType === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 text-white hover:bg-gold/90'}
              onClick={submitAction}
              disabled={actionMutation.isPending || !notes.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
