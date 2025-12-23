"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban,
  CheckCircle2,
  Plus,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  User,
  Sparkles,
  BarChart3,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: Date | null;
  assignee: { name: string | null; image: string | null } | null;
  milestones: { completed: boolean }[];
}

interface ProjectsClientProps {
  projects: Project[];
}

type SortOption = "newest" | "oldest" | "name" | "progress";
type FilterStatus = "all" | "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD" | "PLANNING" | "DESIGN" | "BUILD" | "REVIEW";

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; border: string; label: string; gradient: string }> = {
      COMPLETED: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Completed", gradient: "from-emerald-400 to-green-400" },
      ACTIVE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "Active", gradient: "from-blue-400 to-cyan-400" },
      IN_PROGRESS: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", label: "In Progress", gradient: "from-blue-400 to-cyan-400" },
      DESIGN: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", label: "Design", gradient: "from-purple-400 to-pink-400" },
      BUILD: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30", label: "Build", gradient: "from-cyan-400 to-blue-400" },
      REVIEW: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", label: "Review", gradient: "from-amber-400 to-orange-400" },
      ON_HOLD: { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: "On Hold", gradient: "from-slate-400 to-gray-400" },
      PLANNING: { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", label: "Planning", gradient: "from-indigo-400 to-purple-400" },
    };
    return config[status] || { bg: "bg-slate-500/20", text: "text-slate-300", border: "border-slate-500/30", label: status, gradient: "from-slate-400 to-gray-400" };
  };

  const calculateProgress = (project: Project) => {
    if (project.milestones.length === 0) return 0;
    const completed = project.milestones.filter((m) => m.completed).length;
    return Math.round((completed / project.milestones.length) * 100);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "ACTIVE" || p.status === "IN_PROGRESS").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const avgProgress =
      projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + calculateProgress(p), 0) / projects.length
          )
        : 0;

    return { total, active, completed, avgProgress };
  }, [projects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.assignee?.name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
        case "oldest":
          return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "progress":
          return calculateProgress(b) - calculateProgress(a);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, statusFilter, sortBy]);

  const statusOptions: FilterStatus[] = ["all", "ACTIVE", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "PLANNING", "DESIGN", "BUILD", "REVIEW"];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">My Projects</h1>
          <p className="text-gray-400">Track and manage your active and completed projects</p>
        </div>
        <Link href="/start">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(220, 20, 60, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-trinity-red to-trinity-maroon hover:from-trinity-maroon hover:to-trinity-red text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-trinity-red/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </motion.button>
        </Link>
      </div>

      {/* Stats Section */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-5 rounded-2xl hover:border-trinity-red/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-trinity-red/20 rounded-xl group-hover:bg-trinity-red/30 transition-colors">
                <FolderKanban className="w-5 h-5 text-trinity-red" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total Projects</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-5 rounded-2xl hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-5 rounded-2xl hover:border-green-500/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
                <p className="text-xs text-gray-400">Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-5 rounded-2xl hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.avgProgress}%</p>
                <p className="text-xs text-gray-400">Avg Progress</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Search and Filters */}
      {projects.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(statusFilter !== "all" || sortBy !== "newest") && (
                <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {[statusFilter !== "all" ? 1 : 0, sortBy !== "newest" ? 1 : 0].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            statusFilter === status
                              ? "bg-blue-500 text-white"
                              : "bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {status === "all" ? "All" : getStatusBadge(status).label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { value: "newest", label: "Newest" },
                          { value: "oldest", label: "Oldest" },
                          { value: "name", label: "Name" },
                          { value: "progress", label: "Progress" },
                        ] as { value: SortOption; label: string }[]
                      ).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            sortBy === option.value
                              ? "bg-purple-500 text-white"
                              : "bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 p-12 md:p-16 text-center rounded-xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <FolderKanban className="w-16 h-16 text-white/20 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Start your first project with SeeZee and let's build something amazing together
          </p>
          <Link href="/start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Your First Project
            </motion.button>
          </Link>
        </motion.div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900 border border-gray-800 p-12 text-center rounded-xl"
        >
          <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-white/60 mb-4">
            Try adjusting your search or filters to find what you're looking for
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setSortBy("newest");
            }}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Clear all filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProjects.map((project, index) => {
              const badge = getStatusBadge(project.status);
              const progress = calculateProgress(project);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  layout
                >
                  <Link
                    href={`/client/projects/${project.id}`}
                    className="block bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl group relative overflow-hidden hover:border-trinity-red/50 transition-all duration-300 hover:shadow-lg hover:shadow-trinity-red/10"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-trinity-red/0 via-transparent to-trinity-maroon/0 group-hover:from-trinity-red/5 group-hover:to-trinity-maroon/5 transition-all duration-300 pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white group-hover:text-trinity-red transition-colors mb-2 truncate">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-white/60 line-clamp-2 mb-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="flex-shrink-0 ml-2"
                        >
                          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-trinity-red transition-colors" />
                        </motion.div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {project.milestones.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Progress
                            </span>
                            <span className="font-semibold">{progress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${badge.gradient} transition-all duration-500`}
                            />
                          </div>
                          <div className="text-xs text-white/40 mt-2">
                            {project.milestones.filter((m) => m.completed).length}/{project.milestones.length} milestones completed
                          </div>
                        </div>
                      )}

                      {/* Project Info */}
                      <div className="flex items-center gap-4 text-xs text-white/60 pt-4 border-t border-white/10">
                        {project.startDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        )}
                        {project.assignee && (
                          <div className="flex items-center gap-2 ml-auto">
                            {project.assignee.image ? (
                              <img
                                src={project.assignee.image}
                                alt={project.assignee.name || "Team"}
                                className="w-6 h-6 rounded-full border border-blue-500/30"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                <User className="w-3 h-3 text-blue-400" />
                              </div>
                            )}
                            <span className="text-white/80 font-medium">{project.assignee.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Results Count */}
      {projects.length > 0 && filteredAndSortedProjects.length > 0 && (
        <div className="text-center text-sm text-white/60">
          Showing {filteredAndSortedProjects.length} of {projects.length} projects
        </div>
      )}
    </div>
  );
}

