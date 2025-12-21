import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Emergency endpoint to clear bloated session cookies
 * Use this when session cookies exceed 4KB and cause chunking issues
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear all NextAuth session cookies (including chunked ones)
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
    
    // Delete all cookies
    cookieNames.forEach(name => {
      try {
        cookieStore.delete(name);
      } catch (err) {
        // Cookie might not exist, ignore
      }
    });
    
    console.log('✅ Cleared all NextAuth session cookies');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Session cookies cleared. Please sign in again.' 
    });
  } catch (error) {
    console.error('❌ Error clearing session cookies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
}

// Allow GET requests to clear cookies via browser navigation
export async function GET(request: NextRequest) {
  return POST(request);
}


