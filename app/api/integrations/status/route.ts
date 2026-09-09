import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  return NextResponse.json({
    ai: {
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      gatewayConfigured: true
    },
    receptionist: {
      provider: process.env.RECEPTIONIST_PROVIDER || 'retell',
      configured: Boolean(process.env.RETELL_API_KEY && process.env.RETELL_AGENT_ID),
      phoneConfigured: Boolean(process.env.RETELL_PHONE_NUMBER)
    },
    payroll: {
      provider: process.env.PAYROLL_PROVIDER || 'gusto',
      configured: Boolean(process.env.GUSTO_CLIENT_ID && process.env.GUSTO_CLIENT_SECRET),
      environment: process.env.GUSTO_ENVIRONMENT || 'demo'
    }
  })
}
