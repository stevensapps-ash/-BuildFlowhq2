'use client'

import {useEffect,useState} from 'react'
import {
  AlertCircle, CalendarDays, Camera, ChevronDown, ClipboardList, Coins, DollarSign,
  FileSignature, FileText, FolderKanban, HardHat, Home, LogIn, LogOut, Menu,
  NotebookPen, Plus, PlusCircle, Receipt, Settings, Sparkles, Trash2, Users, ContactRound, Phone, Mail,
  WalletCards, X, Clock3, Search, BriefcaseBusiness, FilePlus2, Upload, FolderOpen
} from 'lucide-react'
import ContractWorkspace from './components/ContractWorkspace'
import JobTracker from './components/JobTracker'
import BlueprintLibrary from './components/BlueprintLibrary'
import ProjectGallery from './components/ProjectGallery'
import ReceiptOrganizer from './components/ReceiptOrganizer'
import HQAssistant from './components/HQAssistant'

type Project={id:number;customer:string;name:string;status:string;date:string;amount:number}
type AppData={projects:any[];customers:any[];invoices:any[];notes:any[];estimates:any[];docs:any[];receipts:any[];schedule:any[];employees:any[];payroll:any[];files:any[];timeEntries:any[];settings:any;[key:string]:any}

const emptyData:AppData={
  projects:[],customers:[],contacts:[],invoices:[],notes:[],estimates:[],docs:[],receipts:[],
  schedule:[],employees:[],payroll:[],files:[],timeEntries:[],
  settings:{businessName:'',phone:'',email:'',address:'',estimateTerms:'Estimates are subject to field verification and final owner approval.'}
}
const groups=[
  {label:'Work',items:[['Dashboard',Home],['Projects',FolderKanban],['Schedule',CalendarDays],['Customers',Users],['Contact Book',ContactRound]]},
  {label:'Create',items:[['AI Estimates',Sparkles],['Contracts',FileSignature],['Change Orders',ClipboardList],['Plans Studio',FileText]]},
  {label:'Money',items:[['Invoices',Receipt],['Receipts',WalletCards],['Billing & Tokens',Coins]]},
  {label:'Business',items:[['Before & After',Camera],['Documents',FileText],['Notes',NotebookPen],['Settings',Settings]]}
] as any[]
const money=(n:number)=>'$'+Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2})
const localDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function norm(d:any):AppData{return{...emptyData,...d,projects:d?.projects||[],customers:d?.customers||[],contacts:d?.contacts||[],invoices:d?.invoices||[],notes:d?.notes||[],estimates:d?.estimates||[],docs:d?.docs||[],receipts:d?.receipts||[],schedule:d?.schedule||[],employees:d?.employees||[],payroll:d?.payroll||[],files:d?.files||[],timeEntries:d?.timeEntries||[],settings:{...emptyData.settings,...(d?.settings||{})}}}
async function ai(mode:string,input:string){const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,input})});const b=await r.json().catch(()=>({}));if(!r.ok)throw Error('AI draft could not be generated.');return String(b.text||'')}

