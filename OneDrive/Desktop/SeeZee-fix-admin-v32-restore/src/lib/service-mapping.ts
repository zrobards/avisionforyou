import { ServiceCategory, ServiceType } from "@prisma/client";

/**
 * Maps URL parameters to ServiceCategory enum values
 * Used when user selects a service type on the /start page
 */
export function urlParamToServiceCategory(
  param: string
): ServiceCategory | null {
  const mapping: Record<string, ServiceCategory> = {
    business: ServiceCategory.BUSINESS_WEBSITE,
    nonprofit: ServiceCategory.NONPROFIT_WEBSITE,
    personal: ServiceCategory.PERSONAL_WEBSITE,
    maintenance: ServiceCategory.MAINTENANCE_PLAN,
  };

  return mapping[param.toLowerCase()] || null;
}

/**
 * Maps ServiceCategory enum to ServiceType enum for ProjectRequest.services
 * Maintains consistency between lead service types and project request services
 */
export function serviceCategoryToServiceType(
  category: ServiceCategory
): ServiceType {
  const mapping: Record<ServiceCategory, ServiceType> = {
    [ServiceCategory.BUSINESS_WEBSITE]: ServiceType.WEBSITE,
    [ServiceCategory.NONPROFIT_WEBSITE]: ServiceType.WEBSITE,
    [ServiceCategory.PERSONAL_WEBSITE]: ServiceType.WEBSITE,
    [ServiceCategory.MAINTENANCE_PLAN]: ServiceType.OTHER,
  };

  return mapping[category];
}

/**
 * Legacy migration helper - maps old free-text service types to new enum
 * Used for migrating existing database records
 */
export function legacyServiceTypeToEnum(
  legacyType: string | null
): ServiceCategory | null {
  if (!legacyType) return null;

  const normalized = legacyType.toLowerCase().trim();
  
  const mapping: Record<string, ServiceCategory> = {
    'business': ServiceCategory.BUSINESS_WEBSITE,
    'business website': ServiceCategory.BUSINESS_WEBSITE,
    'small-business': ServiceCategory.BUSINESS_WEBSITE,
    'small_business': ServiceCategory.BUSINESS_WEBSITE,
    'nonprofit': ServiceCategory.NONPROFIT_WEBSITE,
    'nonprofit website': ServiceCategory.NONPROFIT_WEBSITE,
    'non-profit': ServiceCategory.NONPROFIT_WEBSITE,
    'personal': ServiceCategory.PERSONAL_WEBSITE,
    'personal website': ServiceCategory.PERSONAL_WEBSITE,
    'maintenance': ServiceCategory.MAINTENANCE_PLAN,
    'maintenance plan': ServiceCategory.MAINTENANCE_PLAN,
    'quick-fix': ServiceCategory.MAINTENANCE_PLAN,
    'quick_fix': ServiceCategory.MAINTENANCE_PLAN,
  };

  return mapping[normalized] || null;
}

/**
 * Gets display name for ServiceCategory
 */
export function getServiceCategoryDisplayName(category: ServiceCategory): string {
  const displayNames: Record<ServiceCategory, string> = {
    [ServiceCategory.BUSINESS_WEBSITE]: "Business Website",
    [ServiceCategory.NONPROFIT_WEBSITE]: "Nonprofit Website",
    [ServiceCategory.PERSONAL_WEBSITE]: "Personal Website",
    [ServiceCategory.MAINTENANCE_PLAN]: "Maintenance Plan",
  };

  return displayNames[category];
}

/**
 * Gets description for ServiceCategory
 */
export function getServiceCategoryDescription(category: ServiceCategory): string {
  const descriptions: Record<ServiceCategory, string> = {
    [ServiceCategory.BUSINESS_WEBSITE]: "Professional website for your business with custom design and features",
    [ServiceCategory.NONPROFIT_WEBSITE]: "Specialized website for nonprofit organizations (40% discount available)",
    [ServiceCategory.PERSONAL_WEBSITE]: "Personal portfolio, blog, or professional presence online",
    [ServiceCategory.MAINTENANCE_PLAN]: "Ongoing website maintenance and support services",
  };

  return descriptions[category];
}

/**
 * Gets starting price for ServiceCategory
 */
export function getServiceCategoryStartingPrice(category: ServiceCategory): string {
  const prices: Record<ServiceCategory, string> = {
    [ServiceCategory.BUSINESS_WEBSITE]: "$599",
    [ServiceCategory.NONPROFIT_WEBSITE]: "$359",
    [ServiceCategory.PERSONAL_WEBSITE]: "$299",
    [ServiceCategory.MAINTENANCE_PLAN]: "$99/mo",
  };

  return prices[category];
}

/**
 * Validates if a service category string is valid
 */
export function isValidServiceCategory(value: string): value is ServiceCategory {
  return Object.values(ServiceCategory).includes(value as ServiceCategory);
}
