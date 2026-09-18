'use client'

import { useEffect, useState } from 'react'
import { Bot, CheckCircle2, CircleAlert, PhoneCall, PhoneForwarded, MessageSquareText, Settings2 } from 'lucide-react'

type Status = { receptionist?: { provider?: string; configured?: boolean; phoneConfigured?: boolean } }

export default function ReceptionistPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [transferNumber,setTransferNumber]=useState('')
  const [businessName,setBusinessName]=useState('')
  const [saved,setSaved]=useState(false)

  useEffect(() => {
    fetch('/api/integrations/status').then(r => r.json()).then(setStatus).catch(() => setStatus({}))
    try {
      const v=JSON.parse(localStorage.getItem('construction-hq-call-agent')||'{}')
      setTransferNumber(v.transferNumber||''); setBusinessName(v.businessName||'')
    } catch {}
  }, [])

  const r=status?.receptionist
  const ready=Boolean(r?.configured && r?.phoneConfigured)
  const save=()=>{
    localStorage.setItem('construction-hq-call-agent',JSON.stringify({transferNumber,businessName}))
    setSaved(true); setTimeout(()=>setSaved(false),1800)
  }

  return <main style={{maxWidth:920,margin:'0 auto',padding:'40px 20px',fontFamily:'system-ui',color:'#eaf2ff',background:'#05090f',minHeight:'100vh'}}>
    <a href="/" style={{color:'#57e6ff',textDecoration:'none'}}>← Back to Construction HQ</a>
    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:28}}><PhoneForwarded size={36}/><div><h1 style={{margin:0}}>Call Forwarding AI Agent</h1><p style={{margin:'6px 0 0',color:'#9fb0c5'}}>Forward business calls to AI, then transfer qualified calls to the right person.</p></div></div>

    <section style={card}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>{ready?<CheckCircle2/>:<CircleAlert/>}<strong>{ready?'Voice provider and phone connection detected':'Voice provider connection is required before live calls can run'}</strong></div>
      <p style={{color:'#aab8c8'}}>Provider: <b style={{color:'#fff'}}>{r?.provider||'Retell'}</b></p>
    </section>

    <section style={card}>
      <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:18}}><Settings2/><strong>Company call routing</strong></div>
      <label style={label}>Business name</label>
      <input value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Keating Construction" style={input}/>
      <label style={label}>Owner / staff transfer number</label>
      <input value={transferNumber} onChange={e=>setTransferNumber(e.target.value)} placeholder="(555) 555-5555" inputMode="tel" style={input}/>
      <button onClick={save} style={button}>{saved?'Saved ✓':'Save call routing'}</button>
      <p style={{fontSize:13,color:'#8496aa'}}>This screen stores the routing preference for setup. Live forwarding and transfers activate after the voice provider is connected to the company phone number.</p>
    </section>

    <section style={card}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}><Bot/><strong>Agent workflow</strong></div>
      <p style={{lineHeight:1.65,color:'#b9c7d8'}}>Incoming forwarded call → AI answers using the company name → identifies the reason for the call → answers approved FAQs → captures name, callback number and project details → transfers appropriate calls to owner/staff → if unavailable, takes a message → saves a call summary and lead record in Construction HQ.</p>
    </section>

    <section style={card}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}><PhoneCall/><strong>Transfer rules</strong></div>
      <p style={{color:'#b9c7d8',lineHeight:1.65}}>The agent can transfer urgent callers, existing customers, or callers who specifically request a person. It must never invent pricing, availability, policies, or claim an appointment is confirmed unless a connected scheduling system confirms it.</p>
      <div style={{display:'flex',gap:10,alignItems:'center',marginTop:14}}><MessageSquareText/><span>Failed transfer → return to AI → take message → create owner summary.</span></div>
    </section>
  </main>
}

const card={marginTop:20,padding:24,border:'1px solid #26384c',borderRadius:18,background:'#0b121c'} as const
const label={display:'block',fontSize:13,fontWeight:800,margin:'14px 0 7px',color:'#b8c8da'} as const
const input={width:'100%',boxSizing:'border-box',padding:'13px 14px',borderRadius:11,border:'1px solid #344a62',background:'#060b12',color:'#fff',fontSize:16} as const
const button={marginTop:16,padding:'12px 18px',border:0,borderRadius:11,background:'#64ff72',color:'#071009',fontWeight:900,cursor:'pointer'} as const
