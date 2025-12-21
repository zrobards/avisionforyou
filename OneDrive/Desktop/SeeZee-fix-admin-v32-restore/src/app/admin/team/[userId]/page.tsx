import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireRole";
import { Mail, Phone, Building2, MapPin, Globe, Briefcase, Calendar, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Avatar from "@/components/ui/Avatar";
import { RoleBadge } from "@/components/admin/RoleBadge";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/login");
  }

  // Only admins can view other user profiles
  const isAdmin = ["CEO", "CFO", "FRONTEND", "BACKEND", "OUTREACH"].includes(currentUser.role || "");
  
  if (!isAdmin) {
    redirect("/");
  }

  // Fetch the user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      _count: {
        select: {
          assignedProjects: true,
          assignedTodos: true,
          createdTodos: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Team
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Team Member Profile</h1>
          <p className="text-gray-400">View detailed information about this team member</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Avatar */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <Avatar
                    src={user.image || user.profileImageUrl}
                    alt={user.name || user.email}
                    size={128}
                    fallbackText={user.name || user.email?.charAt(0)}
                  />
                </div>
                
                <h2 className="text-xl font-bold text-white">
                  {user.name || "No name set"}
                </h2>
                <p className="text-sm text-gray-400 mb-3">{user.email}</p>
                
                <div className="flex items-center justify-center gap-2">
                  <RoleBadge role={user.role as any} />
                </div>

                {user.profile?.jobTitle && (
                  <p className="text-sm text-purple-400 mt-2 font-medium">
                    {user.profile.jobTitle}
                  </p>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">About</h3>
                  <p className="text-sm text-white">{user.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Member since</span>
                  <span className="text-white font-medium">
                    {formatDistanceToNow(new Date(user.createdAt))} ago
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last active</span>
                  <span className="text-white font-medium">
                    {user.lastLogin 
                      ? formatDistanceToNow(new Date(user.lastLogin)) + " ago"
                      : "Never"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-white font-medium">
                    {user._count.assignedProjects}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tasks</span>
                  <span className="text-white font-medium">
                    {user._count.assignedTodos}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {user.profile?.skills && user.profile.skills.length > 0 && (
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Mail className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}

                {/* Company */}
                {user.company && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    <Building2 className="h-5 w-5 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Company</p>
                      <p className="text-white font-medium">{user.company}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {user.location && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white font-medium">{user.location}</p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {user.profile?.websiteUrl && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    <Globe className="h-5 w-5 text-cyan-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Website</p>
                      <a 
                        href={user.profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                      >
                        {user.profile.websiteUrl}
                      </a>
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {user.profile?.portfolioUrl && (
                  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                    <Briefcase className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Portfolio</p>
                      <a 
                        href={user.profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                      >
                        {user.profile.portfolioUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Account Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Email Verified</p>
                    <p className="text-white font-medium">
                      {user.emailVerified ? "✓ Yes" : "✗ No"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Profile Complete</p>
                    <p className="text-white font-medium">
                      {user.profileDoneAt ? "✓ Yes" : "✗ No"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">2FA Enabled</p>
                    <p className="text-white font-medium">
                      {user.twofaEnabled ? "✓ Yes" : "✗ No"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">ToS Accepted</p>
                    <p className="text-white font-medium">
                      {user.tosAcceptedAt ? "✓ Yes" : "✗ No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}




