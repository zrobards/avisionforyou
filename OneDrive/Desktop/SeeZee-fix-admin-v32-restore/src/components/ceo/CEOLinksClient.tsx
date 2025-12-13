"use client";

/**
 * CEO Links Client Component
 * Custom CEO-only links management interface
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  ExternalLink,
  Trash2,
  Edit,
  Pin,
  Search,
  Filter,
  Link as LinkIcon,
  Crown,
} from "lucide-react";
import { deleteLink, createLink, updateLink, toggleLinkPin } from "@/server/actions";
import type { CurrentUser } from "@/lib/auth/requireRole";

type Link = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  icon: string | null;
  color: string | null;
  order: number;
  pinned: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface CEOLinksClientProps {
  links: Link[];
  user: CurrentUser;
}

const categoryColors: Record<string, string> = {
  DESIGN: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  DEVELOPMENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MARKETING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  TOOLS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DOCUMENTATION: "bg-green-500/20 text-green-400 border-green-500/30",
  OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const categoryIcons: Record<string, string> = {
  DESIGN: "🎨",
  DEVELOPMENT: "💻",
  MARKETING: "📢",
  TOOLS: "🛠️",
  DOCUMENTATION: "📚",
  OTHER: "🔗",
};

export function CEOLinksClient({ links, user }: CEOLinksClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pinning, setPinning] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    description: "",
    category: "OTHER" as const,
    icon: "",
    color: "",
    pinned: false,
  });

  // Filter links
  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || link.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Separate pinned and unpinned links
  const pinnedLinks = filteredLinks.filter((link) => link.pinned);
  const unpinnedLinks = filteredLinks.filter((link) => !link.pinned);

  const handleDelete = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    
    setDeleting(linkId);
    const result = await deleteLink(linkId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to delete link");
    }
    setDeleting(null);
  };

  const handleTogglePin = async (linkId: string) => {
    setPinning(linkId);
    const result = await toggleLinkPin(linkId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to toggle pin status");
    }
    setPinning(null);
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const result = await createLink(newLink);
      
      if (result.success) {
        setShowCreateModal(false);
        setNewLink({
          title: "",
          url: "",
          description: "",
          category: "OTHER",
          icon: "",
          color: "",
          pinned: false,
        });
        router.refresh();
      } else {
        alert("Failed to create link");
      }
    } catch (error) {
      console.error("Failed to create link:", error);
      alert("Failed to create link");
    } finally {
      setCreating(false);
    }
  };

  const handleEditLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    
    setUpdating(true);
    
    try {
      const result = await updateLink(editingLink.id, {
        title: newLink.title,
        url: newLink.url,
        description: newLink.description || undefined,
        category: newLink.category,
        icon: newLink.icon || undefined,
        color: newLink.color || undefined,
        pinned: newLink.pinned,
      });
      
      if (result.success) {
        setShowEditModal(false);
        setEditingLink(null);
        setNewLink({
          title: "",
          url: "",
          description: "",
          category: "OTHER",
          icon: "",
          color: "",
          pinned: false,
        });
        router.refresh();
      } else {
        alert("Failed to update link");
      }
    } catch (error) {
      console.error("Failed to update link:", error);
      alert("Failed to update link");
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (link: Link) => {
    setEditingLink(link);
    setNewLink({
      title: link.title,
      url: link.url,
      description: link.description || "",
      category: link.category as any,
      icon: link.icon || "",
      color: link.color || "",
      pinned: link.pinned,
    });
    setShowEditModal(true);
  };

  const categories = ["ALL", "DESIGN", "DEVELOPMENT", "MARKETING", "TOOLS", "DOCUMENTATION", "OTHER"];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">CEO Links</h1>
            <p className="text-gray-400">Manage your important links and resources</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 appearance-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-900">
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-yellow-500/25 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Link
        </button>
      </motion.div>

      {/* Pinned Links Section */}
      {pinnedLinks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Pin className="w-5 h-5 text-yellow-400" />
            Pinned Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDelete}
                onEdit={openEditModal}
                onTogglePin={handleTogglePin}
                deleting={deleting === link.id}
                pinning={pinning === link.id}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-gray-400" />
          All Links ({filteredLinks.length})
        </h2>
        {unpinnedLinks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDelete}
                onEdit={openEditModal}
                onTogglePin={handleTogglePin}
                deleting={deleting === link.id}
                pinning={pinning === link.id}
                delay={index * 0.05}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
            <LinkIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No links found</p>
          </div>
        )}
      </motion.div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <LinkModal
          title="Add New Link"
          link={newLink}
          setLink={setNewLink}
          onSubmit={handleCreateLink}
          onClose={() => {
            setShowCreateModal(false);
            setNewLink({
              title: "",
              url: "",
              description: "",
              category: "OTHER",
              icon: "",
              color: "",
              pinned: false,
            });
          }}
          submitting={creating}
          submitLabel="Create Link"
        />
      )}

      {/* Edit Link Modal */}
      {showEditModal && editingLink && (
        <LinkModal
          title="Edit Link"
          link={newLink}
          setLink={setNewLink}
          onSubmit={handleEditLink}
          onClose={() => {
            setShowEditModal(false);
            setEditingLink(null);
            setNewLink({
              title: "",
              url: "",
              description: "",
              category: "OTHER",
              icon: "",
              color: "",
              pinned: false,
            });
          }}
          submitting={updating}
          submitLabel="Update Link"
        />
      )}
    </div>
  );
}

