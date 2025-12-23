import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Check all environment variables that the app uses
  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    
    // Authentication
    authSecret: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      hasEither: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
      AUTH_SECRET_length: process.env.AUTH_SECRET?.length || 0,
      NEXTAUTH_SECRET_length: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    
    authUrl: {
      AUTH_URL: process.env.AUTH_URL || "NOT SET",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      hasEither: !!(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
    },
    
    googleOAuth: {
      AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      hasId: !!(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID),
      AUTH_GOOGLE_ID_value: process.env.AUTH_GOOGLE_ID?.substring(0, 20) + "..." || "NOT SET",
      GOOGLE_CLIENT_ID_value: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "..." || "NOT SET",
      
      AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      hasSecret: !!(process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET),
      AUTH_GOOGLE_SECRET_length: process.env.AUTH_GOOGLE_SECRET?.length || 0,
      GOOGLE_CLIENT_SECRET_length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    },
    
    database: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 30) + "..." || "NOT SET",
    },
    
    appConfig: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    },
    
    // Vercel-specific
    vercel: {
      VERCEL: process.env.VERCEL || "NOT SET",
      VERCEL_ENV: process.env.VERCEL_ENV || "NOT SET",
      VERCEL_URL: process.env.VERCEL_URL || "NOT SET",
    },
    
    // All env vars (filtered for security)
    allEnvKeys: Object.keys(process.env)
      .filter(key => 
        key.includes('AUTH') || 
        key.includes('NEXTAUTH') || 
        key.includes('GOOGLE') || 
        key.includes('DATABASE') ||
        key.includes('VERCEL')
      )
      .sort(),
  };
  
  return NextResponse.json(envCheck, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

