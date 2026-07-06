const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding membership_plans...');
  const plansToSeed = [
    {
      plan_name: 'Basic Pass',
      name: 'Basic Pass',
      description: 'Perfect for casual gym goers looking to stay active.',
      price: 1999,
      duration_days: 30,
      features: ['Access to gym floor & weights', 'Standard locker access', '1 Trainer consult / month', 'Free high-speed WiFi']
    },
    {
      plan_name: 'Elite Gym Pass',
      name: 'Elite Gym Pass',
      description: 'Our most popular option for dedicated fitness enthusiasts.',
      price: 2999,
      duration_days: 90,
      features: ['24/7 Gym access', 'Unlimited fitness group classes', 'Free sauna & steam rooms', 'Personalized nutrition guide', '4 Trainer consults / month']
    },
    {
      plan_name: 'VIP Unlimited',
      name: 'VIP Unlimited',
      description: 'All-inclusive premium experience with absolute freedom.',
      price: 4999,
      duration_days: 180,
      features: ['All Elite features included', '1-on-1 Dedicated Trainer', 'Complimentary towels & laundry', 'VIP lounge access', 'Free pre-workout drinks', '10% Discount on merchandise']
    }
  ];
  
  const { data, error } = await supabase
    .from('membership_plans')
    .insert(plansToSeed)
    .select();

  if (error) {
    console.error('Failed to seed:', error);
  } else {
    console.log('Successfully seeded:', data);
  }
  process.exit(0);
}

seed();
