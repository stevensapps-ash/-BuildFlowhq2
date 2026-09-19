import {NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

const bucket='customer-files'
const safe=(v:string)=>String(v||'Unassigned').trim().replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(0,80)||'Unassigned'
async function ctx(){
 const supabase=createClient(); const{data:{user}}=await supabase.auth.getUser()
 if(!user)return null
 const{data:member}=await supabase.from('company_members').select('company_id,role').eq('user_id',user.id).limit(1).maybeSingle()
 if(!member)return null
 return{supabase,user,member}
}
export async function GET(){
 const c=await ctx();if(!c)return NextResponse.json({error:'UNAUTHORIZED'},{status:401})
 const{data,error}=await c.supabase.from('customer_files').select('id,customer,project,category,filename,storage_path,mime_type,size_bytes,created_at').eq('company_id',c.member.company_id).order('created_at',{ascending:false})
 if(error)return NextResponse.json({error:'FILES_READ_FAILED'},{status:500})
 return NextResponse.json({files:data||[]})
}
export async function POST(req:Request){
 const c=await ctx();if(!c)return NextResponse.json({error:'UNAUTHORIZED'},{status:401})
 if(!['owner','manager'].includes(c.member.role))return NextResponse.json({error:'FORBIDDEN'},{status:403})
 const form=await req.formData();const file=form.get('file')
 if(!(file instanceof File))return NextResponse.json({error:'FILE_REQUIRED'},{status:400})
 const allowed=['image/jpeg','image/png','image/webp','application/pdf'];if(!allowed.includes(file.type))return NextResponse.json({error:'FILE_TYPE_NOT_ALLOWED'},{status:400})
 if(file.size>10*1024*1024)return NextResponse.json({error:'FILE_TOO_LARGE'},{status:400})
 const customer=String(form.get('customer')||''),project=String(form.get('project')||''),category=String(form.get('category')||'Other')
 const filename=safe(file.name),path=`${c.member.company_id}/${safe(customer)}/${safe(project)}/${safe(category)}/${crypto.randomUUID()}-${filename}`
 const{error:up}=await c.supabase.storage.from(bucket).upload(path,file,{contentType:file.type,upsert:false});if(up)return NextResponse.json({error:'UPLOAD_FAILED'},{status:500})
 const{data:row,error:meta}=await c.supabase.from('customer_files').insert({company_id:c.member.company_id,customer,project,category,filename,storage_path:path,mime_type:file.type,size_bytes:file.size,created_by:c.user.id}).select().single()
 if(meta){await c.supabase.storage.from(bucket).remove([path]);return NextResponse.json({error:'FILE_METADATA_FAILED'},{status:500})}
 return NextResponse.json({file:row},{status:201})
}
