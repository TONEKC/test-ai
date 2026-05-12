import { NextResponse, type NextRequest } from 'next/server'

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Event Registration Admin"',
    },
  })
}

function verifyBasicAuth(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  const header = request.headers.get('authorization')

  if (!username || !password || !header?.startsWith('Basic ')) {
    return false
  }

  const decoded = atob(header.replace('Basic ', ''))
  const separatorIndex = decoded.indexOf(':')

  if (separatorIndex === -1) {
    return false
  }

  return (
    decoded.slice(0, separatorIndex) === username &&
    decoded.slice(separatorIndex + 1) === password
  )
}

export function middleware(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
