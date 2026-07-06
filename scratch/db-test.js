import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://bilojbymapoxgpdzryjo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("=== Querying Profiles ===");
  const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
  if (profError) console.error("Profiles error:", profError);
  else console.log(`Profiles: ${profiles.length} rows`, JSON.stringify(profiles, null, 2));

  console.log("=== Querying Payments ===");
  const { data: payments, error: payError } = await supabase.from('payments').select('*');
  if (payError) console.error("Payments error:", payError);
  else console.log(`Payments: ${payments.length} rows`, JSON.stringify(payments, null, 2));
}

test();
