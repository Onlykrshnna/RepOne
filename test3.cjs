const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Querying membership_plans with *...');
  let query = supabase.from('membership_plans').select('*');
  const { data, error } = await query;
  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Data length:', data.length);
    console.log('Data:', data);
  }
  process.exit(0);
}

run();
