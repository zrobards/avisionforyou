import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { answers } = await request.json()

    if (!answers) {
      return NextResponse.json(
        { error: "Assessment answers required" },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate program match based on answers
    let recommendedProgram = "MINDBODYSOUL_IOP"
    let score = 0

    // Simple scoring logic - can be enhanced
    if (answers.substanceFreeDays < 30) score += 3
    if (answers.mentalHealthConcerns) score += 2
    if (answers.needsHousing) score += 2
    if (answers.spiritualInterest) score += 1

    if (score >= 6 && answers.needsHousing) {
      recommendedProgram = "SURRENDER_PROGRAM"
    } else if (answers.spiritualInterest && score >= 4) {
      recommendedProgram = "MOVING_MOUNTAINS"
    } else if (answers.mentalHealthConcerns) {
      recommendedProgram = "MINDBODYSOUL_IOP"
    }

    // Store assessment
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        answers: answers,
        recommendedProgram: recommendedProgram,
        completed: true
      }
    })

    return NextResponse.json({
      success: true,
      assessment: assessment,
      recommendedProgram: recommendedProgram
    })
  } catch (error) {
    console.error("Assessment error:", error)
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        assessment: true
      }
    })

    if (!user?.assessment) {
      return NextResponse.json(
        { assessment: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      assessment: user.assessment
    })
  } catch (error) {
    console.error("Get assessment error:", error)
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    )
  }
}
