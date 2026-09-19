'use client'

import {useEffect,useRef,useState} from 'react'
import {Mic,MicOff,Send,X,Sparkles} from 'lucide-react'

export default function HQAssistant({section,go,data,role}:{section:string;go:(s:string)=>void;data:any;role:string}){
 const[open,setOpen]=useState(false),[listening,setListening]=useState(false),[text,setText]=useState(''),[reply,setReply]=useState('Say “Hey HQ” followed by what you need.')
 const rec=useRef<any>(null)
 const run=(raw:string)=>{
  const q=raw.trim().replace(/^hey\s+hq[,.]?\s*/i,'').trim(); if(!q)return
  const l=q.toLowerCase()
  const routes:[string[],string][]=[
   [['estimate','quote'],'AI Estimates'],[['receipt'],'Receipts'],[['invoice','unpaid'],'Invoices'],[['schedule','today'], 'Schedule'],
   [['customer','client'],'Customers'],[['contact'],'Contact Book'],[['contract'],'Contracts'],[['change order'],'Change Orders'],
   [['plan','blueprint','drawing'],'Plans Studio'],[['job','project'],'Projects'],[['employee'],'Employees'],[['note'],'Notes'],[['document','file'],'Documents']
  ]
  const hit=routes.find(([keys])=>keys.some(k=>l.includes(k)))
  if(hit){go(hit[1]);setReply(`Opening ${hit[1]}. Tell me what you want to do there.`);setOpen(true);return}
  if(l.includes('dashboard')||l.includes('home')){go('Dashboard');setReply('Opening your dashboard.');setOpen(true);return}
  const projects=(data?.projects||[]).filter((p:any)=>[p.name,p.customer,p.status].join(' ').toLowerCase().includes(l))
  if(projects.length){go('Projects');setReply(`I found ${projects.length} matching job${projects.length===1?'':'s'}.`);setOpen(true);return}
  setReply(`I heard: “${q}”. I can navigate Construction HQ now; deeper create/update commands are being connected next.`);setOpen(true)
 }
 useEffect(()=>{
  const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
  if(!SR)return
  const r=new SR();r.continuous=true;r.interimResults=false;r.lang='en-US'
  r.onresult=(e:any)=>{const heard=Array.from(e.results).slice(e.resultIndex).map((x:any)=>x[0].transcript).join(' ');if(/hey\s+hq/i.test(heard)){setOpen(true);run(heard)}}
  r.onend=()=>setListening(false);r.onerror=()=>setListening(false);rec.current=r
  return()=>{try{r.stop()}catch{}}
 },[data])
 const toggle=()=>{if(!rec.current){setOpen(true);setReply('Voice recognition is not available in this browser. You can still type to HQ.');return}if(listening){rec.current.stop();setListening(false)}else{try{rec.current.start();setListening(true);setOpen(true);setReply('Listening… say “Hey HQ” and your command.')}catch{}}}
 const submit=()=>{if(!text.trim())return;run(text);setText('')}
 return <><button className={'hqOrb '+(listening?'listening':'')} onClick={()=>setOpen(!open)} aria-label="Open HQ Assistant"><Sparkles size={20}/><span>HQ</span></button>
 {open&&<aside className="hqAssistant"><div className="hqAssistantHead"><div><b>HQ Assistant</b><small>{listening?'Listening for “Hey HQ”…':`${section} · ${role}`}</small></div><button onClick={()=>setOpen(false)}><X size={18}/></button></div>
 <div className="hqAssistantReply">{reply}</div><div className="hqAssistantInput"><button className={listening?'active':''} onClick={toggle} aria-label={listening?'Stop listening':'Start voice'}>{listening?<MicOff/>:<Mic/>}</button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="Ask HQ anything…"/><button onClick={submit} aria-label="Send command"><Send/></button></div>
 <small className="hqAssistantHint">Try: “Hey HQ, show me today’s jobs” or “Hey HQ, open estimates.”</small></aside>}</>
}
