'use client'

import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, ClipboardList, DollarSign, FileText, FolderKanban, HardHat, Home, Menu, NotebookPen, Plus, Receipt, Search, Users, X } from 'lucide-react'

type Job={id:number;customer:string;project:string;status:string;date:string;amount:number}
type Invoice={id:number;customer:string;project:string;amount:number;status:string}
type Note={id:number;text:string}

const seedJobs:Job[]=[
{id:1,customer:'Johnson Family',project:'Kitchen Remodel',status:'In Progress',date:'Today · 8:00 AM',amount:18500},
{id:2,customer:'Miller Properties',project:'Deck Replacement',status:'Scheduled',date:'Today · 1:00 PM',amount:7200},
{id:3,customer:'Anderson',project:'Bathroom Renovation',status:'Estimate',date:'Tomorrow · 10:00 AM',amount:9800}
]
const seedInvoices:Invoice[]=[
{id:1,customer:'Johnson Family',project:'Kitchen Remodel',amount:6200,status:'Unpaid'},
{id:2,customer:'Wilson LLC',project:'Roof Repair',amount:2850,status:'Overdue'}
]

const nav=[['Dashboard',Home],['Projects',FolderKanban],['Customers',Users],['Estimates',ClipboardList],['Invoices',Receipt],['Schedule',CalendarDays],['Documents',FileText],['Notes',NotebookPen]] as const

