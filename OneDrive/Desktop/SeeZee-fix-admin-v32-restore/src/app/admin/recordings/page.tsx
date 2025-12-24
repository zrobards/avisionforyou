'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Mic, Plus, Play, Clock, FileText, Sparkles, Calendar, FolderOpen, 
  Tag, Eye, ChevronDown, Trash2, Building2, User, ArrowUpDown, 
  ArrowUp, ArrowDown, AlertCircle, X
} from "lucide-react";

interface Recording {
  id: string;
  title: string;
  filename: string;
  status: string;
  category: string | null;
  duration: number | null;
  transcript: string | null;
  isClientVisible: boolean;
  createdAt: string;
  project: { 
    id: string; 
    name: string;
    organization?: {
      id: string;
      name: string;
    } | null;
  } | null;
  uploadedBy?: {
    id: string;
    name: string | null;
  } | null;
}

interface Project {
  id: string;
  name: string;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'DISCOVERY_CALL', label: '📞 Discovery Call' },
  { value: 'DESIGN_REVIEW', label: '🎨 Design Review' },
  { value: 'TECHNICAL_DISCUSSION', label: '💻 Technical Discussion' },
  { value: 'PROJECT_UPDATE', label: '📊 Project Update' },
  { value: 'BRAINSTORMING', label: '💡 Brainstorming' },
  { value: 'TRAINING', label: '📚 Training' },
  { value: 'SUPPORT', label: '🛠️ Support' },
  { value: 'INTERNAL', label: '🏢 Internal' },
  { value: 'OTHER', label: '📁 Other' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'TRANSCRIBED', label: 'Transcribed' },
  { value: 'ERROR', label: 'Error' },
];

type SortField = 'createdAt' | 'title' | 'duration' | 'status';
type SortDirection = 'asc' | 'desc';

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchRecordings();
    fetchProjects();
  }, []);

  const fetchRecordings = async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?limit=100');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/recordings?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setRecordings(prev => prev.filter(r => r.id !== id));
        setDeleteConfirm(null);
      } else {
        const error = await res.json();
        alert(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete recording:', error);
      alert('Failed to delete recording');
    } finally {
      setDeleting(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Apply filters and sorting
  const filteredAndSortedRecordings = useMemo(() => {
    let result = recordings.filter(r => {
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (projectFilter && r.project?.id !== projectFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesProject = r.project?.name?.toLowerCase().includes(query);
        const matchesClient = r.project?.organization?.name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesProject && !matchesClient) return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [recordings, categoryFilter, statusFilter, projectFilter, searchQuery, sortField, sortDirection]);

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCategoryLabel = (category: string | null) => {
    const option = CATEGORY_OPTIONS.find(c => c.value === category);
    return option?.label || category || 'Uncategorized';
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'DISCOVERY_CALL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'DESIGN_REVIEW': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'TECHNICAL_DISCUSSION': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'PROJECT_UPDATE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'BRAINSTORMING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'TRAINING': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'SUPPORT': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'INTERNAL': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TRANSCRIBED':
        return <FileText className="w-5 h-5 text-green-400" />;
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Play className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRANSCRIBED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PROCESSING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ERROR':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const hasActiveFilters = categoryFilter || statusFilter || projectFilter || searchQuery;

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
        sortField === field 
          ? 'bg-pink-500/20 text-pink-400' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
      {sortField === field ? (
        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-50" />
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Mic className="w-8 h-8 text-pink-400" />
            Session Recordings
          </h1>
          <p className="text-slate-400 mt-1">
            AI-transcribed meeting recordings linked to your projects
          </p>
        </div>
        <Link
          href="/admin/recordings/upload"
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-pink-500/20"
        >
          <Plus className="w-4 h-4" />
          Upload Recording
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by title, project, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Category Dropdown */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Category</label>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none bg-slate-800/80 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 cursor-pointer pr-10"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Project Dropdown */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Project</label>
            <div className="relative">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full appearance-none bg-slate-800/80 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 cursor-pointer pr-10"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-slate-800/80 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 cursor-pointer pr-10"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCategoryFilter('');
                  setStatusFilter('');
                  setProjectFilter('');
                  setSearchQuery('');
                }}
                className="px-4 py-2.5 text-sm text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Sort controls & Results count */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-2">Sort by:</span>
            <SortButton field="createdAt" label="Date" />
            <SortButton field="title" label="Title" />
            <SortButton field="duration" label="Duration" />
            <SortButton field="status" label="Status" />
          </div>
          <div className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{filteredAndSortedRecordings.length}</span> of{' '}
            <span className="text-white font-medium">{recordings.length}</span> recordings
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Filtered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recordings List */}
      {loading ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center backdrop-blur-sm">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4" />
            <div className="h-4 w-48 bg-slate-700 rounded mx-auto" />
          </div>
        </div>
      ) : filteredAndSortedRecordings.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center backdrop-blur-sm">
          <Mic className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {recordings.length === 0 ? 'No recordings yet' : 'No recordings match your filters'}
          </h3>
          <p className="text-slate-400 mb-6">
            {recordings.length === 0 
              ? 'Upload your first meeting recording to get started'
              : 'Try adjusting your filters or clear them to see all recordings'
            }
          </p>
          {recordings.length === 0 && (
            <Link
              href="/admin/recordings/upload"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Recording
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="divide-y divide-white/5">
            {filteredAndSortedRecordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
              >
                <Link
                  href={`/admin/recordings/${recording.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  {/* Status Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getStatusColor(recording.status)}`}
                  >
                    {getStatusIcon(recording.status)}
                  </div>
                  
                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-white group-hover:text-pink-400 transition-colors truncate">
                        {recording.title}
                      </h3>
                      {recording.isClientVisible && (
                        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded flex items-center gap-1 border border-cyan-500/30">
                          <Eye className="w-3 h-3" />
                          Visible
                        </span>
                      )}
                    </div>
                    
                    {/* Client & Project Row */}
                    <div className="flex items-center gap-3 text-sm mt-1">
                      {recording.project?.organization && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Building2 className="w-3 h-3" />
                          {recording.project.organization.name}
                        </span>
                      )}
                      {recording.project && (
                        <span className="flex items-center gap-1 text-pink-400">
                          <FolderOpen className="w-3 h-3" />
                          {recording.project.name}
                        </span>
                      )}
                      {!recording.project && (
                        <span className="text-slate-500 italic text-xs">No project assigned</span>
                      )}
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                      {/* Category Badge */}
                      {recording.category && (
                        <span className={`px-2 py-0.5 rounded-full font-medium border ${getCategoryColor(recording.category)}`}>
                          {getCategoryLabel(recording.category)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(recording.createdAt)}
                      </span>
                      {recording.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(recording.duration)}
                        </span>
                      )}
                      {recording.transcript && (
                        <span className="flex items-center gap-1 text-green-400">
                          <Sparkles className="w-3 h-3" />
                          Transcribed
                        </span>
                      )}
                      {recording.uploadedBy?.name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {recording.uploadedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-4">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border hidden sm:block ${getStatusColor(recording.status)}`}
                  >
                    {recording.status}
                  </span>
                  
                  {/* Delete Button */}
                  {deleteConfirm === recording.id ? (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                      <span className="text-xs text-red-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(recording.id)}
                        disabled={deleting === recording.id}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {deleting === recording.id ? '...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteConfirm(recording.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}








