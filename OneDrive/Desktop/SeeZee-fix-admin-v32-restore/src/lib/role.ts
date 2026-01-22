/**
 * Role definitions and helpers for SeeZee Admin v3.0
 * Updated roles: ADMIN, BOARD, ALUMNI, COMMUNITY, CEO, CFO, FRONTEND, BACKEND, OUTREACH, CLIENT
 */

export const ROLE = {
  ADMIN: "ADMIN",
  BOARD: "BOARD",
  ALUMNI: "ALUMNI",
  COMMUNITY: "COMMUNITY",
  CEO: "CEO",
  CFO: "CFO",
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  OUTREACH: "OUTREACH",
  CLIENT: "CLIENT",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/**
 * Check if user has admin privileges
 * ADMIN role has full access to everything
 */
export function isAdmin(role?: string | null): boolean {
  return role === ROLE.ADMIN || role === ROLE.CEO || role === ROLE.CFO;
}

/**
 * Legacy function - maps to isAdmin
 * @deprecated Use isAdmin instead
 */
export function isAdminLike(role?: string | null): boolean {
  return isAdmin(role);
}

/**
 * Check if user is board member
 */
export function isBoardMember(role?: string | null): boolean {
  return role === ROLE.BOARD;
}

/**
 * Check if user is alumni
 */
export function isAlumni(role?: string | null): boolean {
  return role === ROLE.ALUMNI;
}

/**
 * Check if user is community member
 */
export function isCommunity(role?: string | null): boolean {
  return role === ROLE.COMMUNITY;
}

/**
 * Check if user can access board routes
 * ADMIN and BOARD can access board routes
 */
export function canAccessBoardRoutes(role?: string | null): boolean {
  return isAdmin(role) || isBoardMember(role);
}

/**
 * Check if user can access community routes
 * ADMIN, BOARD, ALUMNI, and COMMUNITY can access community routes
 */
export function canAccessCommunityRoutes(role?: string | null): boolean {
  return isAdmin(role) || isBoardMember(role) || isAlumni(role) || isCommunity(role);
}

/**
 * Check if user has any staff/admin role (not CLIENT, BOARD, ALUMNI, COMMUNITY)
 * Used for access control to admin areas
 * @deprecated This function is deprecated. Roles like STAFF are being removed. Use isAdmin instead.
 */
export function isStaffRole(role?: string | null): boolean {
  return isAdmin(role) || isDeveloper(role) || role === ROLE.OUTREACH;
}

/**
 * Check if user is CEO
 */
export function isCEO(role?: string | null): boolean {
  return role === ROLE.CEO;
}

/**
 * Check if user is CFO
 */
export function isCFO(role?: string | null): boolean {
  return role === ROLE.CFO;
}

/**
 * Check if user is a developer (FRONTEND or BACKEND)
 */
export function isDeveloper(role?: string | null): boolean {
  return role === ROLE.FRONTEND || role === ROLE.BACKEND || role === "DEV";
}

/**
 * Get role display name with formatting
 */
export function getRoleDisplay(role?: string | null): string {
  if (!role) return "Client";
  if (role === ROLE.ADMIN) return "Administrator";
  if (role === ROLE.BOARD) return "Board Member";
  if (role === ROLE.ALUMNI) return "Alumni";
  if (role === ROLE.COMMUNITY) return "Community Member";
  if (role === ROLE.CEO) return "Chief Executive";
  if (role === ROLE.CFO) return "Chief Financial Officer";
  if (role === ROLE.FRONTEND || role === "DEV") return "Frontend Developer";
  if (role === ROLE.BACKEND) return "Backend Developer";
  if (role === ROLE.OUTREACH) return "Outreach Specialist";
  if (role === ROLE.CLIENT) return "Client";
  if (role === "DESIGNER") return "Designer";
  return "Client";
}

/**
 * Get role accent color for UI
 */
export function getRoleAccent(role?: string | null): string {
  if (role === ROLE.ADMIN) return "ring-yellow-500/30 shadow-yellow-500/10";
  if (role === ROLE.BOARD) return "ring-purple-500/30 shadow-purple-500/10";
  if (role === ROLE.ALUMNI) return "ring-indigo-500/30 shadow-indigo-500/10";
  if (role === ROLE.COMMUNITY) return "ring-teal-500/30 shadow-teal-500/10";
  if (role === ROLE.CEO) return "ring-yellow-500/30 shadow-yellow-500/10";
  if (role === ROLE.CFO) return "ring-violet-500/30 shadow-violet-500/10";
  if (role === ROLE.FRONTEND || role === "DEV") return "ring-pink-500/30 shadow-pink-500/10";
  if (role === ROLE.BACKEND) return "ring-blue-500/30 shadow-blue-500/10";
  if (role === ROLE.OUTREACH) return "ring-green-500/30 shadow-green-500/10";
  if (role === ROLE.CLIENT) return "ring-cyan-500/30 shadow-cyan-500/10";
  if (role === "DESIGNER") return "ring-pink-500/30 shadow-pink-500/10";
  return "ring-gray-500/30 shadow-gray-500/10";
}

/**
 * Get role gradient for badges/pills
 */
export function getRoleGradient(role?: string | null): string {
  if (role === ROLE.ADMIN)
    return "from-yellow-500 via-amber-500 to-orange-500";
  if (role === ROLE.BOARD)
    return "from-purple-500 via-violet-500 to-indigo-500";
  if (role === ROLE.ALUMNI)
    return "from-indigo-500 via-blue-500 to-cyan-500";
  if (role === ROLE.COMMUNITY)
    return "from-teal-500 via-green-500 to-emerald-500";
  if (role === ROLE.CEO)
    return "from-yellow-500 via-amber-500 to-orange-500";
  if (role === ROLE.CFO)
    return "from-violet-500 via-purple-500 to-fuchsia-500";
  if (role === ROLE.FRONTEND || role === "DEV")
    return "from-pink-500 via-rose-500 to-red-500";
  if (role === ROLE.BACKEND)
    return "from-blue-500 via-indigo-500 to-purple-500";
  if (role === ROLE.OUTREACH)
    return "from-green-500 via-emerald-500 to-teal-500";
  if (role === ROLE.CLIENT)
    return "from-cyan-500 via-teal-500 to-emerald-500";
  if (role === "DESIGNER")
    return "from-pink-500 via-rose-500 to-red-500";
  return "from-gray-500 via-slate-500 to-zinc-500";
}

/**
 * Get the default dashboard URL for a user role
 * ADMIN, CEO, CFO -> /admin
 * BOARD -> /board
 * ALUMNI, COMMUNITY -> /community
 * Everyone else (CLIENT, etc.) -> /client
 */
export function getDashboardUrl(role?: string | null): string {
  if (isAdmin(role)) return '/admin';
  if (isBoardMember(role)) return '/board';
  if (isAlumni(role) || isCommunity(role)) return '/community';
  return '/client';
}
