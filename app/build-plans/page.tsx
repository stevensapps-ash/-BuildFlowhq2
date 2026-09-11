'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, HardHat, ListChecks, PackageCheck, Sparkles, Trash2 } from 'lucide-react'

type Supply = { item: string; quantity: string; estimatedUnitCost: number; estimatedLineCost: number }
type BuildPlan = {
  id: number
  title: string
  overview: string
  steps: string[]
  supplies: Supply[]
  materialCost: number
  laborTasks: string[]
  estimatedLaborHours: number
  laborCost: number
  estimatedTotalCost: number
  assumptions: string[]
  safetyAndCodeNotes: string[]
  project: string
  customer: string
  createdAt: string
}

type WorkspaceData = { docs?: any[]; [key: string]: any }

const money = (n: number) => '$' + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })

export default function BuildPlansPage() {
  const [customer, setCustomer] = useState('')
  const [project, setProject] = useState('')
  const [description, setDescription] = useState('')
  const [measurements, setMeasurements] = useState('')
  const [laborRate, setLaborRate] = useState('')
  const [plan, setPlan] = useState<BuildPlan | null>(null)
  const [savedPlans, setSavedPlans] = useState<BuildPlan[]>([])
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/workspace', { cache: 'no-store' })
        if (r.status === 401) { window.location.href = '/login'; return }
        if (!r.ok) throw new Error('Workspace could not be loaded')
        const w = await r.json()
        const d = w.data || {}
        setWorkspace(d)
        const docs = Array.isArray(d.docs) ? d.docs : []
        setSavedPlans(docs.filter((x: any) => x.type === 'Build Plan' && x.buildPlan).map((x: any) => x.buildPlan))
      } catch (e: any) {
        setError(e?.message || 'Workspace could not be loaded')
      }
    })()
  }, [])

  async function generate() {
    if (!project.trim() || !description.trim()) return
    setWorking(true); setError(''); setSaved('')
    try {
      const input = [
        `Customer: ${customer || 'Not provided'}`,
        `Project: ${project}`,
        `Job description: ${description}`,
        `Measurements / field notes: ${measurements || 'Not provided'}`,
        `Labor rate: ${laborRate ? '$' + laborRate + '/hour' : 'Use a reasonable planning allowance and clearly state it as an assumption.'}`,
        'Include a detailed supply list with quantities and estimated costs, material subtotal, labor estimate, total estimated cost, and clear step-by-step instructions explaining how to build the project.'
      ].join('\n')

      const r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'build_plan', input }) })
      const body = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error('AI Build Plans are not available on this deployment yet.')
      const cleaned = String(body.text || '').replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
      const j = JSON.parse(cleaned)
      setPlan({
        id: Date.now(),
        title: String(j.title || project),
        overview: String(j.overview || ''),
        steps: Array.isArray(j.steps) ? j.steps : [],
        supplies: Array.isArray(j.supplies) ? j.supplies.map((s: any) => ({ item: String(s.item || ''), quantity: String(s.quantity || ''), estimatedUnitCost: Number(s.estimatedUnitCost || 0), estimatedLineCost: Number(s.estimatedLineCost || 0) })) : [],
        materialCost: Number(j.materialCost || 0),
        laborTasks: Array.isArray(j.laborTasks) ? j.laborTasks : [],
        estimatedLaborHours: Number(j.estimatedLaborHours || 0),
        laborCost: Number(j.laborCost || 0),
        estimatedTotalCost: Number(j.estimatedTotalCost || 0),
        assumptions: Array.isArray(j.assumptions) ? j.assumptions : [],
        safetyAndCodeNotes: Array.isArray(j.safetyAndCodeNotes) ? j.safetyAndCodeNotes : [],
        project: project.trim(),
        customer: customer.trim(),
        createdAt: new Date().toISOString()
      })
    } catch (e: any) {
      setError(e?.message || 'Could not generate the build plan.')
    } finally { setWorking(false) }
  }

  async function savePlan() {
    if (!plan || !workspace) return
    const docs = Array.isArray(workspace.docs) ? workspace.docs : []
    const next = { ...workspace, docs: [{ id: plan.id, type: 'Build Plan', customer: plan.customer, project: plan.project, status: 'Draft', buildPlan: plan, content: JSON.stringify(plan) }, ...docs] }
    const r = await fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
    if (!r.ok) { setError('Build plan could not be saved.'); return }
    setWorkspace(next); setSavedPlans([plan, ...savedPlans]); setSaved('Saved to this company workspace')
  }

  async function removePlan(id: number) {
    if (!workspace) return
    const docs = Array.isArray(workspace.docs) ? workspace.docs : []
    const next = { ...workspace, docs: docs.filter((x: any) => !(x.type === 'Build Plan' && x.buildPlan?.id === id)) }
    const r = await fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
    if (r.ok) { setWorkspace(next); setSavedPlans(savedPlans.filter(x => x.id !== id)) }
  }

  return <main style={{maxWidth:1100,margin:'0 auto',padding:'28px 20px 60px',fontFamily:'system-ui',color:'#172033'}}>
    <a href="/" style={{display:'inline-flex',alignItems:'center',gap:7,color:'inherit',textDecoration:'none',fontWeight:700,marginBottom:22}}><ArrowLeft size={18}/> Back to BuildFlow HQ</a>
    <section style={{padding:26,borderRadius:20,background:'#172033',color:'white',marginBottom:22}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}><HardHat/><div><small>AI-POWERED PROJECT PLANNING</small><h1 style={{margin:'3px 0'}}>Build Plans</h1></div></div>
      <p style={{maxWidth:760,opacity:.9}}>Describe the project once. BuildFlow creates the recommended build sequence, supply list, estimated material cost, labor estimate, and total planning cost.</p>
    </section>

    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14,padding:20,border:'1px solid #d9deea',borderRadius:16}}>
      <label>Customer<input style={input} value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Optional"/></label>
      <label>Project name<input style={input} value={project} onChange={e=>setProject(e.target.value)} placeholder="Kitchen remodel"/></label>
      <label style={{gridColumn:'1/-1'}}>Describe what is being built<textarea style={{...input,minHeight:110}} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the full job, existing conditions, finishes, and anything the owner wants included."/></label>
      <label style={{gridColumn:'1/-1'}}>Measurements / field notes<textarea style={{...input,minHeight:80}} value={measurements} onChange={e=>setMeasurements(e.target.value)} placeholder="Room size, wall lengths, openings, heights, quantities, site notes..."/></label>
      <label>Labor rate per hour<input style={input} type="number" min="0" value={laborRate} onChange={e=>setLaborRate(e.target.value)} placeholder="Optional"/></label>
      <div style={{display:'flex',alignItems:'end'}}><button style={primary} disabled={!project.trim()||!description.trim()||working} onClick={generate}><Sparkles size={17}/>{working?' Building plan…':' Generate Build Plan'}</button></div>
    </section>

    {error && <p style={{padding:14,border:'1px solid #d7a6a6',borderRadius:12}}>{error}</p>}
    {saved && <p style={{fontWeight:800}}>{saved}</p>}

    {plan && <section style={{marginTop:24,padding:22,border:'1px solid #d9deea',borderRadius:16}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'start',flexWrap:'wrap'}}><div><small>AI BUILD PLAN — VERIFY FIELD CONDITIONS</small><h2>{plan.title}</h2><p>{plan.overview}</p></div><div style={{fontSize:26,fontWeight:900}}>{money(plan.estimatedTotalCost)}</div></div>
      <h3><ListChecks size={18}/> How to Build</h3><ol>{plan.steps.map((x,i)=><li key={i} style={{marginBottom:9}}>{x}</li>)}</ol>
      <h3><PackageCheck size={18}/> Supply List</h3>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th style={th}>Item</th><th style={th}>Quantity</th><th style={th}>Est. Unit</th><th style={th}>Est. Cost</th></tr></thead><tbody>{plan.supplies.map((s,i)=><tr key={i}><td style={td}>{s.item}</td><td style={td}>{s.quantity}</td><td style={td}>{money(s.estimatedUnitCost)}</td><td style={td}>{money(s.estimatedLineCost)}</td></tr>)}</tbody></table></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,margin:'20px 0'}}><Cost label="Estimated materials" value={plan.materialCost}/><Cost label={`Labor (${plan.estimatedLaborHours} hrs)`} value={plan.laborCost}/><Cost label="Estimated total" value={plan.estimatedTotalCost}/></div>
      <h3>Labor Tasks</h3><ul>{plan.laborTasks.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <h3>Assumptions / Verify</h3><ul>{plan.assumptions.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <h3>Safety & Code Notes</h3><ul>{plan.safetyAndCodeNotes.map((x,i)=><li key={i}>{x}</li>)}</ul>
      <p style={{fontSize:13,opacity:.75}}>Planning estimate only. Supplier pricing, labor conditions, permits, code requirements, structural conditions, and field dimensions must be verified before construction.</p>
      <button style={primary} onClick={savePlan}>Save Build Plan</button>
    </section>}

    <section style={{marginTop:30}}><h2>Saved Build Plans</h2>{savedPlans.length===0?<p>No build plans saved yet.</p>:savedPlans.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:15,border:'1px solid #d9deea',borderRadius:12,marginBottom:10}}><div><b>{p.title}</b><div style={{fontSize:13,opacity:.7}}>{p.customer||'No customer'} · {money(p.estimatedTotalCost)}</div></div><button aria-label="Delete build plan" style={icon} onClick={()=>removePlan(p.id)}><Trash2 size={17}/></button></div>)}</section>
  </main>
}

function Cost({label,value}:{label:string,value:number}){return <div style={{padding:14,border:'1px solid #d9deea',borderRadius:12}}><small>{label}</small><div style={{fontSize:22,fontWeight:900}}>{money(value)}</div></div>}
const input={display:'block',boxSizing:'border-box' as const,width:'100%',marginTop:7,padding:'11px 12px',border:'1px solid #cfd5df',borderRadius:10,font:'inherit'}
const primary={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 16px',border:0,borderRadius:10,fontWeight:800,cursor:'pointer',background:'#172033',color:'white'}
const icon={display:'inline-flex',padding:9,border:'1px solid #d9deea',borderRadius:9,background:'white',cursor:'pointer'}
const th={textAlign:'left' as const,padding:'10px 8px',borderBottom:'2px solid #d9deea'}
const td={padding:'10px 8px',borderBottom:'1px solid #e5e8ef'}
