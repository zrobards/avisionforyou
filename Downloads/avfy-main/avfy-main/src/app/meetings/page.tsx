import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UnifiedScheduler from "@/components/meetings/UnifiedScheduler";

export default async function MeetingsPage() {
  const session = await getServerSession(authOptions);

  // Fetch all upcoming program sessions
  const sessions = await db.programSession.findMany({
    where: {
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    include: {
      _count: { select: { rsvps: true } },
    },
  });

  // Fetch all upcoming DUI classes
  const duiClasses = await db.dUIClass.findMany({
    where: {
      active: true,
      date: { gte: new Date() },
    },
    orderBy: { date: "asc" },
    include: {
      _count: { select: { registrations: true } },
    },
  });

  // Get user's RSVPs if logged in
  let userRsvps: string[] = [];
  let userDuiRegistrations: string[] = [];

  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        rsvps: {
          where: { status: "CONFIRMED" },
          select: { sessionId: true },
        },
        duiRegistrations: {
          where: { status: { not: "CANCELLED" } },
          select: { classId: true },
        },
      },
    });

    if (user) {
      userRsvps = user.rsvps.map((r) => r.sessionId);
      userDuiRegistrations = user.duiRegistrations.map((r) => r.classId);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Sessions & Classes</h1>
          <p className="text-xl text-purple-100">
            Browse upcoming meetings, support sessions, and DUI education classes. 
            RSVP to free sessions or register and pay for classes.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <UnifiedScheduler
            sessions={sessions}
            duiClasses={duiClasses}
            userRsvps={userRsvps}
            userDuiRegistrations={userDuiRegistrations}
            isLoggedIn={!!session}
            userId={session?.user?.email || undefined}
          />
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-purple-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join?</h2>
          <p className="text-lg text-gray-700 mb-8">
            Create an account to track your RSVPs and stay connected with our community.
          </p>
          {!session ? (
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-brand-purple text-white rounded-lg font-bold hover:bg-purple-800 transition"
            >
              Create Account
            </a>
          ) : (
            <a
              href="/dashboard"
              className="inline-block px-8 py-4 bg-brand-purple text-white rounded-lg font-bold hover:bg-purple-800 transition"
            >
              View My Dashboard
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
