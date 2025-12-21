import { redirect } from "next/navigation";

/**
 * Admin Settings Page - Redirects to /settings
 * Settings are now consolidated into the main /settings route
 */
export default function AdminSettingsPage() {
  redirect("/settings");
}











