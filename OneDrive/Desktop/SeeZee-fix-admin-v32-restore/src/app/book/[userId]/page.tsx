import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "./BookingForm";

interface BookingPageProps {
  params: Promise<{ userId: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { userId } = await params;

  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Only allow booking with staff/admin users
  const bookableRoles = ["CEO", "CFO", "ADMIN", "DESIGNER", "DEV", "OUTREACH"];
  if (!bookableRoles.includes(user.role)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-24 h-24 rounded-full mx-auto border-4 border-cyan-500/30 shadow-lg shadow-cyan-500/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-cyan-500/30">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mt-4">{user.name}</h1>
          <p className="text-slate-400">{getRoleLabel(user.role)}</p>
          {user.bio && <p className="text-slate-500 text-sm mt-2">{user.bio}</p>}
        </div>

        {/* Booking Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">Schedule a Meeting</h2>
            <p className="text-slate-400 text-sm mt-1">
              Choose a convenient time for a free consultation
            </p>
          </div>

          <BookingForm userId={userId} userName={user.name || "Team Member"} />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            Powered by{" "}
            <a href="https://see-zee.com" className="text-cyan-400 hover:underline">
              SeeZee Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    CEO: "CEO & Lead Developer",
    CFO: "Chief Financial Officer",
    DESIGNER: "Designer",
    DEV: "Developer",
    OUTREACH: "Client Relations",
    ADMIN: "Administrator",
  };
  return labels[role] || role;
}

