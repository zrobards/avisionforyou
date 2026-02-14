import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET all resources (for admin table)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resources = await db.communityResource.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }]
  })

  return NextResponse.json(resources)
}

// POST new resource
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, url, category, order, active } = await request.json()

  if (!title || !url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const resource = await db.communityResource.create({
    data: {
      title,
      description: description || null,
      url,
      category: category || null,
      order: order || 0,
      active: active !== undefined ? active : true
    }
  })

  return NextResponse.json(resource)
}
