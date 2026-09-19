import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAILS = new Set(['stevensapps@icloud.com', 'stevensapps31@gmail.com'])

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
  const isSubscribeRoute = path.startsWith('/subscribe')
  const isSubscriptionApi = path.startsWith('/api/subscription/')
  const isPublicRoute = isAuthRoute || isResetRoute || isLandingRoute || path.startsWith('/api/health') || path === '/manifest.webmanifest' || path === '/sw.js' || path === '/buildflow-icon.svg'

  if (!user && !isPublicRoute) {
    if (isApiRoute) return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 })
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const isAdmin = ADMIN_EMAILS.has(user.email?.toLowerCase() || '')
    let hasAccess = isAdmin

    if (!hasAccess) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()
      hasAccess = subscription?.status === 'active'
    }

    if (!hasAccess && !isSubscribeRoute && !isSubscriptionApi && !isAuthRoute && !isResetRoute && !isLandingRoute) {
      if (isApiRoute) return NextResponse.json({ error: 'SUBSCRIPTION_REQUIRED' }, { status: 402 })
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      return NextResponse.redirect(url)
    }

    if (hasAccess && isSubscribeRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = hasAccess ? '/' : '/subscribe'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
