import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipService } from '../services/membership.service';
import { paymentService } from '../services/payment.service';
import { useAuth } from '../lib/auth-context';
import { useState, useEffect } from 'react';
import { adminNotificationsService } from '../services/admin-notifications.service';
import { emailService } from '../services/email.service';
import { supabase } from '../lib/supabase';
import { ShieldCheck, CreditCard, Banknote, Building, Smartphone, UploadCloud, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/_member/buy-membership')({
  validateSearch: (search: Record<string, unknown>): { planId?: string } => {
    return {
      planId: search.planId as string | undefined,
    }
  },
  component: BuyMembershipPage,
});

function BuyMembershipPage() {
  const { planId } = Route.useSearch();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPlanId, setSelectedPlanId] = useState(planId || '');
  const [method, setMethod] = useState('razorpay');
  const [reference, setReference] = useState('');
  const [proof, setProof] = useState(''); 
  const [isUploading, setIsUploading] = useState(false);

  const { data: dbPlans, isLoading } = useQuery({
    queryKey: ['active-plans'],
    queryFn: () => membershipService.getPlans(false),
  });

  const plans = dbPlans || [];

  useEffect(() => {
    if (planId) {
      setSelectedPlanId(planId);
    }
  }, [planId]);

  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const purchaseMutation = useMutation<any, any, { razorpayPaymentId?: string } | undefined>({
    mutationFn: async (variables) => {
      if (!selectedPlan) throw new Error('No plan selected');
      
      const targetPlanId = selectedPlan.id;

      return paymentService.createPaymentRequest({
        profile_id: profile!.id,
        membership_plan_id: targetPlanId,
        amount: selectedPlan.price,
        currency: 'INR',
        payment_method: variables?.razorpayPaymentId ? 'Razorpay Online' : method === 'bank' ? 'Bank Transfer' : 'Cash',
        transaction_reference: variables?.razorpayPaymentId || reference || `CASH-${Date.now()}`,
        payment_proof: proof,
      });
    },
    onSuccess: (data, variables) => {
      const actualMethod = variables?.razorpayPaymentId ? 'Razorpay Online (UPI/Cards/Net)' : (method === 'bank' ? 'Bank Transfer' : 'Cash');

      // 1. Notify Admin Console
      adminNotificationsService.addNotification(
        'payment',
        'New Payment / Membership Request',
        `${profile?.first_name} ${profile?.last_name} (${profile?.email}) has purchased the ${selectedPlan.name} (₹${selectedPlan.price}) via ${actualMethod} and is awaiting approval.`
      );

      // 2. Send Email Receipt via Resend
      if (profile?.email) {
        emailService.send({
          to: profile.email,
          subject: 'Membership Order Awaiting Verification - XYZ Fitness',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa; color: #333;">
              <h2 style="color: #4F46E5; margin-bottom: 5px;">XYZ Fitness</h2>
              <p style="font-size: 14px; color: #666; margin-top: 0;">Order Confirmation & Receipt</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
              <p>Hello <strong>${profile.first_name}</strong>,</p>
              <p>We have successfully received your membership registration request and payment details. Our operations team is currently validating your transaction.</p>
              
              <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e6e6e6; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #333;">Subscription Summary:</h4>
                <table style="width: 100%; font-size: 14px;">
                  <tr>
                    <td style="color: #666; padding: 4px 0;">Selected Package:</td>
                    <td style="text-align: right; font-weight: bold;">${selectedPlan.name}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 4px 0;">Plan Duration:</td>
                    <td style="text-align: right; font-weight: bold;">${selectedPlan.duration_days} Days</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 4px 0;">Total Amount:</td>
                    <td style="text-align: right; font-weight: bold; color: #4F46E5;">₹ ${selectedPlan.price}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; padding: 4px 0;">Payment Channel:</td>
                    <td style="text-align: right; font-weight: bold; text-transform: uppercase;">${actualMethod}</td>
                  </tr>
                </table>
              </div>

              <p>Your membership access will be unlocked automatically as soon as the payment confirmation review completes. You can check your status anytime on your member dashboard.</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999; text-align: center;">Thank you for training with XYZ Fitness! <br/>© 2026 XYZ Fitness. All rights reserved.</p>
            </div>
          `
        }).catch(err => console.warn('Email receipt transmission failed:', err));
      }

      // 3. Invalidate React Queries to refresh UI instantly
      queryClient.invalidateQueries({ queryKey: ['member-dashboard', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['member-profile', profile?.id] });

      toast.success('Payment submitted! Awaiting admin approval.');
      navigate({ to: '/dashboard' });
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to submit payment request.');
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `payments/${fileName}`;

        // Upload to storage bucket
        const { error: uploadError } = await supabase.storage
          .from('support-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('support-attachments')
          .getPublicUrl(filePath);

        setProof(data.publicUrl);
        toast.success('Payment proof uploaded successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const rawPrice = selectedPlan.price;
    const sanitizedPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;

    const options = {
      key: "rzp_test_T9l2B79bewK29w",
      amount: Math.round(sanitizedPrice * 100), // Amount in paisa
      currency: "INR",
      name: "Elevate Fitness",
      description: `${selectedPlan.name} Membership`,
      handler: function (response: any) {
        const payId = response.razorpay_payment_id;
        toast.success(`Payment verified successfully! ID: ${payId}`);
        purchaseMutation.mutate({ razorpayPaymentId: payId });
      },
      prefill: {
        name: profile ? `${profile.first_name} ${profile.last_name}` : '',
        email: profile ? profile.email : '',
        contact: profile ? profile.phone : ''
      },
      theme: {
        color: "#4F46E5"
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'razorpay') {
      handleRazorpayPayment();
      return;
    }
    if (method !== 'cash' && !reference) {
      toast.error('Transaction reference is required for verification');
      return;
    }
    purchaseMutation.mutate(undefined);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <Skeleton className="h-[550px] w-full bg-card border border-border rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 px-4">
        <h2 className="text-2xl font-black text-foreground">No active packages found</h2>
        <p className="text-muted-foreground">Could not resolve active subscription plan items.</p>
        <Button onClick={() => navigate({ to: '/membership-plans' })} className="bg-primary text-primary-foreground w-full hover:bg-primary/90">
          <ArrowLeft className="h-4 w-4 mr-2" /> Select a plan
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-4 flex flex-col justify-start">
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate({ to: '/membership-plans' })}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-black tracking-tight text-foreground leading-none">Secure Checkout</h2>
            <p className="text-[10px] text-muted-foreground mt-1">Activate your gym access instantly with premium security protocols.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        {/* Left Column - Plan Selector & Summary (Col-span-5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Plan Selector Card */}
          <Card className="bg-card border-border text-foreground shadow-sm p-4 flex flex-col gap-2">
            <h3 className="font-extrabold text-xs tracking-tight uppercase text-primary">Select Gym Package</h3>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ₹ {p.price}</option>
              ))}
            </select>
          </Card>

          {/* Billing Summary Card */}
          <Card className="bg-card border-border text-foreground shadow-sm p-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs tracking-tight border-b border-border/50 pb-2 uppercase text-primary">Billing Details</h3>
              <div className="flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-foreground">{selectedPlan.name}</div>
                  <div className="text-muted-foreground text-[10px]">{selectedPlan.duration_days} Days Unlimited Access</div>
                </div>
                <div className="font-black text-sm text-foreground">₹ {selectedPlan.price}</div>
              </div>

              <div className="space-y-1.5 text-[11px] text-muted-foreground font-medium pt-2 border-t border-border/20">
                <div className="flex justify-between">
                  <span>Base Subscription</span>
                  <span>₹ {selectedPlan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrollment Fee</span>
                  <span>₹ 0.00</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Total Due</span>
                <span className="text-xl font-black text-primary">₹ {selectedPlan.price}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground/75 text-[9px] font-bold uppercase tracking-wider justify-center">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 fill-emerald-500/10" /> PCI secure checkout verified
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Payment & Form (Col-span-7) */}
        <Card className="md:col-span-7 bg-card border-border text-foreground shadow-sm p-4 flex flex-col justify-between">
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div>
              <h3 className="font-extrabold text-xs tracking-tight uppercase text-primary">Payment Channel</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Select a method to submit your payment details.</p>
            </div>

            {/* Grid selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'razorpay', name: 'Razorpay Secure', subtitle: 'UPI, Cards, Netbanking', icon: CreditCard, highlight: true },
                { id: 'bank', name: 'Bank Transfer', subtitle: 'Manual UTR receipt', icon: Building },
                { id: 'cash', name: 'Cash Settlement', subtitle: 'Pay at front desk', icon: Banknote },
              ].map((m) => {
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all duration-300 relative overflow-hidden text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                        : 'border-border bg-card text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    {m.highlight && (
                      <span className="absolute top-0 right-0 bg-primary text-[8px] font-black text-primary-foreground px-1.5 py-0.5 rounded-bl uppercase">
                        Instant
                      </span>
                    )}
                    <m.icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground/75'}`} />
                    <div>
                      <div className="font-bold text-xs text-foreground leading-tight">{m.name}</div>
                      <div className="text-[9px] text-muted-foreground/80 leading-none mt-0.5">{m.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Channel-specific input panel */}
            <div className="flex-1 bg-muted/30 rounded-xl border border-border p-4">
              <form id="checkout-form" onSubmit={submitPayment} className="h-full flex flex-col justify-center">
                {method === 'razorpay' ? (
                  <div className="flex flex-col items-center text-center space-y-2 py-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Razorpay Gateway Enabled</h4>
                      <p className="text-[11px] text-muted-foreground max-w-xs leading-normal">
                        Supports UPI apps, Netbanking, Visa, Mastercard, and RuPay. Click button below to complete.
                      </p>
                    </div>
                  </div>
                ) : method === 'bank' ? (
                  <div className="space-y-3">
                    <div className="bg-background p-3 rounded-lg border border-border text-[11px] grid grid-cols-2 gap-y-1 font-semibold text-foreground/80">
                      <div className="text-primary uppercase font-bold text-xs col-span-2 mb-1">AXIS BANK CREDENTIALS</div>
                      <div>Account Name:</div> <div className="text-foreground">Elevate Fitness Ltd.</div>
                      <div>A/C Number:</div> <div className="text-foreground text-xs font-mono">918029381923</div>
                      <div>IFSC Code:</div> <div className="text-foreground text-xs font-mono">UTIB0001892</div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="reference" className="text-foreground/80 font-bold text-[10px]">Reference / UTR ID *</Label>
                      <Input 
                        id="reference"
                        placeholder="UTR Transaction ID" 
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="bg-background border-border text-xs h-8" 
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="proof_upload" className="text-foreground/80 font-bold text-[10px]">Upload Receipt Proof</Label>
                      <div className="flex gap-2 items-center bg-background p-2 border border-border border-dashed rounded-lg h-10">
                        <UploadCloud className="h-4 w-4 text-primary shrink-0" />
                        <input 
                          type="file" 
                          id="proof_upload" 
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="text-[10px] text-muted-foreground focus:outline-none"
                        />
                      </div>
                      {proof ? (
                        <div className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Uploaded successfully
                        </div>
                      ) : isUploading ? (
                        <div className="text-[9px] text-primary animate-pulse font-bold">Uploading...</div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground font-medium">
                    Settle details with the reception desk at front counter.
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="pt-4 border-t border-border/55 mt-4">
            <Button 
              type="submit" 
              form="checkout-form"
              disabled={purchaseMutation.isPending || isUploading}
              className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow flex items-center justify-center gap-2"
            >
              {purchaseMutation.isPending ? 'Processing...' : method === 'razorpay' ? 'Launch Razorpay Gateway' : 'Confirm Request & Settle'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
