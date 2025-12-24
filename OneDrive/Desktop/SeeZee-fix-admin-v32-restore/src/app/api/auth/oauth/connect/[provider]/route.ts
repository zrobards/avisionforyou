import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    
    // Validate provider
    const validProviders = ["google", "linkedin", "discord"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Redirect to OAuth provider for linking
    // The callbackUrl will be the settings page
    const callbackUrl = `${request.nextUrl.origin}/settings?tab=account`;
    
    // Initiate OAuth flow
    return NextResponse.redirect(
      `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  } catch (error) {
    console.error("OAuth connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth connection" },
      { status: 500 }
    );
  }
}












