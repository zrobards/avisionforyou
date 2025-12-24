"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Client-side component that checks if user needs to set a password
 * and redirects them to the set-password page if needed.
 * 
 * This runs on the client side to catch users who bypass middleware
 * (e.g., landing on homepage after OAuth)
 */
export function PasswordSetupPrompt() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if:
    // - Not authenticated yet
    // - Already on set-password page
    // - On login/register pages
    if (
      status === "loading" ||
      !session?.user ||
      pathname === "/set-password" ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname?.startsWith("/api/")
    ) {
      return;
    }

    // Check if user needs to set a password
    const needsPassword = (session.user as any).needsPassword;
    
    if (needsPassword === true) {
      console.log("🔒 User needs to set password, redirecting...");
      router.push("/set-password");
    }
  }, [session, status, pathname, router]);

  return null; // This component doesn't render anything
}








