import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import { useState } from 'react';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';

export const Route = createFileRoute('/admin/members')({
  component: MembersPage,
});

function MembersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: dbMembers, isLoading } = useQuery({
    queryKey: ['members', search, statusFilter],
    queryFn: () => membersService.getMembers({ 
      search: search.length >= 2 ? search : undefined, 
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }),
  });

  const members = dbMembers || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersService.deleteMember(id),
    onSuccess: () => {
      toast.success('Member archived successfully');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to archive member');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">Manage your gym members, memberships, and status.</p>
        </div>
        <Button onClick={() => navigate({ to: '/admin/members/add' })} className="bg-indigo-600 text-white hover:bg-gold/90">
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/75" />
          <Input
            placeholder="Search by name, email or username..."
            className="pl-9 bg-card border-border text-foreground w-full sm:max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border text-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-muted/50">
              <TableHead className="text-muted-foreground">Profile</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Join Date</TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-10 w-10 rounded-full bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px] bg-muted" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px] bg-muted" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto bg-muted" /></TableCell>
                </TableRow>
              ))
            ) : members?.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground/75">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              members?.map((member) => {
                const activeMembership = member.member_memberships?.find((m: any) => m.status === 'active');
                return (
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
                          <span className="font-medium text-foreground/90">{member.first_name} {member.last_name}</span>
                          {member.username && <span className="text-xs text-indigo-400 font-semibold">@{member.username}</span>}
                          {!member.is_active && <span className="text-xs text-red-400">Archived</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span>{member.email}</span>
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activeMembership ? (
                        <span className="text-foreground/80">{activeMembership.membership_plans?.name}</span>
                      ) : (
                        <span className="text-muted-foreground/75 italic">No Active Plan</span>
                      )}
                    </TableCell>
                    <TableCell>
                       <Badge variant={member.is_active ? 'default' : 'secondary'} className={member.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground/80">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/members/$memberId" params={{ memberId: member.id }} className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:text-foreground">
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted" />
                          {member.is_active && (
                            <DropdownMenuItem 
                              className="text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
                              onClick={() => {
                                if (confirm('Are you sure you want to archive this member?')) {
                                  deleteMutation.mutate(member.id);
                                }
                              }}
                            >
                              Archive Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
