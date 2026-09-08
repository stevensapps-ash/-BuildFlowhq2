'use client'

import { FormEvent, useState } from 'react'
import { HardHat, LogIn, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage(){
  const [mode,setMode]=useState<'login'|'signup'>('login')
  const [company,setCompany]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const supabase=createClient()

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage('')
    if(mode==='signup'){
      const {error}=await supabase.auth.signUp({email,password,options:{data:{company_name:company}}})
      setBusy(false)
      if(error)return setMessage(error.message)
      setMessage('Account created. Check your email if confirmation is enabled, then sign in.')
      setMode('login')
      return
    }
    const {error}=await supabase.auth.signInWithPassword({email,password})
    setBusy(false)
    if(error)return setMessage(error.message)
    window.location.href='/'
  }

  return <main className="authPage"><section className="authCard"><div className="authBrand"><span><HardHat/></span><div><b>BuildFlow</b><small>HQ</small></div></div><h1>{mode==='login'?'Sign in to your company':'Create your company workspace'}</h1><p>Each company gets its own isolated BuildFlow HQ workspace.</p><form onSubmit={submit}>{mode==='signup'&&<label>Company name<input required value={company} onChange={e=>setCompany(e.target.value)} placeholder="Stevens Construction"/></label>}<label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></label><label>Password<input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="6+ characters"/></label><button disabled={busy} className="primary authButton" type="submit">{mode==='login'?<><LogIn size={18}/> {busy?'Signing in...':'Sign In'}</>:<><UserPlus size={18}/> {busy?'Creating...':'Create Company'}</>}</button></form>{message&&<div className="authMessage">{message}</div>}<button className="authSwitch" onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'New to BuildFlow? Create a company':'Already have an account? Sign in'}</button></section></main>
}
