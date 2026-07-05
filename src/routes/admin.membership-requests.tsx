import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';

export const Route = createFileRoute('/admin/membership-requests')({
  component: MembershipRequestsPage,
});

function MembershipRequestsPage() {
  const { profile: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'reject' | 'request_changes' | null>(null);
  const [searchUsername, setSearchUsername] = useState('');

  const { data: dbMembers, isLoading } = useQuery({
    queryKey: ['members', 'pending'],
    queryFn: () => membersService.getMembers({ status: 'pending' }),
  });

  const members = dbMembers || [];


  const approveMutation = useMutation({
    mutationFn: (id: string) => membersService.approveMember(id, currentUser?.id || ''),
    onSuccess: () => {
      toast.success('Membership approved');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    }
  });

  const approveByUsernameMutation = useMutation({
    mutationFn: (username: string) => membersService.approveMemberByUsername(username, currentUser?.id || ''),
    onSuccess: () => {
      toast.success('Member approved successfully by username');
      setSearchUsername('');
      queryClient.invalidateQueries({ queryKey: ['members'] });
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
    mutationFn: (data: { id: string, action: 'reject' | 'request_changes', notes: string }) => 
      data.action === 'reject' ? membersService.rejectMember(data.id, data.notes) : membersService.requestChangesMember(data.id, data.notes),
    onSuccess: (_, variables) => {
      toast.success(`Membership ${variables.action === 'reject' ? 'rejected' : 'changes requested'}`);
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setDialogOpen(false);
      setNotes('');
    }
  });

  const handleActionClick = (member: any, action: 'reject' | 'request_changes') => {
    setSelectedMember(member);
    setActionType(action);
    setNotes(member.admin_notes || '');
    setDialogOpen(true);
  };

  const submitAction = () => {
    if (!selectedMember || !actionType) return;
    actionMutation.mutate({ id: selectedMember.id, action: actionType, notes });
  };

  // Filter pending in memory just in case API returns all status
  const pendingMembers = members?.filter(m => m.membership_status === 'pending') || [];

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

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">Profile</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Requested</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-10 w-[150px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] bg-muted" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : pendingMembers.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground/75">
                  No pending requests.
                </TableCell>
              </TableRow>
            ) : (
              pendingMembers.map((member) => (
                <TableRow key={member.id} className="border-border hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="bg-muted text-foreground/80">
                          {member.first_name[0]}{member.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Link to="/admin/members/$memberId" params={{ memberId: member.id }} className="font-medium text-foreground/90 hover:underline">
                          {member.first_name} {member.last_name}
                        </Link>
                        <span className="text-xs text-indigo-400 font-semibold">@{member.username || member.email?.split('@')[0] || 'member'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <span>{member.email}</span>
                      {member.phone && <span>{member.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {member.membership_requested_at ? new Date(member.membership_requested_at).toLocaleDateString() : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-border bg-background hover:bg-muted text-foreground/80"
                      onClick={() => handleActionClick(member, 'request_changes')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Feedback
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-900/50 bg-red-950/20 hover:bg-red-900/50 text-red-400"
                      onClick={() => handleActionClick(member, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-emerald-500 text-foreground hover:bg-emerald-600"
                      onClick={() => approveMutation.mutate(member.id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
