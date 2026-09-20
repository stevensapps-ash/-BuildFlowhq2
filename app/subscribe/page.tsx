'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Coins, CreditCard, HardHat, ShieldCheck } from 'lucide-react'

const YEARLY_PRICE='$299.99'
const MONTHLY_PRICE='$29.00'
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
  const [plan,setPlan]=useState<'monthly'|'yearly'>('monthly')
  const [submitting,setSubmitting]=useState(false)
  const [paymentError,setPaymentError]=useState('')
  async function startMoovCheckout(){
    setSubmitting(true)
    setPaymentError('')
    try {
      const r=await fetch('/api/moov/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan})})
      const body=await r.json().catch(()=>({}))
      if(!r.ok||!body.url) throw new Error(body.error||'Moov checkout is not ready.')
      window.location.assign(body.url)
    } catch (error) {
      setPaymentError(error instanceof Error?error.message:'Unable to start checkout.')
    } finally {
      setSubmitting(false)
    }
  }
  return <main style={{minHeight:'100vh',background:'#f5f7fb',padding:'32px 18px',fontFamily:'system-ui',color:'#172033'}}>
    <section style={{maxWidth:680,margin:'0 auto',background:'#fff',border:'1px solid #e4e8ef',borderRadius:22,padding:28,boxShadow:'0 12px 35px rgba(20,35,60,.08)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:800,fontSize:22}}><HardHat/>Construction HQ</div>
      <h1 style={{fontSize:32,margin:'24px 0 8px'}}>Activate your company workspace</h1>
      <p style={{lineHeight:1.6,color:'#526070'}}>Construction HQ keeps your projects, AI estimates, build plans, invoices, customers and company records organized in one private workspace.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,margin:'20px 0'}}><button onClick={()=>setPlan('monthly')} style={{padding:14,borderRadius:12,border:plan==='monthly'?'2px solid #172033':'1px solid #dfe5ed',background:'#fff',fontWeight:800}}>Monthly · $29.00</button><button onClick={()=>setPlan('yearly')} style={{padding:14,borderRadius:12,border:plan==='yearly'?'2px solid #172033':'1px solid #dfe5ed',background:'#fff',fontWeight:800}}>Yearly · $299.99</button></div><div style={{margin:'24px 0',padding:22,border:'2px solid #172033',borderRadius:18}}>
        <div style={{fontWeight:800,fontSize:21}}>Construction HQ subscription</div>
        <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:8}}><strong style={{fontSize:36}}>{plan==='monthly'?MONTHLY_PRICE:YEARLY_PRICE}</strong><span style={{color:'#526070'}}>{plan==='monthly'?'/ month':'/ year'}</span></div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,fontWeight:700}}><Coins size={18}/>1,000 Construction HQ Tokens included each month</div>
        <p style={{margin:'12px 0 0',color:'#526070',lineHeight:1.55}}>No free trial. Subscription payment is required to activate Construction HQ. Included tokens replenish with each paid billing month.</p>
        <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #dfe5ed'}}><div style={{fontWeight:800,fontSize:18}}>Yearly subscription</div><div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:6}}><strong style={{fontSize:30}}>{YEARLY_PRICE}</strong><span style={{color:'#526070'}}>/ year</span></div><p style={{margin:'7px 0 0',color:'#526070',lineHeight:1.5}}>Yearly billing is $299.99 for 12 months of Construction HQ access. Includes 1,000 Construction HQ Tokens each month.</p></div>
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

      <p style={{margin:'22px 0 14px',color:'#526070',lineHeight:1.55}}>Secure subscription checkout is handled by Moov. Your Moov credentials stay on the server and are never shown in the browser.</p>
      <button onClick={startMoovCheckout} disabled={submitting} style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center',gap:8,background:'#172033',color:'#fff',padding:'14px 18px',borderRadius:12,border:0,fontWeight:800,cursor:'pointer'}}><CreditCard size={18}/>{submitting?'Opening secure checkout…':`Continue to Moov · ${plan==='monthly'?MONTHLY_PRICE:YEARLY_PRICE}`}</button>
      {paymentError&&<div style={{marginTop:12,padding:12,borderRadius:10,background:'#fff3f1',color:'#9f2d20',fontWeight:700}}>{paymentError}</div>}
      <div style={{display:'flex',gap:8,alignItems:'flex-start',marginTop:22,color:'#526070',fontSize:14,lineHeight:1.5}}><ShieldCheck size={18} style={{flex:'0 0 auto'}}/><span>Construction HQ does not store your card or bank details. Payment information is handled by Moov.</span></div>
      <p style={{textAlign:'center',marginTop:22,fontSize:14}}><Link href="/login">Return to sign in</Link></p>
    </section>
  </main>
}
