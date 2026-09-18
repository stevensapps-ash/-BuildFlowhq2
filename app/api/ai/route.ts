import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createLocalBuildPlan } from '@/lib/local-build-plan'
import { createClient } from '@/lib/supabase/server'

const instructionsByMode: Record<string,string>={
 estimate:`You are BuildFlow AI, an estimating assistant for small construction companies. Return ONLY valid JSON with keys: scope (string[]), materials (string[]), labor (string[]), assumptions (string[]), amount (number).`,
 contract:`You are BuildFlow AI, a construction contract drafting assistant. Draft a concise contractor/customer agreement with scope, payment terms placeholders, change orders, site access, exclusions, schedule caveat, warranty placeholder, dispute/termination placeholders, and signature blocks.`,
 change_order:`You are BuildFlow AI, a construction change-order drafting assistant. Draft changed scope, reason, schedule impact, cost-impact structure, exclusions, approval language, and signature blocks.`,
 blueprint:`You are BuildFlow AI, a construction project-planning assistant. Create a conceptual project plan, not permit-ready architecture or engineering.`,
 receipt:`You are Construction HQ AI, a receipt organization assistant. Return ONLY valid JSON with key assignments, an array of objects containing index (number), customer (string), project (string), category (string). Use only customer and project names provided by the user. If uncertain, return empty strings rather than inventing a match.`,
 general:`You are BuildFlow AI, an operations assistant for contractors. Produce a practical draft the owner can review and edit.`
}
type Usage={inputTokens:number;outputTokens:number;estimatedCostUsd:number}
function safeMessage(e:unknown){return String((e as any)?.message||e||'unknown error').slice(0,240)}
function field(input:string,label:string){const line=input.split('\n').find(x=>x.toLowerCase().startsWith(`${label.toLowerCase()}:`));return line?line.slice(line.indexOf(':')+1).trim():''}
function makeLocalDraft(input:string){const laborText=field(input,'Labor rate');const m=laborText.match(/\$?([0-9]+(?:\.[0-9]+)?)/);return createLocalBuildPlan({project:field(input,'Project')||'Project',description:field(input,'Job description')||input,measurements:field(input,'Measurements / field notes'),laborRate:m?Number(m[1]):undefined})}
async function recordUsage(feature:string,provider:string,model:string,usage:Usage){try{const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return;const{data:membership}=await supabase.from('company_members').select('company_id').eq('user_id',user.id).limit(1).maybeSingle();if(!membership?.company_id)return;await supabase.from('ai_usage_events').insert({company_id:membership.company_id,user_id:user.id,feature,provider,model,input_tokens:usage.inputTokens,output_tokens:usage.outputTokens,estimated_cost_usd:usage.estimatedCostUsd,credits_charged:0})}catch(e){console.error('BuildFlow usage tracking failed',safeMessage(e))}}
async function localResponse(mode:string,input:string){const draft=makeLocalDraft(input),usage={inputTokens:0,outputTokens:0,estimatedCostUsd:0};void recordUsage(mode,'local-planning','local',usage);if(mode==='estimate')return NextResponse.json({text:JSON.stringify({scope:draft.steps,materials:draft.supplies.map(s=>`${s.item} — ${s.quantity} — planning allowance $${s.estimatedLineCost.toFixed(2)}`),labor:draft.laborTasks,assumptions:[...draft.assumptions,...draft.safetyAndCodeNotes],amount:draft.estimatedTotalCost}),provider:'local-planning',usage});return NextResponse.json({text:JSON.stringify(draft),provider:'local-planning',usage})}

export async function POST(req:Request){try{const body=await req.json();const mode=String(body.mode||'general');const input=String(body.input||'').trim();if(!input)return NextResponse.json({error:'AI_INPUT_REQUIRED'},{status:400});
 // Build Plans and Estimates must never hang on an external AI provider during a customer demo.
 // They use the built-in planning engine immediately; external AI remains available for other drafting features.
 if(mode==='build_plan'||mode==='estimate')return localResponse(mode,input)
 const instructions=instructionsByMode[mode]||instructionsByMode.general
 try{const gatewayModel=process.env.AI_GATEWAY_MODEL||'inclusionai/ling-3.0-flash-vl-free';const result=await generateText({model:gatewayModel,system:instructions,prompt:input});if(!result.text?.trim())throw new Error('AI_EMPTY_RESPONSE');const usage={inputTokens:Number((result.usage as any)?.inputTokens||0),outputTokens:Number((result.usage as any)?.outputTokens||0),estimatedCostUsd:0};void recordUsage(mode,'vercel-ai-gateway',gatewayModel,usage);return NextResponse.json({text:result.text.trim(),provider:'vercel-ai-gateway',usage})}catch(e){console.error('BuildFlow AI Gateway failed',safeMessage(e));return NextResponse.json({error:'AI_REQUEST_FAILED'},{status:502})}
 }catch(e){console.error('BuildFlow AI request error',safeMessage(e));return NextResponse.json({error:'AI_REQUEST_FAILED'},{status:502})}}