function LinkCard({
  link,
  onDelete,
  onEdit,
  onTogglePin,
  deleting,
  pinning,
  delay = 0,
}: {
  link: Link;
  onDelete: (id: string) => void;
  onEdit: (link: Link) => void;
  onTogglePin: (id: string) => void;
  deleting: boolean;
  pinning: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-gradient-to-br from-gray-900 to-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 group"
    >
      {/* Pinned Badge */}
      {link.pinned && (
        <div className="absolute top-4 right-4">
          <Pin className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      {/* Category Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
            categoryColors[link.category] || categoryColors.OTHER
          }`}
        >
          <span>{categoryIcons[link.category] || "🔗"}</span>
          {link.category}
        </span>
      </div>

      {/* Icon */}
      {link.icon && (
        <div className="text-4xl mb-3">{link.icon}</div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
        {link.title}
      </h3>

      {/* Description */}
      {link.description && (
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{link.description}</p>
      )}

      {/* URL */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-4 group/link"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="truncate">{link.url}</span>
        <ExternalLink className="w-4 h-4 flex-shrink-0" />
      </a>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(link.id);
          }}
          disabled={pinning}
          className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Pin className={`w-4 h-4 ${link.pinned ? "fill-yellow-400 text-yellow-400" : ""}`} />
          {link.pinned ? "Unpin" : "Pin"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(link);
          }}
          className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(link.id);
          }}
          disabled={deleting}
          className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function LinkModal({
  title,
  link,
  setLink,
  onSubmit,
  onClose,
  submitting,
  submitLabel,
}: {
  title: string;
  link: any;
  setLink: (link: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
            <input
              type="text"
              value={link.title}
              onChange={(e) => setLink({ ...link, title: e.target.value })}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
              placeholder="GitHub Repository"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => setLink({ ...link, url: e.target.value })}
              required
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={link.description}
              onChange={(e) => setLink({ ...link, description: e.target.value })}
              rows={3}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 resize-none"
              placeholder="Main project repository"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={link.category}
                onChange={(e) => setLink({ ...link, category: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
              >
                <option value="DESIGN">Design</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="MARKETING">Marketing</option>
                <option value="TOOLS">Tools</option>
                <option value="DOCUMENTATION">Documentation</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={link.icon}
                onChange={(e) => setLink({ ...link, icon: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                placeholder="📦"
                maxLength={2}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={link.pinned}
              onChange={(e) => setLink({ ...link, pinned: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-yellow-500 focus:ring-yellow-500/50"
            />
            <label htmlFor="pinned" className="text-sm text-gray-300">
              Pin this link
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 rounded-lg text-white transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? "Processing..." : submitLabel}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

