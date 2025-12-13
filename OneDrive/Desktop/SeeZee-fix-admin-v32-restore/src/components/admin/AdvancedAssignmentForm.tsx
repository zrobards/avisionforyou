"use client";

import { useState, useEffect } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { FiX, FiUpload, FiFile, FiCalendar, FiType, FiCheckCircle } from "react-icons/fi";

interface Project {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
}

interface AdvancedAssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdvancedAssignmentForm({ isOpen, onClose, onSuccess }: AdvancedAssignmentFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    type: "general",
    dueDate: "",
    requiresUpload: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; name: string }>>([]);

  const { startUpload, isUploading } = useUploadThing("adminProjectFileUploader", {
    onClientUploadComplete: (files) => {
      // Match uploaded files with pending files by index
      const newFiles = files.map((f, index) => {
        const pendingFile = pendingFiles[index];
        return {
          name: pendingFile?.name || f.name,
          url: f.url,
        };
      });
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setPendingFiles([]);
      setUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setPendingFiles([]);
      setUploading(false);
      alert("Failed to upload file. Please try again.");
    },
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const pending = fileArray.map((file) => ({ file, name: file.name }));
    setPendingFiles(pending);
    setUploading(true);
    await startUpload(fileArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploading || isUploading) {
      alert("Please wait for file uploads to complete before submitting.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/admin/tasks/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          dueDate: formData.dueDate || null,
          requiresUpload: formData.requiresUpload,
          attachments: uploadedFiles.map((f) => f.url), // Include uploaded file URLs
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create assignment");
      }

      // Reset form
      setFormData({
        projectId: "",
        title: "",
        description: "",
        type: "general",
        dueDate: "",
        requiresUpload: false,
      });
      setUploadedFiles([]);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create assignment:", error);
      alert(error.message || "Failed to create assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Client Assignment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Project <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-trinity-red/50"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.organization.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-trinity-red/50"
              placeholder="Assignment title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-trinity-red/50 resize-none"
              placeholder="Detailed assignment description"
            />
          </div>

          {/* Type and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FiType className="w-4 h-4 inline mr-1" />
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-trinity-red/50"
              >
                <option value="general">General</option>
                <option value="questionnaire">Questionnaire</option>
                <option value="review">Review</option>
                <option value="approval">Approval</option>
                <option value="content">Content</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FiCalendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-trinity-red/50"
              />
            </div>
          </div>

          {/* Requires Upload */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresUpload"
              checked={formData.requiresUpload}
              onChange={(e) => setFormData({ ...formData, requiresUpload: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-slate-800 text-trinity-red focus:ring-trinity-red/50"
            />
            <label htmlFor="requiresUpload" className="text-sm text-white">
              Requires file upload from client
            </label>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FiUpload className="w-4 h-4 inline mr-1" />
              Attach Files (Optional)
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={uploading || isUploading}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex flex-col items-center justify-center py-4 px-6 rounded-lg transition-all ${
                  uploading || isUploading
                    ? "bg-slate-800/50 cursor-wait"
                    : "bg-slate-800/30 hover:bg-slate-800/50"
                }`}
              >
                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-300">
                  {uploading || isUploading ? "Uploading..." : "Click to upload files"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC, Images, ZIP (max 32MB per file)
                </span>
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400">Uploaded files:</p>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg"
                  >
                    <FiFile className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white flex-1 truncate">{file.name}</span>
                    <FiCheckCircle className="w-4 h-4 text-green-400" />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || isUploading || !formData.projectId || !formData.title || !formData.description}
              className="flex-1 px-4 py-2 bg-trinity-red hover:bg-trinity-red/80 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : uploading || isUploading ? "Uploading files..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

