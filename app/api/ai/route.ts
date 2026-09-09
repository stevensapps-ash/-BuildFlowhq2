import { NextResponse } from 'next/server'
import { generateText } from 'ai'

const instructionsByMode: Record<string, string> = {
  estimate: `You are BuildFlow AI, an estimating assistant for small construction companies. Generate a professional planning estimate from the contractor's description. Return ONLY valid JSON with keys: scope (string[]), materials (string[]), labor (string[]), assumptions (string[]), amount (number). Include practical quantities/allowances when reasonable. Never claim supplier pricing is guaranteed. Clearly separate assumptions and exclusions. Do not generate permit-ready architectural claims.`,
  contract: `You are BuildFlow AI, a construction contract drafting assistant. Draft a concise contractor/customer agreement from the supplied project information. Include scope, payment terms placeholders, change-order requirement, site access, exclusions, schedule caveat, warranty placeholder, dispute/termination placeholders, and customer/contractor signature blocks. State that owner review and local legal review may be required before use.`,
  change_order: `You are BuildFlow AI, a construction change-order drafting assistant. Draft the changed scope, reason, schedule impact, cost-impact structure, exclusions, approval language, and customer/contractor signature blocks. Do not invent accepted pricing if not supplied.`,
  blueprint: `You are BuildFlow AI, a construction project-planning assistant. Create a conceptual project plan from the supplied description: dimensions to verify, layout zones, construction sequence, materials/assemblies, dependencies, field checks, and drawing notes. Explicitly label it conceptual/project planning and not permit-ready architecture or engineering.`,
  receipt: `You are BuildFlow AI, a receipt organization assistant for construction companies. Extract and organize merchant, date, total, line items, likely expense categories, and suggested project tags from the supplied receipt information. Do not invent unreadable values; mark them unknown.`,
  general: `You are BuildFlow AI, an operations assistant for contractors. Produce a practical draft that the business owner can review and edit.`
}

type ProviderFailure = { provider: string; message: string }

async function directOpenAI(apiKey: string, model: string, instructions: string, input: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, instructions, input, store: false })
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`OPENAI_${response.status}:${data?.error?.message || 'request failed'}`)
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim()

  const parts = Array.isArray(data?.output)
    ? data.output.flatMap((item: any) => (Array.isArray(item?.content) ? item.content : []))
    : []
  const text = parts.find(
    (part: any) => (part?.type === 'output_text' || part?.type === 'text') && typeof part?.text === 'string'
  )?.text

  if (!text?.trim()) throw new Error('OPENAI_EMPTY_RESPONSE')
  return text.trim()
}

function safeMessage(error: unknown) {
  return String((error as any)?.message || error || 'unknown error').slice(0, 240)
}

function looksLikeAccessFailure(message: string) {
  return /credit card|credit|payment|billing|forbidden|unauthorized|401|403|quota|insufficient_quota/i.test(message)
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

    if (openAiKey) {
      try {
        const text = await directOpenAI(
          openAiKey,
          process.env.OPENAI_MODEL || 'gpt-5.6-luna',
          instructions,
          input
        )
        return NextResponse.json({ text, provider: 'openai' })
      } catch (error) {
        const message = safeMessage(error)
        failures.push({ provider: 'openai', message })
        console.error('BuildFlow AI OpenAI failed; trying Gateway', message)
      }
    } else {
      failures.push({ provider: 'openai', message: 'OPENAI_API_KEY_NOT_CONFIGURED' })
    }

    try {
      const { text } = await generateText({
        model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-5.6-luna',
        system: instructions,
        prompt: input
      })

      if (!text?.trim()) throw new Error('AI_EMPTY_RESPONSE')
      return NextResponse.json({ text: text.trim(), provider: 'vercel-ai-gateway' })
    } catch (error) {
      const message = safeMessage(error)
      failures.push({ provider: 'vercel-ai-gateway', message })
      console.error('BuildFlow AI Gateway failed', message)
    }

    const accessBlocked = failures.some((failure) => looksLikeAccessFailure(failure.message))
    return NextResponse.json(
      {
        error: accessBlocked ? 'AI_PROVIDER_ACCESS_REQUIRED' : 'AI_REQUEST_FAILED',
        providersTried: failures.map(({ provider }) => provider)
      },
      { status: accessBlocked ? 503 : 502 }
    )
  } catch (error) {
    console.error('BuildFlow AI request error', safeMessage(error))
    return NextResponse.json({ error: 'AI_REQUEST_FAILED' }, { status: 502 })
  }
}
