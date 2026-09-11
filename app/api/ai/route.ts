import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createLocalBuildPlan } from '@/lib/local-build-plan'
import { createClient } from '@/lib/supabase/server'

const instructionsByMode: Record<string, string> = {
  estimate: `You are BuildFlow AI, an estimating assistant for small construction companies. Generate a professional planning estimate from the contractor's description. Return ONLY valid JSON with keys: scope (string[]), materials (string[]), labor (string[]), assumptions (string[]), amount (number). Include practical quantities/allowances when reasonable. Never claim supplier pricing is guaranteed. Clearly separate assumptions and exclusions. Do not generate permit-ready architectural claims.`,
  build_plan: `You are BuildFlow AI, a construction planning assistant for small contractors. Create a practical build plan from the contractor's description. Return ONLY valid JSON with keys: title (string), overview (string), steps (string[]), supplies (array of objects with item, quantity, estimatedUnitCost, estimatedLineCost), materialCost (number), laborTasks (string[]), estimatedLaborHours (number), laborCost (number), estimatedTotalCost (number), assumptions (string[]), safetyAndCodeNotes (string[]). The steps must explain how to build the project in a clear recommended sequence. Supply quantities and costs should be reasonable planning estimates only, not guaranteed supplier prices. Include waste/allowance where appropriate. Clearly identify dimensions or field conditions that must be verified. Do not present the output as permit-ready architecture or engineering; advise local code/permit verification when relevant.`,
  contract: `You are BuildFlow AI, a construction contract drafting assistant. Draft a concise contractor/customer agreement from the supplied project information. Include scope, payment terms placeholders, change-order requirement, site access, exclusions, schedule caveat, warranty placeholder, dispute/termination placeholders, and customer/contractor signature blocks. State that owner review and local legal review may be required before use.`,
  change_order: `You are BuildFlow AI, a construction change-order drafting assistant. Draft the changed scope, reason, schedule impact, cost-impact structure, exclusions, approval language, and customer/contractor signature blocks. Do not invent accepted pricing if not supplied.`,
  blueprint: `You are BuildFlow AI, a construction project-planning assistant. Create a conceptual project plan from the supplied description: dimensions to verify, layout zones, construction sequence, materials/assemblies, dependencies, field checks, and drawing notes. Explicitly label it conceptual/project planning and not permit-ready architecture or engineering.`,
  receipt: `You are BuildFlow AI, a receipt organization assistant for construction companies. Extract and organize merchant, date, total, line items, likely expense categories, and suggested project tags from the supplied receipt information. Do not invent unreadable values; mark them unknown.`,
  general: `You are BuildFlow AI, an operations assistant for contractors. Produce a practical draft that the business owner can review and edit.`
}

type ProviderFailure = { provider: string; message: string }
type Usage = { inputTokens: number; outputTokens: number; estimatedCostUsd: number }

function calculateLunaCost(inputTokens = 0, outputTokens = 0) {
  return Number(((inputTokens / 1_000_000) * 0.2 + (outputTokens / 1_000_000) * 1.2).toFixed(8))
}

async function directOpenAI(apiKey: string, model: string, instructions: string, input: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, instructions, input, store: false })
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`OPENAI_${response.status}:${data?.error?.message || 'request failed'}`)

  let text = typeof data?.output_text === 'string' ? data.output_text.trim() : ''
  if (!text) {
    const parts = Array.isArray(data?.output)
      ? data.output.flatMap((item: any) => (Array.isArray(item?.content) ? item.content : []))
      : []
    text = parts.find(
      (part: any) => (part?.type === 'output_text' || part?.type === 'text') && typeof part?.text === 'string'
    )?.text?.trim() || ''
  }
  if (!text) throw new Error('OPENAI_EMPTY_RESPONSE')

  const inputTokens = Number(data?.usage?.input_tokens || 0)
  const outputTokens = Number(data?.usage?.output_tokens || 0)
  return { text, usage: { inputTokens, outputTokens, estimatedCostUsd: calculateLunaCost(inputTokens, outputTokens) } }
}

