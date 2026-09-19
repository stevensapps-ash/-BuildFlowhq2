'use client'

import {useEffect,useRef,useState} from 'react'
import {Mic,MicOff,Send,X,Sparkles} from 'lucide-react'

export default function HQAssistant({section,go,data,role}:{section:string;go:(s:string)=>void;data:any;role:string}){
 const[open,setOpen]=useState(false),[listening,setListening]=useState(false),[text,setText]=useState(''),[reply,setReply]=useState('Say “Hey HQ” followed by what you need.')
 const rec=useRef<any>(null),dataRef=useRef(data),roleRef=useRef(role),goRef=useRef(go)
 useEffect(()=>{dataRef.current=data;roleRef.current=role;goRef.current=go},[data,role,go])
 const runRef=useRef<(raw:string)=>void>(()=>{})
 runRef.current=(raw:string)=>{
  const q=raw.trim().replace(/^hey\s+hq[,.]?\s*/i,'').trim();if(!q)return
  const l=q.toLowerCase(),employee=roleRef.current==='employee'
  const restricted=['invoice','unpaid','payroll','billing','subscription','payment','employee']
  if(employee&&restricted.some(k=>l.includes(k))){setReply('That area requires owner or manager access.');setOpen(true);return}
  const routes:[string[],string][]=[
   [['estimate','quote'],'AI Estimates'],[['receipt'],'Receipts'],[['invoice','unpaid'],'Invoices'],[['schedule','today'],'Schedule'],
   [['customer','client'],'Customers'],[['contact'],'Contact Book'],[['change order'],'Change Orders'],[['contract'],'Contracts'],
   [['plan','blueprint','drawing'],'Plans Studio'],[['job','project'],'Projects'],[['employee'],'Employees'],[['note'],'Notes'],[['document','file'],'Documents']
  ]
  const hit=routes.find(([keys])=>keys.some(k=>l.includes(k)))
  if(hit){goRef.current(hit[1]);setReply(`Opening ${hit[1]}.`);setOpen(true);return}
  if(l.includes('dashboard')||l.includes('home')){goRef.current('Dashboard');setReply('Opening your dashboard.');setOpen(true);return}
  const projects=(dataRef.current?.projects||[]).filter((p:any)=>[p.name,p.customer,p.status].join(' ').toLowerCase().includes(l))
  if(projects.length){goRef.current('Projects');setReply(`I found ${projects.length} matching job${projects.length===1?'':'s'}.`);setOpen(true);return}
  setReply(`I heard: “${q}”. I can open and find Construction HQ records; record-changing commands require the appropriate permission.`);setOpen(true)
 }
 useEffect(()=>{
  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;if(!SR)return
  const r=new SR();r.continuous=true;r.interimResults=false;r.lang='en-US'
  r.onresult=(e:any)=>{const heard=Array.from(e.results).slice(e.resultIndex).map((x:any)=>(x as any)[0].transcript).join(' ');if(/hey\s+hq/i.test(heard)){setOpen(true);runRef.current(heard)}}
  r.onend=()=>setListening(false);r.onerror=()=>setListening(false);rec.current=r
  return()=>{try{r.stop()}catch{}}
 },[])
 const toggle=()=>{if(!rec.current){setOpen(true);setReply('Voice recognition is not available in this browser. You can still type to HQ.');return}if(listening){rec.current.stop();setListening(false)}else{try{rec.current.start();setListening(true);setOpen(true);setReply('Listening… say “Hey HQ” and your command.')}catch{}}}
 const submit=()=>{if(!text.trim())return;runRef.current(text);setText('')}
 return <><button className={'hqOrb '+(listening?'listening':'')} onClick={()=>setOpen(!open)} aria-label="Open HQ Assistant"><Sparkles size={20}/><span>HQ</span></button>
 {open&&<aside className="hqAssistant"><div className="hqAssistantHead"><div><b>HQ Assistant</b><small>{listening?'Listening for “Hey HQ”…':`${section} · ${role}`}</small></div><button onClick={()=>setOpen(false)}><X size={18}/></button></div>
 <div className="hqAssistantReply">{reply}</div><div className="hqAssistantInput"><button className={listening?'active':''} onClick={toggle} aria-label={listening?'Stop listening':'Start voice'}>{listening?<MicOff/>:<Mic/>}</button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Ask HQ anything…"/><button onClick={submit} aria-label="Send command"><Send/></button></div>
 <small className="hqAssistantHint">Try: “Hey HQ, show me today’s jobs” or “Hey HQ, open estimates.”</small></aside>}</>
}
