import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isApiRoute = path.startsWith('/api/')
  const isAuthRoute = path.startsWith('/login')
  const isResetRoute = path.startsWith('/reset-password')
  const isLandingRoute = path.startsWith('/welcome')
  const isPublicRoute = isAuthRoute || isResetRoute || isLandingRoute || path.startsWith('/api/health') || path === '/manifest.webmanifest' || path === '/sw.js' || path === '/buildflow-icon.svg'

  if (!user && !isPublicRoute) {
    // Never redirect API POST requests to an HTML page. A redirected POST can become
    // a misleading 405 response and makes API failures difficult to diagnose.
    if (isApiRoute) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
