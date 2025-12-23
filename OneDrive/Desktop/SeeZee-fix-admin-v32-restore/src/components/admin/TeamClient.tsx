"use client";

/**
 * Team Client Component
 * Manages team members and their roles
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import { SectionCard } from "@/components/admin/SectionCard";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { FilterBar } from "@/components/ui/FilterBar";
import { deleteUser } from "@/server/actions/team";
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Code, 
  Palette, 
  Megaphone,
  UserCheck,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  X,
  Check,
  Loader2,
  Copy
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TeamUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamClientProps {
  users: TeamUser[];
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "CEO": return Crown;
    case "CFO": return Shield;
    case "FRONTEND": return Palette;
    case "BACKEND": return Code;
    case "OUTREACH": return Megaphone;
    case "CLIENT": return UserCheck;
    default: return User;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "CEO": return "text-yellow-400";
    case "CFO": return "text-red-400";
    case "STAFF": return "text-blue-400";
    case "DEV": return "text-green-400";
    case "DESIGNER": return "text-purple-400";
    case "OUTREACH": return "text-orange-400";
    case "CLIENT": return "text-cyan-400";
    default: return "text-gray-400";
  }
};

export function TeamClient({ users }: TeamClientProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClients, setShowClients] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("FRONTEND");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  const handleDelete = async (userId: string) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      setDeleteConfirm(null);
      setOpenMenuId(null);
      router.refresh();
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError("");

    try {
      const response = await fetch("/api/invitations/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: inviteEmail, 
          role: inviteRole,
          expiresDays: 7 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(true);
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteEmail("");
          setInviteRole("FRONTEND");
          setInviteSuccess(false);
        }, 3000);
      } else {
        setInviteError(data.error || "Failed to send invitation");
      }
    } catch (error) {
      setInviteError("An error occurred while sending the invitation");
    } finally {
      setIsInviting(false);
    }
  };

  // Define role order for consistent display and sorting
  const roleOrder: Record<string, number> = {
    CEO: 1,
    CFO: 2,
    FRONTEND: 3,
    BACKEND: 4,
    OUTREACH: 5,
    CLIENT: 6,
  };

  // Get team users (staff only) and clients separately
  const staffUsers = users.filter(user => user.role !== "CLIENT");
  const clientUsers = users.filter(user => user.role === "CLIENT");

  // Determine which users to show based on showClients toggle or CLIENT role selection
  const baseUsers = selectedRole === "CLIENT" 
    ? clientUsers 
    : (showClients ? users : staffUsers);

  // Sort users by role order, then by name
  const sortedUsers = [...baseUsers].sort((a, b) => {
    const aOrder = roleOrder[a.role] || 99;
    const bOrder = roleOrder[b.role] || 99;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return (a.name || a.email).localeCompare(b.name || b.email);
  });

  // Filter users by selected role (skip if already filtering by CLIENT)
  const filteredUsers = (selectedRole && selectedRole !== "CLIENT")
    ? sortedUsers.filter(user => user.role === selectedRole)
    : sortedUsers;

  // Apply search filter
  const searchFilteredUsers = filteredUsers.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Get role statistics for staff users
  const roleStats = staffUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add CLIENT count to stats
  if (clientUsers.length > 0) {
    roleStats["CLIENT"] = clientUsers.length;
  }

  // Sort roles by predefined order
  const roles = Object.keys(roleStats).sort((a, b) => {
    const aOrder = roleOrder[a] || 99;
    const bOrder = roleOrder[b] || 99;
    return aOrder - bOrder;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-3 relative">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-trinity-red glow-on-hover inline-block mb-2">
              People Operations
            </span>
            <h1 className="text-4xl font-heading font-bold gradient-text">Team Management</h1>
            <p className="max-w-2xl text-base text-slate-300 leading-relaxed">
              Manage team members, assign roles, and oversee access control across the platform.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-trinity-red hover:bg-trinity-red/90 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-trinity-red/25 hover:shadow-xl hover:-translate-y-1"
          >
            <UserPlus className="w-5 h-5" />
            Invite Staff
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300 font-semibold">Total Team</p>
            <div className="w-10 h-10 bg-trinity-red/20 rounded-lg flex items-center justify-center border border-trinity-red/30">
              <Users className="w-5 h-5 text-trinity-red" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-gray-100 mb-1">{staffUsers.length}</p>
          <p className="text-xs text-slate-300">Team Members</p>
        </div>
        
        {/* Clients Stat Card */}
        <button 
          onClick={() => {
            setSelectedRole(selectedRole === "CLIENT" ? null : "CLIENT");
          }}
          className={`rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-blue-500/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1 text-left ${selectedRole === "CLIENT" ? "border-blue-500/50" : ""}`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300 font-semibold">Clients</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <UserCheck className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-heading font-bold text-gray-100 mb-1">{clientUsers.length}</p>
          <p className="text-xs text-slate-300">Active Clients</p>
        </button>
        
        {roles.slice(0, 3).map((role) => {
          const Icon = getRoleIcon(role);
          const colorClass = getRoleColor(role);
          const bgClass = colorClass.replace("text-", "bg-").replace("400", "500/20");
          const borderClass = colorClass.replace("text-", "border-").replace("400", "500/30");
          
          return (
            <div key={role} className="rounded-2xl border-2 border-gray-700 glass-effect p-6 text-white hover:border-trinity-red/50 transition-all duration-300 group hover:shadow-large hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-300 font-semibold">{role}s</p>
                <div className={`w-10 h-10 ${bgClass} rounded-lg flex items-center justify-center border ${borderClass}`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
              </div>
              <p className="text-4xl font-heading font-bold text-gray-100 mb-1">{roleStats[role]}</p>
              <p className="text-xs text-slate-300">Active</p>
            </div>
          );
        })}
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRole(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedRole === null
              ? "bg-trinity-red/20 text-trinity-red border border-trinity-red/50"
              : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20 hover:text-gray-100"
          }`}
        >
          All ({showClients ? users.length : staffUsers.length})
        </button>
        {roles.map((role) => {
          const isClient = role === "CLIENT";
          const isSelected = selectedRole === role;
          return (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? isClient 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                    : "bg-trinity-red/20 text-trinity-red border border-trinity-red/50"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20 hover:text-gray-100"
              }`}
            >
              {role} ({roleStats[role]})
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <FilterBar
        searchPlaceholder={selectedRole === "CLIENT" ? "Search clients..." : "Search team members..."}
        onSearchChange={setSearchQuery}
      />

      {/* Team Members / Clients */}
      <div className={`glass-effect rounded-2xl border-2 border-gray-700 p-6 transition-all duration-300 hover:border-trinity-red/30 ${selectedRole === "CLIENT" ? "border-blue-500/30" : ""}`}>
        <h2 className="text-2xl font-heading font-bold text-gray-100 mb-6">
          {selectedRole === "CLIENT" ? "Clients" : "Team Members"} {selectedRole && selectedRole !== "CLIENT" ? `(${selectedRole})` : ""}
          {selectedRole === "CLIENT" && <span className="text-sm font-normal text-blue-400 ml-2">• New client accounts</span>}
        </h2>
        <div className="space-y-4">
          {searchFilteredUsers.length === 0 ? (
            <div className="text-center py-12">
              {selectedRole === "CLIENT" ? (
                <UserCheck className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              ) : (
                <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              )}
              <p className="text-slate-300">
                {searchQuery 
                  ? `No ${selectedRole === "CLIENT" ? "clients" : "team members"} match your search` 
                  : `No ${selectedRole === "CLIENT" ? "clients" : "team members"} found`}
              </p>
            </div>
          ) : (
            searchFilteredUsers.map((user) => {
              const Icon = getRoleIcon(user.role);
              const colorClass = getRoleColor(user.role);
              
              return (
                <div
                  key={user.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Avatar
                          src={user.image}
                          alt={user.name || user.email}
                          size={48}
                          fallbackText={user.name || user.email?.charAt(0)}
                        />
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-gray-100">
                          {user.name || "No name"}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Joined {formatDistanceToNow(new Date(user.createdAt))} ago
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Role Badge */}
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${colorClass}`} />
                        <RoleBadge role={user.role as any} />
                      </div>

                      {/* Actions Dropdown */}
                      <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                            <Link
                              href={`/admin/team/${user.id}`}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <User className="h-4 w-4" />
                              View Profile
                            </Link>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit User
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
                                deleteConfirm === user.id
                                  ? "bg-red-500/20 text-red-300"
                                  : "text-red-400 hover:bg-red-500/10"
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deleteConfirm === user.id ? "Confirm Delete?" : "Delete User"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            router.refresh();
          }}
        />
      )}

      {/* Invite Staff Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-trinity-red" />
                Invite Staff Member
              </h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteRole("FRONTEND");
                  setInviteError("");
                  setInviteSuccess(false);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Invitation Sent!</h3>
                <p className="text-slate-400 text-sm">
                  A 6-digit code has been emailed to {inviteEmail}
                </p>
              </div>
            ) : (
              <form onSubmit={handleInviteStaff} className="space-y-6">
                {inviteError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-trinity-red focus:border-transparent transition-all"
                  >
                    <option value="CEO">CEO - Chief Executive</option>
                    <option value="CFO">CFO - Chief Financial Officer</option>
                    <option value="FRONTEND">Frontend Developer</option>
                    <option value="BACKEND">Backend Developer</option>
                    <option value="OUTREACH">Outreach Specialist</option>
                  </select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    A 6-digit code will be emailed to this address
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                      setInviteRole("FRONTEND");
                      setInviteError("");
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting || !inviteEmail}
                    className="flex-1 px-6 py-3 bg-trinity-red hover:bg-trinity-red/90 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-trinity-red/25"
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}