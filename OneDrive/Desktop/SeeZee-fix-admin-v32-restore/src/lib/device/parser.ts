import { UAParser } from "ua-parser-js";

export interface ParsedUserAgent {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: "mobile" | "tablet" | "desktop" | "unknown";
}

/**
 * Parse user agent string
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  const browser = result.browser.name || "Unknown Browser";
  const browserVersion = result.browser.version || "";
  const os = result.os.name || "Unknown OS";
  const osVersion = result.os.version || "";
  const device = result.device.model || result.device.vendor || "Unknown Device";
  
  let deviceType: ParsedUserAgent["deviceType"] = "unknown";
  if (result.device.type === "mobile") {
    deviceType = "mobile";
  } else if (result.device.type === "tablet") {
    deviceType = "tablet";
  } else if (result.device.type === undefined) {
    // If no device type is specified, it's usually a desktop
    deviceType = "desktop";
  }
  
  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    deviceType,
  };
}

/**
 * Get a human-readable device description
 */
export function getDeviceDescription(userAgent: string): string {
  const parsed = parseUserAgent(userAgent);
  
  // Format: "Chrome 120 on Windows 10"
  const browserInfo = parsed.browserVersion 
    ? `${parsed.browser} ${parsed.browserVersion.split(".")[0]}`
    : parsed.browser;
  
  const osInfo = parsed.osVersion
    ? `${parsed.os} ${parsed.osVersion}`
    : parsed.os;
  
  return `${browserInfo} on ${osInfo}`;
}

/**
 * Get browser icon name (for UI display)
 */
export function getBrowserIcon(userAgent: string): string {
  const parsed = parseUserAgent(userAgent);
  const browser = parsed.browser.toLowerCase();
  
  if (browser.includes("chrome")) return "chrome";
  if (browser.includes("firefox")) return "firefox";
  if (browser.includes("safari")) return "safari";
  if (browser.includes("edge")) return "edge";
  if (browser.includes("opera")) return "opera";
  
  return "browser";
}

/**
 * Get OS icon name (for UI display)
 */
export function getOSIcon(userAgent: string): string {
  const parsed = parseUserAgent(userAgent);
  const os = parsed.os.toLowerCase();
  
  if (os.includes("windows")) return "windows";
  if (os.includes("mac")) return "apple";
  if (os.includes("ios")) return "apple";
  if (os.includes("android")) return "android";
  if (os.includes("linux")) return "linux";
  
  return "desktop";
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(userAgent: string): boolean {
  const parsed = parseUserAgent(userAgent);
  return parsed.deviceType === "mobile" || parsed.deviceType === "tablet";
}

/**
 * Get location from IP address using ipapi.co
 */
export async function getLocationFromIP(ip: string): Promise<{
  city?: string;
  region?: string;
  country?: string;
  location?: string;
}> {
  try {
    // Skip for local IPs
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return { location: "Local Network" };
    }
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        "User-Agent": "SeeZee-Studio/1.0",
      },
    });
    
    if (!response.ok) {
      return {};
    }
    
    const data = await response.json();
    
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      location: [data.city, data.region, data.country_name]
        .filter(Boolean)
        .join(", ") || undefined,
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return {};
  }
}

/**
 * Get IP address from request headers
 */
export function getIPFromHeaders(headers: Headers): string {
  // Check common headers for IP address
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return "unknown";
}




