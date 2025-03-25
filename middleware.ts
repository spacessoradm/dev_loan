import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Get user profile with role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // If no profile exists, create one
  if (error && error.code === 'PGRST116') {
    // Create a default profile
    await supabase.from('profiles').insert({
      id: session.user.id,
      email: session.user.email,
      role: 'user'
    })
    
    // Continue as a regular user
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  const path = req.nextUrl.pathname

  // Role-based routing
  if (path.startsWith('/dashboard')) {
    if (path.startsWith('/dashboard/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (path.startsWith('/dashboard/banker') && profile?.role !== 'banker') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (path === '/dashboard' && profile?.role && profile.role !== 'user') {
      return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

