import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { membershipService } from '../services/membership.service';
import { useAuth } from '../lib/auth-context';
import { CheckCircle2, ShieldAlert, Sparkles, Flame, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/_member/membership-plans')({
  component: MembershipPlansPage,
});

const MOCK_PLANS = [
  {
    id: 'mock-basic',
    name: 'Basic Pass',
    description: 'Perfect for casual gym goers looking to stay active.',
    price: 1999,
    duration_days: 30,
    features: ['Access to gym floor & weights', 'Standard locker access', '1 Trainer consult / month', 'Free high-speed WiFi'],
    color: '#6366F1'
  },
  {
    id: 'mock-elite',
    name: 'Elite Gym Pass',
    description: 'Our most popular option for dedicated fitness enthusiasts.',
    price: 2999,
    duration_days: 90,
    features: ['24/7 Gym access', 'Unlimited fitness group classes', 'Free sauna & steam rooms', 'Personalized nutrition guide', '4 Trainer consults / month'],
    color: '#4F46E5',
    isFeatured: true
  },
  {
    id: 'mock-vip',
    name: 'VIP Unlimited',
    description: 'All-inclusive premium experience with absolute freedom.',
    price: 4999,
    duration_days: 180,
    features: ['All Elite features included', '1-on-1 Dedicated Trainer', 'Complimentary towels & laundry', 'VIP lounge access', 'Free pre-workout drinks', '10% Discount on merchandise'],
    color: '#312E81'
  }
];

function MembershipPlansPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const { data: dbPlans, isLoading } = useQuery({
    queryKey: ['active-plans'],
    queryFn: () => membershipService.getPlans(false), // only active
  });

  // If DB is empty, render the mock plans
  const plans = dbPlans && dbPlans.length > 0 ? dbPlans : MOCK_PLANS;

  const handleSelectPlan = (planId: string) => {
    navigate({ to: '/buy-membership', search: { planId } });
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-8 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Gym Membership Packages
        </div>
        <h2 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Choose Your Fit Plan</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Unlock your full potential with our flexible membership options. Clear terms, cancel anytime.
        </p>
        
        {profile?.membership_status === 'pending' && (
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 rounded-full mt-4">
            <ShieldAlert className="h-4 w-4" />
            <span className="text-sm font-semibold">You have a pending membership approval request.</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch pt-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[450px] w-full bg-card border border-border rounded-2xl" />
          ))
        ) : (
          plans.map((plan, index) => {
            const isFeatured = 'isFeatured' in plan ? !!(plan as any).isFeatured : index === 1;
            
            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex"
              >
                <Card 
                  className={`relative flex flex-col w-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                    ${isFeatured 
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/20 shadow-md ring-1 ring-indigo-600/20' 
                      : 'bg-card border-border shadow-sm'
                    }`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame className="h-3 w-3 fill-white" /> Most Popular
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6 pt-10 px-6">
                    <CardTitle className="text-2xl font-black text-foreground mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground min-h-[48px] text-xs font-semibold">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6 flex items-baseline justify-center gap-x-1">
                      <span className="text-5xl font-black tracking-tight text-foreground">₹ {plan.price}</span>
                      <span className="text-xs font-bold text-muted-foreground uppercase">/ {plan.duration_days} days</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 px-8 pb-6">
                    <ul className="space-y-3.5">
                      {plan.features?.map((feature, i) => (
                        <li key={i} className="flex gap-3 text-foreground items-start">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                          <span className="text-xs font-medium leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="p-8 pt-4 border-t border-border/50 bg-muted/30 rounded-b-2xl">
                    <Button 
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full py-5 text-sm font-bold shadow-sm transition-all duration-300 ${
                        isFeatured 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                          : 'bg-card border border-border text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Zap className="h-4 w-4 mr-2" /> Choose Package
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
