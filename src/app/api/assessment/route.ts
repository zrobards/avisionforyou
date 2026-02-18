import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { encryptJSON, decryptJSON } from "@/lib/encryption"
import { AssessmentAnswersSchema } from "@/lib/validation"
import { rateLimit, assessmentLimiter, getClientIp } from "@/lib/rateLimit"
import { logActivity } from "@/lib/notifications"
import { logger } from '@/lib/logger'
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = getClientIp(request)
    const rl = await rateLimit(assessmentLimiter, ip)
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)

    // Validate input with Zod
    let answers: any
    try {
      const validated = await AssessmentAnswersSchema.parseAsync(await request.json())
      answers = validated.answers
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Invalid assessment data", details: err.errors.map(e => e.message) },
          { status: 400 }
        )
      }
      throw err
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

    // If user is logged in, save to database (encrypted)
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      })

      if (user) {
        // Use upsert so repeat submissions update instead of failing
        await db.assessment.upsert({
          where: { userId: user.id },
          update: {
            answers: encryptJSON(answers),
            recommendedProgram,
            completed: true,
          },
          create: {
            userId: user.id,
            answers: encryptJSON(answers),
            recommendedProgram,
            completed: true,
          }
        })

        // Audit log: PHI write
        await logActivity(
          'PHI_WRITE',
          'Assessment submitted',
          `User ${user.id} submitted assessment. Recommended: ${recommendedProgram}`,
          '/admin/admissions'
        )
      }
    }

    // Send HIPAA-safe notification email to admissions (no PHI)
    try {
      await sendEmail({
        to: 'admissions@avisionforyourecovery.org',
        subject: `New Assessment Submission - Action Required`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #7f3d8b; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">New Assessment Submission</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px;">
              <p style="color: #374151;">A new assessment has been received.</p>
              <p style="color: #374151;"><strong>Recommended Program:</strong> ${recommendedProgram.replace(/_/g, ' ')}</p>
              <p style="color: #374151;">Please view the full details in the <a href="${process.env.NEXTAUTH_URL || 'https://avisionforyou.org'}/admin/admissions">admin panel</a>.</p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
                <p style="color: #92400e; margin: 0; font-size: 12px;">This email intentionally omits personal health information for HIPAA compliance.</p>
              </div>
            </div>
          </div>
        `
      })
    } catch (emailError: unknown) {
      logger.error({ err: emailError }, "Failed to send assessment notification email")
    }

    return NextResponse.json({
      success: true,
      recommendedProgram,
    })
  } catch (error: unknown) {
    logger.error({ err: error }, "Assessment error")
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

    // Audit log: PHI read
    await logActivity(
      'PHI_READ',
      'Assessment accessed',
      `User ${user.id} accessed their assessment`,
      '/assessment'
    )

    return NextResponse.json({
      assessment: {
        ...user.assessment,
        answers: decryptJSON(user.assessment.answers),
      }
    })
  } catch (error: unknown) {
    logger.error({ err: error }, "Get assessment error")
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    )
  }
}
