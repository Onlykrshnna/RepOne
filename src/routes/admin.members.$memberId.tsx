import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersService } from '../services/members.service';
import { ArrowLeft, User, Edit2, Archive, Calendar, Dumbbell, CreditCard, Activity, Save, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../lib/auth-context';

export const Route = createFileRoute('/admin/members/$memberId')({
  component: MemberDetailsPage,
});

const editSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  username: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
});

function MemberDetailsPage() {
  const { memberId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { profile: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: () => membersService.getMemberById(memberId),
  });

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: member ? {
      first_name: member.first_name,
      last_name: member.last_name,
      username: member.username || '',
      phone: member.phone || '',
      gender: member.gender || '',
      date_of_birth: member.date_of_birth || '',
      address: member.address || '',
      emergency_contact: member.emergency_contact || '',
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof editSchema>) => membersService.updateMember(memberId, values, file || undefined),
    onSuccess: () => {
      toast.success('Member updated successfully');
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsEditing(false);
      setFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update member');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => membersService.deleteMember(memberId),
    onSuccess: () => {
      toast.success('Member archived successfully');
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to archive member');
    }
  });

  const approveMutation = useMutation({
    mutationFn: () => membersService.approveMember(memberId, currentUser?.id || ''),
    onSuccess: () => {
      toast.success('Membership activated successfully');
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate membership');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32 bg-muted" />
        <Skeleton className="h-[200px] w-full bg-muted" />
      </div>
    );
  }

  if (!member) {
    return <div className="text-muted-foreground">Member not found.</div>;
  }

  const activeMembership = member.member_memberships?.find((m: any) => m.status === 'active');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate({ to: '/admin/members' })} className="border-border text-foreground hover:bg-muted shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border shadow-xl">
              <AvatarImage src={member.avatar_url} />
              <AvatarFallback className="bg-muted text-foreground/80 text-xl">
                {member.first_name[0]}{member.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                {member.first_name} {member.last_name}
                <Badge variant={member.is_active ? 'default' : 'secondary'} className={member.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}>
                  {member.is_active ? 'Active Account' : 'Archived'}
                </Badge>
                <Badge variant="outline" className={`uppercase ${member.membership_status === 'active' ? 'border-emerald-500 text-emerald-500' : 'border-indigo-600 text-indigo-600'}`}>
                  {member.membership_status}
                </Badge>
              </h2>
              <p className="text-muted-foreground">{member.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {member.is_active && (
            <>
              {currentUser?.role === 'admin' && member.membership_status !== 'active' && (
                <Button 
                  className="bg-indigo-600 text-white hover:bg-gold/90"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {approveMutation.isPending ? 'Activating...' : 'Activate Membership'}
                </Button>
              )}
              <Button 
                variant="outline" 
                className="border-border bg-card hover:bg-muted/50 text-foreground"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
              <Button 
                variant="outline" 
                className="border-border bg-red-950/20 hover:bg-red-900/50 text-red-400 hover:text-red-300 border-red-900/50"
                onClick={() => {
                  if (confirm('Are you sure you want to archive this member?')) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-muted-foreground">Overview</TabsTrigger>
          <TabsTrigger value="memberships" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-muted-foreground">Memberships</TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-muted-foreground">Attendance</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-muted-foreground">Payments</TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-muted-foreground">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isEditing ? (
            <Card className="bg-card border-border text-foreground">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription className="text-muted-foreground">Update member details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="first_name" render={({ field }) => (
                        <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} className="bg-background border-border text-foreground" /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="last_name" render={({ field }) => (
                        <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} className="bg-background border-border text-foreground" /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} className="bg-background border-border text-foreground" /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="username" render={({ field }) => (
                        <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} className="bg-background border-border text-foreground" /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className="bg-card border-border text-foreground">
                              <SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="date_of_birth" render={({ field }) => (
                        <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} className="bg-background border-border text-foreground " /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} className="bg-background border-border text-foreground" /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="emergency_contact" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} className="bg-background border-border text-foreground" /></FormControl></FormItem>
                      )} />
                      <FormItem className="md:col-span-2">
                        <FormLabel>Update Avatar</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-background border-border text-foreground file:text-slate-700 file:border-0 file:bg-slate-100 file:px-4 file:py-1 file:mr-4 file:rounded hover:file:bg-slate-200 cursor-pointer" />
                        </FormControl>
                      </FormItem>
                    </div>
                    <Button type="submit" className="bg-indigo-600 text-white hover:bg-gold/90" disabled={updateMutation.isPending}>
                      <Save className="mr-2 h-4 w-4" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-card border-border text-foreground lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-indigo-600" /> Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-y-6 text-sm">
                  <div><p className="text-muted-foreground/75 mb-1">Email</p><p>{member.email}</p></div>
                  <div><p className="text-muted-foreground/75 mb-1">Username</p><p>@{member.username || 'N/A'}</p></div>
                  <div><p className="text-muted-foreground/75 mb-1">Phone</p><p>{member.phone || 'N/A'}</p></div>
                  <div><p className="text-muted-foreground/75 mb-1">Gender</p><p className="capitalize">{member.gender || 'N/A'}</p></div>
                  <div><p className="text-muted-foreground/75 mb-1">Date of Birth</p><p>{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground/75 mb-1">Address</p><p>{member.address || 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground/75 mb-1">Emergency Contact</p><p>{member.emergency_contact || 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground/75 mb-1">Joined</p><p>{new Date(member.created_at).toLocaleDateString()}</p></div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-card border-border text-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-indigo-600" /> Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeMembership ? (
                      <div className="space-y-4">
                        <div className="text-2xl font-bold text-indigo-600">{activeMembership.membership_plans?.name}</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground/75">Valid until</span>
                          <span>{new Date(activeMembership.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground/75 italic">No active membership plan.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-card border-border text-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-indigo-600" /> Recent Check-ins</CardTitle>
                  </CardHeader>
                  <CardContent>
                     {member.attendance && member.attendance.length > 0 ? (
                       <ul className="space-y-3">
                         {member.attendance.slice(0, 3).map((a: any) => (
                           <li key={a.id} className="flex justify-between text-sm border-b border-border pb-2 last:border-0">
                             <span>{new Date(a.check_in_time).toLocaleDateString()}</span>
                             <span className="text-muted-foreground/75 uppercase text-xs">{a.method}</span>
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <p className="text-muted-foreground/75 italic text-sm">No recent check-ins.</p>
                     )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="memberships" className="space-y-6">
          <Card className="bg-card border-border text-foreground">
            <CardHeader><CardTitle>Membership History</CardTitle></CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Full membership management will be available in Phase 6.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="bg-card border-border text-foreground">
            <CardHeader><CardTitle>Attendance Records</CardTitle></CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Full attendance tracking will be available in Phase 5.</div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6">
          <Card className="bg-card border-border text-foreground">
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Invoices and payments will be available in Phase 7.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card className="bg-card border-border text-foreground">
            <CardHeader><CardTitle>Body Progress</CardTitle></CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Body measurements tracking will be available in Phase 8.</div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
