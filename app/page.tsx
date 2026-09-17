'use client'

import {useEffect,useState} from 'react'
import {
  AlertCircle, CalendarDays, Camera, ChevronDown, ClipboardList, Coins, DollarSign,
  FileSignature, FileText, FolderKanban, HardHat, Home, LogIn, LogOut, Menu,
  NotebookPen, Plus, PlusCircle, Receipt, Settings, Sparkles, Trash2, Users,
  WalletCards, X, Clock3
} from 'lucide-react'
import ContractWorkspace from './components/ContractWorkspace'
import JobTracker from './components/JobTracker'
import BlueprintLibrary from './components/BlueprintLibrary'
import ProjectGallery from './components/ProjectGallery'
import ReceiptOrganizer from './components/ReceiptOrganizer'

type Project={id:number;customer:string;name:string;status:string;date:string;amount:number}
type AppData={projects:any[];customers:any[];invoices:any[];notes:any[];estimates:any[];docs:any[];receipts:any[];schedule:any[];employees:any[];payroll:any[];files:any[];timeEntries:any[];settings:any;[key:string]:any}

const emptyData:AppData={
  projects:[],customers:[],invoices:[],notes:[],estimates:[],docs:[],receipts:[],
  schedule:[],employees:[],payroll:[],files:[],timeEntries:[],
  settings:{businessName:'',phone:'',email:'',address:'',estimateTerms:'Estimates are subject to field verification and final owner approval.'}
}
const groups=[
  {label:'Work',items:[['Dashboard',Home],['Projects',FolderKanban],['Schedule',CalendarDays],['Customers',Users]]},
  {label:'Create',items:[['AI Estimates',Sparkles],['Contracts',FileSignature],['Change Orders',ClipboardList],['Blueprint Library',FileText]]},
  {label:'Money',items:[['Invoices',Receipt],['Receipts',WalletCards],['Payroll',DollarSign],['Billing & Tokens',Coins]]},
  {label:'Business',items:[['Before & After',Camera],['Employees',HardHat],['Documents',FileText],['Notes',NotebookPen],['Settings',Settings]]}
] as any[]
const money=(n:number)=>'$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})
const localDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function norm(d:any):AppData{return{...emptyData,...d,projects:d?.projects||[],customers:d?.customers||[],invoices:d?.invoices||[],notes:d?.notes||[],estimates:d?.estimates||[],docs:d?.docs||[],receipts:d?.receipts||[],schedule:d?.schedule||[],employees:d?.employees||[],payroll:d?.payroll||[],files:d?.files||[],timeEntries:d?.timeEntries||[],settings:{...emptyData.settings,...(d?.settings||{})}}}
async function ai(mode:string,input:string){const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,input})});const b=await r.json().catch(()=>({}));if(!r.ok)throw Error('AI draft could not be generated.');return String(b.text||'')}