export default function Page(){
 const [section,setSection]=useState('Dashboard'); const [jobs,setJobs]=useState<Job[]>(seedJobs); const [invoices,setInvoices]=useState<Invoice[]>(seedInvoices); const [notes,setNotes]=useState<Note[]>([{id:1,text:'Call Johnson about cabinet selection.'}]); const [note,setNote]=useState(''); const [menu,setMenu]=useState(false); const [query,setQuery]=useState('')
 useEffect(()=>{try{const v=localStorage.getItem('buildflow-data');if(v){const d=JSON.parse(v);setJobs(d.jobs||seedJobs);setInvoices(d.invoices||seedInvoices);setNotes(d.notes||[])}}catch{}},[])
 useEffect(()=>{localStorage.setItem('buildflow-data',JSON.stringify({jobs,invoices,notes}))},[jobs,invoices,notes])
 const unpaid=useMemo(()=>invoices.filter(i=>i.status!=='Paid').reduce((s,i)=>s+i.amount,0),[invoices]); const active=jobs.filter(j=>j.status==='In Progress').length
 const filtered=jobs.filter(j=>(j.customer+' '+j.project).toLowerCase().includes(query.toLowerCase()))
 function addJob(){const customer=prompt('Customer name?');if(!customer)return;const project=prompt('Project name?')||'New Project';setJobs(v=>[{id:Date.now(),customer,project,status:'Estimate',date:'Not scheduled',amount:0},...v])}
 function addEstimate(){const customer=prompt('Customer name?');if(!customer)return;const project=prompt('Project / estimate name?')||'New Estimate';const amount=Number(prompt('Estimated total?')||0);setJobs(v=>[{id:Date.now(),customer,project,status:'Estimate',date:'Not scheduled',amount},...v]);setSection('Estimates')}
 function addNote(){if(!note.trim())return;setNotes(v=>[{id:Date.now(),text:note.trim()},...v]);setNote('')}
 return <div className="shell">
  <aside className={menu?'sidebar open':'sidebar'}><div className="brand"><div className="mark"><HardHat size={24}/></div><div><b>BuildFlow</b><span>HQ</span></div><button className="close" onClick={()=>setMenu(false)}><X/></button></div><div className="company"><small>COMPANY</small><strong>Stevens Construction</strong><span>Owner Workspace</span></div><nav>{nav.map(([n,I])=><button key={n} className={section===n?'active':''} onClick={()=>{setSection(n);setMenu(false)}}><I size={19}/>{n}</button>)}</nav><div className="sidefoot"><BriefcaseBusiness size={18}/><div><b>Multi-tenant ready</b><small>Company workspace isolated</small></div></div></aside>
  <main><header><button className="hamb" onClick={()=>setMenu(true)}><Menu/></button><div><h1>{section}</h1><p>Good morning, Ashley. Here’s what’s happening with your business.</p></div><div className="search"><Search size={18}/><input placeholder="Search projects or customers" value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="primary" onClick={addJob}><Plus size={18}/> New Project</button></header>
  {section==='Dashboard'?<>
   <section className="hero"><div><span>BUILD SMARTER. STAY ORGANIZED.</span><h2>Your entire construction business,<br/>in one headquarters.</h2><p>Projects, estimates, invoices, schedules, documents and field notes — organized automatically.</p></div><button onClick={addEstimate}><Plus size={18}/> Create Estimate</button></section>
   <section className="stats"><Stat icon={<CalendarDays/>} label="Today's Jobs" value={String(jobs.filter(j=>j.date.startsWith('Today')).length)} sub="scheduled today"/><Stat icon={<DollarSign/>} label="Unpaid Invoices" value={'$'+unpaid.toLocaleString()} sub={`${invoices.length} open invoices`}/><Stat icon={<FolderKanban/>} label="Active Projects" value={String(active)} sub="currently in progress"/><Stat icon={<ClipboardList/>} label="Open Estimates" value={String(jobs.filter(j=>j.status==='Estimate').length)} sub="awaiting action"/></section>
   <section className="grid"><Card title="Today's Jobs" action="View Schedule"><div className="joblist">{filtered.slice(0,3).map(j=><div className="job" key={j.id}><div className="jobicon"><HardHat/></div><div className="grow"><b>{j.project}</b><span>{j.customer} · {j.date}</span></div><Badge>{j.status}</Badge></div>)}</div></Card><Card title="Quick Actions"><div className="quick"><button onClick={addEstimate}><ClipboardList/>New Estimate<span>Create pricing & scope</span></button><button onClick={()=>setSection('Invoices')}><Receipt/>New Invoice<span>Bill a customer</span></button><button onClick={addJob}><FolderKanban/>New Project<span>Build project workspace</span></button><button onClick={()=>setSection('Schedule')}><CalendarDays/>Schedule Job<span>Add to calendar</span></button></div></Card></section>
   <section className="grid lower"><Card title="Unpaid Invoices" action="View All"><div className="invoiceList">{invoices.map(i=><div className="invoice" key={i.id}><div><b>{i.customer}</b><span>{i.project}</span></div><strong>${i.amount.toLocaleString()}</strong><Badge>{i.status}</Badge></div>)}</div></Card><Card title="Owner Notes"><div className="noteform"><input value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addNote()} placeholder="Add a reminder or note..."/><button onClick={addNote}><Plus/></button></div>{notes.slice(0,4).map(n=><div className="note" key={n.id}>{n.text}</div>)}</Card></section>
  </>:<Workspace section={section} jobs={filtered} invoices={invoices} notes={notes} addJob={addJob} addEstimate={addEstimate}/>}<footer>BuildFlow HQ · Contractor Operating System · MVP</footer></main>
 </div>
}
function Stat({icon,label,value,sub}:{icon:React.ReactNode,label:string,value:string,sub:string}){return <div className="stat"><div className="statIcon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>}
function Card({title,action,children}:{title:string,action?:string,children:React.ReactNode}){return <div className="card"><div className="cardhead"><h3>{title}</h3>{action&&<button>{action} →</button>}</div>{children}</div>}
function Badge({children}:{children:React.ReactNode}){return <span className="badge">{children}</span>}
function Workspace({section,jobs,invoices,notes,addJob,addEstimate}:{section:string,jobs:Job[],invoices:Invoice[],notes:Note[],addJob:()=>void,addEstimate:()=>void}){let rows:any[]=jobs;if(section==='Invoices')rows=invoices;if(section==='Notes')return <div className="workspace"><div className="workspaceHead"><div><h2>Owner Notes</h2><p>Keep important reminders visible in your company workspace.</p></div></div>{notes.map(n=><div className="wideRow" key={n.id}><NotebookPen/><b>{n.text}</b></div>)}</div>;return <div className="workspace"><div className="workspaceHead"><div><h2>{section}</h2><p>Everything for your company stays organized here.</p></div><button className="primary" onClick={section==='Estimates'?addEstimate:addJob}><Plus/> Add {section==='Estimates'?'Estimate':'Item'}</button></div>{rows.length?rows.map((r:any)=><div className="wideRow" key={r.id}><FolderKanban/><div className="grow"><b>{r.project||r.customer}</b><span>{r.customer}{r.date?' · '+r.date:''}</span></div>{typeof r.amount==='number'&&<strong>${r.amount.toLocaleString()}</strong>}<Badge>{r.status}</Badge></div>):<div className="empty">No items yet. Add your first one.</div>}</div>}
