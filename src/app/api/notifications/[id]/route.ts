import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params

    const notification = await db.notification.findFirst({
      where: { id, userId: user.id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await db.notification.update({
      where: { id },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification PATCH error:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
