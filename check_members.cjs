const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('members').select('profile_id, join_date, expiry_date, status, membership_plan_id');
  if (error) {
    console.error('members table query error:', error);
  } else {
    console.log('members table query success. Data:', data);
  }
  process.exit(0);
}
run();
