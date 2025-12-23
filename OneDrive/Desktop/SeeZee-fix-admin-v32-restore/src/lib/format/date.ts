import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

export type DateFormatType = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type TimeFormatType = "12h" | "24h";

/**
 * Format a date according to user preference
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatType: DateFormatType = "MM/DD/YYYY"
): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    const formatMap: Record<DateFormatType, string> = {
      "MM/DD/YYYY": "MM/dd/yyyy",
      "DD/MM/YYYY": "dd/MM/yyyy",
      "YYYY-MM-DD": "yyyy-MM-dd",
    };
    
    return format(dateObj, formatMap[formatType]);
  } catch {
    return "";
  }
}

/**
 * Format a time according to user preference
 */
export function formatTime(
  date: Date | string | null | undefined,
  timeFormat: TimeFormatType = "12h"
): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    const formatString = timeFormat === "12h" ? "h:mm a" : "HH:mm";
    return format(dateObj, formatString);
  } catch {
    return "";
  }
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  dateFormat: DateFormatType = "MM/DD/YYYY",
  timeFormat: TimeFormatType = "12h"
): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    const dateFormatMap: Record<DateFormatType, string> = {
      "MM/DD/YYYY": "MM/dd/yyyy",
      "DD/MM/YYYY": "dd/MM/yyyy",
      "YYYY-MM-DD": "yyyy-MM-dd",
    };
    
    const timeFormatString = timeFormat === "12h" ? "h:mm a" : "HH:mm";
    const fullFormat = `${dateFormatMap[dateFormat]} ${timeFormatString}`;
    
    return format(dateObj, fullFormat);
  } catch {
    return "";
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return "";
  }
}

/**
 * Format date in ISO format
 */
export function formatISO(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    return dateObj.toISOString();
  } catch {
    return "";
  }
}

/**
 * Get list of common timezones
 */
export function getTimezones(): Array<{ value: string; label: string; offset: string }> {
  return [
    { value: "America/New_York", label: "Eastern Time", offset: "UTC-5" },
    { value: "America/Chicago", label: "Central Time", offset: "UTC-6" },
    { value: "America/Denver", label: "Mountain Time", offset: "UTC-7" },
    { value: "America/Los_Angeles", label: "Pacific Time", offset: "UTC-8" },
    { value: "America/Anchorage", label: "Alaska Time", offset: "UTC-9" },
    { value: "Pacific/Honolulu", label: "Hawaii Time", offset: "UTC-10" },
    { value: "Europe/London", label: "London", offset: "UTC+0" },
    { value: "Europe/Paris", label: "Paris", offset: "UTC+1" },
    { value: "Europe/Berlin", label: "Berlin", offset: "UTC+1" },
    { value: "Asia/Tokyo", label: "Tokyo", offset: "UTC+9" },
    { value: "Asia/Shanghai", label: "Shanghai", offset: "UTC+8" },
    { value: "Asia/Dubai", label: "Dubai", offset: "UTC+4" },
    { value: "Australia/Sydney", label: "Sydney", offset: "UTC+11" },
    { value: "UTC", label: "UTC", offset: "UTC+0" },
  ];
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    return format(dateObj, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * Format time for input fields (HH:mm)
 */
export function formatTimeForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    
    if (!isValid(dateObj)) return "";
    
    return format(dateObj, "HH:mm");
  } catch {
    return "";
  }
}








