import "@/styles/admin.css";
import { redirect } from "next/navigation";
import ClientShell from "@/components/client/ClientShell";
import { ClientErrorBoundary } from "@/components/client/ClientErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "@/components/ui/Toast";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { ROLE } from "@/lib/role";
import { Providers } from "@/app/providers";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use getCurrentUser to get properly mapped role
  const user = await getCurrentUser();

  // Not authenticated - redirect to login
  if (!user) {
    redirect("/login?returnUrl=/client");
  }

  // CEO email always has access to client dashboard
  const CEO_EMAILS = ["seanspm1007@gmail.com", "seanpm1007@gmail.com", "sean.mcculloch23@gmail.com"];
  if (user.email && CEO_EMAILS.includes(user.email.toLowerCase())) {
    // CEO can access client dashboard
    return (
      <Providers>
        <ClientErrorBoundary>
          <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
            <ClientShell>{children}</ClientShell>
            <Toaster />
            <ToastContainer />
          </div>
        </ClientErrorBoundary>
      </Providers>
    );
  }

  // Check if user has appropriate role to access client dashboard
  // Allow CLIENT, CEO, CFO, FRONTEND, BACKEND, OUTREACH to view client dashboard
  const allowedRoles = [
    ROLE.CLIENT,
    ROLE.CEO,
    ROLE.CFO,
    ROLE.FRONTEND,
    ROLE.BACKEND,
    ROLE.OUTREACH,
  ];

  // Allow access if role is in allowedRoles list
  // If not in allowedRoles, redirect based on user type
  if (!allowedRoles.includes(user.role)) {
    // Staff/admin roles that aren't explicitly allowed - redirect to admin
    const staffRoles = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH", "ADMIN", "STAFF"];
    if (staffRoles.includes(user.role)) {
      redirect("/admin");
    } else {
      // Unknown role or no access - redirect to login
      redirect("/login");
    }
  }

  return (
    <Providers>
      <ClientErrorBoundary>
        <div className="min-h-screen" style={{ paddingTop: 'var(--h-nav)' }}>
          <ClientShell>{children}</ClientShell>
          <Toaster />
          <ToastContainer />
        </div>
      </ClientErrorBoundary>
    </Providers>
  );
}
