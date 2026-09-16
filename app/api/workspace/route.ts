import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getContext() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  // Keep the membership lookup simple. Embedding companies here can cause the
  // whole query to fail under RLS even when the user's membership is valid.
  const { data: membership, error: membershipError } = await supabase
    .from('company_members')
    .select('company_id,role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    console.error('BuildFlow workspace membership lookup failed', membershipError.message)
    return { error: NextResponse.json({ error: 'Workspace membership could not be loaded' }, { status: 500 }) }
  }
  if (!membership) return { error: NextResponse.json({ error: 'No company workspace found' }, { status: 403 }) }

  return { supabase, user, membership }
}

export async function GET() {
  const ctx = await getContext()
  if ('error' in ctx) return ctx.error
  const { supabase, membership } = ctx

  const [{ data: company, error: companyError }, { data: workspace, error: workspaceError }] = await Promise.all([
    supabase.from('companies').select('name').eq('id', membership.company_id).maybeSingle(),
    supabase.from('workspace_state').select('data,updated_at').eq('company_id', membership.company_id).maybeSingle()
  ])

  if (companyError) console.error('BuildFlow company lookup failed', companyError.message)
  if (workspaceError) {
    console.error('BuildFlow workspace state lookup failed', workspaceError.message)
    return NextResponse.json({ error: 'Workspace state could not be loaded' }, { status: 500 })
  }

  return NextResponse.json({
    companyId: membership.company_id,
    companyName: company?.name || 'BuildFlow Company',
    role: membership.role,
    data: workspace?.data || {},
    updatedAt: workspace?.updated_at || null
  })
}

export async function PUT(request: Request) {
  const ctx = await getContext()
  if ('error' in ctx) return ctx.error
  const { supabase, membership } = ctx
  if (!['owner', 'manager'].includes(membership.role)) return NextResponse.json({ error: 'Read-only role' }, { status: 403 })

  const body = await request.json()
  const { error } = await supabase
    .from('workspace_state')
    .upsert({ company_id: membership.company_id, data: body, updated_at: new Date().toISOString() }, { onConflict: 'company_id' })

  if (error) {
    console.error('BuildFlow workspace save failed', error.message)
    return NextResponse.json({ error: 'Workspace could not be saved' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
