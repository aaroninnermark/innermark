// Supabase Edge Function — send daily reminder emails via Resend
// Uses only built-in Deno APIs + fetch (no external imports)

Deno.serve(async (_req) => {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing env vars', resend: !!RESEND_API_KEY, url: !!SUPABASE_URL, key: !!SUPABASE_SERVICE_ROLE_KEY }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const now = new Date()
  const utcHour = now.getUTCHours()
  const pad = (n: number) => String(n).padStart(2, '0')
  const windowStart = pad(utcHour) + ':00:00'
  const windowEnd = pad(utcHour) + ':59:59'

  // Query profiles using REST API directly — no SDK needed
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
  }

  const profilesRes = await fetch(
    SUPABASE_URL + '/rest/v1/profiles?select=id,email,full_name,reminder_time,reminders_enabled&reminder_time=gte.' + windowStart + '&reminder_time=lte.' + windowEnd + '&reminders_enabled=neq.false',
    { headers }
  )

  if (!profilesRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch profiles', status: profilesRes.status }), { status: 500 })
  }

  const profiles = await profilesRes.json()

  if (!profiles || profiles.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0, skipped: 0, total: 0, utc_hour: utcHour, window: windowStart + '-' + windowEnd }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const today = now.toISOString().split('T')[0]
  let sent = 0, skipped = 0

  for (const p of profiles) {
    // Check if already checked in today
    const checkinRes = await fetch(
      SUPABASE_URL + '/rest/v1/checkins?select=id&user_id=eq.' + p.id + '&date=eq.' + today + '&limit=1',
      { headers }
    )
    const checkins = await checkinRes.json()
    if (checkins && checkins.length > 0) { skipped++; continue }

    const firstName = (p.full_name || '').split(' ')[0]
    const greeting = firstName ? 'Hi ' + firstName + ',' : 'Hi,'
    let subject = '🌿 Your daily check-in is waiting'
    if (utcHour < 12) subject = '🌿 Good morning — your daily check-in is waiting'
    else if (utcHour >= 17) subject = '🌿 Take 60 seconds before the day ends'

    const html = '<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#4a3f35;background:#faf9f6;"><div style="text-align:center;margin-bottom:32px;"><span style="font-size:48px;">🌿</span><h1 style="font-size:20px;font-weight:600;color:#3a5c3a;">Innermark</h1></div><p style="font-size:16px;">' + greeting + '</p><p style="font-size:15px;line-height:1.7;">You set aside this time to check in with yourself. That\'s worth honoring.</p><p style="font-size:15px;line-height:1.7;margin-bottom:32px;">It only takes a minute — tap a color for each area, add a note if you\'d like, and you\'re done.</p><div style="text-align:center;margin-bottom:32px;"><a href="https://getinnermark.com" style="background:#4e7c50;color:white;padding:14px 36px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">Open Innermark</a></div><p style="font-size:14px;color:#8a7a6a;">Change happens little by little.</p><hr style="border:none;border-top:1px solid #e8e0d2;margin:32px 0;"><p style="font-size:12px;color:#b0a090;">You\'re receiving this because you set a daily reminder in Innermark. Open the app to change or disable reminders in Settings.</p></div>'

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Innermark <hello@getinnermark.com>', to: p.email, subject, html }),
    })

    if (emailRes.ok) sent++
    else console.error('Email failed for ' + p.email + ': ' + await emailRes.text())
  }

  return new Response(
    JSON.stringify({ sent, skipped, total: profiles.length, utc_hour: utcHour }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
