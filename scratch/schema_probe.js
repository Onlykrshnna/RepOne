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

async function probe(table, columns = 'id') {
  try {
    const res = await fetch(`${BASE}/${table}?select=${columns}&limit=0`, { headers });
    if (res.ok || res.status === 200) {
      return { table, status: 'OK', code: res.status };
    }
    const body = await res.text();
    return { table, status: 'ERROR', code: res.status, body: body.substring(0, 300) };
  } catch (e) {
    return { table, status: 'NETWORK_ERROR', error: e.message };
  }
}

async function probeColumns(table, columns) {
  const results = {};
  for (const col of columns) {
    const res = await fetch(`${BASE}/${table}?select=${col}&limit=0`, { headers });
    const body = await res.text();
    results[col] = res.ok ? 'OK' : `MISSING (${body.substring(0, 120)})`;
  }
  return results;
}

async function run() {
  console.log('\n=== TABLE EXISTENCE PROBE ===');
  const tables = [
    'profiles', 'members', 'attendance', 'payments', 'membership_plans',
    'classes', 'trainers', 'bookings', 'class_bookings', 'guest_passes',
    'support_tickets', 'ticket_replies', 'feedback', 'progress_tracking',
    'gyms', 'notifications'
  ];

  const tableResults = {};
  for (const t of tables) {
    const r = await probe(t);
    tableResults[t] = r.status;
    console.log(`  ${t}: ${r.status} (${r.code || ''}) ${r.body || ''}`);
  }

  console.log('\n=== COLUMN PROBE: profiles ===');
  const profileCols = await probeColumns('profiles', [
    'id','first_name','last_name','email','username','phone','gender','date_of_birth',
    'address','emergency_contact','role','avatar_url','is_active','membership_status',
    'approved_by','approved_at','membership_requested_at','payment_verified_at',
    'admin_notes','created_at','updated_at'
  ]);
  for (const [col, status] of Object.entries(profileCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: members ===');
  const memberCols = await probeColumns('members', [
    'id','profile_id','membership_plan_id','join_date','expiry_date','status','gym_id','created_at'
  ]);
  for (const [col, status] of Object.entries(memberCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: attendance ===');
  const attendanceCols = await probeColumns('attendance', [
    'id','member_id','check_in_time','check_out_time','method','created_at'
  ]);
  for (const [col, status] of Object.entries(attendanceCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: payments ===');
  const paymentCols = await probeColumns('payments', [
    'id','profile_id','membership_plan_id','amount','currency','payment_method',
    'transaction_reference','payment_proof','status','payment_date','remarks',
    'verified_at','verified_by','created_at'
  ]);
  for (const [col, status] of Object.entries(paymentCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: membership_plans ===');
  const planCols = await probeColumns('membership_plans', [
    'id','plan_name','name','description','price','duration_days','created_at'
  ]);
  for (const [col, status] of Object.entries(planCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: classes ===');
  const classCols = await probeColumns('classes', [
    'id','gym_id','trainer_id','title','description','category','room','start_time',
    'end_time','days','duration','capacity','booked_count','waiting_list_count',
    'difficulty_level','color_label','status','created_at'
  ]);
  for (const [col, status] of Object.entries(classCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: trainers ===');
  const trainerCols = await probeColumns('trainers', [
    'id','gym_id','name','photo_url','specialization','experience','bio','contact','created_at'
  ]);
  for (const [col, status] of Object.entries(trainerCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: bookings ===');
  const bookingCols = await probeColumns('bookings', [
    'id','gym_id','class_id','member_id','status','booked_at','cancelled_at','attended','created_at'
  ]);
  for (const [col, status] of Object.entries(bookingCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: guest_passes ===');
  const guestCols = await probeColumns('guest_passes', [
    'id','generated_by','guest_name','guest_phone','guest_email','pass_code',
    'valid_from','valid_until','is_used','used_at','used_by_staff','notes','created_at'
  ]);
  for (const [col, status] of Object.entries(guestCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: support_tickets ===');
  const ticketCols = await probeColumns('support_tickets', [
    'id','gym_id','member_id','category','subject','description','status',
    'attachment_url','created_at','updated_at'
  ]);
  for (const [col, status] of Object.entries(ticketCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: ticket_replies ===');
  const replyCols = await probeColumns('ticket_replies', [
    'id','ticket_id','sender_id','message','created_at'
  ]);
  for (const [col, status] of Object.entries(replyCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: feedback ===');
  const feedbackCols = await probeColumns('feedback', [
    'id','gym_id','member_id','target_type','target_id','rating_overall',
    'rating_cleanliness','rating_trainers','rating_equipment','rating_value',
    'comments','admin_reply','is_resolved','is_archived','created_at'
  ]);
  for (const [col, status] of Object.entries(feedbackCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: progress_tracking ===');
  const progressCols = await probeColumns('progress_tracking', [
    'id','member_id','weight_kg','height_cm','bmi','body_fat_percentage',
    'chest_cm','waist_cm','hips_cm','left_arm_cm','right_arm_cm','left_thigh_cm',
    'right_thigh_cm','neck_cm','shoulders_cm','water_percentage','muscle_percentage',
    'notes','progress_photos','recorded_at'
  ]);
  for (const [col, status] of Object.entries(progressCols)) {
    console.log(`  ${col}: ${status}`);
  }

  console.log('\n=== COLUMN PROBE: gyms ===');
  const gymCols = await probeColumns('gyms', ['id','name']);
  for (const [col, status] of Object.entries(gymCols)) {
    console.log(`  ${col}: ${status}`);
  }

  // Check bookings relationship – member_id should be a profile id or a member.id?
  console.log('\n=== RELATIONSHIP PROBE: bookings.member_id -> profiles ===');
  const bookingMemberRel = await fetch(`${BASE}/bookings?select=member_id,profiles:member_id(id)&limit=0`, { headers });
  console.log(`  bookings.member_id -> profiles: ${bookingMemberRel.status} ${bookingMemberRel.ok ? 'OK' : await bookingMemberRel.text().then(t => t.substring(0, 200))}`);

  const bookingMemberRel2 = await fetch(`${BASE}/bookings?select=member_id,members:member_id(id)&limit=0`, { headers });
  console.log(`  bookings.member_id -> members: ${bookingMemberRel2.status} ${bookingMemberRel2.ok ? 'OK' : await bookingMemberRel2.text().then(t => t.substring(0, 200))}`);

  console.log('\n=== RELATIONSHIP PROBE: analytics trainers ===');
  const analyticsTrainers = await fetch(`${BASE}/classes?select=trainers(name)&limit=0`, { headers });
  console.log(`  classes -> trainers: ${analyticsTrainers.status} ${analyticsTrainers.ok ? 'OK' : await analyticsTrainers.text().then(t => t.substring(0, 200))}`);

  console.log('\n=== RELATIONSHIP PROBE: payments -> membership_plans ===');
  const paymentPlans = await fetch(`${BASE}/payments?select=membership_plans:membership_plan_id(id,name,duration_days)&limit=0`, { headers });
  console.log(`  payments -> membership_plans (name col): ${paymentPlans.status} ${paymentPlans.ok ? 'OK' : await paymentPlans.text().then(t => t.substring(0, 300))}`);

  console.log('\n=== RELATIONSHIP PROBE: progress_tracking -> profiles ===');
  const progressFromProfiles = await fetch(`${BASE}/profiles?select=id,progress_tracking(recorded_at)&eq.role=member&limit=0`, { headers });
  console.log(`  profiles -> progress_tracking: ${progressFromProfiles.status} ${progressFromProfiles.ok ? 'OK' : await progressFromProfiles.text().then(t => t.substring(0, 200))}`);

  console.log('\nDONE.');
}

run();
