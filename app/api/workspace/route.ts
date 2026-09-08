import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getContext(){
  const supabase=createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return {error:NextResponse.json({error:'Unauthorized'},{status:401})}
  const {data:membership,error}=await supabase.from('company_members').select('company_id,role,companies(name)').eq('user_id',user.id).limit(1).single()
  if(error||!membership)return {error:NextResponse.json({error:'No company workspace found'},{status:403})}
  return {supabase,user,membership}
}

export async function GET(){
  const ctx=await getContext(); if('error' in ctx)return ctx.error
  const {supabase,membership}=ctx
  const {data,error}=await supabase.from('workspace_state').select('data,updated_at').eq('company_id',membership.company_id).single()
  if(error)return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({companyId:membership.company_id,companyName:(membership.companies as any)?.name||'BuildFlow Company',role:membership.role,data:data?.data||{},updatedAt:data?.updated_at})
}

export async function PUT(request:Request){
  const ctx=await getContext(); if('error' in ctx)return ctx.error
  const {supabase,membership}=ctx
  if(!['owner','manager'].includes(membership.role))return NextResponse.json({error:'Read-only role'},{status:403})
  const body=await request.json()
  const {error}=await supabase.from('workspace_state').upsert({company_id:membership.company_id,data:body,updated_at:new Date().toISOString()},{onConflict:'company_id'})
  if(error)return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ok:true})
}
