"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImageCropper } from "./ImageCropper";
import { useToast } from "@/stores/useToast";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (url: string) => void;
}

export function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    // Read file as data URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  });

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setUploading(true);
    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", croppedImageBlob, "profile.jpg");

      // Upload to API
      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload image" }));
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      onImageChange(data.url || data.imageUrl);
      setSelectedImage(null);
      showToast("Profile picture updated!", "success");
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast("Failed to upload image", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      const response = await fetch("/api/profile/remove-image", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove image");
      }

      onImageChange("");
      showToast("Profile picture removed", "success");
    } catch (error) {
      console.error("Error removing image:", error);
      showToast("Failed to remove image", "error");
    }
  };

  if (selectedImage) {
    return (
      <ImageCropper
        image={selectedImage}
        onCropComplete={handleCropComplete}
        onCancel={() => setSelectedImage(null)}
        loading={uploading}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Image */}
      {currentImage && (
        <div className="flex items-center gap-4">
          <img
            src={currentImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/50 hover:border-red-400 rounded-lg transition-colors"
          >
            Remove Photo
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${
            isDragActive
              ? "border-cyan-400 bg-cyan-400/10"
              : "border-slate-600 hover:border-slate-500"
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div>
            <p className="text-sm text-slate-300">
              {isDragActive ? (
                "Drop the image here"
              ) : (
                <>
                  <span className="text-cyan-400">Click to upload</span> or drag
                  and drop
                </>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PNG, JPG, WEBP up to 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}











