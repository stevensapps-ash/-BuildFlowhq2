import {NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

const bucket='customer-files'

async function ctx(){
 const supabase=createClient()
 const{data:{user}}=await supabase.auth.getUser()
 if(!user)return null
 const{data:member}=await supabase.from('company_members').select('company_id,role').eq('user_id',user.id).limit(1).maybeSingle()
 if(!member)return null
 return{supabase,member}
}

export async function GET(_:Request,{params}:{params:{id:string}}){
 const c=await ctx();if(!c)return NextResponse.json({error:'UNAUTHORIZED'},{status:401})
 const{data:file,error}=await c.supabase.from('customer_files').select('id,storage_path,filename,mime_type').eq('id',params.id).eq('company_id',c.member.company_id).maybeSingle()
 if(error)return NextResponse.json({error:'FILE_READ_FAILED'},{status:500})
 if(!file)return NextResponse.json({error:'NOT_FOUND'},{status:404})
 const{data,error:sign}=await c.supabase.storage.from(bucket).createSignedUrl(file.storage_path,60)
 if(sign||!data?.signedUrl)return NextResponse.json({error:'SIGNED_URL_FAILED'},{status:500})
 return NextResponse.json({url:data.signedUrl,filename:file.filename,mimeType:file.mime_type})
}

export async function DELETE(_:Request,{params}:{params:{id:string}}){
 const c=await ctx();if(!c)return NextResponse.json({error:'UNAUTHORIZED'},{status:401})
 if(!['owner','manager'].includes(c.member.role))return NextResponse.json({error:'FORBIDDEN'},{status:403})
 const{data:file,error}=await c.supabase.from('customer_files').select('id,storage_path').eq('id',params.id).eq('company_id',c.member.company_id).maybeSingle()
 if(error)return NextResponse.json({error:'FILE_READ_FAILED'},{status:500})
 if(!file)return NextResponse.json({error:'NOT_FOUND'},{status:404})
 const{error:remove}=await c.supabase.storage.from(bucket).remove([file.storage_path])
 if(remove)return NextResponse.json({error:'FILE_DELETE_FAILED'},{status:500})
 const{error:meta}=await c.supabase.from('customer_files').delete().eq('id',file.id).eq('company_id',c.member.company_id)
 if(meta)return NextResponse.json({error:'FILE_METADATA_DELETE_FAILED'},{status:500})
 return NextResponse.json({ok:true})
}
