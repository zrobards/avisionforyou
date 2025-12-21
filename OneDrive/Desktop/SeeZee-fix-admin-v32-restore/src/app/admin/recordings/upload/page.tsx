"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Mic,
  FileAudio,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const ALLOWED_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export default function UploadRecordingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Please upload an audio or video file (MP3, WAV, MP4, etc.)");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 500MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Auto-generate title from filename
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } } as any;
      handleFileSelect(event);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      if (projectId) {
        formData.append("projectId", projectId);
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setSuccess(true);
          setTimeout(() => {
            router.push("/admin/recordings");
          }, 2000);
        } else {
          const response = JSON.parse(xhr.responseText);
          setError(response.error || "Upload failed");
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        setError("Upload failed. Please try again.");
        setUploading(false);
      });

      xhr.open("POST", "/api/recordings/upload");
      xhr.send(formData);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Complete!</h2>
          <p className="text-slate-400 mb-6">
            Your recording is being processed. You'll be notified when the transcription is ready.
          </p>
          <Link
            href="/admin/recordings"
            className="text-cyan-400 hover:underline"
          >
            Return to Recordings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/recordings"
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recordings
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Upload className="w-8 h-8 text-pink-400" />
          Upload Recording
        </h1>
        <p className="text-slate-400 mt-1">
          Upload an audio or video file from your meeting
        </p>
      </div>

      {/* Upload Area */}
      <div className="space-y-6">
        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            file
              ? "border-pink-500/50 bg-pink-500/10"
              : "border-white/10 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <FileAudio className="w-7 h-7 text-pink-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          ) : (
            <>
              <Mic className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                Drop your recording here or click to upload
              </p>
              <p className="text-sm text-slate-500">
                Supports MP3, WAV, MP4, WebM • Max 500MB
              </p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Recording Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Client Discovery Call - Acme Corp"
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>

        {/* Project (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Link to Project (optional)
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Project ID or search..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50"
          />
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Uploading...</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & Process
            </>
          )}
        </button>

        {/* Info */}
        <p className="text-xs text-slate-500 text-center">
          Processing typically takes 1-5 minutes depending on recording length.
          You'll receive a notification when transcription is complete.
        </p>
      </div>
    </div>
  );
}

