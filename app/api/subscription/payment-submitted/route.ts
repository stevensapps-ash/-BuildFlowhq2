import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const plan = body.plan === 'yearly' ? 'yearly' : 'monthly'
  const amount_cents = plan === 'yearly' ? 29999 : 2999

  const { error } = await supabase.from('subscription_payment_submissions').insert({
    user_id: user.id,
    requested_plan: plan,
    amount_cents,
    status: 'pending',
    note: 'Submitted from Construction HQ subscription page'
  })

  if (error) return NextResponse.json({ error: 'PAYMENT_SUBMISSION_FAILED' }, { status: 500 })
  return NextResponse.json({ ok: true, plan })
}
