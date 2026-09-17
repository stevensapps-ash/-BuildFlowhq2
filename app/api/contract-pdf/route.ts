import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type Payload={project?:string;customer?:string;contractor?:string;contractorDetails?:string;content?:string;terms?:string;contractorSignature?:string;customerSignature?:string;contractDate?:string}

function ascii(value=''){return value.normalize('NFKD').replace(/[^\x20-\x7E\n]/g,'').replace(/\r/g,'')}
function pdfEscape(value:string){return ascii(value).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')}
function wrap(text:string,width=88){const out:string[]=[];for(const raw of ascii(text).split('\n')){if(!raw.trim()){out.push('');continue}const words=raw.trim().split(/\s+/);let line='';for(const word of words){if((line+' '+word).trim().length>width){out.push(line);line=word}else line=(line+' '+word).trim()}if(line)out.push(line)}return out}
function safeName(value='contract'){return ascii(value).replace(/[^a-z0-9-_]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase()||'contract'}

function makePdf(p:Payload){
 const lines=[
  {t:p.project||'Construction Agreement',s:18},
  {t:'EXECUTED CONTRACT',s:10},
  {t:'',s:10},
  {t:`Contractor: ${p.contractor||'Contractor'}`,s:11},
  {t:p.contractorDetails||'',s:9},
  {t:`Customer: ${p.customer||'Customer named in agreement'}`,s:11},
  {t:'',s:10},
  ...wrap(p.content||'').map(t=>({t,s:10})),
  {t:'',s:10},
  ...(p.terms?[{t:'Terms',s:12},...wrap(p.terms).map(t=>({t,s:10}))]:[]),
  {t:'',s:10},{t:'SIGNATURES',s:12},
  {t:`Contractor: ${p.contractorSignature||''}`,s:11},
  {t:`Customer: ${p.customerSignature||''}`,s:11},
  {t:`Executed: ${p.contractDate?new Date(p.contractDate).toLocaleString('en-US'):''}`,s:10}
 ]
 const pages:Array<Array<{t:string;s:number}>>=[];let page:Array<{t:string;s:number}>=[];let y=748
 for(const line of lines){const step=Math.max(14,line.s+5);if(y-step<55){pages.push(page);page=[];y=748}page.push(line);y-=step}if(page.length)pages.push(page)
 const objects:string[]=[];const add=(v:string)=>{objects.push(v);return objects.length}
 const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
 const pageIds:number[]=[];const contentIds:number[]=[]
 for(const pg of pages){let yy=748;let stream='BT\n';for(const line of pg){stream+=`/F1 ${line.s} Tf 1 0 0 1 54 ${yy} Tm (${pdfEscape(line.t)}) Tj\n`;yy-=Math.max(14,line.s+5)}stream+='ET';contentIds.push(add(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`));pageIds.push(add('PENDING'))}
 const pagesId=objects.length+1;add('PAGES_PENDING');const catalogId=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`)
 pageIds.forEach((id,i)=>objects[id-1]=`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`)
 objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
 let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`});const xref=Buffer.byteLength(pdf);pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<=objects.length;i++)pdf+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`
 return Buffer.from(pdf,'binary')
}

export async function POST(req:NextRequest){
 try{const p=(await req.json()) as Payload;if(!p.contractorSignature||!p.customerSignature)return NextResponse.json({error:'Signed contract required'},{status:400});const pdf=makePdf(p);const filename=`${safeName(p.customer)}-${safeName(p.project)}-signed-contract.pdf`;return new NextResponse(pdf,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${filename}"`,'Content-Length':String(pdf.length),'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'Could not create PDF'},{status:500})}
}
