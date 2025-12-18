import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Must be logged in" },
        { status: 401 }
      )
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const { role } = await request.json()

    if (!['USER', 'STAFF', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Must be logged in" },
        { status: 401 }
      )
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Delete the user - cascade will handle related records automatically
    // (RSVPs, Donations, BlogPosts, MediaItems, Newsletters, etc.)
    await db.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
