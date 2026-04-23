import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM_EMAIL = 'hello@getinnermark.com'
const APP_URL = 'https://getinnermark.com'

Deno.serve(async () => {
  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Missing environment variables', { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Get current UTC hour and minute
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcMinute = now.getUTCMinutes()

  // Find users whose reminder_time falls within the current UTC hour
  // reminder_time is stored as HH:MM in the user's local time — 
  // for now we match on UTC hour (improvement: store timezone with profile)
  const currentTimeStr = `${String(utcHour).padStart(2, '0')}:${String(utcMinute).padStart(2, '0')}`
  const windowStart = `${String(utcHour).padStart(2, '0')}:00:00`
  const windowEnd = `${String(utcHour).padStart(2, '0')}:59:59`

  // Get users with reminder in this hour window
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, reminder_time, reminders_enabled')
    .not('reminder_time', 'is', null)
    .not('email', 'is', null)
    .neq('reminders_enabled', false)
    .gte('reminder_time', windowStart)
    .lte('reminder_time', windowEnd)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    return new Response('Error fetching profiles', { status: 500 })
  }

  if (!profiles || profiles.length === 0) {
    return new Response('No reminders to send this hour', { status: 200 })
  }

  const today = now.toISOString().split('T')[0]
  let sent = 0
  let skipped = 0

  for (const profile of profiles) {
    // Check if user already checked in today
    const { data: checkin } = await supabase
      .from('checkins')
      .select('id')
      .eq('user_id', profile.id)
      .eq('date', today)
      .single()

    if (checkin) {
      skipped++
      continue // Already checked in today — skip
    }

    const firstName = profile.full_name?.split(' ')[0] || null
    const greeting = firstName ? `Hi ${firstName},` : 'Hi,'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#faf9f6;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;color:#4a3f35;">

    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;">🌿</span>
      <h1 style="font-size:20px;font-weight:600;color:#3a5c3a;margin:12px 0 4px;">Innermark</h1>
    </div>

    <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">${greeting}</p>

    <p style="font-size:15px;line-height:1.7;margin-bottom:16px;">
      You set aside this time to check in with yourself. That's worth honoring.
    </p>

    <p style="font-size:15px;line-height:1.7;margin-bottom:32px;">
      It only takes a minute — tap a color for each area of your life, add a note if something's on your mind, and you're done.
    </p>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="${APP_URL}"
         style="background-color:#4e7c50;color:white;padding:14px 36px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
        Open Innermark →
      </a>
    </div>

    <p style="font-size:14px;line-height:1.7;color:#8a7a6a;margin-bottom:0;">
      Change happens little by little.
    </p>

    <hr style="border:none;border-top:1px solid #e8e0d2;margin:32px 0;">

    <p style="font-size:12px;color:#b0a090;line-height:1.6;">
      You're receiving this because you set a daily reminder in Innermark.
      <a href="${APP_URL}" style="color:#6b8f6e;">Open the app</a> to change or turn off your reminder anytime in Settings.
    </p>

  </div>
</body>
</html>`

    // Determine subject based on reminder hour
    let subject = '🌿 Your daily check-in is waiting'
    if (utcHour >= 5 && utcHour < 12) {
      subject = '🌿 Good morning — your daily check-in is waiting'
    } else if (utcHour >= 12 && utcHour < 17) {
      subject = "🌿 How's your day going? Your check-in is ready"
    } else {
      subject = '🌿 Take 60 seconds before the day ends'
    }

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Innermark <${FROM_EMAIL}>`,
        to: profile.email,
        subject,
        html,
      }),
    })

    if (res.ok) {
      sent++
    } else {
      const err = await res.text()
      console.error(`Failed to send to ${profile.email}:`, err)
    }
  }

  return new Response(
    JSON.stringify({ sent, skipped, total: profiles.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
