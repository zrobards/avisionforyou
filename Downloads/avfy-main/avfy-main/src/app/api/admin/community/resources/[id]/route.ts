import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET single resource
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resource = await db.communityResource.findUnique({
    where: { id: params.id }
  })

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(resource)
}

// PUT update resource
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, url, category, order, active } = await request.json()

  const resource = await db.communityResource.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(url && { url }),
      ...(category !== undefined && { category }),
      ...(order !== undefined && { order }),
      ...(active !== undefined && { active })
    }
  })

  return NextResponse.json(resource)
}

// DELETE resource
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.communityResource.delete({
    where: { id: params.id }
  })

  return NextResponse.json({ success: true })
}
