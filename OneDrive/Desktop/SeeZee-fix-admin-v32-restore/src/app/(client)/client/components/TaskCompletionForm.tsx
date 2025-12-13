"use client";

import { useState } from "react";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskCompletionFormProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    requiresUpload: boolean;
    status: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export function TaskCompletionForm({ task, onComplete, onCancel }: TaskCompletionFormProps) {
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", task.id); // Using task id as project identifier for now

      const response = await fetch(`/api/client/files?projectId=${task.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      setFileUrl(data.url || data.file?.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (task.requiresUpload && !fileUrl) {
      setError("File upload is required for this task");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/client/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: task.id,
          submissionNotes: submissionNotes.trim() || null,
          fileUrl,
          status: "completed",
        }),
      });

      // Handle response - check for errors first
      if (!response.ok) {
        let errorMessage = `Failed to complete task (${response.status})`;
        try {
          // Try to parse JSON error response
          const text = await response.text();
          if (text && text.trim()) {
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
            } catch {
              // If not JSON, use the text as error message
              errorMessage = text;
            }
          }
        } catch (parseError) {
          // If we can't read the response, use the default error message
          console.error("Failed to read error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // For successful responses, the API returns JSON with the updated task
      // We don't need to parse it, but we should handle empty responses gracefully
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const data = await response.json();
          // Successfully parsed - task was updated
        } catch (jsonError) {
          // If response is empty or invalid JSON, that's okay - the task was still updated
          // The status code 200 indicates success even if body is empty
          console.warn("Response was successful but could not parse JSON:", jsonError);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to complete task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Complete Task</h2>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-white/60 text-sm">{task.description}</p>
            )}
          </div>

          {task.requiresUpload && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload File {task.requiresUpload && <span className="text-red-400">*</span>}
              </label>
              {!fileUrl ? (
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-white/60">
                      {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-white flex-1">File uploaded successfully</span>
                  <button
                    onClick={() => setFileUrl(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Notes / Response
            </label>
            <textarea
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Add any notes or responses about this task..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300">Task completed successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (task.requiresUpload && !fileUrl) || success}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Task
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

