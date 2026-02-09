import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { answers } = await request.json()

    if (!answers) {
      return NextResponse.json(
        { error: "Assessment answers required" },
        { status: 400 }
      )
    }

    // Calculate program match based on answers
    // answers.substanceFreeDays is 0-5 scale (0=<7days, 5=6+months)
    let recommendedProgram = "MINDBODYSOUL_IOP"
    let score = 0

    const sobrietyLevel = typeof answers.substanceFreeDays === 'number' ? answers.substanceFreeDays : 0

    if (sobrietyLevel <= 1) score += 3       // Less than 2 weeks
    else if (sobrietyLevel <= 2) score += 2  // 2-4 weeks
    else if (sobrietyLevel <= 3) score += 1  // 1-3 months

    if (answers.mentalHealthConcerns === true) score += 2
    if (answers.needsHousing === true) score += 2
    if (answers.spiritualInterest === true) score += 1
    if (answers.priorTreatment === true) score += 1
    if (answers.employment === false) score += 1

    // Determine recommended program
    if (answers.needsHousing && sobrietyLevel <= 2) {
      recommendedProgram = "SURRENDER_PROGRAM"
    } else if (answers.spiritualInterest && score >= 4) {
      recommendedProgram = "MOVING_MOUNTAINS"
    } else if (answers.mentalHealthConcerns || score >= 5) {
      recommendedProgram = "MINDBODYSOUL_IOP"
    } else if (score <= 2 && sobrietyLevel >= 4) {
      recommendedProgram = "DUI_CLASSES"
    }

    // If user is logged in, save to database
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      })

      if (user) {
        // Use upsert so repeat submissions update instead of failing
        await db.assessment.upsert({
          where: { userId: user.id },
          update: {
            answers: answers,
            recommendedProgram,
            completed: true,
          },
          create: {
            userId: user.id,
            answers: answers,
            recommendedProgram,
            completed: true,
          }
        })
      }
    }

    // Send notification email to admissions (non-blocking)
    try {
      await sendEmail({
        to: 'admissions@avisionforyourecovery.org',
        subject: `New Assessment Submission - Recommended: ${recommendedProgram}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #7f3d8b; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">New Assessment Submission</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px;">
              <h2 style="color: #1f2937;">Recommended Program: ${recommendedProgram.replace(/_/g, ' ')}</h2>
              <p style="color: #374151;">Score: ${score}/10</p>
              <h3 style="color: #1f2937;">Answers:</h3>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Substance-free days: ${['Less than 7 days', '1-2 weeks', '2-4 weeks', '1-3 months', '3-6 months', '6+ months'][sobrietyLevel] || 'Unknown'}</li>
                <li>Mental health concerns: ${answers.mentalHealthConcerns ? 'Yes' : 'No'}</li>
                <li>Needs housing: ${answers.needsHousing ? 'Yes' : 'No'}</li>
                <li>Spiritual interest: ${answers.spiritualInterest ? 'Yes' : 'No'}</li>
                <li>Prior treatment: ${answers.priorTreatment ? 'Yes' : 'No'}</li>
                <li>Currently employed: ${answers.employment ? 'Yes' : 'No'}</li>
              </ul>
              ${session?.user?.email ? `<p style="color: #374151;">User: ${session.user.name || ''} (${session.user.email})</p>` : '<p style="color: #6b7280;">Anonymous submission</p>'}
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error("Failed to send assessment notification email:", emailError)
    }

    return NextResponse.json({
      success: true,
      recommendedProgram,
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
        { assessment: null },
        { status: 200 }
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
