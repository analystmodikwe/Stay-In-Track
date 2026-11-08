/**
 * Seed script for STAY IN TRACK.
 * Section 8.7 of IMPLEMENTATION_PLAN.md & PRD 8.4.
 * Loads sample data set for today = 28 Oct 2026.
 * Run with: npm run seed
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const testPassword = process.env.SEED_TEST_PASSWORD || 'TestPassword123!'

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY. Check your .env file.')
  process.exit(1)
}

// Client with service role key (bypasses RLS for seeding)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('Seeding STAY IN TRACK sample data...')

  // Clean up existing sample users and gyms if re-seeding
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  if (existingUsers?.users) {
    const seedEmails = [
      'sipho@ironhaven.example.com',
      'naledi.k@example.com',
      'thando.m@example.com',
      'lerato.m@example.com',
      'bheki.s@example.com',
    ]
    for (const u of existingUsers.users) {
      if (u.email && seedEmails.includes(u.email)) {
        await supabase.auth.admin.deleteUser(u.id)
      }
    }
  }
  await supabase.from('gyms').delete().eq('name', 'Iron Haven Gym')

  // 1. Create Admin Auth User: sipho@ironhaven.example.com
  // The handle_new_user trigger creates Iron Haven Gym and the admin profile!
  const adminEmail = 'sipho@ironhaven.example.com'
  const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      gym_name: 'Iron Haven Gym',
      full_name: 'Sipho Dlamini',
      is_18_or_older: true,
    },
  })

  if (adminErr) {
    console.error('Error creating admin user:', adminErr)
    process.exit(1)
  }

  // Get gym_id from profile created by trigger
  const { data: adminProfile, error: profErr } = await supabase
    .from('profiles')
    .select('gym_id')
    .eq('id', adminUser.user.id)
    .single()

  if (profErr || !adminProfile) {
    console.error('Could not find created gym profile:', profErr)
    process.exit(1)
  }

  const gymId = adminProfile.gym_id

  // 2. Insert the 3 Plans (PRD 8.4)
  const { data: studentPlan, error: p1Err } = await supabase
    .from('plans')
    .insert({
      gym_id: gymId,
      name: 'Student',
      price: 250.00,
      benefits: 'Gym floor access',
      status: 'active',
    })
    .select()
    .single()

  const { data: standardPlan, error: p2Err } = await supabase
    .from('plans')
    .insert({
      gym_id: gymId,
      name: 'Standard',
      price: 350.00,
      benefits: 'Gym floor access, 1 fitness assessment',
      status: 'active',
    })
    .select()
    .single()

  const { data: premiumPlan, error: p3Err } = await supabase
    .from('plans')
    .insert({
      gym_id: gymId,
      name: 'Premium',
      price: 550.00,
      benefits: 'Gym floor access, group classes, 1 locker',
      status: 'active',
    })
    .select()
    .single()

  if (p1Err || p2Err || p3Err) {
    console.error('Error creating plans:', p1Err || p2Err || p3Err)
    process.exit(1)
  }

  // 3. Insert the 4 Members (PRD 8.4)
  // Naledi Khumalo (Student plan)
  const { data: naledi, error: m1Err } = await supabase
    .from('members')
    .insert({
      gym_id: gymId,
      full_name: 'Naledi Khumalo',
      email: 'naledi.k@example.com',
      phone: '+27825550147',
      plan_id: studentPlan.id,
      paid_until: '2026-11-15',
      is_18_or_older: true,
    })
    .select()
    .single()

  // Johan van der Merwe (Premium plan)
  const { data: johan, error: m2Err } = await supabase
    .from('members')
    .insert({
      gym_id: gymId,
      full_name: 'Johan van der Merwe',
      email: 'johan.vdm@example.com',
      phone: '+27835550198',
      plan_id: premiumPlan.id,
      paid_until: '2026-12-01',
      is_18_or_older: true,
    })
    .select()
    .single()

  // Thando Mokoena (Standard plan)
  const { data: thando, error: m3Err } = await supabase
    .from('members')
    .insert({
      gym_id: gymId,
      full_name: 'Thando Mokoena',
      email: 'thando.m@example.com',
      phone: '+27845550123',
      plan_id: standardPlan.id,
      paid_until: '2026-10-26',
      is_18_or_older: true,
    })
    .select()
    .single()

  // Ayesha Patel (Student plan)
  const { data: ayesha, error: m4Err } = await supabase
    .from('members')
    .insert({
      gym_id: gymId,
      full_name: 'Ayesha Patel',
      email: 'ayesha.p@example.com',
      phone: '+27855550174',
      plan_id: studentPlan.id,
      paid_until: '2026-10-10',
      is_18_or_older: true,
    })
    .select()
    .single()

  if (m1Err || m2Err || m3Err || m4Err) {
    console.error('Error inserting members:', m1Err || m2Err || m3Err || m4Err)
    process.exit(1)
  }

  // 4. Create Auth accounts for Naledi and Thando (handle_new_user links them!)
  const { error: nalUserErr } = await supabase.auth.admin.createUser({
    email: 'naledi.k@example.com',
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      role: 'member',
      full_name: 'Naledi Khumalo',
      is_18_or_older: true,
    },
  })

  const { error: thaUserErr } = await supabase.auth.admin.createUser({
    email: 'thando.m@example.com',
    password: testPassword,
    email_confirm: true,
    user_metadata: {
      role: 'member',
      full_name: 'Thando Mokoena',
      is_18_or_older: true,
    },
  })

  if (nalUserErr || thaUserErr) {
    console.error('Error creating member auth users:', nalUserErr || thaUserErr)
    process.exit(1)
  }

  // 5. Insert Payments (PRD 8.4)
  // Revenue this month (Oct 2026): Naledi (R250) + Johan (R1,100) = R1,350.00
  const payments = [
    {
      gym_id: gymId,
      member_id: naledi.id,
      amount: 250.00,
      method: 'EFT',
      months: 1,
      payment_date: '2026-10-15',
      previous_paid_until: '2026-10-15',
      recorded_by: adminUser.user.id,
    },
    {
      gym_id: gymId,
      member_id: johan.id,
      amount: 1100.00,
      method: 'Card',
      months: 2,
      payment_date: '2026-10-01',
      previous_paid_until: '2026-10-01',
      recorded_by: adminUser.user.id,
    },
    {
      gym_id: gymId,
      member_id: thando.id,
      amount: 350.00,
      method: 'Cash',
      months: 1,
      payment_date: '2026-09-26',
      previous_paid_until: '2026-09-26',
      recorded_by: adminUser.user.id,
    },
    {
      gym_id: gymId,
      member_id: ayesha.id,
      amount: 250.00,
      method: 'Cash',
      months: 1,
      payment_date: '2026-09-10',
      previous_paid_until: '2026-09-10',
      recorded_by: adminUser.user.id,
    },
  ]

  const { error: payErr } = await supabase.from('payments').insert(payments)
  if (payErr) {
    console.error('Error inserting payments:', payErr)
    process.exit(1)
  }

  console.log('Seed completed successfully!')
  console.log('Sample gym: Iron Haven Gym')
  console.log('Test accounts:')
  console.log(' - Admin: sipho@ironhaven.example.com')
  console.log(' - Member (Active): naledi.k@example.com')
  console.log(' - Member (Grace period): thando.m@example.com')
  console.log('Revenue this month (Oct 2026): R1,350.00')
}

seed().catch(err => {
  console.error('Unexpected seed error:', err)
  process.exit(1)
})

