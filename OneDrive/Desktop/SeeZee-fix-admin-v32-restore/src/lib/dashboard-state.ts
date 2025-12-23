/**
 * Utility functions to detect dashboard state for clients
 */

export interface DashboardState {
  hasActiveProjectRequest: boolean;
  hasOnlyLeadProjects: boolean;
  hasActiveProjects: boolean;
  activeProjectRequest: any | null;
  leadProjects: any[];
  activeProjects: any[];
}

/**
 * Check if user has active project request
 * Active statuses: DRAFT, SUBMITTED, REVIEWING, NEEDS_INFO
 * Excludes APPROVED and REJECTED statuses (these are considered final)
 */
export function hasActiveProjectRequest(projectRequests: any[]): boolean {
  if (!projectRequests || projectRequests.length === 0) return false;
  
  const activeStatuses = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'];
  const finalStatuses = ['APPROVED', 'REJECTED'];
  
  return projectRequests.some((req) => {
    const status = String(req.status || '').toUpperCase();
    // Only count as active if status is in active list and not in final statuses
    // Don't rely on req.project as it may be incorrectly linked via email matching
    return activeStatuses.includes(status) && !finalStatuses.includes(status);
  });
}

/**
 * Get the active project request
 * Returns the first request with active status (DRAFT, SUBMITTED, REVIEWING, NEEDS_INFO)
 * Excludes APPROVED and REJECTED statuses
 */
export function getActiveProjectRequest(projectRequests: any[]): any | null {
  if (!projectRequests || projectRequests.length === 0) return null;
  
  const activeStatuses = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'];
  const finalStatuses = ['APPROVED', 'REJECTED'];
  
  return projectRequests.find((req) => {
    const status = String(req.status || '').toUpperCase();
    // Only return if status is in active list and not in final statuses
    // Don't rely on req.project as it may be incorrectly linked via email matching
    return activeStatuses.includes(status) && !finalStatuses.includes(status);
  }) || null;
}

/**
 * Check if user has only LEAD status projects (excluding maintenance plan projects)
 * Projects with maintenance plans are considered "active" via the HoursBank
 */
export function hasOnlyLeadProjects(projects: any[]): boolean {
  if (!projects || projects.length === 0) return false;
  
  // Filter out maintenance plan projects first
  const nonMaintenanceProjects = projects.filter(p => !p.hasMaintenancePlan);
  
  // If no non-maintenance projects, user only has maintenance plans which are active
  if (nonMaintenanceProjects.length === 0) return false;
  
  return nonMaintenanceProjects.every((project) => {
    const status = String(project.status || '').toUpperCase();
    return status === 'LEAD';
  });
}

/**
 * Get projects with LEAD status
 * Excludes projects that have a maintenance plan attached (those are shown via HoursBank instead)
 */
export function getLeadProjects(projects: any[]): any[] {
  if (!projects || projects.length === 0) return [];
  
  return projects.filter((project) => {
    const status = String(project.status || '').toUpperCase();
    // Only include LEAD projects that don't have a maintenance plan
    // Maintenance plan projects are shown via the HoursBank component instead
    return status === 'LEAD' && !project.hasMaintenancePlan;
  });
}

/**
 * Check if user has active projects (non-LEAD status OR has maintenance plan)
 * Projects with maintenance plans are considered active
 */
export function hasActiveProjects(projects: any[]): boolean {
  if (!projects || projects.length === 0) return false;
  
  return projects.some((project) => {
    const status = String(project.status || '').toUpperCase();
    // Consider a project active if it's not LEAD OR if it has a maintenance plan
    return status !== 'LEAD' || project.hasMaintenancePlan;
  });
}

/**
 * Get active projects (non-LEAD status OR has maintenance plan)
 * Projects with maintenance plans are considered active
 */
export function getActiveProjects(projects: any[]): any[] {
  if (!projects || projects.length === 0) return [];
  
  return projects.filter((project) => {
    const status = String(project.status || '').toUpperCase();
    // Consider a project active if it's not LEAD OR if it has a maintenance plan
    return status !== 'LEAD' || project.hasMaintenancePlan;
  });
}

/**
 * Determine if user should see pre-client dashboard
 * Pre-client: has active project request OR has only LEAD projects
 */
export function shouldShowPreClientDashboard(
  projectRequests: any[],
  projects: any[]
): boolean {
  const hasActive = hasActiveProjectRequest(projectRequests);
  const onlyLead = hasOnlyLeadProjects(projects);
  
  return hasActive || (onlyLead && projects.length > 0);
}

/**
 * Get comprehensive dashboard state
 */
export function getDashboardState(
  projectRequests: any[],
  projects: any[]
): DashboardState {
  return {
    hasActiveProjectRequest: hasActiveProjectRequest(projectRequests),
    hasOnlyLeadProjects: hasOnlyLeadProjects(projects),
    hasActiveProjects: hasActiveProjects(projects),
    activeProjectRequest: getActiveProjectRequest(projectRequests),
    leadProjects: getLeadProjects(projects),
    activeProjects: getActiveProjects(projects),
  };
}





