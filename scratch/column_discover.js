import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = match[2].trim();
});

const BASE = env.VITE_SUPABASE_URL + '/rest/v1';
const KEY = env.VITE_SUPABASE_ANON_KEY;
const headers = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

async function fetchOneRow(table) {
  const res = await fetch(`${BASE}/${table}?limit=1`, { headers });
  if (!res.ok) { console.log(`${table}: ${await res.text()}`); return; }
  const data = await res.json();
  if (data.length > 0) {
    console.log(`\n=== ${table.toUpperCase()} columns (from live row) ===`);
    console.log(Object.keys(data[0]).join(', '));
  } else {
    console.log(`\n=== ${table.toUpperCase()} – no rows, using HEAD ===`);
    // try with select *
    const r2 = await fetch(`${BASE}/${table}?select=*&limit=0`, { headers, method: 'GET' });
    console.log(`status: ${r2.status}`);
  }
}

async function run() {
  // Probe tables with schema mismatches to see real columns
  await fetchOneRow('classes');
  await fetchOneRow('bookings');
  await fetchOneRow('feedback');
  await fetchOneRow('guest_passes');
  
  // Also check classes actual columns by fetching with Prefer: return=representation
  console.log('\n=== CLASSES: PREFER method ===');
  const r = await fetch(`${BASE}/classes?select=*&limit=1`, { headers });
  const d = await r.json();
  if (d.length > 0) {
    console.log('Real columns:', Object.keys(d[0]).join(', '));
  } else {
    console.log('No classes rows in DB, checking schema cache via OPTIONS');
    const o = await fetch(`${BASE}/classes`, { method: 'OPTIONS', headers });
    console.log('Options status:', o.status);
  }

  console.log('\n=== CHECKING REAL classes COLUMNS VIA SELECT EACH ===');
  const classesReal = ['id', 'gym_id', 'name', 'class_name', 'trainer_id', 'title', 'description',
    'type', 'class_type', 'category', 'room', 'location', 'start_time', 'end_time', 'schedule_time',
    'days', 'day', 'duration', 'capacity', 'max_capacity', 'booked_count', 'current_bookings',
    'waiting_list_count', 'difficulty_level', 'difficulty', 'color_label', 'color',
    'status', 'is_active', 'created_at', 'updated_at'];
  for (const col of classesReal) {
    const res = await fetch(`${BASE}/classes?select=${col}&limit=0`, { headers });
    if (res.ok) console.log(`  classes.${col}: EXISTS`);
  }

  console.log('\n=== CHECKING REAL feedback COLUMNS VIA SELECT EACH ===');
  const feedbackReal = ['id', 'member_id', 'gym_id', 'rating', 'comment', 'comments', 'rating_overall',
    'target_type', 'type', 'category', 'is_resolved', 'resolved', 'is_archived', 'archived',
    'admin_reply', 'reply', 'created_at', 'updated_at', 'rating_cleanliness', 'rating_equipment',
    'rating_trainers', 'rating_value', 'class_id', 'trainer_id', 'subject', 'message'];
  for (const col of feedbackReal) {
    const res = await fetch(`${BASE}/feedback?select=${col}&limit=0`, { headers });
    if (res.ok) console.log(`  feedback.${col}: EXISTS`);
  }

  console.log('\n=== CHECKING REAL guest_passes COLUMNS VIA SELECT EACH ===');
  const gpReal = ['id', 'gym_id', 'member_id', 'generated_by', 'issued_by', 'guest_name', 'guest_phone',
    'guest_email', 'pass_code', 'code', 'valid_from', 'start_date', 'valid_until', 'expiry_date',
    'expires_at', 'is_used', 'used', 'used_at', 'used_by', 'used_by_staff', 'staff_id',
    'notes', 'note', 'remarks', 'created_at', 'updated_at'];
  for (const col of gpReal) {
    const res = await fetch(`${BASE}/guest_passes?select=${col}&limit=0`, { headers });
    if (res.ok) console.log(`  guest_passes.${col}: EXISTS`);
  }

  console.log('\n=== CHECKING REAL bookings COLUMNS VIA SELECT EACH ===');
  const bkReal = ['id', 'gym_id', 'class_id', 'member_id', 'profile_id', 'status', 'booked_at',
    'booking_date', 'cancelled_at', 'attended', 'attendance_status', 'waiting_position',
    'created_at', 'updated_at'];
  for (const col of bkReal) {
    const res = await fetch(`${BASE}/bookings?select=${col}&limit=0`, { headers });
    if (res.ok) console.log(`  bookings.${col}: EXISTS`);
  }

  console.log('\nDONE');
}

run();
