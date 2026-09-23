'use client'
import {useMemo,useState} from 'react'
import {BadgeCheck,Building2,CalendarCheck,ExternalLink,FileCheck2,FileText,Plus,ShieldCheck,Trash2} from 'lucide-react'

type Props={data:any;setData:(d:any)=>void}
const statuses=['Not Started','Application Ready','Submitted','Under Review','Corrections Required','Permit Issued','Inspection Scheduled','Passed','Failed','Closed']
const kinds=['Building','Electrical','Mechanical / HVAC','Plumbing','Zoning','Other']
const portal=(jurisdiction:string)=>{
 const q=jurisdiction.toLowerCase()
 if(q.includes('detroit'))return 'https://aca-prod.accela.com/DETROIT/Default.aspx'
 if(q.includes('michigan')||q.includes('state'))return 'https://aca-prod.accela.com/LARA/Default.aspx'
 return ''
}
export default function PermitCenter({data,setData}:Props){
 const permits=data.permits||[], projects=data.projects||[]
 const[project,setProject]=useState(''),[kind,setKind]=useState('Building'),[jurisdiction,setJurisdiction]=useState(''),[number,setNumber]=useState('')
 const grouped=useMemo(()=>projects.map((p:any)=>({p,items:permits.filter((x:any)=>String(x.projectId)===String(p.id))})),[projects,permits])
 function add(){if(!project)return;const p=projects.find((x:any)=>String(x.id)===project);setData({...data,permits:[{id:Date.now(),projectId:p?.id,project:p?.name||'',customer:p?.customer||'',kind,jurisdiction,status:'Application Ready',permitNumber:number,submittedAt:'',inspectionDate:'',notes:'',createdAt:new Date().toISOString()},...permits]});setNumber('')}
 function patch(id:any,updates:any){setData({...data,permits:permits.map((x:any)=>x.id===id?{...x,...updates}:x)})}
 return <div className="workspace"><div className="workspaceHead"><div><h2><ShieldCheck/> Permit Center</h2><p>Prepare permit packages, track agency review, corrections, inspections and closeout from the project record.</p></div></div>
 <div className="permitNotice"><FileCheck2/><div><b>Permit-ready workflow, without false approvals</b><span>Construction HQ tracks submissions and documents. A permit is only marked issued/approved when the authority or licensed reviewer actually provides that result.</span></div></div>
 <div className="builderGrid">
  <label>Project<select value={project} onChange={e=>setProject(e.target.value)}><option value="">Choose project</option>{projects.map((p:any)=><option key={p.id} value={p.id}>{p.customer? p.customer+' · ':''}{p.name}</option>)}</select></label>
  <label>Permit type<select value={kind} onChange={e=>setKind(e.target.value)}>{kinds.map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Enforcing jurisdiction<input value={jurisdiction} onChange={e=>setJurisdiction(e.target.value)} placeholder="City, township, county, or State of Michigan"/></label>
  <label>Permit / application # (optional)<input value={number} onChange={e=>setNumber(e.target.value)} placeholder="Add when assigned"/></label>
  <button className="primary full" disabled={!project} onClick={add}><Plus/> Add Permit Record</button>
 </div>
 {grouped.some(g=>g.items.length)?grouped.filter(g=>g.items.length).map(({p,items}:any)=><section className="permitProject" key={p.id}><h3><Building2/> {p.name}<small>{p.customer}</small></h3>{items.map((x:any)=><div className="permitCard" key={x.id}><div className="permitCardTop"><div><b>{x.kind} Permit</b><span>{x.jurisdiction||'Jurisdiction not set'}{x.permitNumber?' · #'+x.permitNumber:''}</span></div><select aria-label="Permit status" value={x.status} onChange={e=>patch(x.id,{status:e.target.value,submittedAt:e.target.value==='Submitted'&&!x.submittedAt?new Date().toISOString():x.submittedAt})}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
 <div className="permitFields"><label>Application #<input value={x.permitNumber||''} onChange={e=>patch(x.id,{permitNumber:e.target.value})}/></label><label>Inspection date<input type="date" value={x.inspectionDate||''} onChange={e=>patch(x.id,{inspectionDate:e.target.value})}/></label><label className="full">Corrections / notes<textarea value={x.notes||''} onChange={e=>patch(x.id,{notes:e.target.value})} placeholder="Agency comments, correction items, inspection notes..."/></label></div>
 <div className="permitActions">{portal(x.jurisdiction||'')&&<a className="ghost" href={portal(x.jurisdiction)} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Open permit portal</a>}<button className="ghost" onClick={()=>patch(x.id,{status:'Inspection Scheduled'})}><CalendarCheck size={14}/> Schedule inspection</button><button className="ghost" onClick={()=>patch(x.id,{status:'Closed'})}><BadgeCheck size={14}/> Close permit</button><button className="iconButton" aria-label="Delete permit" onClick={()=>setData({...data,permits:permits.filter((p:any)=>p.id!==x.id)})}><Trash2 size={14}/></button></div></div>)}</section>):<div className="empty"><FileText/><b>No permit records yet.</b><span>Select a project above to start its permit package.</span></div>}
 </div>
}
