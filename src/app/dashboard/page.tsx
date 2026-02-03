import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch user's upcoming RSVPs
  const upcomingRsvps = await db.rSVP.findMany({
    where: {
      userId: user.id,
      status: "CONFIRMED",
      session: { startDate: { gte: new Date() } },
    },
    include: {
      session: {
        include: {
          program: true,
        },
      },
    },
    orderBy: { session: { startDate: "asc" } },
    take: 5,
  });

  // Fetch user's DUI registrations
  const duiRegistrations = await db.dUIRegistration.findMany({
    where: {
      userId: user.id,
      status: { not: "CANCELLED" },
      class: { date: { gte: new Date() } },
    },
    include: {
      class: true,
    },
    orderBy: { class: { date: "asc" } },
    take: 5,
  });

  // Fetch user's donations
  const recentDonations = await db.donation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch user's assessment
  const assessment = await db.assessment.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-purple to-purple-900 text-white py-8 border-b border-purple-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold">Welcome back, {session.user.name || "User"}!</h1>
          <p className="text-purple-100 mt-2">
            {user.role === "ADMIN" && "Administrator Account"}
            {user.role === "BOARD" && "Board Member Account"}
            {user.role === "ALUMNI" && "Alumni/Community Member"}
            {user.role === "USER" && "Member Account"}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Quick Access Cards for Special Roles */}
        {(user.role === "BOARD" || user.role === "ALUMNI" || user.role === "ADMIN") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {(user.role === "BOARD" || user.role === "ADMIN") && (
              <Link
                href="/board"
                className="block p-6 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
              >
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-indigo-900">Board Portal</h3>
                <p className="text-sm text-indigo-700 mt-1">Access board updates and documents</p>
              </Link>
            )}

            {(user.role === "ALUMNI" || user.role === "BOARD" || user.role === "ADMIN") && (
              <Link
                href="/community"
                className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
              >
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="font-semibold text-green-900">Community Hub</h3>
                <p className="text-sm text-green-700 mt-1">Announcements, polls, and resources</p>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="block p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
              >
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-purple-900">Admin Panel</h3>
                <p className="text-sm text-purple-700 mt-1">Manage site content and users</p>
              </Link>
            )}
          </div>
        )}

        {/* Application Status */}
        {assessment ? (
          <div className="mb-8 bg-green-50 border border-brand-green rounded-lg p-6">
            <div className="flex gap-4">
              <span className="text-2xl">💚</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Application Submitted</h3>
                <p className="text-gray-700">
                  Based on your application, we recommend the <strong>{assessment.recommendedProgram}</strong> program. 
                  You can view upcoming sessions below.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-purple-50 border border-brand-purple rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Complete Your Application</h3>
                <p className="text-gray-700">
                  Fill out our brief application to help us match you with the best program for your needs.
                </p>
              </div>
              <Link
                href="/assessment"
                className="bg-brand-purple text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
              >
                Start Application
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Upcoming Sessions</h2>
              <Link href="/meetings" className="text-brand-purple hover:underline text-sm">
                View All →
              </Link>
            </div>

            {upcomingRsvps.length === 0 && duiRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No upcoming sessions</p>
                <Link href="/meetings" className="text-brand-purple hover:underline mt-2 inline-block">
                  Browse sessions
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Free Session RSVPs */}
                {upcomingRsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                  >
                    <div>
                      <p className="font-medium">{rsvp.session.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(rsvp.session.startDate).toLocaleDateString()} •{" "}
                        {new Date(rsvp.session.startDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      Free Session
                    </span>
                  </div>
                ))}

                {/* DUI Class Registrations */}
                {duiRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100"
                  >
                    <div>
                      <p className="font-medium">{reg.class.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(reg.class.date).toLocaleDateString()} • {reg.class.startTime}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                      DUI Class
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Donations</h2>
              <Link href="/donate" className="text-brand-purple hover:underline text-sm">
                Donate →
              </Link>
            </div>

            {recentDonations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No donations yet</p>
                <Link href="/donate" className="text-brand-purple hover:underline mt-2 inline-block">
                  Make a donation
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">${donation.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        donation.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/meetings"
            className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition"
          >
            <span className="text-2xl">📅</span>
            <p className="mt-2 font-medium text-blue-900">Browse Sessions</p>
          </Link>
          <Link
            href="/donate"
            className="p-4 bg-pink-50 rounded-lg text-center hover:bg-pink-100 transition"
          >
            <span className="text-2xl">💝</span>
            <p className="mt-2 font-medium text-pink-900">Make Donation</p>
          </Link>
          <Link
            href="/blog"
            className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition"
          >
            <span className="text-2xl">📰</span>
            <p className="mt-2 font-medium text-orange-900">Read Blog</p>
          </Link>
          <Link
            href="/contact"
            className="p-4 bg-teal-50 rounded-lg text-center hover:bg-teal-100 transition"
          >
            <span className="text-2xl">✉️</span>
            <p className="mt-2 font-medium text-teal-900">Contact Us</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
