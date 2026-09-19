import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = new Set(['stevensapps@icloud.com', 'stevensapps31@gmail.com'])

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email?.toLowerCase() || ''
  if (!user || !ADMIN_EMAILS.has(email)) return { supabase, user: null }
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })

  const { data, error } = await supabase
    .from('subscription_payment_submissions')
    .select('id,user_id,requested_plan,amount_cents,status,note,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data || [] })
}

export async function POST(request: Request) {
  const { supabase, user } = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'ADMIN_REQUIRED' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const id = String(body.id || '')
  const action = body.action === 'reject' ? 'reject' : 'approve'
  if (!id) return NextResponse.json({ error: 'SUBMISSION_ID_REQUIRED' }, { status: 400 })

  const { data: submission, error: readError } = await supabase
    .from('subscription_payment_submissions')
    .select('id,user_id,requested_plan,status')
    .eq('id', id)
    .maybeSingle()

  if (readError || !submission) return NextResponse.json({ error: 'SUBMISSION_NOT_FOUND' }, { status: 404 })
  if (submission.status !== 'pending') return NextResponse.json({ error: 'SUBMISSION_ALREADY_REVIEWED' }, { status: 409 })

  if (action === 'reject') {
    const { error } = await supabase.from('subscription_payment_submissions').update({ status: 'rejected' }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: 'rejected' })
  }

  const yearly = submission.requested_plan === 'yearly'
  const currentPeriodEnd = new Date()
  if (yearly) currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
  else currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

  const { data: existing } = await supabase.from('user_subscriptions').select('user_id,token_balance').eq('user_id', submission.user_id).maybeSingle()
  const subscription = {
    status: 'active',
    plan: yearly ? 'construction_hq_yearly' : 'construction_hq_monthly',
    billing_period: yearly ? 'yearly' : 'monthly',
    activated_at: new Date().toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    updated_at: new Date().toISOString(),
    token_balance: Math.max(Number(existing?.token_balance || 0), 1000)
  }

  const write = existing
    ? await supabase.from('user_subscriptions').update(subscription).eq('user_id', submission.user_id)
    : await supabase.from('user_subscriptions').insert({ user_id: submission.user_id, ...subscription })

  if (write.error) return NextResponse.json({ error: write.error.message }, { status: 500 })

  const { error: statusError } = await supabase
    .from('subscription_payment_submissions')
    .update({ status: 'approved' })
    .eq('id', id)

  if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 })
  return NextResponse.json({ ok: true, status: 'approved' })
}
