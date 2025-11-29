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
 * Returns false if project request has an associated project (already approved)
 */
export function hasActiveProjectRequest(projectRequests: any[]): boolean {
  if (!projectRequests || projectRequests.length === 0) return false;
  
  const activeStatuses = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'];
  return projectRequests.some((req) => {
    const status = String(req.status || '').toUpperCase();
    // Don't count as active if a project has been created from this request
    return activeStatuses.includes(status) && !req.project;
  });
}

/**
 * Get the active project request
 * Returns null if project request has an associated project (already approved)
 */
export function getActiveProjectRequest(projectRequests: any[]): any | null {
  if (!projectRequests || projectRequests.length === 0) return null;
  
  const activeStatuses = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'NEEDS_INFO'];
  return projectRequests.find((req) => {
    const status = String(req.status || '').toUpperCase();
    // Don't count as active if a project has been created from this request
    return activeStatuses.includes(status) && !req.project;
  }) || null;
}

/**
 * Check if user has only LEAD status projects
 */
export function hasOnlyLeadProjects(projects: any[]): boolean {
  if (!projects || projects.length === 0) return false;
  
  return projects.every((project) => {
    const status = String(project.status || '').toUpperCase();
    return status === 'LEAD';
  });
}

/**
 * Get projects with LEAD status
 */
export function getLeadProjects(projects: any[]): any[] {
  if (!projects || projects.length === 0) return [];
  
  return projects.filter((project) => {
    const status = String(project.status || '').toUpperCase();
    return status === 'LEAD';
  });
}

/**
 * Check if user has active projects (non-LEAD status)
 */
export function hasActiveProjects(projects: any[]): boolean {
  if (!projects || projects.length === 0) return false;
  
  return projects.some((project) => {
    const status = String(project.status || '').toUpperCase();
    return status !== 'LEAD';
  });
}

/**
 * Get active projects (non-LEAD status)
 */
export function getActiveProjects(projects: any[]): any[] {
  if (!projects || projects.length === 0) return [];
  
  return projects.filter((project) => {
    const status = String(project.status || '').toUpperCase();
    return status !== 'LEAD';
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





