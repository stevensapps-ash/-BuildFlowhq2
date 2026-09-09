import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI_NOT_CONFIGURED' }, { status: 503 })
    }

    const mode = String(body.mode || 'general')
    const input = String(body.input || '').trim()
    if (!input) {
      return NextResponse.json({ error: 'AI_INPUT_REQUIRED' }, { status: 400 })
    }

    const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna'

    const instructionsByMode: Record<string, string> = {
      estimate: `You are BuildFlow AI, an estimating assistant for small construction companies. Generate a professional planning estimate from the contractor's description. Return ONLY valid JSON with keys: scope (string[]), materials (string[]), labor (string[]), assumptions (string[]), amount (number). Include practical quantities/allowances when reasonable. Never claim supplier pricing is guaranteed. Clearly separate assumptions and exclusions. Do not generate permit-ready architectural claims.`,
      contract: `You are BuildFlow AI, a construction contract drafting assistant. Draft a concise contractor/customer agreement from the supplied project information. Include scope, payment terms placeholders, change-order requirement, site access, exclusions, schedule caveat, warranty placeholder, dispute/termination placeholders, and customer/contractor signature blocks. State that owner review and local legal review may be required before use.`,
      change_order: `You are BuildFlow AI, a construction change-order drafting assistant. Draft the changed scope, reason, schedule impact, cost-impact structure, exclusions, approval language, and customer/contractor signature blocks. Do not invent accepted pricing if not supplied.`,
      blueprint: `You are BuildFlow AI, a construction project-planning assistant. Create a conceptual project plan from the supplied description: dimensions to verify, layout zones, construction sequence, materials/assemblies, dependencies, field checks, and drawing notes. Explicitly label it conceptual/project planning and not permit-ready architecture or engineering.`,
      receipt: `You are BuildFlow AI, a receipt organization assistant for construction companies. Extract and organize merchant, date, total, line items, likely expense categories, and suggested project tags from the supplied receipt information. Do not invent unreadable values; mark them unknown.`,
      general: `You are BuildFlow AI, an operations assistant for contractors. Produce a practical draft that the business owner can review and edit.`
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        instructions: instructionsByMode[mode] || instructionsByMode.general,
        input,
        store: false
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('BuildFlow AI request failed', response.status, data?.error?.message || data?.error || 'Unknown error')
      return NextResponse.json({ error: 'AI_REQUEST_FAILED' }, { status: response.status })
    }

    const text = data.output_text || data.output?.flatMap((item: any) => item.content || []).find((c: any) => c.type === 'output_text')?.text || ''
    if (!text) {
      return NextResponse.json({ error: 'AI_EMPTY_RESPONSE' }, { status: 502 })
    }
    return NextResponse.json({ text })
  } catch (error) {
    console.error('BuildFlow AI server error', error)
    return NextResponse.json({ error: 'AI_SERVER_ERROR' }, { status: 500 })
  }
}
