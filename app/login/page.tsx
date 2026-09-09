'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Download, HardHat, LogIn, Smartphone, UserPlus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function LoginPage(){
  const [mode,setMode]=useState<'login'|'signup'>('login')
  const [company,setCompany]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  const [installPrompt,setInstallPrompt]=useState<InstallPromptEvent|null>(null)
  const [showIosInstall,setShowIosInstall]=useState(false)
  const [installed,setInstalled]=useState(false)
  const supabase=createClient()

  useEffect(()=>{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').catch(()=>{})
    }
    const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & {standalone?:boolean}).standalone)
    setInstalled(standalone)
    const capture=(event:Event)=>{
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const installedHandler=()=>{
      setInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('beforeinstallprompt',capture)
    window.addEventListener('appinstalled',installedHandler)
    return ()=>{
      window.removeEventListener('beforeinstallprompt',capture)
      window.removeEventListener('appinstalled',installedHandler)
    }
  },[])

  async function installAndroid(){
    if(installPrompt){
      await installPrompt.prompt()
      const choice=await installPrompt.userChoice
      if(choice.outcome==='accepted')setInstalled(true)
      setInstallPrompt(null)
      return
    }
    setMessage('On Android, open this page in Chrome, tap the browser menu, then choose “Install app” or “Add to Home screen.”')
  }

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setMessage('')
    if(mode==='signup'){
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
      const {error}=await supabase.auth.signUp({
        email,
        password,
        options:{
          data:{company_name:company},
          emailRedirectTo:redirectTo
        }
      })
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

  return <main className={styles.page}><section className={styles.card}><div className={styles.brand}><span className={styles.brandIcon}><HardHat/></span><div className={styles.brandText}><b>BuildFlow</b><small>HQ</small></div></div><h1>{mode==='login'?'Sign in to your company':'Create your company workspace'}</h1><p className={styles.lead}>Each company gets its own isolated BuildFlow HQ workspace.</p><form className={styles.form} onSubmit={submit}>{mode==='signup'&&<label>Company name<input required value={company} onChange={e=>setCompany(e.target.value)} placeholder="Stevens Construction"/></label>}<label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></label><label>Password<input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="6+ characters"/></label><button disabled={busy} className={styles.submit} type="submit">{mode==='login'?<><LogIn size={18}/> {busy?'Signing in...':'Sign In'}</>:<><UserPlus size={18}/> {busy?'Creating...':'Create Company'}</>}</button></form>{message&&<div className={styles.message}>{message}</div>}<button className={styles.switch} onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'New to BuildFlow? Create a company':'Already have an account? Sign in'}</button>{!installed&&<div className={styles.installArea}><div className={styles.installTitle}><Smartphone size={17}/><b>Install BuildFlow HQ</b></div><p>Put BuildFlow HQ on your home screen and open it like a regular app.</p><div className={styles.installButtons}><button type="button" className={styles.installButton} onClick={installAndroid}><Download size={16}/>Install on Android</button><button type="button" className={styles.installButton} onClick={()=>setShowIosInstall(true)}><Download size={16}/>Install on iPhone/iPad</button></div></div>}{installed&&<div className={styles.installed}>BuildFlow HQ is installed on this device.</div>}</section>{showIosInstall&&<div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Install BuildFlow HQ on iPhone or iPad"><div className={styles.modal}><button className={styles.close} onClick={()=>setShowIosInstall(false)} aria-label="Close"><X size={18}/></button><h2>Install on iPhone or iPad</h2><ol><li>Open BuildFlow HQ in <b>Safari</b>.</li><li>Tap the <b>Share</b> button.</li><li>Scroll and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol><p>BuildFlow HQ will appear on your Home Screen and launch in its own app window.</p><button className={styles.submit} onClick={()=>setShowIosInstall(false)}>Got it</button></div></div>}</main>
}
