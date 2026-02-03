import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function CommunityDashboardPage() {
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

  if (user.role !== "ALUMNI" && user.role !== "BOARD" && user.role !== "ADMIN") {
    redirect("/unauthorized");
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

  // Fetch active polls
  const activePolls = await db.communityPoll.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      _count: { select: { votes: true } },
      votes: {
        where: { userId: user.id },
        select: { vote: true },
      },
    },
  });

  // Fetch announcements
  const announcements = await db.communityAnnouncement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold">
            Welcome to the Community Hub, {session.user.name || "Member"}!
          </h1>
          <p className="text-green-100 mt-2">
            Connect, participate, and stay informed with the AVFY community.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Upcoming Sessions</h2>
                <Link href="/community/meetings" className="text-green-600 hover:underline text-sm">
                  Browse All →
                </Link>
              </div>

              {upcomingRsvps.length === 0 && duiRegistrations.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No upcoming sessions or classes</p>
                  <Link href="/community/meetings" className="text-green-600 hover:underline mt-2 inline-block">
                    Find sessions and classes to join
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingRsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
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
                        RSVP'd
                      </span>
                    </div>
                  ))}
                  {duiRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{reg.class.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(reg.class.date).toLocaleDateString()} • {reg.class.startTime}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        Registered
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Announcements</h2>
                <Link href="/community/announcements" className="text-green-600 hover:underline text-sm">
                  View All →
                </Link>
              </div>

              {announcements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No announcements</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium">{ann.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(ann.createdAt).toLocaleDateString()} • {ann.author.name || "Admin"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Polls & Quick Links */}
          <div className="space-y-6">
            {/* Active Polls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">🗳️ Active Polls</h2>
                <Link href="/community/polls" className="text-green-600 hover:underline text-sm">
                  All Polls →
                </Link>
              </div>

              {activePolls.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active polls</p>
              ) : (
                <div className="space-y-3">
                  {activePolls.map((poll) => {
                    const hasVoted = poll.votes.length > 0;
                    return (
                      <Link
                        key={poll.id}
                        href="/community/polls"
                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <p className="font-medium text-sm">{poll.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {poll._count.votes} votes
                          {hasVoted && " • You voted"}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/community/meetings"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <span>📅</span>
                  <span>Browse Sessions & Classes</span>
                </Link>
                <Link
                  href="/community/resources"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <span>📚</span>
                  <span>Resources</span>
                </Link>
                <Link
                  href="/community/my-rsvps"
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <span>✅</span>
                  <span>My RSVPs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
