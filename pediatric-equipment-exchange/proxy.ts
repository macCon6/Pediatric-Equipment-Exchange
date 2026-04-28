// updated to not run middleware on any public pages, so we don't run
// getClaims unnecessarily
// public pages: /, /login-page, /equipment-gallery, /item/[id]

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     * UPDATED TO EXCLUDE: / (using $), login-page, equipment-gallery,
     * and /items/[id] (but NOT /items/[id]/waiver). Using items/[^/]+$
     */
    '/((?!$|api|login-page|equipment-gallery|items/[^/]+$|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}