async function recordUsage(feature: string, provider: string, model: string, usage: Usage) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: membership } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
    if (!membership?.company_id) return
    await supabase.from('ai_usage_events').insert({
      company_id: membership.company_id,
      user_id: user.id,
      feature,
      provider,
      model,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      estimated_cost_usd: usage.estimatedCostUsd,
      credits_charged: 0
    })
  } catch (error) {
    console.error('BuildFlow usage tracking failed', safeMessage(error))
  }
}

function safeMessage(error: unknown) {
  return String((error as any)?.message || error || 'unknown error').slice(0, 240)
}

function looksLikeAccessFailure(message: string) {
  return /credit card|credit|payment|billing|forbidden|unauthorized|401|403|quota|insufficient_quota/i.test(message)
}

function field(input: string, label: string) {
  const line = input.split('\n').find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`))
  return line ? line.slice(line.indexOf(':') + 1).trim() : ''
}

async function localBuildPlanResponse(input: string) {
  const laborText = field(input, 'Labor rate')
  const laborMatch = laborText.match(/\$?([0-9]+(?:\.[0-9]+)?)/)
  const draft = createLocalBuildPlan({
    project: field(input, 'Project') || 'Build Plan',
    description: field(input, 'Job description') || input,
    measurements: field(input, 'Measurements / field notes'),
    laborRate: laborMatch ? Number(laborMatch[1]) : undefined,
  })
  const usage = { inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 }
  await recordUsage('build_plan', 'local-planning', 'local', usage)
  return NextResponse.json({ text: JSON.stringify(draft), provider: 'local-planning', usage })
}

export async function POST(req: Request) {
  const failures: ProviderFailure[] = []

  try {
    const body = await req.json()
    const mode = String(body.mode || 'general')
    const input = String(body.input || '').trim()

    if (!input) return NextResponse.json({ error: 'AI_INPUT_REQUIRED' }, { status: 400 })

    const instructions = instructionsByMode[mode] || instructionsByMode.general
    const openAiKey = process.env.OPENAI_API_KEY
    const openAiModel = process.env.OPENAI_MODEL || 'gpt-5.6-luna'

    if (openAiKey) {
      try {
        const result = await directOpenAI(openAiKey, openAiModel, instructions, input)
        await recordUsage(mode, 'openai', openAiModel, result.usage)
        return NextResponse.json({ text: result.text, provider: 'openai', usage: result.usage })
      } catch (error) {
        const message = safeMessage(error)
        failures.push({ provider: 'openai', message })
        console.error('BuildFlow AI OpenAI failed; trying Gateway', message)
      }
    } else {
      failures.push({ provider: 'openai', message: 'OPENAI_API_KEY_NOT_CONFIGURED' })
    }

    try {
      const gatewayModel = process.env.AI_GATEWAY_MODEL || 'openai/gpt-5.6-luna'
      const result = await generateText({ model: gatewayModel, system: instructions, prompt: input })
      if (!result.text?.trim()) throw new Error('AI_EMPTY_RESPONSE')
      const inputTokens = Number((result.usage as any)?.inputTokens || 0)
      const outputTokens = Number((result.usage as any)?.outputTokens || 0)
      const usage = { inputTokens, outputTokens, estimatedCostUsd: calculateLunaCost(inputTokens, outputTokens) }
      await recordUsage(mode, 'vercel-ai-gateway', gatewayModel, usage)
      return NextResponse.json({ text: result.text.trim(), provider: 'vercel-ai-gateway', usage })
    } catch (error) {
      const message = safeMessage(error)
      failures.push({ provider: 'vercel-ai-gateway', message })
      console.error('BuildFlow AI Gateway failed', message)
    }

    if (mode === 'build_plan') return localBuildPlanResponse(input)

    const accessBlocked = failures.some((failure) => looksLikeAccessFailure(failure.message))
    return NextResponse.json(
      { error: accessBlocked ? 'AI_PROVIDER_ACCESS_REQUIRED' : 'AI_REQUEST_FAILED', providersTried: failures.map(({ provider }) => provider) },
      { status: accessBlocked ? 503 : 502 }
    )
  } catch (error) {
    console.error('BuildFlow AI request error', safeMessage(error))
    return NextResponse.json({ error: 'AI_REQUEST_FAILED' }, { status: 502 })
  }
}
