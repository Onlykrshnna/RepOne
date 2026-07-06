const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('get_schema_info', {}); 
  if (error) {
    // try to query information_schema.columns using an RPC if it exists, but it probably doesn't.
    // Let's just do a select limit 1 on member_memberships, members, etc.
    const t1 = await supabase.from('member_memberships').select('*').limit(1);
    const t2 = await supabase.from('members').select('*').limit(1);
    console.log('member_memberships', t1.error || t1.data);
    console.log('members', t2.error || t2.data);
  }
  process.exit(0);
}
run();
