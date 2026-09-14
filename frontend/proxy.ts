import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/Users') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/users';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};