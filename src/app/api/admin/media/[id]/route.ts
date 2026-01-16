import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { deleteFile, isBlobUrl } from '@/lib/storage'

// PATCH - Update media tags/usage
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { tags, usage } = body

    const mediaItem = await prisma.mediaItem.update({
      where: { id: params.id },
      data: {
        tags: tags !== undefined ? tags : undefined,
        usage: usage !== undefined ? usage : undefined
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

    return NextResponse.json(mediaItem)
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}

// DELETE - Delete media
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get media item to get the URL before deleting
    const mediaItem = await prisma.mediaItem.findUnique({
      where: { id: params.id }
    })

    if (!mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/[id]/route.ts:76',message:'Before delete operations',data:{mediaId:params.id,mediaUrl:mediaItem.url,isBlob:isBlobUrl(mediaItem.url)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Delete from blob storage if it's a blob URL
    let blobDeleteSuccess = false
    if (isBlobUrl(mediaItem.url)) {
      try {
        blobDeleteSuccess = await deleteFile(mediaItem.url)
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/[id]/route.ts:84',message:'Blob delete result',data:{success:blobDeleteSuccess,url:mediaItem.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/[id]/route.ts:88',message:'Blob delete error',data:{error:String(error),url:mediaItem.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('Error deleting file from blob storage:', error)
        // Continue with database deletion even if blob deletion fails
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/[id]/route.ts:96',message:'Before database delete',data:{mediaId:params.id,blobDeleteSuccess},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Delete from database
    await prisma.mediaItem.delete({
      where: { id: params.id }
    })
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/c26e3558-f2ea-4576-a2b6-64a9cd37eb67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'media/[id]/route.ts:101',message:'Database delete succeeded',data:{mediaId:params.id,blobDeleteSuccess},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
