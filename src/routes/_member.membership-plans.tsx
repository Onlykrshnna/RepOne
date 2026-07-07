import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { membershipService } from '../services/membership.service';
import { paymentService } from '../services/payment.service';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import {
  CheckCircle2, ShieldAlert, Sparkles, Flame, Zap,
  CreditCard, Calendar, CalendarCheck, Clock, ArrowRight,
  AlertTriangle, CheckCircle, Receipt, RefreshCw, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/_member/membership-plans')({
  component: MembershipPlansPage,
});

function MembershipPlansPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Fetch active member row using profile_id (as stored by the approval RPC)
  const { data: memberRow, isLoading: memberLoading } = useQuery({
    queryKey: ['member-row', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          profile_id,
          membership_plan_id,
          join_date,
          expiry_date,
          status
        `)
        .eq('profile_id', profile!.id)
        .eq('status', 'active')
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.warn('[MembershipPage] members query error:', error);
        return null;
      }
      return data;
    },
    enabled: !!profile?.id,
  });

  // Fetch the plan details for the active member row
  const { data: activePlanDetails, isLoading: planDetailsLoading } = useQuery({
    queryKey: ['plan-details', memberRow?.membership_plan_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('id, plan_name, description, price, duration_days')
        .eq('id', memberRow!.membership_plan_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!memberRow?.membership_plan_id,
  });

  // Fetch latest approved payment for the current plan
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['member-payments-detail', profile?.id],
    queryFn: () => paymentService.getMemberPayments(profile!.id),
    enabled: !!profile?.id,
  });

  // Fetch all available plans
  const { data: dbPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['active-plans'],
    queryFn: () => membershipService.getPlans(false),
  });

  const plans = dbPlans || [];

  // The most recent approved/completed payment (RPC marks as 'completed')
  const latestApprovedPayment = (payments || []).find((p: any) => p.status === 'approved' || p.status === 'completed');
  const latestPendingPayment = (payments || []).find((p: any) => p.status === 'pending');

  const isLoading = memberLoading || paymentsLoading || planDetailsLoading;
  const hasMembership = !!memberRow && memberRow.status === 'active';
  const isPending = profile?.membership_status === 'pending' && !hasMembership;

  // Days remaining calculation
  const daysRemaining = hasMembership && memberRow?.expiry_date
    ? Math.ceil((new Date(memberRow.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  const handleSelectPlan = (planId: string) => {
    navigate({ to: '/buy-membership', search: { planId } });
  };

  const planButtonLabel = (planId: string) => {
    if (hasMembership && memberRow?.membership_plan_id === planId) {
      if (isExpiringSoon || isExpired) return 'Renew This Plan';
      return 'Current Plan';
    }
    if (hasMembership) return 'Upgrade to This Plan';
    return 'Choose Package';
  };

  const planButtonDisabled = (planId: string) => {
    return hasMembership && memberRow?.membership_plan_id === planId && !isExpiringSoon && !isExpired;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-16">

      {/* ─────────────────────────────────────────
          UPPER HALF — CURRENT MEMBERSHIP STATUS
      ───────────────────────────────────────── */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-foreground">My Membership</h2>
          <p className="text-muted-foreground mt-1">Your current plan, payment details, and validity.</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 bg-card border border-border rounded-2xl" />
            ))}
          </div>
        ) : isPending && !hasMembership ? (
          /* ── PENDING STATE ── */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-amber-950/10 border-amber-800/40 text-foreground">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="p-4 rounded-full bg-amber-500/10 shrink-0">
                  <Clock className="h-10 w-10 text-amber-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-400">Membership Approval Pending</p>
                  <p className="text-muted-foreground text-sm mt-1 max-w-xl">
                    Your payment has been submitted and is awaiting admin approval. You'll be notified once your membership is activated.
                  </p>
                  {latestPendingPayment && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Receipt className="h-4 w-4" />
                        ₹{latestPendingPayment.amount} paid via {latestPendingPayment.payment_method?.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Submitted {new Date(latestPendingPayment.payment_date || latestPendingPayment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : hasMembership ? (
          /* ── ACTIVE MEMBERSHIP DETAILS ── */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Expiry warning banner */}
            {(isExpiringSoon || isExpired) && (
              <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-semibold ${
                isExpired
                  ? 'bg-red-950/20 border-red-800/40 text-red-400'
                  : 'bg-amber-950/20 border-amber-800/40 text-amber-400'
              }`}>
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {isExpired
                  ? 'Your membership has expired. Renew below to continue access.'
                  : `Your membership expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Scroll down to renew.`}
                <ChevronDown className="h-4 w-4 ml-auto animate-bounce" />
              </div>
            )}

            {/* Membership hero card */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Plan identity */}
              <Card className={`md:col-span-1 border text-foreground relative overflow-hidden ${
                isExpired ? 'bg-red-950/10 border-red-800/30' :
                isExpiringSoon ? 'bg-amber-950/10 border-amber-800/30' :
                'bg-gradient-to-br from-indigo-950/30 to-card border-indigo-700/30'
              }`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${isExpired ? 'bg-red-500/10' : isExpiringSoon ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`}>
                      <CreditCard className={`h-6 w-6 ${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-indigo-400'}`} />
                    </div>
                    <Badge className={`text-[10px] font-bold uppercase tracking-wider ${
                      isExpired ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                      isExpiringSoon ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                      'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Plan</p>
                  <p className="text-2xl font-black text-foreground mt-1">{activePlanDetails?.plan_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 flex-1">
                    {activePlanDetails?.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <p className="text-3xl font-black text-indigo-400">₹{activePlanDetails?.price ?? latestApprovedPayment?.amount ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{activePlanDetails?.duration_days} days validity</p>
                  </div>
                </CardContent>
              </Card>

              {/* Date details */}
              <Card className="md:col-span-2 bg-card border-border text-foreground">
                <CardContent className="p-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-5">Validity Details</p>
                  <div className="grid grid-cols-2 gap-5 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="h-3.5 w-3.5" /> Start Date
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {memberRow.join_date
                          ? new Date(memberRow.join_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <CalendarCheck className="h-3.5 w-3.5" /> Expiry Date
                      </div>
                      <p className={`text-lg font-bold ${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-foreground'}`}>
                        {memberRow.expiry_date
                          ? new Date(memberRow.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Clock className="h-3.5 w-3.5" /> Days Remaining
                      </div>
                      <p className={`text-3xl font-black ${
                        isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isExpired ? '0' : daysRemaining ?? '—'}
                        <span className="text-sm font-medium text-muted-foreground ml-1">days</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <CheckCircle className="h-3.5 w-3.5" /> Member Since
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {memberRow.join_date && memberRow.expiry_date && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Plan Progress</span>
                        <span>{isExpired ? '100%' : `${Math.max(0, Math.min(100, Math.round(100 - (((daysRemaining ?? 0) / (activePlanDetails?.duration_days || 30)) * 100)))).toFixed(0)}% used`}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-amber-400' : 'bg-indigo-500'
                          }`}
                          style={{
                            width: isExpired ? '100%' : `${Math.max(2, Math.min(100, 100 - Math.round(((daysRemaining ?? 0) / (activePlanDetails?.duration_days || 30)) * 100))).toFixed(0)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment receipt row */}
            {latestApprovedPayment && (
              <Card className="bg-card border-border text-foreground">
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Last Payment</p>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Receipt className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-foreground">₹{latestApprovedPayment.amount}</p>
                        <p className="text-xs text-muted-foreground capitalize">{latestApprovedPayment.payment_method?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-border hidden sm:block" />
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Date</p>
                      <p className="font-semibold text-foreground">
                        {new Date(latestApprovedPayment.payment_date || latestApprovedPayment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    {latestApprovedPayment.transaction_reference && (
                      <>
                        <div className="w-px h-10 bg-border hidden sm:block" />
                        <div>
                          <p className="text-xs text-muted-foreground">Transaction Ref</p>
                          <code className="text-xs bg-muted px-2 py-1 rounded border border-border font-mono">
                            {latestApprovedPayment.transaction_reference}
                          </code>
                        </div>
                      </>
                    )}
                    <div className="ml-auto">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[10px] font-bold tracking-wider">
                        <CheckCircle className="h-3 w-3 mr-1" /> Approved
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}



          </motion.div>
        ) : (
          /* ── NO MEMBERSHIP YET ── */
          <Card className="bg-card border-border text-foreground">
            <CardContent className="flex items-center gap-6 p-8">
              <div className="p-4 rounded-full bg-muted shrink-0">
                <CreditCard className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">No Active Membership</p>
                <p className="text-muted-foreground text-sm mt-1">Choose a plan below to get started.</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground ml-auto animate-pulse" />
            </CardContent>
          </Card>
        )}
      </section>

      {/* ─────────────────────────────────────────
          LOWER HALF — AVAILABLE PLANS
      ───────────────────────────────────────── */}
      <section>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              {hasMembership ? (isExpiringSoon || isExpired ? 'Renew or Upgrade' : 'Available Plans') : 'Choose Your Plan'}
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            {hasMembership && (isExpiringSoon || isExpired)
              ? 'Ready to Continue?'
              : hasMembership
              ? 'Explore Other Plans'
              : 'Get Started'}
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {hasMembership && (isExpiringSoon || isExpired)
              ? 'Your membership is expiring soon. Renew your current plan or switch to a better one.'
              : hasMembership
              ? 'Upgrade anytime. Your new plan will begin after your current one is approved.'
              : 'Unlock full access to XYZ Fitness. Choose the plan that fits your training goals.'}
          </p>
        </div>

        {plansLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[420px] w-full bg-card border border-border rounded-2xl" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <Card className="bg-card border-border text-foreground">
            <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
              No plans are currently available. Check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {plans.map((plan, index) => {
              const isFeatured = index === 1;
              const isCurrentPlan = hasMembership && memberRow?.membership_plan_id === plan.id;
              const disabled = planButtonDisabled(plan.id);

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex"
                >
                  <Card className={`relative flex flex-col w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    isCurrentPlan && !isExpired && !isExpiringSoon
                      ? 'border-emerald-600/40 bg-emerald-950/10 ring-1 ring-emerald-600/20'
                      : isFeatured
                      ? 'border-indigo-600/50 bg-indigo-950/10 shadow-md ring-1 ring-indigo-600/20'
                      : 'bg-card border-border shadow-sm'
                  }`}>
                    {/* Badges */}
                    {isCurrentPlan && !isExpired && !isExpiringSoon && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle className="h-3 w-3 fill-white" /> Current Plan
                      </div>
                    )}
                    {(isExpiringSoon || isExpired) && isCurrentPlan && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                        <RefreshCw className="h-3 w-3" /> Renew Now
                      </div>
                    )}
                    {isFeatured && !isCurrentPlan && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                        <Flame className="h-3 w-3 fill-white" /> Most Popular
                      </div>
                    )}

                    <CardHeader className="text-center pb-6 pt-10 px-6">
                      <CardTitle className="text-2xl font-black text-foreground mb-2">{plan.name}</CardTitle>
                      <CardDescription className="text-muted-foreground min-h-[40px] text-xs font-semibold">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-6 flex items-baseline justify-center gap-x-1">
                        <span className="text-5xl font-black tracking-tight text-foreground">₹{plan.price}</span>
                        <span className="text-xs font-bold text-muted-foreground uppercase">/ {plan.duration_days} days</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 px-8 pb-6">
                      <ul className="space-y-3">
                        {plan.features?.map((feature: string, i: number) => (
                          <li key={i} className="flex gap-3 text-foreground items-start">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                            <span className="text-xs font-medium leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="p-8 pt-4 border-t border-border/50 bg-muted/20 rounded-b-2xl">
                      <Button
                        onClick={() => !disabled && handleSelectPlan(plan.id)}
                        disabled={disabled}
                        className={`w-full py-5 text-sm font-bold shadow-sm transition-all duration-300 ${
                          disabled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                            : isFeatured || isCurrentPlan
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5'
                            : 'bg-card border border-border text-foreground hover:bg-muted/50'
                        }`}
                      >
                        {disabled ? (
                          <><CheckCircle className="h-4 w-4 mr-2" /> Active Plan</>
                        ) : (
                          <><Zap className="h-4 w-4 mr-2" /> {planButtonLabel(plan.id)}</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
