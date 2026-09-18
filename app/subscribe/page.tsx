'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Coins, ExternalLink, HardHat, ShieldCheck } from 'lucide-react'

const VENMO_PAYMENT_URL='https://venmo.com/code?user_id=4684033359349495058&created=1789509238.174633&printed=1'
const YEARLY_PRICE='$299.99'
const TOKEN_PACKS=[
  {tokens:'500',price:'$4.99'},
  {tokens:'1,500',price:'$9.99'},
  {tokens:'4,000',price:'$19.99'},
  {tokens:'10,000',price:'$39.99'},
]
const AI_COSTS=[
  ['Quick AI help / rewrite','5'],
  ['Receipt analysis','10'],
  ['Change order','15'],
  ['Contract','20'],
  ['AI estimate','20'],
  ['Full build plan + materials/costs','30'],
  ['Blueprint / project-planning assistance','30'],
]

export default function SubscribePage(){
  const [sent,setSent]=useState(false)
  const [plan,setPlan]=useState<'monthly'|'yearly'>('monthly')
  const [submitting,setSubmitting]=useState(false)
  async function submitPayment(){setSubmitting(true);try{const r=await fetch('/api/subscription/payment-submitted',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan})});if(!r.ok)throw Error();setSent(true)}finally{setSubmitting(false)}}
  return <main style={{minHeight:'100vh',background:'#f5f7fb',padding:'32px 18px',fontFamily:'system-ui',color:'#172033'}}>
    <section style={{maxWidth:680,margin:'0 auto',background:'#fff',border:'1px solid #e4e8ef',borderRadius:22,padding:28,boxShadow:'0 12px 35px rgba(20,35,60,.08)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:800,fontSize:22}}><HardHat/>Construction HQ</div>
      <h1 style={{fontSize:32,margin:'24px 0 8px'}}>Activate your company workspace</h1>
      <p style={{lineHeight:1.6,color:'#526070'}>Construction HQ keeps your projects, AI estimates, build plans, invoices, customers and company records organized in one private workspace.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,margin:'20px 0'}}><button onClick={()=>setPlan('monthly')} style={{padding:14,borderRadius:12,border:plan==='monthly'?'2px solid #172033':'1px solid #dfe5ed',background:'#fff',fontWeight:800}}>Monthly · $29.99</button><button onClick={()=>setPlan('yearly')} style={{padding:14,borderRadius:12,border:plan==='yearly'?'2px solid #172033':'1px solid #dfe5ed',background:'#fff',fontWeight:800}}>Yearly · $299.99</button></div><div style={{margin:'24px 0',padding:22,border:'2px solid #172033',borderRadius:18}}>
        <div style={{fontWeight:800,fontSize:21}}>Construction HQ subscription</div>
        <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:8}}><strong style={{fontSize:36}}>$29.99</strong><span style={{color:'#526070'}}>/ month</span></div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,fontWeight:700}}><Coins size={18}/>1,000 Construction HQ Tokens included each month</div>
        <p style={{margin:'12px 0 0',color:'#526070',lineHeight:1.55}}>No free trial. Subscription payment is required to activate Construction HQ. Included tokens replenish with each paid billing month.</p>
        <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #dfe5ed'}}><div style={{fontWeight:800,fontSize:18}}>Yearly subscription</div><div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:6}}><strong style={{fontSize:30}}>{YEARLY_PRICE}</strong><span style={{color:'#526070'}}>/ year</span></div><p style={{margin:'7px 0 0',color:'#526070',lineHeight:1.5}}>Save $59.89 compared with paying $29.99 monthly for 12 months — about 2 months free. Includes 1,000 Construction HQ Tokens each month.</p></div>
      </div>

      <h2 style={{fontSize:20,margin:'24px 0 10px'}}>AI token costs</h2>
      <div style={{border:'1px solid #dfe5ed',borderRadius:14,overflow:'hidden'}}>
        {AI_COSTS.map(([feature,cost],i)=><div key={feature} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'11px 14px',borderTop:i?'1px solid #edf0f4':'none'}}><span>{feature}</span><strong>{cost} tokens</strong></div>)}
      </div>

      <h2 style={{fontSize:20,margin:'24px 0 10px'}}>Buy more tokens</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
        {TOKEN_PACKS.map(pack=><div key={pack.tokens} style={{border:'1px solid #dfe5ed',borderRadius:14,padding:14}}><strong>{pack.tokens} tokens</strong><div style={{fontSize:20,fontWeight:800,marginTop:5}}>{pack.price}</div></div>)}
      </div>
      <p style={{fontSize:13,color:'#667386',lineHeight:1.5}}>Tokens are used only for AI-powered features. Purchased token packs remain available until used.</p>

      <p style={{margin:'22px 0 14px',color:'#526070',lineHeight:1.55}}>During the MVP launch, subscription and token-pack payments are handled through the Stevensapps Venmo Business profile and manually verified.</p>
      {!sent ? <>
        <a href={VENMO_PAYMENT_URL} target="_blank" rel="noopener noreferrer" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,textDecoration:'none',background:'#172033',color:'#fff',padding:'14px 18px',borderRadius:12,fontWeight:800}}>Pay with Venmo <ExternalLink size={18}/></a>
        <button onClick={submitPayment} disabled={submitting} style={{width:'100%',marginTop:12,padding:'13px 18px',borderRadius:12,border:'1px solid #cfd6df',background:'#fff',fontWeight:700,cursor:'pointer'}}>{submitting?'Saving payment submission…':`I sent my ${plan} payment`}</button>
      </> : <div style={{padding:20,borderRadius:16,background:'#f1f7f3'}}><div style={{display:'flex',gap:9,alignItems:'center',fontWeight:800}}><CheckCircle2 size={20}/>Payment pending verification</div><p style={{lineHeight:1.55,marginBottom:0}}>Your payment submission is now saved securely to your Construction HQ account. Construction HQ access will be activated after the payment is verified.</p></div>}
      <div style={{display:'flex',gap:8,alignItems:'flex-start',marginTop:22,color:'#526070',fontSize:14,lineHeight:1.5}}><ShieldCheck size={18} style={{flex:'0 0 auto'}}/><span>Construction HQ does not ask you to enter bank or card details on this page. Venmo handles the payment.</span></div>
      <p style={{textAlign:'center',marginTop:22,fontSize:14}}><Link href="/login">Return to sign in</Link></p>
    </section>
  </main>
}
