import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import { usePaymentsRealtime } from '../hooks/usePaymentsRealtime';
import { useAuth } from '../lib/auth-context';
import { useState } from 'react';
import { CheckCircle2, XCircle, FileText, Search, Download, ExternalLink, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export const Route = createFileRoute('/admin/payments')({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  usePaymentsRealtime();
  const queryClient = useQueryClient();
  const { profile: currentUser } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'reject' | 'approve' | 'view_proof' | null>(null);

  const { data: dbPayments, isLoading } = useQuery({
    queryKey: ['admin-payments', statusFilter, search],
    queryFn: () => paymentService.getAdminPayments({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search.length > 2 ? search : undefined
    }),
  });

  // Fall back to rich dummy data when DB is empty
  const payments = dbPayments && dbPayments.length > 0 ? dbPayments : [];

  const { data: revenue } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: paymentService.getDashboardRevenue
  });


  const actionMutation = useMutation({
    mutationFn: (data: { id: string, action: 'approve' | 'reject', notes?: string }) => {
      if (data.action === 'approve') return paymentService.approvePayment(data.id, currentUser!.id);
      return paymentService.rejectPayment(data.id, currentUser!.id, data.notes || '');
    },
    onSuccess: (_, vars) => {
      toast.success(vars.action === 'approve' ? 'Payment approved & Membership activated' : 'Payment rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message || 'Action failed')
  });

  const downloadCSV = () => {
    if (!payments || payments.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Date', 'Member', 'Plan', 'Amount', 'Method', 'Ref', 'Status'];
    const rows = payments.map(r => [
      new Date(r.payment_date).toLocaleString(),
      `${r.profiles?.first_name} ${r.profiles?.last_name}`,
      r.membership_plans?.name || 'Unknown',
      `${r.amount} ${r.currency}`,
      r.payment_method,
      r.transaction_reference || 'N/A',
      r.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAction = (payment: any, type: 'approve' | 'reject' | 'view_proof') => {
    setSelectedPayment(payment);
    setActionType(type);
    setNotes('');
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments & Invoices</h2>
          <p className="text-muted-foreground">Manage membership payments and approvals.</p>
        </div>
        <Button onClick={downloadCSV} variant="outline" className="border-border bg-card text-foreground hover:bg-muted/50">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <span className="text-indigo-600 text-lg">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{revenue?.today?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <span className="text-indigo-600 text-lg">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{revenue?.month?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border text-foreground min-w-0 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/75" />
              <Input
                placeholder="Search member, email, or reference..."
                className="pl-9 bg-background border-border text-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Member</TableHead>
                  <TableHead className="text-muted-foreground">Plan</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Method</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-border"><TableCell colSpan={7} className="h-24"><Skeleton className="h-full w-full bg-background" /></TableCell></TableRow>
                ) : payments?.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground/75">No payments found.</TableCell>
                  </TableRow>
                ) : (
                  payments?.map((payment) => (
                    <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-foreground/80">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-muted text-[10px]">{payment.profiles?.first_name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{payment.profiles?.first_name} {payment.profiles?.last_name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground/80">{payment.membership_plans?.name || 'Custom'}</TableCell>
                      <TableCell className="font-medium text-foreground">₹{payment.amount} {payment.currency}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-background border-border text-muted-foreground uppercase text-[10px]">
                          {payment.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`uppercase text-[10px]
                          ${payment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                          ${payment.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                          ${payment.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                        `}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {payment.payment_proof && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => openAction(payment, 'view_proof')} title="View Proof">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {payment.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-900/50" onClick={() => openAction(payment, 'reject')}>
                              Reject
                            </Button>
                            <Button size="sm" className="h-8 bg-emerald-500 text-foreground hover:bg-emerald-600" onClick={() => openAction(payment, 'approve')}>
                              Approve
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Payment'}
              {actionType === 'reject' && 'Reject Payment'}
              {actionType === 'view_proof' && 'Payment Proof'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {actionType === 'approve' && 'This will mark the payment as completed and automatically activate the member\'s subscription plan.'}
              {actionType === 'reject' && 'This will reject the payment. Please provide a reason below.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedPayment && (
              <div className="bg-background p-4 rounded-md border border-border text-sm">
                <div className="grid grid-cols-2 gap-2 text-foreground/80">
                  <div><strong>Member:</strong> {selectedPayment.profiles?.first_name} {selectedPayment.profiles?.last_name}</div>
                  <div><strong>Plan:</strong> {selectedPayment.membership_plans?.name}</div>
                  <div><strong>Amount:</strong> ₹{selectedPayment.amount} {selectedPayment.currency}</div>
                  <div><strong>Method:</strong> {selectedPayment.payment_method}</div>
                  <div className="col-span-2"><strong>Reference:</strong> {selectedPayment.transaction_reference || 'None provided'}</div>
                </div>
              </div>
            )}

            {actionType === 'view_proof' && selectedPayment?.payment_proof && (
              <div className="bg-background p-4 rounded-md border border-border overflow-hidden text-center">
                {selectedPayment.payment_proof.startsWith('http') || selectedPayment.payment_proof.startsWith('data:image') ? (
                  <img src={selectedPayment.payment_proof} alt="Payment Proof" className="max-w-full h-auto mx-auto rounded" />
                ) : (
                  <div className="text-muted-foreground break-all">{selectedPayment.payment_proof}</div>
                )}
              </div>
            )}

            {actionType === 'reject' && (
              <div className="space-y-2">
                <Textarea 
                  placeholder="Reason for rejection (e.g. Invalid reference number)..." 
                  className="bg-background border-border text-foreground min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-border text-foreground/80 hover:bg-muted">
              {actionType === 'view_proof' ? 'Close' : 'Cancel'}
            </Button>
            {actionType === 'approve' && (
              <Button onClick={() => actionMutation.mutate({ id: selectedPayment.id, action: 'approve' })} disabled={actionMutation.isPending} className="bg-emerald-500 text-foreground hover:bg-emerald-600">
                Confirm & Activate
              </Button>
            )}
            {actionType === 'reject' && (
              <Button onClick={() => actionMutation.mutate({ id: selectedPayment.id, action: 'reject', notes })} disabled={actionMutation.isPending || !notes.trim()} className="bg-red-500 text-foreground hover:bg-red-600">
                Reject Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
