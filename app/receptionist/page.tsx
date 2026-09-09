'use client'

import { useEffect, useState } from 'react'
import { Bot, CheckCircle2, CircleAlert, PhoneCall } from 'lucide-react'

type Status = { receptionist?: { provider?: string; configured?: boolean; phoneConfigured?: boolean } }

export default function ReceptionistPage() {
  const [status, setStatus] = useState<Status | null>(null)
  useEffect(() => { fetch('/api/integrations/status').then(r => r.json()).then(setStatus).catch(() => setStatus({})) }, [])
  const r = status?.receptionist
  const ready = Boolean(r?.configured && r?.phoneConfigured)

  return <main style={{maxWidth:900,margin:'0 auto',padding:'40px 20px',fontFamily:'Arial,sans-serif'}}>
    <a href="/" style={{textDecoration:'none'}}>← Back to BuildFlow HQ</a>
    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:28}}><PhoneCall size={34}/><div><h1 style={{margin:0}}>AI Receptionist</h1><p style={{margin:'6px 0 0'}}>Paid add-on · tenant-isolated business configuration</p></div></div>
    <section style={{marginTop:28,padding:24,border:'1px solid #d7dde5',borderRadius:16}}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>{ready?<CheckCircle2/>:<CircleAlert/>}<strong>{ready?'Receptionist connection is configured':'Receptionist connection still needs provider credentials'}</strong></div>
      <p>Provider: <b>{r?.provider || 'Retell'}</b></p>
      <p>BuildFlow will use this connection to answer calls, capture caller details, qualify leads, collect appointment preferences, take messages, transfer urgent calls, and write call summaries back to the company workspace.</p>
    </section>
    <section style={{marginTop:20,padding:24,border:'1px solid #d7dde5',borderRadius:16}}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}><Bot/><strong>Receptionist data flow</strong></div>
      <p>Incoming call → business-specific receptionist → lead/customer details → project or message → call summary → BuildFlow workspace.</p>
      <p>The receptionist should never invent pricing, confirmed availability, policies, or payment information.</p>
    </section>
  </main>
}
