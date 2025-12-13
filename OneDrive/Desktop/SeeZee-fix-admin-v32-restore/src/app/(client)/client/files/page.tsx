"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, Upload, Download, Eye, FileText, Image as ImageIcon, Video, Calendar, ArrowLeft } from "lucide-react";
import { fetchJson } from "@/lib/client-api";
import { motion } from "framer-motion";

interface File {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  type: string;
  mimeType: string;
  url: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await fetchJson<{ files: File[] }>("/api/client/files");
      setFiles(data.files || []);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileList[0]);

      const response = await fetch("/api/client/files", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      // Refresh files list
      await fetchFiles();
      if (e.target) {
        e.target.value = "";
      }
    } catch (err: any) {
      console.error("Failed to upload file:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string, type: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (mimeType.startsWith("video/")) return <Video className="w-5 h-5 text-purple-400" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "IMAGE":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "VIDEO":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "DOCUMENT":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trinity-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Files</h1>
          <p className="text-white/60 text-sm">View and manage files from all your projects</p>
        </div>
        <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Upload File
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Folder className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No files yet</h3>
          <p className="text-white/60 mb-6">Upload files to get started</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Upload Your First File
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-trinity-red/50 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 p-3 bg-white/5 rounded-lg">
                  {getFileIcon(file.mimeType, file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate mb-1 group-hover:text-blue-300 transition-colors">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getFileTypeColor(file.type)}`}>
                      {file.type}
                    </span>
                    <span className="text-xs text-white/40">{formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-blue-500/30"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </a>
                <a
                  href={file.url}
                  download
                  className="flex-1 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-cyan-500/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Uploading...
        </div>
      )}
    </div>
  );
}
