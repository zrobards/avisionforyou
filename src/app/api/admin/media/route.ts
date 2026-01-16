import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { uploadFile, isDataUrl, deleteFile } from '@/lib/storage'

// GET - Fetch all media
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const media = await prisma.mediaItem.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(media, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

// POST - Upload new media
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:56',message:'Parsing form data',data:{hasFile:!!file,fileName:file?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    let tags: string[] = []
    let usage: string[] = []
    try {
      tags = JSON.parse(formData.get('tags') as string || '[]')
      usage = JSON.parse(formData.get('usage') as string || '[]')
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:62',message:'Tags/usage parsed successfully',data:{tagsCount:tags.length,usageCount:usage.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:66',message:'JSON parse error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: 'Invalid tags or usage format' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'other'

    // Upload to Vercel Blob storage
    let blobUrl: string
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:78',message:'Before blob upload',data:{fileName:file.name,fileSize:file.size,fileType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      const uploadResult = await uploadFile(file, `media/${Date.now()}-${file.name}`)
      blobUrl = uploadResult.url
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:82',message:'Blob upload succeeded',data:{blobUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:86',message:'Blob upload failed',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Error uploading to blob storage:', error)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:95',message:'Before database insert',data:{blobUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let mediaItem
    try {
      mediaItem = await prisma.mediaItem.create({
      data: {
        filename: file.name,
        type: fileType,
        url: blobUrl, // Vercel Blob URL
        size: file.size,
        mimeType: file.type,
        tags: tags,
        usage: usage,
        uploadedById: (session.user as any).id
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:108',message:'Database insert succeeded',data:{mediaItemId:mediaItem.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(mediaItem)
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:113',message:'Database insert failed after blob upload',data:{error:String(error),blobUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // If database insert fails, try to delete the orphaned blob
      if (blobUrl) {
        try {
          await deleteFile(blobUrl)
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:119',message:'Cleaned up orphaned blob',data:{blobUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } catch (cleanupError) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/route.ts:123',message:'Failed to cleanup orphaned blob',data:{blobUrl,error:String(cleanupError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
      }
      console.error('Error uploading media:', error)
      return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
