'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ExternalLink, HardHat, ShieldCheck } from 'lucide-react'

const VENMO_PAYMENT_URL='https://venmo.com/code?user_id=4684033359349495058&created=1789509238.174633&printed=1'

export default function SubscribePage(){
  const [sent,setSent]=useState(false)
  return <main style={{minHeight:'100vh',background:'#f5f7fb',padding:'32px 18px',fontFamily:'system-ui',color:'#172033'}}>
    <section style={{maxWidth:620,margin:'0 auto',background:'#fff',border:'1px solid #e4e8ef',borderRadius:22,padding:28,boxShadow:'0 12px 35px rgba(20,35,60,.08)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:800,fontSize:22}}><HardHat/>BuildFlow HQ</div>
      <h1 style={{fontSize:32,margin:'24px 0 8px'}}>Activate your company workspace</h1>
      <p style={{lineHeight:1.6,color:'#526070'}}>BuildFlow keeps your projects, estimates, invoices, customers and company records organized in one private workspace.</p>
      <div style={{margin:'24px 0',padding:20,border:'1px solid #dfe5ed',borderRadius:16}}>
        <div style={{fontWeight:800,fontSize:20}}>BuildFlow subscription</div>
        <p style={{margin:'8px 0 0',color:'#526070'}}>Pay securely through the Stevensapps Venmo Business profile. Subscription activation is manually verified during the MVP launch.</p>
      </div>
      {!sent ? <>
        <a href={VENMO_PAYMENT_URL} target="_blank" rel="noopener noreferrer" style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,textDecoration:'none',background:'#172033',color:'#fff',padding:'14px 18px',borderRadius:12,fontWeight:800}}>Pay with Venmo <ExternalLink size={18}/></a>
        <button onClick={()=>setSent(true)} style={{width:'100%',marginTop:12,padding:'13px 18px',borderRadius:12,border:'1px solid #cfd6df',background:'#fff',fontWeight:700,cursor:'pointer'}}>I sent my payment</button>
      </> : <div style={{padding:20,borderRadius:16,background:'#f1f7f3'}}><div style={{display:'flex',gap:9,alignItems:'center',fontWeight:800}}><CheckCircle2 size={20}/>Payment pending verification</div><p style={{lineHeight:1.55,marginBottom:0}}>Your payment submission has been noted on this device. BuildFlow access will be activated after the payment is verified.</p></div>}
      <div style={{display:'flex',gap:8,alignItems:'flex-start',marginTop:22,color:'#526070',fontSize:14,lineHeight:1.5}}><ShieldCheck size={18} style={{flex:'0 0 auto'}}/><span>BuildFlow does not ask you to enter bank or card details on this page. Venmo handles the payment.</span></div>
      <p style={{textAlign:'center',marginTop:22,fontSize:14}}><Link href="/login">Return to sign in</Link></p>
    </section>
  </main>
}