export default function Page(){
  const[section,setSection]=useState('Dashboard')
  const[data,setData]=useState<AppData>(emptyData)
  const[loaded,setLoaded]=useState(false)
  const[company,setCompany]=useState('Construction Company')
  const[activeJob,setActiveJob]=useState<Project|null>(null)
  const[toolsOpen,setToolsOpen]=useState(false)
  const[createOpen,setCreateOpen]=useState(false)

  useEffect(()=>{fetch('/api/workspace',{cache:'no-store'}).then(async r=>{if(r.status===401){location.href='/login';return}const w=await r.json();setCompany(w.companyName||'Construction Company');setData(norm(w.data||{}));setLoaded(true)})},[])
  useEffect(()=>{if(!loaded)return;const t=setTimeout(()=>fetch('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}),450);return()=>clearTimeout(t)},[data,loaded])

  if(!loaded)return <div className="loading"><HardHat/><b>Loading workspace…</b></div>
  const go=(s:string)=>{if(s==='Billing & Tokens'){location.href='/subscribe';return}setSection(s);setActiveJob(null);setToolsOpen(false);setCreateOpen(false)}
  const createItems=[['Project','Projects'],['AI Estimate','AI Estimates'],['Invoice','Invoices'],['Receipt','Receipts'],['Contract','Contracts'],['Change Order','Change Orders'],['Customer','Customers']] as const

  return <div className="compactShell">
    <header className="topbar">
      <div className="topBrand"><span className="topMark"><HardHat size={19}/></span><div><b>Construction HQ</b><small>{data.settings.businessName||company}</small></div></div>
      <nav className="quickNav">
        <button className={section==='Dashboard'?'active':''} onClick={()=>go('Dashboard')}><Home/>Home</button>
        <button className={section==='Projects'?'active':''} onClick={()=>go('Projects')}><FolderKanban/>Jobs</button>
        <button className={section==='AI Estimates'?'active':''} onClick={()=>go('AI Estimates')}><Sparkles/>Estimate</button>
        <button className={section==='Receipts'?'active':''} onClick={()=>go('Receipts')}><WalletCards/>Receipts</button>
        <button className="toolsBtn" onClick={()=>setToolsOpen(!toolsOpen)}><Menu/>More<ChevronDown size={14}/></button>
      </nav>
      {toolsOpen&&<div className="toolMenu">
        <div className="toolMenuHead"><b>Construction HQ Tools</b><button onClick={()=>setToolsOpen(false)}><X/></button></div>
        {groups.map(g=><div className="toolGroup" key={g.label}><small>{g.label}</small><div>{g.items.map(([n,I]:any)=><button key={n} onClick={()=>go(n)} className={section===n?'active':''}><I size={17}/><span>{n}</span></button>)}</div></div>)}
        <div className="toolGroup"><small>Account</small><div><button onClick={()=>location.href='/login'}><LogIn size={17}/>Sign in</button><button onClick={()=>location.href='/logout'}><LogOut size={17}/>Sign out</button></div></div>
      </div>}
    </header>

    {createOpen&&<div className="createMenu"><div className="createMenuHead"><b>Create New</b><button onClick={()=>setCreateOpen(false)}><X size={18}/></button></div>{createItems.map(([label,target])=><button key={label} onClick={()=>go(target)}><Plus size={17}/>{label}</button>)}</div>}

    <main className="compactMain">
      <div className="pageTitle"><h1>{section}</h1><p>{data.settings.businessName||company}</p></div>
      {activeJob?<JobTracker project={data.projects.find((p:any)=>p.id===activeJob.id)||activeJob} data={data} setData={setData} onClose={()=>setActiveJob(null)}/>:
      section==='Contracts'?<ContractWorkspace data={data} setData={setData} ai={ai}/>:
      section==='Blueprint Library'?<BlueprintLibrary data={data} setData={setData} ai={ai}/>:
      section==='Before & After'?<ProjectGallery data={data} setData={setData}/>:
      section==='Receipts'?<ReceiptOrganizer data={data} setData={setData}/>:
      section==='Projects'?<Projects data={data} setData={setData} startJob={setActiveJob}/>:
      section==='Schedule'?<Schedule data={data} setData={setData}/>:
      section==='Dashboard'?<Dashboard data={data} go={go}/>:
      section==='Customers'?<Customers data={data} setData={setData}/>:
      section==='Invoices'?<Invoices data={data} setData={setData}/>:
      section==='Change Orders'?<ChangeOrders data={data} setData={setData}/>:
      section==='Employees'?<Employees data={data} setData={setData}/>:
      section==='Notes'?<Notes data={data} setData={setData}/>:
      section==='Settings'?<BusinessSettings data={data} setData={setData}/>:
      section==='Documents'?<Documents data={data}/>:
      section==='AI Estimates'?<EstimateHub data={data}/>:
      <Simple section={section} data={data}/>}
      <footer>Construction HQ · Contractor business workspace</footer>
    </main>

    <nav className="mobileNav">
      <button className={section==='Dashboard'?'active':''} onClick={()=>go('Dashboard')}><Home/><span>Home</span></button>
      <button className={section==='Projects'?'active':''} onClick={()=>go('Projects')}><FolderKanban/><span>Jobs</span></button>
      <button className="mobileCreate" onClick={()=>setCreateOpen(!createOpen)}><PlusCircle/><span>New</span></button>
      <button className={section==='Schedule'?'active':''} onClick={()=>go('Schedule')}><CalendarDays/><span>Schedule</span></button>
      <button onClick={()=>setToolsOpen(!toolsOpen)}><Menu/><span>More</span></button>
    </nav>
  </div>
}

function Dashboard({data,go}:{data:AppData,go:(s:string)=>void}){
  const today=localDate(),todayJobs=data.schedule.filter((x:any)=>x.date===today),unpaid=data.invoices.filter((x:any)=>String(x.status||'').toLowerCase()!=='paid'),unpaidTotal=unpaid.reduce((a:number,x:any)=>a+Number(x.balance??x.amount??0),0),recent=[...data.estimates].slice(0,4)
  return <><section className="hero"><div><span>CONSTRUCTION HQ</span><h2>Your business, organized for today.</h2><p>See what needs attention and jump straight into the next job, estimate, or invoice.</p></div><button onClick={()=>go('AI Estimates')}><Plus size={17}/> New Estimate</button></section>
  <section className="stats">
    <button className="statButton" onClick={()=>go('Projects')}><Stat label="Active Jobs" value={String(data.projects.filter((p:any)=>p.status==='In Progress').length)} sub="currently active"/></button>
    <button className="statButton" onClick={()=>go('Schedule')}><Stat label="Today's Jobs" value={String(todayJobs.length)} sub="scheduled today"/></button>
    <button className="statButton" onClick={()=>go('Invoices')}><Stat label="Unpaid" value={money(unpaidTotal)} sub={unpaid.length+" open invoices"}/></button>
  </section>
  <section className="dashboardGrid">
    <Panel title="Today's Jobs" eyebrow="TODAY" action="View schedule" onClick={()=>go('Schedule')}>
      {todayJobs.length?todayJobs.slice(0,4).map((x:any)=><div className="dashRow" key={x.id}><Clock3/><div><b>{x.project}</b><span>{x.start}–{x.end} · {x.worker}</span></div></div>):<EmptyAction icon={CalendarDays} text="Nothing scheduled for today." action="Add to schedule" onClick={()=>go('Schedule')}/>}
    </Panel>
    <Panel title="Unpaid Invoices" eyebrow="MONEY" action="View invoices" onClick={()=>go('Invoices')}>
      {unpaid.length?unpaid.slice(0,4).map((x:any)=><div className="dashRow" key={x.id}><AlertCircle/><div><b>{x.customer||x.project||'Invoice'}</b><span>{x.status||'Open'}</span></div><strong>{money(x.balance??x.amount)}</strong></div>):<EmptyAction icon={Receipt} text="No unpaid invoices." action="Create invoice" onClick={()=>go('Invoices')}/>}
    </Panel>
    <div className="fullPanel"><Panel title="Recent Estimates" eyebrow="RECENT" action="New estimate" onClick={()=>go('AI Estimates')}>
      {recent.length?recent.map((x:any)=><div className="dashRow" key={x.id}><Sparkles/><div><b>{x.project||x.customer||'Estimate'}</b><span>{x.status||'Draft'}</span></div>{x.amount!==undefined&&<strong>{money(x.amount)}</strong>}</div>):<EmptyAction icon={Sparkles} text="No estimates yet." action="Create your first AI estimate" onClick={()=>go('AI Estimates')}/>}
    </Panel></div>
  </section></>
}

function Panel({title,eyebrow,action,onClick,children}:{title:string;eyebrow:string;action:string;onClick:()=>void;children:any}){return <div className="dashPanel"><div className="dashPanelHead"><div><small>{eyebrow}</small><h3>{title}</h3></div><button onClick={onClick}>{action}</button></div>{children}</div>}
function EmptyAction({icon:Icon,text,action,onClick}:{icon:any;text:string;action:string;onClick:()=>void}){return <div className="emptyAction"><Icon/><p>{text}</p><button className="primary" onClick={onClick}>{action}</button></div>}

function Schedule({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[date,setDate]=useState(''),[start,setStart]=useState('08:00'),[end,setEnd]=useState('16:00'),[project,setProject]=useState(''),[worker,setWorker]=useState(''),[notes,setNotes]=useState('')
  function add(){if(!date||!project||!worker.trim())return;setData({...data,schedule:[{id:Date.now(),date,start,end,project,worker:worker.trim(),notes:notes.trim()},...data.schedule]});setNotes('')}
  const sorted=[...data.schedule].sort((a:any,b:any)=>String(a.date+a.start).localeCompare(String(b.date+b.start)))
  return <div className="workspace"><Head title="Schedule" text="Assign workers to jobs and set their work times."/><div className="builderGrid">
    <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
    <label>Start time<input type="time" value={start} onChange={e=>setStart(e.target.value)}/></label>
    <label>End time<input type="time" value={end} onChange={e=>setEnd(e.target.value)}/></label>
    <label>Job<select value={project} onChange={e=>setProject(e.target.value)}><option value="">Select job</option>{data.projects.map((p:any)=><option key={p.id} value={p.name}>{p.name} · {p.customer}</option>)}</select></label>
    <label>Worker<input value={worker} onChange={e=>setWorker(e.target.value)} placeholder="Worker name"/></label>
    <label>Notes<input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Address, task, instructions…"/></label>
    <button className="primary" onClick={add}><CalendarDays size={16}/> Add to Schedule</button>
  </div>
  {sorted.length?sorted.map((s:any)=><div className="wideRow" key={s.id}><CalendarDays size={18}/><div className="grow"><b>{s.project}</b><span>{s.worker} · {s.date} · {s.start}–{s.end}{s.notes?' · '+s.notes:''}</span></div><button className="iconButton" title="Delete schedule item" onClick={()=>setData({...data,schedule:data.schedule.filter((x:any)=>x.id!==s.id)})}><Trash2 size={15}/></button></div>):<p>No work scheduled yet.</p>}</div>
}

function Projects({data,setData,startJob}:{data:AppData;setData:(d:any)=>void;startJob:(p:Project)=>void}){
  const[c,setC]=useState(''),[n,setN]=useState(''),[a,setA]=useState('')
  function add(){if(!c.trim()||!n.trim())return;const id=Date.now(),customer=c.trim(),name=n.trim();const customers=data.customers.some((x:any)=>String(x.name||x.customer||'').toLowerCase()===customer.toLowerCase())?data.customers:[{id:id+1,name:customer,customer,phone:'',email:'',address:'',status:'Active'},...data.customers];setData({...data,customers,projects:[{id,customer,name,status:'Estimate',date:'Not scheduled',amount:Number(a||0)},...data.projects]});setC('');setN('');setA('')}
  return <div className="workspace"><Head title="Projects" text="Every job becomes a command center for contract, labor, receipts, schedule, and invoicing."/><div className="builderGrid"><Field label="Customer" value={c} set={setC}/><Field label="Project" value={n} set={setN}/><Field label="Estimate" value={a} set={setA}/><button className="primary" onClick={add}><Plus/>New Project</button></div>
  {data.projects.length?data.projects.map((p:any)=><div className="wideRow" key={p.id}><div className="grow"><b>{p.name}</b><span>{p.customer} · {p.date||'Not scheduled'}</span></div><strong>{money(p.amount)}</strong><Status value={p.status}/><button className="primary" onClick={()=>startJob(p)}>{p.status==='In Progress'?'Open Command Center':'Open Job'}</button></div>):<p>No projects yet. Use the form above to create your first project.</p>}</div>
}

function Customers({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[address,setAddress]=useState('')
  function add(){if(!name.trim())return;setData({...data,customers:[{id:Date.now(),name:name.trim(),customer:name.trim(),phone:phone.trim(),email:email.trim(),address:address.trim(),status:'Active'},...data.customers]});setName('');setPhone('');setEmail('');setAddress('')}
  return <div className="workspace"><Head title="Customers" text="Enter a customer once, then reuse them across estimates, projects, contracts, and invoices."/><div className="builderGrid"><Field label="Customer name" value={name} set={setName}/><Field label="Phone" value={phone} set={setPhone}/><Field label="Email" value={email} set={setEmail}/><Field label="Address" value={address} set={setAddress}/><button className="primary" onClick={add}><Plus/>Add Customer</button></div>
  {data.customers.length?data.customers.map((x:any)=><div className="wideRow" key={x.id}><Users size={18}/><div className="grow"><b>{x.name||x.customer}</b><span>{[x.phone,x.email,x.address].filter(Boolean).join(' · ')||'Contact details not added yet'}</span></div><Status value={x.status||'Active'}/><button className="iconButton" title="Delete customer" onClick={()=>setData({...data,customers:data.customers.filter((y:any)=>y.id!==x.id)})}><Trash2 size={15}/></button></div>):<p>No customers yet.</p>}</div>
}

function Invoices({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[project,setProject]=useState(''),[customer,setCustomer]=useState(''),[amount,setAmount]=useState(''),[due,setDue]=useState(''),[status,setStatus]=useState('Draft')
  function pickProject(v:string){setProject(v);const p=data.projects.find((x:any)=>x.name===v);if(p){setCustomer(p.customer||'');setAmount(String(p.amount||''))}}
  function add(){if(!customer.trim()||Number(amount)<=0)return;setData({...data,invoices:[{id:Date.now(),project:project.trim(),customer:customer.trim(),amount:Number(amount),balance:Number(amount),due,status,createdAt:localDate()},...data.invoices]});setProject('');setCustomer('');setAmount('');setDue('');setStatus('Draft')}
  return <div className="workspace"><Head title="Invoices" text="Create invoices directly from a job and track them through payment."/><div className="builderGrid">
    <label>Project<select value={project} onChange={e=>pickProject(e.target.value)}><option value="">Optional project</option>{data.projects.map((p:any)=><option key={p.id}>{p.name}</option>)}</select></label>
    <Field label="Customer" value={customer} set={setCustomer}/><Field label="Amount" value={amount} set={setAmount}/>
    <label>Due date<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label>
    <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option>Draft</option><option>Sent</option><option>Overdue</option><option>Paid</option></select></label>
    <button className="primary" onClick={add}><Plus/>Create Invoice</button>
  </div>
  {data.invoices.length?data.invoices.map((x:any)=><div className="wideRow" key={x.id}><Receipt size={18}/><div className="grow"><b>{x.customer}{x.project?' · '+x.project:''}</b><span>{x.due?'Due '+x.due:'No due date'}</span></div><strong>{money(x.amount)}</strong><select aria-label="Invoice status" value={x.status||'Draft'} onChange={e=>setData({...data,invoices:data.invoices.map((y:any)=>y.id===x.id?{...y,status:e.target.value,balance:e.target.value==='Paid'?0:y.amount}:y)})}><option>Draft</option><option>Sent</option><option>Overdue</option><option>Paid</option></select><button className="iconButton" title="Delete invoice" onClick={()=>setData({...data,invoices:data.invoices.filter((y:any)=>y.id!==x.id)})}><Trash2 size={15}/></button></div>):<p>No invoices yet.</p>}</div>
}

function ChangeOrders({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[project,setProject]=useState(''),[description,setDescription]=useState(''),[amount,setAmount]=useState('')
  const rows=data.docs.filter((x:any)=>x.type==='Change Order')
  function add(){if(!project||!description.trim())return;const p=data.projects.find((x:any)=>x.name===project);setData({...data,docs:[{id:Date.now(),type:'Change Order',project,customer:p?.customer||'',description:description.trim(),amount:Number(amount||0),status:'Awaiting Approval',createdAt:localDate()},...data.docs]});setDescription('');setAmount('')}
  return <div className="workspace"><Head title="Change Orders" text="Document scope and price changes before changed work begins."/><div className="builderGrid"><label>Project<select value={project} onChange={e=>setProject(e.target.value)}><option value="">Select project</option>{data.projects.map((p:any)=><option key={p.id}>{p.name}</option>)}</select></label><Field label="Price change" value={amount} set={setAmount}/><label style={{gridColumn:'1/-1'}}>Change description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe the added, removed, or revised work."/></label><button className="primary" onClick={add}><Plus/>Create Change Order</button></div>
  {rows.length?rows.map((x:any)=><div className="wideRow" key={x.id}><ClipboardList size={18}/><div className="grow"><b>{x.project}</b><span>{x.description}</span></div><strong>{money(x.amount)}</strong><select value={x.status} onChange={e=>setData({...data,docs:data.docs.map((y:any)=>y.id===x.id?{...y,status:e.target.value}:y)})}><option>Awaiting Approval</option><option>Approved</option><option>Declined</option></select></div>):<p>No change orders yet.</p>}</div>
}

function Employees({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[name,setName]=useState(''),[role,setRole]=useState(''),[rate,setRate]=useState('')
  function add(){if(!name.trim())return;setData({...data,employees:[{id:Date.now(),name:name.trim(),role:role.trim()||'Crew',rate:Number(rate||0),status:'Active'},...data.employees]});setName('');setRole('');setRate('')}
  return <div className="workspace"><Head title="Employees" text="Keep crew information and standard hourly rates in one place."/><div className="builderGrid"><Field label="Employee name" value={name} set={setName}/><Field label="Role" value={role} set={setRole}/><Field label="Hourly rate" value={rate} set={setRate}/><button className="primary" onClick={add}><Plus/>Add Employee</button></div>
  {data.employees.length?data.employees.map((x:any)=><div className="wideRow" key={x.id}><HardHat size={18}/><div className="grow"><b>{x.name}</b><span>{x.role||'Crew'}</span></div><strong>{money(x.rate)}/hr</strong><Status value={x.status||'Active'}/></div>):<p>No employees yet.</p>}</div>
}

function Notes({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[text,setText]=useState('')
  function add(){if(!text.trim())return;setData({...data,notes:[{id:Date.now(),text:text.trim(),createdAt:new Date().toLocaleString()},...data.notes]});setText('')}
  return <div className="workspace"><Head title="Notes" text="Owner notes stay private to this company workspace."/><div className="builderGrid"><label style={{gridColumn:'1/-1'}}>New note<textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Follow-up, material reminder, customer request…"/></label><button className="primary" onClick={add}><Plus/>Save Note</button></div>
  {data.notes.length?data.notes.map((x:any)=><div className="wideRow" key={x.id}><NotebookPen size={18}/><div className="grow"><b>{x.text}</b><span>{x.createdAt||''}</span></div><button className="iconButton" onClick={()=>setData({...data,notes:data.notes.filter((y:any)=>y.id!==x.id)})}><Trash2 size={15}/></button></div>):<p>No notes yet.</p>}</div>
}

function Documents({data}:{data:AppData}){return <div className="workspace"><Head title="Documents" text="Contracts, change orders, build plans, and other project records in one place."/>
  {data.docs.length?data.docs.map((x:any)=><div className="wideRow" key={x.id}><FileText size={18}/><div className="grow"><b>{x.type||'Document'}{x.project?' · '+x.project:''}</b><span>{x.customer||''}</span></div><Status value={x.status||'Draft'}/></div>):<p>No documents yet.</p>}
</div>}

function EstimateHub({data}:{data:AppData}){
  const plans=data.docs.filter((x:any)=>x.type==='Build Plan')
  const rows=[...data.estimates,...plans.map((x:any)=>({id:x.id,project:x.project,customer:x.customer,status:x.status||'Draft',amount:x.buildPlan?.estimatedTotalCost}))]
  return <div className="workspace"><Head title="AI Estimates" text="Generate a detailed build plan with materials, labor, scope, assumptions, and estimated total."/><div className="reviewActions"><button className="primary" onClick={()=>location.href='/build-plans'}><Sparkles size={17}/>Generate AI Estimate</button></div>
  {rows.length?rows.map((x:any)=><div className="wideRow" key={x.id}><Sparkles size={18}/><div className="grow"><b>{x.project||x.customer||'Estimate'}</b><span>{x.customer||''}</span></div><strong>{money(x.amount)}</strong><Status value={x.status||'Draft'}/></div>):<p>No estimates yet.</p>}</div>
}

function BusinessSettings({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const s=data.settings||{}
  function set(k:string,v:string){setData({...data,settings:{...s,[k]:v}})}
  function demo(){if(!confirm('Load sample presentation data into this workspace?'))return;const id=Date.now();setData({...data,customers:[{id:id+1,name:'Morgan Reed',customer:'Morgan Reed',phone:'(555) 014-0182',email:'morgan@example.com',address:'214 Oak Ridge Dr',status:'Active'},...data.customers],projects:[{id:id+2,customer:'Morgan Reed',name:'Kitchen Remodel',status:'In Progress',date:localDate(),amount:18450},...data.projects],estimates:[{id:id+3,customer:'Morgan Reed',project:'Kitchen Remodel',status:'Approved',amount:18450},...data.estimates],invoices:[{id:id+4,customer:'Morgan Reed',project:'Kitchen Remodel',amount:7250,balance:7250,status:'Sent',due:localDate()},...data.invoices],schedule:[{id:id+5,date:localDate(),start:'08:00',end:'16:00',project:'Kitchen Remodel',worker:'Alex Crew',notes:'Cabinet installation'},...data.schedule],notes:[{id:id+6,text:'Confirm countertop template before Friday.',createdAt:new Date().toLocaleString()},...data.notes]})}
  return <div className="workspace"><Head title="Settings" text="Business identity used across Construction HQ and customer-facing records."/><div className="builderGrid"><label>Business name<input value={s.businessName||''} onChange={e=>set('businessName',e.target.value)}/></label><label>Phone<input value={s.phone||''} onChange={e=>set('phone',e.target.value)}/></label><label>Email<input value={s.email||''} onChange={e=>set('email',e.target.value)}/></label><label>Address<input value={s.address||''} onChange={e=>set('address',e.target.value)}/></label><label style={{gridColumn:'1/-1'}}>Estimate terms<textarea value={s.estimateTerms||''} onChange={e=>set('estimateTerms',e.target.value)}/></label></div><div className="dashPanel" style={{marginTop:18}}><div className="dashPanelHead"><div><small>PRESENTATION</small><h3>Sample workspace</h3></div></div><p>Load a realistic customer, project, estimate, invoice, schedule item, and owner note for demos.</p><button className="primary" onClick={demo}>Load Sample Data</button></div></div>
}

function Simple({section,data}:{section:string;data:AppData}){const rows=section==='Payroll'?data.payroll:[];return <div className="workspace"><Head title={section} text="Organized inside this company workspace."/>
  {rows.length?rows.map((x:any)=><div className="wideRow" key={x.id}><div className="grow"><b>{x.project||x.customer||x.employee||section}</b><Status value={x.status||x.category||'Draft'}/></div>{x.amount!==undefined&&<strong>{money(x.amount)}</strong>}{x.gross!==undefined&&<strong>{money(x.gross)}</strong>}</div>):<p>No {section.toLowerCase()} yet.</p>}
</div>}

function Status({value}:{value:string}){return <span className={"statusText status-"+String(value||'draft').toLowerCase().replace(/\s+/g,'-')}>{value}</span>}
function Head({title,text}:{title:string;text:string}){return <div className="workspaceHead"><div><h2>{title}</h2><p>{text}</p></div></div>}
function Stat({label,value,sub}:{label:string;value:string;sub:string}){return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>}
function Field({label,value,set}:{label:string;value:string;set:(v:string)=>void}){return <label>{label}<input value={value} onChange={e=>set(e.target.value)}/></label>}
