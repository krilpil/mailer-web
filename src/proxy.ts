import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { routes, publicRoutes } from '@/shared/config';

export const proxy = auth((request) => {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/sign-up')) {
      return NextResponse.next();
    }

    if (!request.auth?.user) {
      return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) return NextResponse.next();

  if (!request.auth?.user) {
    url.pathname = routes.AUTH_PAGE;
    // url.searchParams.set('callbackUrl', request.nextUrl.href);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
