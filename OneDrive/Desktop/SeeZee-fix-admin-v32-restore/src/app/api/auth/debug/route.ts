// Force Node.js runtime
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const GOOGLE_ID = (process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID)?.trim();
  const GOOGLE_SECRET = (process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET)?.trim();
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000'
    : (process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000');

  // Check for common issues
  const issues: string[] = [];
  if (GOOGLE_SECRET) {
    // GOCSPX- format secrets are 35 characters, which is valid
    if (!GOOGLE_SECRET.startsWith('GOCSPX-')) {
      issues.push(`⚠️ CRITICAL: Client Secret doesn't start with 'GOCSPX-'. This is likely WRONG!`);
    } else if (GOOGLE_SECRET.length < 35) {
      issues.push(`⚠️ CRITICAL: Client Secret length is ${GOOGLE_SECRET.length} characters (expected 35+ for GOCSPX- format). This is likely WRONG!`);
    }
  }

  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasAuthSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
      authUrl: process.env.AUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      baseUrl: baseUrl,
    },
    googleOAuth: {
      hasGoogleId: !!GOOGLE_ID,
      hasGoogleSecret: !!GOOGLE_SECRET,
      googleId: GOOGLE_ID ? `${GOOGLE_ID.substring(0, 30)}...` : 'MISSING',
      googleIdFull: GOOGLE_ID || 'MISSING',
      googleSecretPrefix: GOOGLE_SECRET ? `${GOOGLE_SECRET.substring(0, 10)}...` : 'MISSING',
      googleSecretLength: GOOGLE_SECRET ? GOOGLE_SECRET.length : 0,
      expectedRedirectUri: `${baseUrl}/api/auth/callback/google`,
      expectedJavaScriptOrigin: baseUrl,
    },
    instructions: {
      step1: "Go to: https://console.cloud.google.com/apis/credentials",
      step2: `Find OAuth client with ID: ${GOOGLE_ID || 'MISSING'}`,
      step3: `Verify redirect URI is EXACTLY: ${baseUrl}/api/auth/callback/google`,
      step4: `Verify JavaScript origin is EXACTLY: ${baseUrl}`,
      step5: "Copy the Client Secret (starts with GOCSPX-)",
      step6: "Update AUTH_GOOGLE_SECRET in your .env.local file",
      step7: "Restart your dev server",
    },
    commonIssues: {
      wrongSecret: "The Client Secret in .env doesn't match Google Console",
      wrongRedirectUri: "The redirect URI in Google Console doesn't match exactly",
      wrongClientId: "The Client ID doesn't match",
      wrongClientType: "OAuth client type should be 'Web application'",
    },
    detectedIssues: issues.length > 0 ? issues : ["✅ No obvious issues detected"],
    fixInstructions: issues.length > 0 ? {
      step1: "Go to: https://console.cloud.google.com/apis/credentials",
      step2: `Find OAuth client: ${GOOGLE_ID || 'MISSING'}`,
      step3: "Click 'Edit' (pencil icon)",
      step4: "Click 'SHOW' next to Client Secret",
      step5: "Copy the ENTIRE secret (should be 40-50 characters, starts with GOCSPX-)",
      step6: "Open your .env.local file",
      step7: "Update AUTH_GOOGLE_SECRET with the EXACT secret (no quotes, no spaces, no line breaks)",
      step8: "Example: AUTH_GOOGLE_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456",
      step9: "Save the file",
      step10: "RESTART your dev server completely (stop and start again)",
    } : null,
  });
}

