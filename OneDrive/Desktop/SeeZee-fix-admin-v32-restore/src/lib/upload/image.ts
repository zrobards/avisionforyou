/**
 * Image upload and manipulation utilities
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "File must be a JPEG, PNG, or WebP image",
    };
  }
  
  return { valid: true };
}

/**
 * Generate avatar URL from initials
 * Uses UI Avatars API as fallback
 */
export function generateAvatarUrl(name: string): string {
  const initials = name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  // Use UI Avatars API with SeeZee brand colors
  const params = new URLSearchParams({
    name: initials,
    background: "dc2626", // trinity-red
    color: "ffffff",
    size: "200",
    bold: "true",
  });
  
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Convert file to base64 data URL
 */
export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Create an image element from a data URL
 */
export async function createImageFromDataURL(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    
    img.src = dataURL;
  });
}

/**
 * Crop and resize image using canvas
 */
export async function cropImage(
  imageDataURL: string,
  crop: { x: number; y: number; width: number; height: number },
  outputSize: number = 400
): Promise<string> {
  const img = await createImageFromDataURL(imageDataURL);
  
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  
  // Draw cropped image
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize
  );
  
  // Convert to data URL
  return canvas.toDataURL("image/jpeg", 0.9);
}

/**
 * Compress image to reduce file size
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  const dataURL = await fileToDataURL(file);
  const img = await createImageFromDataURL(dataURL);
  
  // Calculate new dimensions
  let width = img.width;
  let height = img.height;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  
  // Draw image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to compress image"));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const dataURL = await fileToDataURL(file);
  const img = await createImageFromDataURL(dataURL);
  
  return {
    width: img.width,
    height: img.height,
  };
}

/**
 * Delete image from UploadThing
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract file key from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileKey = pathname.split("/").pop();
    
    if (!fileKey) {
      throw new Error("Invalid image URL");
    }
    
    // Call UploadThing delete endpoint
    const response = await fetch("/api/uploadthing/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileKey }),
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}