export default function Page(){
  const[section,setSection]=useState('Dashboard')
  const[data,setData]=useState<AppData>(emptyData)
  const[loaded,setLoaded]=useState(false)
  const[company,setCompany]=useState('Construction Company')
  const[role,setRole]=useState('owner')
  const[search,setSearch]=useState('')
  const[activeJob,setActiveJob]=useState<Project|null>(null)
  const[toolsOpen,setToolsOpen]=useState(false)
  const[createOpen,setCreateOpen]=useState(false)

  useEffect(()=>{fetch('/api/workspace',{cache:'no-store'}).then(async r=>{if(r.status===401){location.href='/login';return}const w=await r.json();setCompany(w.companyName||'Construction Company');setRole(w.role||'owner');setData(norm(w.data||{}));setLoaded(true)})},[])
  useEffect(()=>{if(!loaded||!['owner','manager'].includes(role))return;const t=setTimeout(()=>{void fetch('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(r=>{if(!r.ok)console.error('Workspace save failed',r.status)}).catch(()=>console.error('Workspace save failed'))},450);return()=>clearTimeout(t)},[data,loaded,role])

  if(!loaded)return <div className="loading"><HardHat/><b>Loading workspace…</b></div>
  const go=(s:string)=>{if(s==='Billing & Tokens'){location.href='/subscribe';return}if(s==='Jobs'){setSection('Projects')}else if(s==='Files'){setSection('Documents')}else setSection(s);setActiveJob(null);setToolsOpen(false);setCreateOpen(false);setSearch('')}
  const searchRows=search.trim()?[
    ...data.customers.map((x:any)=>({kind:'Customer',title:x.name||x.customer,detail:x.phone||x.email||x.address||'',target:'Customers'})),
    ...data.projects.map((x:any)=>({kind:'Job',title:x.name,detail:x.customer||'',target:'Projects'})),
    ...data.invoices.map((x:any)=>({kind:'Invoice',title:x.customer||x.project||'Invoice',detail:money(x.amount),target:'Invoices'})),
    ...data.docs.map((x:any)=>({kind:x.type||'Document',title:x.project||x.customer||x.type||'Document',detail:x.customer||'',target:'Documents'})),
    ...data.receipts.map((x:any)=>({kind:'Receipt',title:x.merchant||x.description||'Receipt',detail:[x.customer,x.project].filter(Boolean).join(' · '),target:'Receipts'}))
  ].filter((x:any)=>[x.kind,x.title,x.detail].join(' ').toLowerCase().includes(search.toLowerCase())).slice(0,8):[]
  const createItems=[['Project Setup','Projects'],['Customer','Customers'],['Project','Projects'],['AI Estimate','AI Estimates'],['Invoice','Invoices'],['Receipt','Receipts'],['AI Plan','Plans Studio'],['Contract','Contracts'],['Change Order','Change Orders'],['Contact','Contact Book']] as const

  return <div className="compactShell">
    <header className="topbar">
      <div className="topBrand"><span className="topMark logoMark"><CHQLogo/></span><div><b>Construction HQ</b><small>{data.settings.businessName||company}</small></div></div>
      <div className="chqSearch"><div className="chqSearchBox"><Search className="chqSearchIcon" size={16}/><input className="chqSearchInput" aria-label="Search Construction HQ" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Construction HQ…"/>{search&&<button className="chqSearchClear" aria-label="Clear search" onClick={()=>setSearch('')}><X size={15}/></button>}</div>{search&&<div className="chqSearchResults">{searchRows.length?searchRows.map((x:any,i:number)=><button className="chqSearchResult" key={i} onClick={()=>go(x.target)}><b>{x.kind}: {x.title}</b><small>{x.detail}</small></button>):<div className="chqSearchEmpty">No matches found</div>}</div>}</div><nav className="quickNav">
        <button className={section==='Dashboard'?'active':''} onClick={()=>go('Dashboard')}><Home/>Home</button>
        <button className={section==='Projects'?'active':''} onClick={()=>go('Projects')}><FolderKanban/>Jobs</button>
        <button className={section==='AI Estimates'?'active':''} onClick={()=>go('AI Estimates')}><Sparkles/>Estimate</button>
        <button className={section==='Receipts'?'active':''} onClick={()=>go('Receipts')}><WalletCards/>Receipts</button>
        <button className="toolsBtn" onClick={()=>{setCreateOpen(false);setToolsOpen(v=>!v)}}><Menu/>More<ChevronDown size={14}/></button>
      </nav>
      {toolsOpen&&<div className="toolMenu">
        <div className="toolMenuHead"><b>Construction HQ Tools</b><button onClick={()=>setToolsOpen(false)}><X/></button></div>
        {groups.map(g=><div className="toolGroup" key={g.label}><small>{g.label}</small><div>{g.items.map(([n,I]:any)=><button key={n} onClick={()=>go(n)} className={section===n?'active':''}><I size={17}/><span>{n}</span></button>)}</div></div>)}
        <div className="toolGroup"><small>Account</small><div><button onClick={()=>location.href='/login'}><LogIn size={17}/>Sign in</button><button onClick={()=>location.href='/logout'}><LogOut size={17}/>Sign out</button></div></div>
      </div>}
    </header>

    {createOpen&&<div className="createMenu"><div className="createMenuHead"><b>Create New</b><button onClick={()=>setCreateOpen(false)}><X size={18}/></button></div>{createItems.map(([label,target])=><button key={label} onClick={()=>go(target)}><Plus size={17}/>{label}</button>)}</div>}

    <HQAssistant section={section} go={go} data={data} role={role}/>
    <main className="compactMain">
      <div className="pageTitle"><h1>{section}</h1><p>{data.settings.businessName||company} · {role==='manager'?'Manager workspace':'Owner workspace'}</p></div>
      {activeJob?<JobTracker project={data.projects.find((p:any)=>p.id===activeJob.id)||activeJob} data={data} setData={setData} onClose={()=>setActiveJob(null)}/>:
      section==='Contracts'?<ContractWorkspace data={data} setData={setData} ai={ai}/>:
      section==='Plans Studio'?<BlueprintLibrary data={data} setData={setData} ai={ai}/>:
      section==='Before & After'?<ProjectGallery data={data} setData={setData}/>:
      section==='Receipts'?<ReceiptOrganizer data={data} setData={setData}/>:
      section==='Projects'?<Projects data={data} setData={setData} startJob={setActiveJob}/>:
      section==='Schedule'?<Schedule data={data} setData={setData}/>:
      section==='Dashboard'?<Dashboard data={data} go={go} role={role}/>:
      section==='Customers'?<Customers data={data} setData={setData}/>:
      section==='Contact Book'?<ContactBook data={data} setData={setData}/>:
      section==='Invoices'?<Invoices data={data} setData={setData}/>:
      section==='Change Orders'?<ChangeOrders data={data} setData={setData}/>:

      section==='Notes'?<Notes data={data} setData={setData}/>:
      section==='Settings'?<BusinessSettings data={data} setData={setData}/>:
      section==='Documents'?<Documents data={data} setData={setData}/>:
      section==='AI Estimates'?<EstimateHub data={data} setData={setData}/>:
      <Simple section={section} data={data}/>}
      <footer>Construction HQ · Contractor business workspace</footer>
    </main>

    <nav className="mobileNav" aria-label="Primary navigation">
      <button className={section==='Dashboard'?'active':''} onClick={()=>go('Dashboard')}><Home/><span>Home</span></button>
      <button className={section==='Projects'?'active':''} onClick={()=>go('Projects')}><FolderKanban/><span>Jobs</span></button>
      <button className={section==='AI Estimates'?'active':''} onClick={()=>go('AI Estimates')}><Sparkles/><span>Estimate</span></button>
      <button className="mobileCreate" aria-expanded={createOpen} onClick={()=>{setToolsOpen(false);setCreateOpen(v=>!v)}}><PlusCircle/><span>New</span></button>
      <button className={section==='Documents'?'active':''} onClick={()=>go('Documents')}><FolderOpen/><span>Files</span></button>
      <button className={toolsOpen?'active':''} aria-expanded={toolsOpen} onClick={()=>{setCreateOpen(false);setToolsOpen(v=>!v)}}><Menu/><span>More</span></button>
    </nav>
  </div>
}

function CHQLogo(){return <svg className="chqLogo" viewBox="0 0 100 76" role="img" aria-label="Construction HQ logo"><defs><linearGradient id="steel" x1="0" x2="1"><stop offset="0" stopColor="#f8fbfd"/><stop offset=".5" stopColor="#aeb9c1"/><stop offset="1" stopColor="#59666f"/></linearGradient><linearGradient id="blue" x1="0" x2="1"><stop offset="0" stopColor="#34c9ff"/><stop offset=".5" stopColor="#168cff"/><stop offset="1" stopColor="#0b5fff"/></linearGradient></defs><path d="M8 44 49 10l42 34M18 38V18h12v11M68 27V14h11v21" fill="none" stroke="url(#steel)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 59c6-28 26-46 47-46 18 0 33 10 39 28" fill="none" stroke="url(#blue)" strokeWidth="3"/><text x="49" y="59" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="35" fill="url(#steel)" stroke="#168cff" strokeWidth=".7">HQ</text><path d="M8 65h84" stroke="url(#blue)" strokeWidth="2.5"/><rect x="45" y="25" width="6" height="6" rx="1" fill="#24b8ff"/><rect x="53" y="25" width="6" height="6" rx="1" fill="#24b8ff"/></svg>}

function Dashboard({data,go,role}:{data:AppData,go:(s:string)=>void,role:string}){
  const today=localDate(),todayJobs=data.schedule.filter((x:any)=>x.date===today),unpaid=data.invoices.filter((x:any)=>String(x.status||'').toLowerCase()!=='paid'),unpaidTotal=unpaid.reduce((a:number,x:any)=>a+Number(x.balance??x.amount??0),0),recent=[...data.estimates].slice(0,4)
  const openProjects=data.projects.filter((p:any)=>!['Completed','Paid'].includes(String(p.status||'')));const missingNext=openProjects.slice(0,4).map((p:any)=>({text:`${p.name} · Next: ${p.status==='Estimate'?'finish/review estimate':p.status==='Ready to Start'?'contract & schedule':p.status==='In Progress'?'track costs / prepare invoice':'open project'}`,target:'Projects'}));
  const attention=[...missingNext,...unpaid.filter((x:any)=>String(x.status||'').toLowerCase()==='overdue').map((x:any)=>({text:`Overdue invoice · ${x.customer||x.project||'Customer'}`,target:'Invoices'})),...data.estimates.filter((x:any)=>String(x.status||'').toLowerCase()==='sent').map((x:any)=>({text:`Estimate awaiting approval · ${x.project||x.customer||'Estimate'}`,target:'AI Estimates'})),...data.docs.filter((x:any)=>String(x.status||'').toLowerCase().includes('awaiting')).map((x:any)=>({text:`${x.type||'Document'} awaiting action · ${x.project||x.customer||''}`,target:'Documents'}))].slice(0,6)
  return <><section className="hero"><div><span>CONSTRUCTION HQ</span><h2>Your business, organized for today.</h2><p>See what needs attention and jump straight into the next job, estimate, or invoice.</p></div><button onClick={()=>go('AI Estimates')}><Plus size={17}/> New Estimate</button></section>
  <section className="stats">
    <button className="statButton" onClick={()=>go('Projects')}><Stat label="Active Jobs" value={String(data.projects.filter((p:any)=>p.status==='In Progress').length)} sub="currently active"/></button>
    <button className="statButton" onClick={()=>go('Schedule')}><Stat label="Today's Jobs" value={String(todayJobs.length)} sub="scheduled today"/></button>
    {<button className="statButton" onClick={()=>go('Invoices')}><Stat label="Unpaid Invoices" value={String(unpaid.length)} sub={unpaid.length?money(unpaidTotal)+' outstanding':'nothing outstanding'}/></button>}
  </section>
  <section className="quickActions"><div className="quickActionsHead"><h3>Quick Actions</h3><button onClick={()=>go('Documents')}>View all <span>›</span></button></div><div className="quickActionGrid">
    <button onClick={()=>go('AI Estimates')}><FilePlus2/><b>New Estimate</b><small>AI powered</small></button>
    <button onClick={()=>go('Plans Studio')}><BriefcaseBusiness/><b>Build Plans</b><small>Draw & design</small></button>
    <button onClick={()=>go('Contracts')}><FileSignature/><b>New Contract</b><small>Templates</small></button>
    <button onClick={()=>go('Schedule')}><CalendarDays/><b>Schedule</b><small>Manage jobs</small></button>
    <button onClick={()=>go('Before & After')}><Upload/><b>Upload Photos</b><small>AI file sorting</small></button>
    <button onClick={()=>go('Documents')}><FolderOpen/><b>File Cabinet</b><small>Customer files</small></button>
  </div></section>
  <section className="hqBanner"><div><Sparkles/><span><b>Hey HQ</b><small>Ask, find, create — by voice or text</small></span></div><button onClick={()=>document.querySelector<HTMLButtonElement>('.hqOrb')?.click()}>Start</button></section>
  {attention.length>0&&<section className="dashPanel" style={{marginBottom:18}}><div className="dashPanelHead"><div><small>ATTENTION</small><h3>Needs Attention</h3></div></div>{attention.map((x:any,i:number)=><button key={i} onClick={()=>go(x.target)} className="wideRow" style={{width:'100%',textAlign:'left',cursor:'pointer'}}><AlertCircle size={18}/><div className="grow"><b>{x.text}</b></div></button>)}</section>}
  <section className="dashboardGrid">
    <Panel title="Quick Start" eyebrow="WORKFLOW" action="Start project" onClick={()=>go('Projects')}><div className="dashRow"><FolderKanban/><div><b>Create one project record</b><span>Customer → Estimate → Plans → Contract → Schedule → Work → Invoice → Closeout</span></div></div><button className="primary" onClick={()=>go('Projects')}><Plus size={16}/> Start Project Setup</button></Panel><Panel title="Today's Jobs" eyebrow="TODAY" action="View schedule" onClick={()=>go('Schedule')}>
      {todayJobs.length?todayJobs.slice(0,4).map((x:any)=><div className="dashRow" key={x.id}><Clock3/><div><b>{x.project}</b><span>{x.start}–{x.end} · {x.worker}</span></div></div>):<EmptyAction icon={CalendarDays} text="Nothing scheduled for today." action="Add to schedule" onClick={()=>go('Schedule')}/>}
    </Panel>
    <Panel title="Unpaid Invoices" eyebrow="MONEY" action="View invoices" onClick={()=>go('Invoices')}>
      {unpaid.length?unpaid.slice(0,4).map((x:any)=><div className="dashRow" key={x.id}><AlertCircle/><div><b>{x.customer||x.project||'Invoice'}</b><span>{x.status||'Open'}</span></div><strong>{money(x.balance??x.amount)}</strong></div>):<EmptyAction icon={Receipt} text="No unpaid invoices." action="Create invoice" onClick={()=>go('Invoices')}/>}
    </Panel>
    <div className="fullPanel"><Panel title="Recent Estimates" eyebrow="RECENT" action="New estimate" onClick={()=>go('AI Estimates')}>
      {recent.length?recent.map((x:any)=><div className="dashRow" key={x.id}><Sparkles/><div><b>{x.project||x.customer||'Estimate'}</b><span>{x.status||'Draft'}</span></div>{x.amount!==undefined&&<strong>{money(x.amount)}</strong>}</div>):<EmptyAction icon={Sparkles} text="No estimates yet." action="Create your first AI estimate" onClick={()=>go('AI Estimates')}/>}
    </Panel></div>
    <div className="fullPanel"><Panel title="Business Activity" eyebrow="ACTIVITY" action="Open jobs" onClick={()=>go('Projects')}>
      {[...data.projects.slice(0,2).map((x:any)=>({id:'p'+x.id,title:x.name,detail:'Job · '+(x.status||'Draft')})),...data.invoices.slice(0,2).map((x:any)=>({id:'i'+x.id,title:x.customer||x.project||'Invoice',detail:'Invoice · '+(x.status||'Draft')})),...data.docs.slice(0,2).map((x:any)=>({id:'d'+x.id,title:x.project||x.type||'Document',detail:(x.type||'Document')+' · '+(x.status||'Draft')}))].slice(0,5).map((x:any)=><div className="dashRow" key={x.id}><ClipboardList/><div><b>{x.title}</b><span>{x.detail}</span></div></div>)}
      {!data.projects.length&&!data.invoices.length&&!data.docs.length&&<p>No activity yet. New estimates, jobs, invoices, and documents will appear here.</p>}
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
  const[c,setC]=useState(''),[n,setN]=useState(''),[a,setA]=useState(''),[address,setAddress]=useState(''),[scope,setScope]=useState(''),[target,setTarget]=useState('')
  function add(){if(!c.trim()||!n.trim())return;const id=Date.now(),customer=c.trim(),name=n.trim(),existing=data.customers.find((x:any)=>String(x.name||x.customer||'').toLowerCase()===customer.toLowerCase());const customers=existing?data.customers:[{id:id+1,name:customer,customer,phone:'',email:'',address:address.trim(),status:'Active'},...data.customers];const project={id,customer,name,status:'Estimate',date:'Not scheduled',amount:Number(a||0),address:address.trim()||existing?.address||'',scope:scope.trim(),targetDate:target,stage:'Estimate'};setData({...data,customers,projects:[project,...data.projects],files:[{id:id+2,name:'Project File Cabinet',category:'Project Folder',customer,project:name,folders:['Estimates','Contracts','Plans & Diagrams','Receipts','Invoices','Change Orders','Photos','Permits & Other'],createdAt:new Date().toISOString()},...(data.files||[])]});setC('');setN('');setA('');setAddress('');setScope('');setTarget('')}
  return <div className="workspace"><Head title="Project Setup" text="Enter the job once. Construction HQ carries these details into the rest of the project workflow."/><div className="builderGrid"><label>Customer<select value={c} onChange={e=>setC(e.target.value)}><option value="">Select or type below</option>{data.customers.map((x:any)=><option key={x.id} value={x.name||x.customer}>{x.name||x.customer}</option>)}</select></label><Field label="Customer / new customer" value={c} set={setC}/><Field label="Project" value={n} set={setN}/><Field label="Job address" value={address} set={setAddress}/><label className="full">Scope / project description<textarea value={scope} onChange={e=>setScope(e.target.value)} placeholder="Describe the work once so it can follow the project."/></label><label>Target date<input type="date" value={target} onChange={e=>setTarget(e.target.value)}/></label><Field label="Estimate / budget" value={a} set={setA}/><button className="primary" onClick={add}><Plus/>Create Project & File Cabinet</button></div>
  {data.projects.length?data.projects.map((p:any)=><div className="wideRow" key={p.id}><div className="grow"><b>{p.name}</b><span>{p.customer} · {p.date||'Not scheduled'}</span></div><strong>{money(p.amount)}</strong><Status value={p.status}/><button className="primary" onClick={()=>startJob(p)}>{p.status==='In Progress'?'Open Command Center':'Open Job'}</button></div>):<p>No projects yet. Use the form above to create your first project.</p>}</div>
}

function Customers({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[name,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[address,setAddress]=useState(''),[openId,setOpenId]=useState<number|null>(null)
  function add(){if(!name.trim())return;setData({...data,customers:[{id:Date.now(),name:name.trim(),customer:name.trim(),phone:phone.trim(),email:email.trim(),address:address.trim(),status:'Active'},...data.customers]});setName('');setPhone('');setEmail('');setAddress('')}
  const selected=data.customers.find((x:any)=>x.id===openId)
  return <div className="workspace"><Head title="Customers" text="Each customer has one job binder for projects, estimates, contracts, invoices, receipts, photos, notes and documents."/><div className="builderGrid"><Field label="Customer name" value={name} set={setName}/><Field label="Phone" value={phone} set={setPhone}/><Field label="Email" value={email} set={setEmail}/><Field label="Address" value={address} set={setAddress}/><button className="primary" onClick={add}><Plus/>Add Customer</button></div>
  {selected&&<CustomerBinder customer={selected} data={data} onClose={()=>setOpenId(null)}/>}
  {data.customers.length?data.customers.map((x:any)=><div className="wideRow" key={x.id}><Users size={18}/><div className="grow"><b>{x.name||x.customer}</b><span>{[x.phone,x.email,x.address].filter(Boolean).join(' · ')||'Contact details not added yet'}</span></div><Status value={x.status||'Active'}/><button className="primary" onClick={()=>setOpenId(x.id)}>Open File</button><button className="iconButton" title="Delete customer" onClick={()=>setData({...data,customers:data.customers.filter((y:any)=>y.id!==x.id)})}><Trash2 size={15}/></button></div>):<p>No customers yet.</p>}</div>
}

function CustomerBinder({customer,data,onClose}:{customer:any;data:AppData;onClose:()=>void}){
  const n=String(customer.name||customer.customer||'').toLowerCase()
  const projects=data.projects.filter((x:any)=>String(x.customer||'').toLowerCase()===n)
  const estimates=data.estimates.filter((x:any)=>String(x.customer||'').toLowerCase()===n)
  const invoices=data.invoices.filter((x:any)=>String(x.customer||'').toLowerCase()===n)
  const receipts=data.receipts.filter((x:any)=>String(x.customer||'').toLowerCase()===n||projects.some((p:any)=>p.name===x.project))
  const docs=data.docs.filter((x:any)=>String(x.customer||'').toLowerCase()===n||projects.some((p:any)=>p.name===x.project))
  const totalReceipts=receipts.reduce((s:number,x:any)=>s+Number(x.amount||0),0)
  const contractValue=projects.reduce((s:number,x:any)=>s+Number(x.amount||0),0)
  const labor=data.payroll.filter((x:any)=>projects.some((p:any)=>p.name===x.project)).reduce((s:number,x:any)=>s+Number(x.gross||0),0)
  const actualCost=totalReceipts+labor
  const profit=contractValue-actualCost
  const timeline=[...projects.map((x:any)=>({date:x.date||'',label:`Job · ${x.name} · ${x.status}`})),...estimates.map((x:any)=>({date:x.createdAt||'',label:`Estimate · ${x.project||'Project'} · ${x.status||'Draft'}`})),...invoices.map((x:any)=>({date:x.createdAt||x.due||'',label:`Invoice · ${x.status||'Draft'} · ${money(x.amount)}`})),...receipts.map((x:any)=>({date:x.date||'',label:`Receipt · ${x.merchant||'Vendor'} · ${money(x.amount)}`})),...docs.map((x:any)=>({date:x.createdAt||'',label:`${x.type||'Document'} · ${x.status||'Draft'}`}))].sort((a:any,b:any)=>String(b.date).localeCompare(String(a.date))).slice(0,12)
  return <div className="dashPanel" style={{margin:'18px 0'}}><div className="dashPanelHead"><div><small>CUSTOMER JOB BINDER</small><h3>{customer.name||customer.customer}</h3><span>{[customer.phone,customer.email,customer.address].filter(Boolean).join(' · ')}</span></div><button onClick={onClose}>Close</button></div>
    <div className="stats"><Stat label="Project Value" value={money(contractValue)} sub={projects.length+' projects'}/><Stat label="Actual Cost" value={money(actualCost)} sub="receipts + labor"/><Stat label="Job Profit" value={money(profit)} sub={contractValue?'before overhead/tax':'no project value yet'}/></div>
    <h3>Projects</h3>{projects.length?projects.map((x:any)=><div className="wideRow" key={x.id}><FolderKanban size={17}/><div className="grow"><b>{x.name}</b><span>{x.status}</span></div><strong>{money(x.amount)}</strong></div>):<p>No projects yet.</p>}
    <h3>Receipts & Highlighted Purchases</h3>{receipts.length?receipts.map((x:any)=><div className="wideRow" key={x.id} style={{borderLeft:`8px solid ${x.color||'#888'}`}}><Receipt size={17}/><div className="grow"><b>{x.merchant||x.description||'Receipt'}</b><span>{x.description||x.project||'Unassigned'} · {x.date||''}</span></div><strong>{money(x.amount)}</strong>{x.receiptImage&&String(x.receiptImage).startsWith('data:image')&&<img src={x.receiptImage} alt="Receipt" style={{width:54,height:54,objectFit:'cover',borderRadius:8}}/>}</div>):<p>No receipts assigned to this customer yet.</p>}
    <h3>Documents</h3>{docs.length?docs.map((x:any)=><div className="wideRow" key={x.id}><FileText size={17}/><div className="grow"><b>{x.type||'Document'}</b><span>{x.project||''}</span></div><Status value={x.status||'Draft'}/></div>):<p>No documents yet.</p>}
    <h3>Timeline</h3>{timeline.length?timeline.map((x:any,i:number)=><div className="wideRow" key={i}><Clock3 size={17}/><div className="grow"><b>{x.label}</b><span>{x.date||'Date not recorded'}</span></div></div>):<p>No activity recorded yet.</p>}
  </div>
}


function ContactBook({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const[name,setName]=useState(''),[company,setCompany]=useState(''),[type,setType]=useState('Customer'),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[address,setAddress]=useState(''),[notes,setNotes]=useState(''),[search,setSearch]=useState('')
  function add(){if(!name.trim())return;setData({...data,contacts:[{id:Date.now(),name:name.trim(),company:company.trim(),type,phone:phone.trim(),email:email.trim(),address:address.trim(),notes:notes.trim(),status:'Active'},...(data.contacts||[])]});setName('');setCompany('');setPhone('');setEmail('');setAddress('');setNotes('')}
  const q=search.trim().toLowerCase(),rows=(data.contacts||[]).filter((x:any)=>!q||[x.name,x.company,x.type,x.phone,x.email,x.address,x.notes].some((v:any)=>String(v||'').toLowerCase().includes(q)))
  return <div className="workspace"><Head title="Contact Book" text="Keep customers, subcontractors, suppliers, vendors, and other business contacts in one searchable place."/>
    <div className="builderGrid">
      <Field label="Name" value={name} set={setName}/><Field label="Company" value={company} set={setCompany}/>
      <label>Contact type<select value={type} onChange={e=>setType(e.target.value)}><option>Customer</option><option>Subcontractor</option><option>Supplier</option><option>Vendor</option><option>Employee</option><option>Other</option></select></label>
      <Field label="Phone" value={phone} set={setPhone}/><Field label="Email" value={email} set={setEmail}/><Field label="Address" value={address} set={setAddress}/>
      <label style={{gridColumn:'1/-1'}}>Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Trade, specialty, account info, preferred contact time…"/></label>
      <button className="primary" onClick={add}><Plus/>Add Contact</button>
    </div>
    <div className="libraryHead" style={{margin:'22px 0 10px'}}><div><b>Saved Contacts</b><div className="hint">{(data.contacts||[]).length} total</div></div><div className="librarySearch"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts…"/></div></div>
    {rows.length?rows.map((x:any)=><div className="wideRow" key={x.id}><ContactRound size={18}/><div className="grow"><b>{x.name}{x.company?' · '+x.company:''}</b><span>{[x.type,x.phone,x.email,x.address].filter(Boolean).join(' · ')}</span>{x.notes&&<span>{x.notes}</span>}</div>{x.phone&&<a className="iconButton" title="Call contact" href={'tel:'+x.phone}><Phone size={15}/></a>}{x.email&&<a className="iconButton" title="Email contact" href={'mailto:'+x.email}><Mail size={15}/></a>}<button className="iconButton" title="Delete contact" onClick={()=>setData({...data,contacts:(data.contacts||[]).filter((y:any)=>y.id!==x.id)})}><Trash2 size={15}/></button></div>):<p>{search?'No contacts match your search.':'No contacts yet.'}</p>}
  </div>
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

function Documents({data,setData}:{data:AppData;setData:(d:any)=>void}){
 const[secureFiles,setSecureFiles]=useState<any[]>([]),[customer,setCustomer]=useState('All'),[project,setProject]=useState('All'),[templateName,setTemplateName]=useState(''),[templateType,setTemplateType]=useState('Estimate'),[templateBody,setTemplateBody]=useState('')
 useEffect(()=>{fetch('/api/files',{cache:'no-store'}).then(r=>r.ok?r.json():{files:[]}).then(b=>setSecureFiles(b.files||[]))},[])
 const templates=data.templates||[];const files=secureFiles.filter((f:any)=>(customer==='All'||f.customer===customer)&&(project==='All'||f.project===project))
 async function openFile(id:string){const r=await fetch('/api/files/'+id);const b=await r.json();if(r.ok&&b.url)window.open(b.url,'_blank','noopener,noreferrer')}
 function saveTemplate(){if(!templateName.trim()||!templateBody.trim())return;setData({...data,templates:[{id:Date.now(),name:templateName.trim(),type:templateType,body:templateBody.trim(),createdAt:new Date().toISOString()},...templates]});setTemplateName('');setTemplateBody('')}
 return <div className="workspace"><Head title="Customer File Cabinet & Templates" text="Secure customer/project files plus reusable company templates in one workspace."/>
 <div className="dashPanel"><div className="dashPanelHead"><div><small>SECURE STORAGE</small><h3>Customer File Cabinet</h3></div></div><div className="builderGrid"><label>Customer<select value={customer} onChange={e=>setCustomer(e.target.value)}><option>All</option>{Array.from(new Set(secureFiles.map((x:any)=>x.customer).filter(Boolean))).map((x:any)=><option key={x}>{x}</option>)}</select></label><label>Project<select value={project} onChange={e=>setProject(e.target.value)}><option>All</option>{Array.from(new Set(secureFiles.map((x:any)=>x.project).filter(Boolean))).map((x:any)=><option key={x}>{x}</option>)}</select></label></div>{files.length?files.map((x:any)=><div className="wideRow" key={x.id}><FileText size={18}/><div className="grow"><b>{x.filename}</b><span>{[x.customer,x.project,x.category].filter(Boolean).join(' · ')}</span></div><button className="primary" onClick={()=>openFile(x.id)}>Open</button></div>):<p>No securely uploaded files match this filter yet.</p>}</div>
 <div className="dashPanel" style={{marginTop:18}}><div className="dashPanelHead"><div><small>REUSABLE COMPANY INTELLIGENCE</small><h3>Advanced Templates</h3></div></div><div className="builderGrid"><Field label="Template name" value={templateName} set={setTemplateName}/><label>Type<select value={templateType} onChange={e=>setTemplateType(e.target.value)}>{['Estimate','Contract','Scope of Work','Change Order','Invoice Notes','Closeout','Customer Message','Project Checklist'].map(x=><option key={x}>{x}</option>)}</select></label><label className="full">Reusable content<textarea value={templateBody} onChange={e=>setTemplateBody(e.target.value)} placeholder="Add standard scope language, exclusions, checklist items, terms, or company wording…"/></label><button className="primary" onClick={saveTemplate}><Plus/>Save Template</button></div>{templates.length?templates.map((x:any)=><div className="wideRow" key={x.id}><ClipboardList size={18}/><div className="grow"><b>{x.name}</b><span>{x.type} · {x.body.slice(0,120)}{x.body.length>120?'…':''}</span></div><button className="iconButton" onClick={()=>setData({...data,templates:templates.filter((t:any)=>t.id!==x.id)})}><Trash2 size={15}/></button></div>):<p>No reusable templates yet.</p>}</div>
 <div className="dashPanel" style={{marginTop:18}}><h3>Generated Project Documents</h3>{data.docs.length?data.docs.map((x:any)=><div className="wideRow" key={x.id}><FileText size={18}/><div className="grow"><b>{x.type||'Document'}{x.project?' · '+x.project:''}</b><span>{x.customer||''}</span></div><Status value={x.status||'Draft'}/></div>):<p>No generated documents yet.</p>}</div></div>
}

function EstimateHub({data,setData}:{data:AppData;setData:(d:any)=>void}){
  const plans=data.docs.filter((x:any)=>x.type==='Build Plan')
  const rows=[...data.estimates,...plans.map((x:any)=>({id:x.id,project:x.project,customer:x.customer,status:x.status||'Draft',amount:x.buildPlan?.estimatedTotalCost,buildPlan:true}))]
  function patch(id:any,key:string,value:any){setData({...data,estimates:data.estimates.map((x:any)=>x.id===id?{...x,[key]:value}:x)})}
  return <div className="workspace"><Head title="AI Estimates" text="Create, review, edit, approve, and move estimates directly into the job workflow."/><div className="reviewActions"><button className="primary" onClick={()=>location.href='/build-plans'}><Sparkles size={17}/>Generate AI Estimate</button></div>
  {rows.length?rows.map((x:any)=><div className="wideRow" key={(x.buildPlan?'plan-':'estimate-')+x.id}><Sparkles size={18}/><div className="grow">{x.buildPlan?<><b>{x.project||x.customer||'Build Plan'}</b><span>{x.customer||''} · Edit materials, labor and scope from Build Plans</span></>:<><input aria-label="Estimate project" value={x.project||''} onChange={e=>patch(x.id,'project',e.target.value)} placeholder="Project"/><input aria-label="Estimate customer" value={x.customer||''} onChange={e=>patch(x.id,'customer',e.target.value)} placeholder="Customer"/></>}</div>{x.buildPlan?<strong>{money(x.amount)}</strong>:<input aria-label="Estimate amount" type="number" min="0" value={x.amount??0} onChange={e=>patch(x.id,'amount',Number(e.target.value||0))}/>} {x.buildPlan?<Status value={x.status||'Draft'}/>:<select aria-label="Estimate status" value={x.status||'Draft'} onChange={e=>patch(x.id,'status',e.target.value)}><option>Draft</option><option>Sent</option><option>Approved</option><option>Declined</option></select>}{x.buildPlan&&<button className="primary" onClick={()=>location.href='/build-plans'}>Edit</button>}</div>):<p>No estimates yet.</p>}</div>
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
