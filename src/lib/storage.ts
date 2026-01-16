import { put, head, del } from '@vercel/blob'

/**
 * Storage utility for Vercel Blob
 * Handles file uploads, retrieval, and deletion
 */

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
  size: number
}

/**
 * Upload a file to Vercel Blob storage
 * @param file - File to upload
 * @param filename - Optional custom filename (defaults to file.name)
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  file: File | Buffer,
  filename?: string
): Promise<UploadResult> {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.ts:22',message:'uploadFile entry',data:{hasFilename:!!filename,isFile:file instanceof File,isBuffer:file instanceof Buffer},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN

  if (!blobReadWriteToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set')
  }

  const fileBuffer = file instanceof File ? await file.arrayBuffer() : file
  const fileName = filename || (file instanceof File ? file.name : 'upload')
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.ts:33',message:'Filename determined',data:{fileName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  // Upload to Vercel Blob
  const blob = await put(fileName, fileBuffer, {
    access: 'public',
    token: blobReadWriteToken,
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    contentDisposition: blob.contentDisposition,
    size: blob.size,
  }
}

/**
 * Get file metadata from Vercel Blob
 * @param url - Blob URL
 * @returns File metadata or null if not found
 */
export async function getFileMetadata(url: string) {
  try {
    const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!blobReadWriteToken) {
      return null
    }

    const metadata = await head(url, {
      token: blobReadWriteToken,
    })

    return metadata
  } catch (error) {
    console.error('Error getting file metadata:', error)
    return null
  }
}

/**
 * Delete a file from Vercel Blob storage
 * @param url - Blob URL to delete
 * @returns True if successful, false otherwise
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!blobReadWriteToken) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set')
    }

    await del(url, {
      token: blobReadWriteToken,
    })

    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Check if a URL is a Vercel Blob URL
 * @param url - URL to check
 * @returns True if it's a blob URL
 */
export function isBlobUrl(url: string): boolean {
  return url.startsWith('https://') && url.includes('.public.blob.vercel-storage.com')
}

/**
 * Check if a URL is a data URL (base64)
 * @param url - URL to check
 * @returns True if it's a data URL
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:')
}
