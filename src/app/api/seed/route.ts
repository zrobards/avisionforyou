import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Must be logged in" },
        { status: 401 }
      )
    }

    // Create Programs
    const programs = []
    const programsData = [
      {
        name: 'Surrender Program',
        slug: 'surrender-prog-seed',
        description: 'A 6-9 month peer-driven recovery program',
        longDescription: 'Based on our original flagship model',
        programType: 'SHELTER',
        schedule: 'Residential',
        location: '1675 Story Ave, Louisville, KY 40206',
        phone: '(502) 555-0100',
        email: 'surrender@avisionforyou.org',
        capacity: 50
      },
      {
        name: 'MindBodySoul IOP',
        slug: 'mindbodysoul-iop-seed',
        description: 'Clinical intensive outpatient program',
        longDescription: 'Intensive outpatient with therapy',
        programType: 'IOP',
        schedule: 'Evening & Weekends',
        location: '1675 Story Ave, Louisville, KY 40206',
        phone: '(502) 555-0101',
        email: 'iop@avisionforyou.org',
        capacity: 30
      },
      {
        name: 'Moving Mountains Ministry',
        slug: 'moving-mountains-seed',
        description: 'Spiritual recovery and discipleship ministry',
        longDescription: 'Spiritual arm of A Vision For You',
        programType: 'SELF_HELP',
        schedule: 'Weekly Classes',
        location: '1675 Story Ave, Louisville, KY 40206',
        phone: '(502) 555-0102',
        email: 'ministry@avisionforyou.org',
        capacity: 100
      },
      {
        name: "Women's Program",
        slug: 'womens-program-seed',
        description: 'Specialized recovery program for women',
        longDescription: 'Trauma-informed for women',
        programType: 'SHELTER',
        schedule: 'Residential',
        location: '1675 Story Ave, Louisville, KY 40206',
        phone: '(502) 555-0103',
        email: 'womens@avisionforyou.org',
        capacity: 25
      }
    ]

    for (const prog of programsData) {
      try {
        const p = await db.program.findUnique({ where: { slug: prog.slug } })
        if (!p) {
          const created = await db.program.create({ data: prog })
          programs.push(created)
        } else {
          programs.push(p)
        }
      } catch (e) {
        // Duplicate slug, find existing
        const existing = await db.program.findFirst({ 
          where: { name: prog.name }
        })
        if (existing) programs.push(existing)
      }
    }

    // Create Test Users
    const testUsers = []
    const userEmails = [
      'john@example.com',
      'sarah@example.com',
      'michael@example.com',
      'jessica@example.com',
      'david@example.com'
    ]

    for (const email of userEmails) {
      try {
        let user = await db.user.findUnique({ where: { email } })
        if (!user) {
          const passwordHash = await bcrypt.hash('TestPassword123!', 10)
          user = await db.user.create({
            data: {
              email,
              name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
              passwordHash,
              role: 'USER',
              emailVerified: new Date()
            }
          })
        }
        testUsers.push(user)
      } catch (e) {
        // User exists
      }
    }

    // Create Program Sessions
    const today = new Date()
    const sessions = []

    for (let i = 0; i < 12; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + (i * 2) + 1)
      date.setHours(10 + (i % 8), 0, 0, 0)

      const programId = programs[i % programs.length].id
      const format = i % 3 === 0 ? 'ONLINE' : 'IN_PERSON'

      const session = await db.programSession.create({
        data: {
          programId,
          title: `Recovery Session ${i + 1}`,
          description: `Join us for our ${i % 2 === 0 ? 'morning' : 'evening'} recovery session.`,
          startDate: date,
          endDate: new Date(date.getTime() + 90 * 60000),
          format,
          link: format === 'ONLINE' ? 'https://zoom.us/j/mock-meeting-id' : null,
          location: format === 'IN_PERSON' ? '1675 Story Ave, Louisville, KY 40206' : null,
          capacity: 30
        }
      })
      sessions.push(session)
    }

    // Create RSVPs
    for (let i = 0; i < testUsers.length; i++) {
      for (let j = 0; j < Math.min(3, sessions.length); j++) {
        const randomSession = sessions[Math.floor(Math.random() * sessions.length)]
        try {
          await db.rSVP.create({
            data: {
              userId: testUsers[i].id,
              sessionId: randomSession.id,
              status: 'CONFIRMED'
            }
          })
        } catch (e) {
          // Skip duplicates
        }
      }
    }

    // Create Assessments
    const assessmentScores = [
      { answers: { q1: 180, q2: 'Good', q3: 'Stable', q4: 'Yes', q5: 'No', q6: 'Working' }, program: 'MindBodySoul IOP' },
      { answers: { q1: 30, q2: 'Struggling', q3: 'Unstable', q4: 'No', q5: 'Yes', q6: 'Unemployed' }, program: 'Surrender Program' },
      { answers: { q1: 90, q2: 'Good', q3: 'Stable', q4: 'Yes', q5: 'No', q6: 'Working' }, program: "Women's Program" },
      { answers: { q1: 200, q2: 'Excellent', q3: 'Stable', q4: 'Yes', q5: 'No', q6: 'Working' }, program: 'Moving Mountains Ministry' },
      { answers: { q1: 60, q2: 'Fair', q3: 'Improving', q4: 'Yes', q5: 'Yes', q6: 'Seeking' }, program: 'MindBodySoul IOP' }
    ]

    for (let i = 0; i < testUsers.length; i++) {
      try {
        const existing = await db.assessment.findUnique({
          where: { userId: testUsers[i].id }
        })
        if (!existing) {
          const assessment = assessmentScores[i % assessmentScores.length]
          await db.assessment.create({
            data: {
              userId: testUsers[i].id,
              answers: assessment.answers,
              recommendedProgram: assessment.program,
              completed: true
            }
          })
        }
      } catch (e) {
        // Skip
      }
    }

    // Create Donations
    const donationNames = [
      'John Smith', 'Sarah Johnson', 'Michael Davis', 'Jessica Martinez',
      'Robert Wilson', 'Emily Brown', 'James Taylor', 'Anonymous',
      'David Anderson', 'Lisa Garcia'
    ]

    let donationsCreated = 0
    for (let i = 0; i < 20; i++) {
      try {
        const amount = Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 100) + 25
        const frequency = Math.random() > 0.8 ? 'MONTHLY' : Math.random() > 0.6 ? 'YEARLY' : 'ONE_TIME'
        const status = Math.random() > 0.95 ? 'FAILED' : Math.random() > 0.9 ? 'PENDING' : 'COMPLETED'
        const daysAgo = Math.floor(Math.random() * 90)

        await db.donation.create({
          data: {
            userId: Math.random() > 0.6 ? testUsers[Math.floor(Math.random() * testUsers.length)].id : null,
            amount,
            currency: 'USD',
            frequency,
            status,
            name: donationNames[Math.floor(Math.random() * donationNames.length)],
            email: Math.random() > 0.5 ? `donor${i}@example.com` : null,
            comment: ['Supporting the mission', 'Keep up the great work!', null, null][Math.floor(Math.random() * 4)],
            createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
          }
        })
        donationsCreated++
      } catch (e) {
        // Skip duplicates
      }
    }

    return NextResponse.json({
      success: true,
      usersCreated: testUsers.length,
      meetingsCreated: sessions.length,
      donationsCreated,
      programsCreated: programs.length
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Failed to seed database: " + (error as Error).message },
      { status: 500 }
    )
  }
}
