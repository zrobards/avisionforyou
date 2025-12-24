import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

// Helper functions to check user roles
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.CFO || role === UserRole.CEO;
}

export function isStaffOrAdmin(role: UserRole): boolean {
  return role === UserRole.CFO || role === UserRole.CEO || role === UserRole.FRONTEND || role === UserRole.BACKEND || role === UserRole.OUTREACH;
}

/**
 * Server-side authentication guard
 * Returns the session if authenticated, redirects to login if not
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Server-side role guard
 * Checks if the current user has one of the required roles
 */
export async function requireRole(requiredRoles: UserRole[]) {
  const session = await requireAuth();
  
  if (!session.user?.role || !requiredRoles.includes(session.user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const userRole = session.user?.role;
    if (userRole === UserRole.CEO || userRole === UserRole.CFO || 
        userRole === UserRole.FRONTEND || userRole === UserRole.BACKEND || userRole === UserRole.OUTREACH) {
      redirect("/admin");
    } else {
      redirect("/client");
    }
  }
  
  return session;
}

/**
 * Server-side admin guard
 * Ensures the current user is an admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  
  // CEO email always has access - bypass role check
  const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "sean.mcculloch23@gmail.com"];
  if (session.user?.email && CEO_EMAILS.includes(session.user.email.toLowerCase())) {
    return session;
  }
  
  if (!session.user?.role || !isAdmin(session.user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const userRole = session.user?.role;
    if (userRole === UserRole.CEO || userRole === UserRole.CFO || 
        userRole === UserRole.FRONTEND || userRole === UserRole.BACKEND || userRole === UserRole.OUTREACH) {
      redirect("/admin");
    } else {
      redirect("/client");
    }
  }
  
  return session;
}

/**
 * Server-side staff or admin guard
 * Ensures the current user is staff or admin
 */
export async function requireStaffOrAdmin() {
  const session = await requireAuth();
  
  if (!session.user?.role || !isStaffOrAdmin(session.user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const userRole = session.user?.role;
    if (userRole === UserRole.CEO || userRole === UserRole.CFO || 
        userRole === UserRole.FRONTEND || userRole === UserRole.BACKEND || userRole === UserRole.OUTREACH) {
      redirect("/admin");
    } else {
      redirect("/client");
    }
  }
  
  return session;
}

/**
 * API route authentication helper
 * Returns 401 if not authenticated
 */
export async function requireAuthAPI() {
  const session = await auth();
  
  if (!session) {
    return {
      error: "Authentication required",
      status: 401,
      session: null
    };
  }
  
  return {
    error: null,
    status: 200,
    session
  };
}

/**
 * API route role guard helper
 * Returns 403 if user doesn't have required role
 */
export async function requireRoleAPI(requiredRoles: UserRole[]) {
  const authResult = await requireAuthAPI();
  
  if (authResult.error) {
    return authResult;
  }
  
  const { session } = authResult;
  
  if (!session?.user?.role || !requiredRoles.includes(session.user.role)) {
    return {
      error: "Insufficient permissions",
      status: 403,
      session: null
    };
  }
  
  return {
    error: null,
    status: 200,
    session
  };
}

/**
 * API route admin guard helper
 */
export async function requireAdminAPI() {
  const authResult = await requireAuthAPI();
  
  if (authResult.error) {
    return authResult;
  }
  
  const { session } = authResult;
  
  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return {
      error: "Admin access required",
      status: 403,
      session: null
    };
  }
  
  return {
    error: null,
    status: 200,
    session
  };
}

/**
 * API route staff or admin guard helper
 */
export async function requireStaffOrAdminAPI() {
  const authResult = await requireAuthAPI();
  
  if (authResult.error) {
    return authResult;
  }
  
  const { session } = authResult;
  
  if (!session?.user?.role || !isStaffOrAdmin(session.user.role)) {
    return {
      error: "Staff or admin access required",
      status: 403,
      session: null
    };
  }
  
  return {
    error: null,
    status: 200,
    session
  };
}

/**
 * Server action authentication guard
 * Throws error if not authenticated
 */
export async function requireAuthAction() {
  const session = await auth();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  return session;
}

/**
 * Server action role guard
 * Throws error if user doesn't have required role
 */
export async function requireRoleAction(requiredRoles: UserRole[]) {
  const session = await requireAuthAction();
  
  if (!session.user?.role || !requiredRoles.includes(session.user.role)) {
    throw new Error("Insufficient permissions");
  }
  
  return session;
}

/**
 * Get current session without redirecting
 * Returns null if not authenticated
 */
export async function getCurrentSession() {
  return await auth();
}

/**
 * Check if current user has role without throwing
 * Returns boolean
 */
export async function hasCurrentUserRole(requiredRoles: UserRole[]) {
  const session = await getCurrentSession();
  
  if (!session?.user?.role) {
    return false;
  }
  
  return requiredRoles.includes(session.user.role);
}

/**
 * Check if current user is admin without throwing
 */
export async function isCurrentUserAdmin() {
  const session = await getCurrentSession();
  
  if (!session?.user?.role) {
    return false;
  }
  
  return isAdmin(session.user.role);
}