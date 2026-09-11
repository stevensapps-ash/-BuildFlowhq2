'use client'
import { useState } from 'react'

export default function ConnectFinancialAccount() {
  const [accepted,setAccepted]=useState(false)
  return <main style={{maxWidth:720,margin:'0 auto',padding:'48px 24px',fontFamily:'system-ui',lineHeight:1.6,color:'#172033'}}>
    <h1>Connect a financial account</h1>
    <p>Connecting an account is optional. BuildFlow HQ will use financial information you authorize only to provide the financial features you request, such as account or transaction information used by your business.</p>
    <div style={{padding:20,border:'1px solid #d7dce5',borderRadius:12,margin:'24px 0'}}>
      <h2 style={{marginTop:0}}>Your consent</h2>
      <p>By continuing, you authorize BuildFlow HQ and its financial-data provider to collect, process, and store the financial information you choose to share for the purposes described above. You can choose not to connect an account and may disconnect an integration later.</p>
      <p><a href="/privacy">Read the Privacy Policy</a> · <a href="/data-policy">Data Retention & Deletion Policy</a></p>
      <label style={{display:'flex',gap:10,alignItems:'flex-start'}}><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} style={{marginTop:6}}/><span>I have read the disclosures and consent to the collection, processing, and storage of the financial data I choose to share.</span></label>
    </div>
    <button disabled={!accepted} onClick={()=>alert('Consent recorded. Plaid Link should be launched here only after the server-side Plaid integration is configured.')} style={{padding:'12px 18px',borderRadius:10,border:0,fontWeight:700,cursor:accepted?'pointer':'not-allowed'}}>Continue to secure connection</button>
    <p style={{marginTop:24,fontSize:14}}>Important: this consent gate does not claim that Plaid production access is configured. The secure Plaid Link launch must be connected server-side before live financial data is enabled.</p>
  </main>
}
