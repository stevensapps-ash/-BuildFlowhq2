import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: membership } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership?.company_id) return NextResponse.json({ error: 'COMPANY_NOT_FOUND' }, { status: 404 })

  const { data, error } = await supabase
    .from('ai_usage_events')
    .select('feature,provider,model,input_tokens,output_tokens,estimated_cost_usd,credits_charged,created_at')
    .eq('company_id', membership.company_id)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: 'USAGE_LOAD_FAILED' }, { status: 500 })

  const events = data || []
  const summary = events.reduce((acc, event) => {
    acc.requests += 1
    acc.inputTokens += Number(event.input_tokens || 0)
    acc.outputTokens += Number(event.output_tokens || 0)
    acc.estimatedCostUsd += Number(event.estimated_cost_usd || 0)
    acc.creditsCharged += Number(event.credits_charged || 0)
    return acc
  }, { requests: 0, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0, creditsCharged: 0 })

  summary.estimatedCostUsd = Number(summary.estimatedCostUsd.toFixed(8))
  return NextResponse.json({ summary, events })
}
