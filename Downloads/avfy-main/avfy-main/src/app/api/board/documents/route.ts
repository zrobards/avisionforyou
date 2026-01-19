import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || ((session.user as any).role !== "BOARD" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")

  const documents = await db.boardDocument.findMany({
    where: category ? { category: category as any } : undefined,
    orderBy: { uploadedAt: "desc" },
    include: {
      uploadedBy: {
        select: { name: true },
      },
    },
  })

  return NextResponse.json(documents)
}
