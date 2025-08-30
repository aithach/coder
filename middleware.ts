import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function verifyCookie(value: string, secret: string): Promise<boolean> {
  const [cookieValue, signature] = value.split('.')
  if (!signature) return false

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])

  const data = encoder.encode(cookieValue)
  const expectedSignature = await crypto.subtle.sign('HMAC', key, data)
  const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return signature === expectedSignatureHex
}

async function signCookie(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])

  const data = encoder.encode(value)
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `${value}.${signatureHex}`
}

export async function middleware(request: NextRequest) {
  const cookieStore = cookies()
  const loggedInCookie = (await cookieStore).get('loggedIn')

  if (loggedInCookie?.value) {
    try {
      const isValid = await verifyCookie(loggedInCookie.value, process.env.BETTER_AUTH_SECRET!)
      if (isValid) {
        return NextResponse.next()
      }
    } catch {}
  }

  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  const [scheme, encoded] = authHeader.split(' ')

  if (scheme !== 'Basic' || !encoded) {
    return new NextResponse('Malformed authentication header', { status: 400 })
  }

  const decoded = Buffer.from(encoded, 'base64').toString()
  const [_ignoredUsername, password] = decoded.split(':')

  const validPassword = process.env.BASIC_AUTH_PASSWORD

  if (!validPassword) {
    console.error('Basic authentication password environment variable is not set.')
    return new NextResponse('Server configuration error', { status: 500 })
  }

  if (password === validPassword) {
    const response = NextResponse.next()
    const signedValue = await signCookie('true', process.env.BETTER_AUTH_SECRET!)

    response.cookies.set('loggedIn', signedValue, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
    })

    return response
  } else {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }
}

export const config = {
  runtime: 'experimental-edge',
  matcher: ['/'],
}
