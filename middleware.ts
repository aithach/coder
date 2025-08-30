import { Session } from 'better-auth'
import { betterFetch } from '@better-fetch/fetch'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  })

  if (!session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (!process.env.AUTH_USERS?.includes((session as any).user.email)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs',

  matcher: ['/'],
}
