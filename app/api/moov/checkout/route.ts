import { NextResponse } from 'next/server'

const API='https://api.moov.io'
const VERSION='v2026.07.00'

async function token(){
  const publicKey=process.env.NEXT_PUBLIC_MOOV_PUBLIC_KEY
  const secret=process.env.MOOV_SECRET_KEY
  if(!publicKey||!secret) throw new Error('Moov API keys are not configured.')
  const basic=Buffer.from(`${publicKey}:${secret}`).toString('base64')
  const r=await fetch(API+'/oauth2/token',{method:'POST',headers:{Authorization:`Basic ${basic}`,'Content-Type':'application/json','X-Moov-Version':VERSION},body:JSON.stringify({grant_type:'client_credentials',scope:'/accounts.read'})})
  const b=await r.json().catch(()=>({}))
  if(!r.ok||!b.access_token) throw new Error(b?.error_description||b?.error||'Moov authentication failed.')
  return b.access_token as string
}

export async function POST(req:Request){
  try{
    const {plan}=await req.json()
    if(plan!=='monthly'&&plan!=='yearly') return NextResponse.json({error:'Invalid subscription plan.'},{status:400})
    const access=await token()
    const r=await fetch(API+'/accounts?type=business',{headers:{Authorization:`Bearer ${access}`,'X-Moov-Version':VERSION}})
    const accounts=await r.json().catch(()=>[])
    if(!r.ok) return NextResponse.json({error:'Moov account lookup failed.'},{status:502})
    const account=(Array.isArray(accounts)?accounts:[]).find((a:any)=>a.accountType==='business')
    if(!account?.accountID) return NextResponse.json({error:'Your Moov keys work, but no business merchant account is connected to them yet. Add/verify the Construction HQ business account in Moov, then try again.'},{status:409})
    return NextResponse.json({error:`Moov is connected to ${account.displayName||'your business'}, but checkout needs the merchant payment method enabled before recurring billing can be created.`,accountConnected:true,plan,amount:plan==='monthly'?2900:29999},{status:409})
  }catch(e:any){
    return NextResponse.json({error:e?.message||'Unable to start Moov checkout.'},{status:500})
  }
}
