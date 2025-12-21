/**
 * Role definitions and helpers for SeeZee Admin v3.0
 * Updated roles: CEO, CFO, FRONTEND, BACKEND, OUTREACH, CLIENT
 */

export const ROLE = {
  CEO: "CEO",
  CFO: "CFO",
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  OUTREACH: "OUTREACH",
  CLIENT: "CLIENT",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/**
 * Check if user has admin-like privileges (CEO or CFO)
 * Also accepts legacy roles ADMIN for backwards compatibility
 */
export function isAdminLike(role?: string | null): boolean {
  return role === ROLE.CEO || role === ROLE.CFO || role === "ADMIN";
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
 * Check if user is staff member (FRONTEND, BACKEND, OUTREACH)
 * Also accepts legacy roles STAFF, DEV, DESIGNER for backwards compatibility
 */
export function isStaff(role?: string | null): boolean {
  return (
    role === ROLE.FRONTEND || 
    role === ROLE.BACKEND || 
    role === ROLE.OUTREACH ||
    role === "STAFF" ||
    role === "DEV" ||
    role === "DESIGNER"
  );
}

/**
 * Check if user has any staff/admin role (CEO, CFO, FRONTEND, BACKEND, OUTREACH, etc.)
 * This is used for access control to admin areas
 */
export function isStaffRole(role?: string | null): boolean {
  return isAdminLike(role) || isStaff(role);
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
  if (role === ROLE.CEO) return "Chief Executive";
  if (role === ROLE.CFO) return "Chief Financial Officer";
  if (role === ROLE.FRONTEND || role === "DEV") return "Frontend Developer";
  if (role === ROLE.BACKEND) return "Backend Developer";
  if (role === ROLE.OUTREACH) return "Outreach Specialist";
  if (role === ROLE.CLIENT) return "Client";
  if (role === "ADMIN") return "Administrator";
  if (role === "STAFF") return "Staff";
  if (role === "DESIGNER") return "Designer";
  return "Client";
}

/**
 * Get role accent color for UI
 */
export function getRoleAccent(role?: string | null): string {
  if (role === ROLE.CEO) return "ring-yellow-500/30 shadow-yellow-500/10";
  if (role === ROLE.CFO) return "ring-violet-500/30 shadow-violet-500/10";
  if (role === ROLE.FRONTEND || role === "DEV") return "ring-pink-500/30 shadow-pink-500/10";
  if (role === ROLE.BACKEND) return "ring-blue-500/30 shadow-blue-500/10";
  if (role === ROLE.OUTREACH) return "ring-green-500/30 shadow-green-500/10";
  if (role === ROLE.CLIENT) return "ring-cyan-500/30 shadow-cyan-500/10";
  if (role === "ADMIN") return "ring-yellow-500/30 shadow-yellow-500/10";
  if (role === "DESIGNER") return "ring-pink-500/30 shadow-pink-500/10";
  return "ring-gray-500/30 shadow-gray-500/10";
}

/**
 * Get role gradient for badges/pills
 */
export function getRoleGradient(role?: string | null): string {
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
  if (role === "ADMIN")
    return "from-yellow-500 via-amber-500 to-orange-500";
  if (role === "DESIGNER")
    return "from-pink-500 via-rose-500 to-red-500";
  return "from-gray-500 via-slate-500 to-zinc-500";
}
