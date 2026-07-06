const { createClient } = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://bilojbymapoxgpdzryjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbG9qYnltYXBveGdwZHpyeWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTg3ODEsImV4cCI6MjA5ODU5NDc4MX0.ycQNxRUqAbHpc7sgcBypmt-nqr2_tTMVkLRm1aJ9e3M';
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = {
  profiles: ['id', 'first_name', 'last_name', 'email', 'username', 'role', 'is_active', 'membership_status', 'avatar_url', 'phone', 'address', 'gender', 'date_of_birth', 'emergency_contact', 'approved_by', 'approved_at', 'payment_verified_at', 'admin_notes', 'created_at', 'updated_at', 'membership_requested_at'],
  payments: ['id', 'member_id', 'membership_plan_id', 'amount', 'currency', 'payment_method', 'transaction_reference', 'payment_proof', 'status', 'payment_date', 'verified_by', 'verified_at', 'created_at'],
  membership_plans: ['id', 'name', 'description', 'price', 'duration_days', 'features', 'is_active', 'created_at'],
  member_memberships: ['id', 'member_id', 'plan_id', 'start_date', 'end_date', 'status', 'created_at'],
  classes: ['id', 'title', 'instructor', 'capacity', 'duration_minutes', 'description', 'image_url', 'schedule', 'created_at'],
  bookings: ['id', 'class_id', 'member_id', 'status', 'booking_date', 'created_at'],
  guest_passes: ['id', 'member_id', 'guest_name', 'guest_email', 'guest_phone', 'pass_code', 'valid_until', 'is_used', 'used_at', 'created_at'],
  attendance: ['id', 'member_id', 'check_in_time', 'check_out_time', 'method', 'created_at']
};

async function audit() {
  console.log('--- DB AUDIT START ---');
  for (const [table, cols] of Object.entries(tables)) {
    console.log('\nTesting table:', table);
    for (const col of cols) {
      const { error } = await supabase.from(table).select(col).limit(1);
      if (error) {
        console.log('MISSING: ' + table + '.' + col + ' - ' + error.code + ' - ' + error.message);
      }
    }
  }
  console.log('--- DB AUDIT END ---');
}
audit();
