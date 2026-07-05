import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import { dashboardService } from '../services/dashboard.service';
import { useAuth } from '../lib/auth-context';
import { toast } from 'sonner';
import { Receipt, Download, AlertCircle, CreditCard, TrendingUp, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

export const Route = createFileRoute('/_member/payments')({
  component: PaymentHistoryPage,
});

function PaymentHistoryPage() {
  const { profile } = useAuth();

  const { data: rawPayments, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ['member-payments', profile?.id],
    queryFn: () => paymentService.getMemberPayments(profile!.id),
    enabled: !!profile,
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['member-dashboard', profile?.id],
    queryFn: () => dashboardService.getMemberDashboard(profile!.id),
    enabled: !!profile,
  });

  const payments = rawPayments || [];

  const handleDownloadInvoice = (payment: any) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to view invoice.');
      return;
    }
    const planName = payment.membership_plans?.name || 'Gym Package';
    const amount = payment.amount;
    const invNum = `INV-${payment.id.split('-')[0].toUpperCase()}`;
    const date = new Date(payment.payment_date).toLocaleDateString();
    
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invNum}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); padding: 30px; border-radius: 10px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #4F46E5; letter-spacing: -1px; }
            .inv-details { text-align: right; font-size: 14px; color: #666; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 12px; color: #888; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .billing-info { display: flex; justify-content: space-between; }
            .billing-info div { width: 45%; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f7f9fa; color: #555; font-weight: bold; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .total-row td { font-weight: bold; border-top: 2px solid #eee; border-bottom: none; font-size: 16px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="logo">ELEVATE FITNESS</div>
              <div class="inv-details">
                <div><strong>Invoice Reference:</strong> ${invNum}</div>
                <div><strong>Date:</strong> ${date}</div>
                <div><strong>Status:</strong> ${payment.status.toUpperCase()}</div>
              </div>
            </div>
            
            <div class="section billing-info">
              <div>
                <div class="section-title">Merchant</div>
                <strong>Elevate Fitness Ltd.</strong><br/>
                100 Gym Lane, Elevate Park<br/>
                billing@elevatefitness.com
              </div>
              <div>
                <div class="section-title">Bill To</div>
                <strong>Member Account</strong><br/>
                Email: ${profile?.email || 'Registered Member'}<br/>
                Name: ${profile ? `${profile.first_name} ${profile.last_name}` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Transaction Details</div>
              <table>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Payment Channel</th>
                    <th style="text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${planName} Membership Subscription</td>
                    <td style="text-transform: uppercase;">${payment.payment_method}</td>
                    <td style="text-align: right;">₹ ${amount}</td>
                  </tr>
                  <tr class="total-row">
                    <td></td>
                    <td style="text-align: right;">Total Settle Due:</td>
                    <td style="text-align: right; color: #4F46E5;">₹ ${amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              Thank you for training with ELEVATE FITNESS. If you have any billing queries, please open a support request.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Payments</h2>
        <p className="text-muted-foreground">Manage your membership subscriptions and payment history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Active Plan Card */}
        <Card className="md:col-span-1 bg-card border-border text-foreground flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Current Subscription</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isDashboardLoading ? (
               <Skeleton className="h-32 w-full bg-background rounded-lg" />
            ) : (() => {
              const plan = dashboardData?.activePlan;
              const daysLeft = dashboardData?.daysRemaining;
              
              if (!plan) {
                return (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-border rounded-lg p-6 text-center space-y-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-foreground font-bold text-lg">No Active Plan</div>
                    <div className="text-sm text-muted-foreground">
                      Purchase a plan to see details here.
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 rounded-lg p-6 text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-indigo-600 font-bold text-lg">{plan.membership_plans?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Valid until {new Date(plan.end_date).toLocaleDateString()}
                  </div>
                  <div className="inline-flex items-center justify-center gap-2 bg-card rounded-full px-4 py-2 border border-border shadow-sm">
                    <span className="text-2xl font-extrabold text-foreground">{daysLeft !== undefined ? daysLeft : '-'}</span>
                    <span className="text-xs text-muted-foreground/75 uppercase tracking-wider">Days Left</span>
                  </div>
                  {daysLeft !== null && daysLeft !== undefined && daysLeft <= 7 && (
                     <div className="text-xs text-amber-500 flex items-center justify-center gap-1">
                       <AlertCircle className="h-3 w-3" /> Your plan expires soon
                     </div>
                  )}
                </div>
              );
            })()}
          </CardContent>

        </Card>

        {/* Payment History Table */}
        <Card className="md:col-span-2 bg-card border-border text-foreground">
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
            <CardDescription className="text-muted-foreground">View and download your past invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Plan</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-muted-foreground">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPaymentsLoading ? (
                    <TableRow className="border-border"><TableCell colSpan={5} className="h-24"><Skeleton className="h-full w-full bg-background" /></TableCell></TableRow>
                  ) : payments?.length === 0 ? (
                    <TableRow className="border-border">
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground/75">No payment history found.</TableCell>
                    </TableRow>
                  ) : (
                    payments?.map((payment) => (
                      <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                        <TableCell className="text-foreground/80">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.membership_plans?.name || 'Custom'}
                        </TableCell>
                        <TableCell className="text-foreground font-medium">
                          ₹{payment.amount} {payment.currency}
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
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => handleDownloadInvoice(payment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
