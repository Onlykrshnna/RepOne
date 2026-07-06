const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_schema_info', {}); 
  // If rpc doesn't exist we'll use a direct select on information_schema if we had postgres access. 
  // But we don't. We'll just try to insert into payments with a random UUID to see the exact foreign key error.
  const { error: insertError } = await supabase.from('payments').insert([{
    member_id: '00000000-0000-0000-0000-000000000000',
    membership_plan_id: '00000000-0000-0000-0000-000000000000',
    amount: 100,
    payment_method: 'Cash'
  }]);
  console.log(insertError);
  process.exit(0);
}
run();
