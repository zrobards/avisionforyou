import { NextRequest, NextResponse } from 'next/server';

/**
 * Emergency endpoint to clear bloated session cookies
 * Use this when session cookies exceed 4KB and cause chunking issues
 * 
 * This endpoint clears cookies by setting them to expire in the response headers.
 * This works even when request headers are too large (431 error) because we don't
 * need to read the request cookies - we just set expiration headers in the response.
 */
function clearCookieHeader(name: string, path: string = '/'): string {
  // Set cookie to expire immediately (past date)
  const expires = new Date(0).toUTCString();
  return `${name}=; Path=${path}; Expires=${expires}; HttpOnly; SameSite=Lax`;
}

function clearSecureCookieHeader(name: string, path: string = '/'): string {
  const expires = new Date(0).toUTCString();
  return `${name}=; Path=${path}; Expires=${expires}; HttpOnly; SameSite=Lax; Secure`;
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cookies cleared. Please sign in again.' 
    });
    
    // Clear all NextAuth session cookies (including chunked ones)
    // We set them in response headers to expire immediately
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
    ];
    
    // Also clear any chunked session cookies (next-auth.session-token.0, .1, .2, etc.)
    for (let i = 0; i < 10; i++) {
      cookieNames.push(`next-auth.session-token.${i}`);
      cookieNames.push(`__Secure-next-auth.session-token.${i}`);
    }
    
    // Set all cookies to expire in response headers
    cookieNames.forEach(name => {
      if (name.startsWith('__Secure-')) {
        response.headers.append('Set-Cookie', clearSecureCookieHeader(name));
      } else {
        response.headers.append('Set-Cookie', clearCookieHeader(name));
      }
    });
    
    console.log('✅ Cleared all NextAuth session cookies via response headers');
    
    return response;
  } catch (error) {
    console.error('❌ Error clearing session cookies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
}

// Allow GET requests to clear cookies via browser navigation
// Redirects to login after clearing
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Clear all NextAuth session cookies
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
    ];
    
    // Also clear any chunked session cookies
    for (let i = 0; i < 10; i++) {
      cookieNames.push(`next-auth.session-token.${i}`);
      cookieNames.push(`__Secure-next-auth.session-token.${i}`);
    }
    
    // Set all cookies to expire in response headers
    cookieNames.forEach(name => {
      if (name.startsWith('__Secure-')) {
        response.headers.append('Set-Cookie', clearSecureCookieHeader(name));
      } else {
        response.headers.append('Set-Cookie', clearCookieHeader(name));
      }
    });
    
    console.log('✅ Cleared all NextAuth session cookies and redirecting to login');
    
    return response;
  } catch (error) {
    console.error('❌ Error clearing session cookies:', error);
    // Even on error, try to redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}






