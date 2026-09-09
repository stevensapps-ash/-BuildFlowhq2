'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, DollarSign, Users } from 'lucide-react'

type Status = { payroll?: { provider?: string; configured?: boolean; environment?: string } }

export default function PayrollSetupPage() {
  const [status, setStatus] = useState<Status | null>(null)
  useEffect(() => { fetch('/api/integrations/status').then(r => r.json()).then(setStatus).catch(() => setStatus({})) }, [])
  const p = status?.payroll
  return <main style={{maxWidth:900,margin:'0 auto',padding:'40px 20px',fontFamily:'Arial,sans-serif'}}>
    <a href="/" style={{textDecoration:'none'}}>← Back to BuildFlow HQ</a>
    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:28}}><DollarSign size={34}/><div><h1 style={{margin:0}}>Payroll & Direct Deposit</h1><p style={{margin:'6px 0 0'}}>Paid add-on · powered by an embedded payroll provider</p></div></div>
    <section style={{marginTop:28,padding:24,border:'1px solid #d7dde5',borderRadius:16}}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>{p?.configured?<CheckCircle2/>:<CircleAlert/>}<strong>{p?.configured?'Payroll provider credentials configured':'Payroll provider connection still needs credentials'}</strong></div>
      <p>Provider: <b>{p?.provider || 'Gusto'}</b> · Environment: <b>{p?.environment || 'demo'}</b></p>
      <p>BuildFlow will manage the contractor-facing experience while the payroll provider handles regulated payroll processing, tax setup, bank verification and direct deposit.</p>
    </section>
    <section style={{marginTop:20,padding:24,border:'1px solid #d7dde5',borderRadius:16}}>
      <div style={{display:'flex',gap:10,alignItems:'center'}}><Users/><strong>Planned payroll flow</strong></div>
      <p>Company onboarding → employee self-onboarding → pay schedule → hours/pay items → owner review → payroll submission → direct deposit status.</p>
      <p>BuildFlow does not store bank credentials or Social Security numbers in the normal workspace JSON.</p>
    </section>
  </main>
}
