const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_schema_info', {}); 
  // Wait, I don't have RPC for schema info. But I can just check if profile_id exists by querying it!
  const res1 = await supabase.from('payments').select('member_id').limit(1);
  const res2 = await supabase.from('payments').select('profile_id').limit(1);
  console.log('member_id error:', res1.error);
  console.log('profile_id error:', res2.error);
  process.exit(0);
}
run();
