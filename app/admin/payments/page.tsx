'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react'

type Submission = {
  id: string
  user_id: string
  requested_plan: string
  amount_cents: number
  status: string
  note?: string | null
  created_at: string
}

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    setMessage('')
    const r = await fetch('/api/admin/payments', { cache: 'no-store' })
    const body = await r.json().catch(() => ({}))
    if (!r.ok) setMessage(body.error || 'Could not load payment submissions.')
    else setRows(body.submissions || [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function review(id: string, action: 'approve' | 'reject') {
    setBusy(id)
    setMessage('')
    const r = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    })
    const body = await r.json().catch(() => ({}))
    if (!r.ok) setMessage(body.error || 'Could not update payment.')
    else {
      setMessage(action === 'approve' ? 'Payment approved. Customer access is active.' : 'Payment submission rejected.')
      await load()
    }
    setBusy(null)
  }

  return <main style={{minHeight:'100vh',background:'#f5f7fb',padding:'28px 16px',fontFamily:'system-ui',color:'#172033'}}>
    <section style={{maxWidth:980,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:20}}>
        <div><h1 style={{margin:0}}>Payment approvals</h1><p style={{color:'#5e6a78'}}>Verify the Venmo payment first, then approve the matching submission here.</p></div>
        <button onClick={load} disabled={loading} style={{padding:'10px 14px',borderRadius:10,border:'1px solid #cfd6df',background:'#fff',fontWeight:700}}><RefreshCw size={16}/> Refresh</button>
      </div>
      {message && <div style={{padding:12,borderRadius:10,background:'#fff',border:'1px solid #dfe5ed',marginBottom:14}}>{message}</div>}
      <div style={{display:'grid',gap:12}}>
        {loading ? <div>Loading…</div> : rows.length === 0 ? <div style={{background:'#fff',padding:22,borderRadius:14}}>No payment submissions yet.</div> : rows.map(row =>
          <article key={row.id} style={{background:'#fff',border:'1px solid #e1e6ed',borderRadius:14,padding:18}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div><strong>{row.requested_plan === 'yearly' ? 'Yearly' : 'Monthly'} · {'$'}{(row.amount_cents/100).toFixed(2)}</strong><div style={{fontSize:13,color:'#667386',marginTop:4}}>{new Date(row.created_at).toLocaleString()} · {row.status}</div><div style={{fontSize:12,color:'#7a8491',marginTop:6}}>User: {row.user_id}</div></div>
              {row.status === 'pending' && <div style={{display:'flex',gap:8}}>
                <button disabled={busy===row.id} onClick={()=>review(row.id,'approve')} style={{padding:'10px 13px',border:0,borderRadius:10,background:'#172033',color:'#fff',fontWeight:800}}><CheckCircle2 size={16}/> Approve</button>
                <button disabled={busy===row.id} onClick={()=>review(row.id,'reject')} style={{padding:'10px 13px',borderRadius:10,border:'1px solid #cfd6df',background:'#fff',fontWeight:700}}><XCircle size={16}/> Reject</button>
              </div>}
            </div>
          </article>
        )}
      </div>
      <p style={{marginTop:24}}><Link href="/">Back to Construction HQ</Link></p>
    </section>
  </main>
}
