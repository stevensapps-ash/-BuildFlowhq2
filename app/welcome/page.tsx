import Link from 'next/link'
import { CalendarDays, CheckCircle2, FileSignature, HardHat, Receipt, Sparkles, Users, WalletCards } from 'lucide-react'
import styles from './welcome.module.css'

const features = [
  ['AI Estimates', Sparkles, 'Build scopes, materials, labor and pricing drafts faster.'],
  ['Projects', HardHat, 'Keep customers, jobs and project details organized in one place.'],
  ['Invoices', Receipt, 'Track open invoices, balances and payment status.'],
  ['Schedule', CalendarDays, 'See upcoming work and keep crews aligned.'],
  ['Crew', Users, 'Manage employees, roles, rates and payroll records.'],
  ['Documents', FileSignature, 'Keep contracts, change orders and company documents together.'],
  ['Receipts', WalletCards, 'Track expenses by project and color tag.'],
  ['AI Documents', Sparkles, 'Create contractor-focused drafts with owner review before use.']
] as const

export default function WelcomePage(){
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/welcome" className={styles.brand}><span className={styles.logo}><HardHat/></span><span><b>BuildFlow</b> HQ</span></Link>
      <nav><a href="#features">Features</a><a href="#how">How it works</a><Link className={styles.signIn} href="/login">Sign In</Link></nav>
    </header>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>BUILT FOR CONTRACTORS & SMALL BUSINESS OWNERS</span>
        <h1>Run the whole business from <em>one place.</em></h1>
        <p>BuildFlow HQ brings estimates, projects, invoices, receipts, schedules, crews, documents and AI-powered business tools into one simple workspace.</p>
        <div className={styles.actions}><Link className={styles.primary} href="/login">Start Free</Link><a className={styles.secondary} href="#features">See Features</a></div>
        <div className={styles.trust}><span><CheckCircle2/>Multi-tenant workspaces</span><span><CheckCircle2/>Cloud saved</span><span><CheckCircle2/>Works on phone & desktop</span></div>
      </div>
      <div className={styles.mockup}>
        <div className={styles.mockTop}><span></span><span></span><span></span></div>
        <div className={styles.mockBody}>
          <aside><b>BF</b><span>Dashboard</span><span>Projects</span><span>AI Estimates</span><span>Invoices</span><span>Schedule</span></aside>
          <section><small>BUILD FLOW HQ</small><h3>Good morning.</h3><div className={styles.cards}><div><b>4</b><span>Today's Jobs</span></div><div><b>$12,480</b><span>Unpaid Invoices</span></div><div><b>7</b><span>Active Projects</span></div></div><div className={styles.aiBox}><Sparkles/><div><b>AI Estimate</b><span>Create scope, materials, labor & price</span></div></div></section>
        </div>
      </div>
    </section>

    <section id="features" className={styles.features}><div className={styles.sectionHead}><span>EVERYTHING IN ONE HQ</span><h2>Built to replace the contractor paperwork pile.</h2></div><div className={styles.grid}>{features.map(([title,Icon,text])=><article key={title}><Icon/><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section id="how" className={styles.how}><div><span>HOW IT WORKS</span><h2>Simple enough to use on a jobsite.</h2><p>Create your company workspace, add customers and projects, then let BuildFlow HQ keep the business organized as you work.</p></div><div className={styles.steps}><div><b>1</b><span>Create your company</span></div><div><b>2</b><span>Add customers & jobs</span></div><div><b>3</b><span>Run estimates, invoices & schedules</span></div></div></section>

    <section className={styles.cta}><HardHat/><h2>Ready to run your business from one place?</h2><p>Create your BuildFlow HQ workspace and start organizing your company today.</p><Link className={styles.primary} href="/login">Start BuildFlow HQ</Link></section>

    <footer><span>© 2026 BuildFlow HQ</span><span>Plan · Build · Manage · Grow</span></footer>
  </main>
}
