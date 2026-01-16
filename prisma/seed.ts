// Use CommonJS-style imports to avoid Node ESM warnings during ts-node execution in build
// (keeps package.json type as CommonJS and prevents MODULE_TYPELESS_PACKAGE_JSON warning)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const isProd = process.env.NODE_ENV === 'production'

  // Clear existing data only in non-production to avoid wiping real data
  if (!isProd) {
    await prisma.rSVP.deleteMany()
    await prisma.donation.deleteMany()
    await prisma.assessment.deleteMany()
    await prisma.programSession.deleteMany()
    await prisma.program.deleteMany()
    await prisma.blogPost.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.user.deleteMany()
    console.log('🧹 Cleared existing data (non-production environment)')
  } else {
    console.log('⏩ Skipping data wipe in production')
  }

  const upsertUser = async (email: string, data: any) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log(`ℹ️  User already exists, skipping: ${email}`)
      return existing
    }
    return prisma.user.create({ data })
  }

  const getOrCreateProgram = async (prog: any) => {
    const existing = await prisma.program.findUnique({ where: { slug: prog.slug } })
    if (existing) {
      console.log(`ℹ️  Program already exists, skipping: ${prog.slug}`)
      return existing
    }
    return prisma.program.create({ data: prog })
  }

  // Create Programs
  const programData = [
    {
      name: 'Surrender Program',
      slug: 'surrender-program',
      description: 'A 6-9 month peer-driven recovery program',
      longDescription: 'Based on our original flagship model, the Surrender Program is a 6-9 month voluntary self-help social model recovery program.',
      programType: 'SHELTER',
      schedule: 'Residential',
      location: '1675 Story Ave, Louisville, KY 40206',
      phone: '(502) 555-0100',
      email: 'surrender@avisionforyou.org',
      capacity: 50
    },
    {
      name: 'MindBodySoul IOP',
      slug: 'mindbodysoul-iop',
      description: 'Clinical intensive outpatient program',
      longDescription: 'Our comprehensive intensive outpatient program combining evidence-based therapy, psychiatric care, and holistic wellness approaches.',
      programType: 'IOP',
      schedule: 'Evening & Weekends',
      location: '1675 Story Ave, Louisville, KY 40206',
      phone: '(502) 555-0101',
      email: 'iop@avisionforyou.org',
      capacity: 30
    },
    {
      name: 'Moving Mountains Ministry',
      slug: 'moving-mountains-ministry',
      description: 'Spiritual recovery and discipleship ministry',
      longDescription: 'Moving Mountains Ministry represents the spiritual arm of A Vision For You, birthed from the conviction that true recovery involves spiritual renewal.',
      programType: 'SELF_HELP',
      schedule: 'Weekly Classes',
      location: '1675 Story Ave, Louisville, KY 40206',
      phone: '(502) 555-0102',
      email: 'ministry@avisionforyou.org',
      capacity: 100
    },
    {
      name: 'DUI Education & Supervision',
      slug: 'dui-classes',
      description: 'Court-ordered DUI education, supervision, and support services',
      longDescription: 'Comprehensive DUI education program meeting court requirements with individualized supervision and support. We work with the legal system to provide evidence-based education and intervention.',
      programType: 'OUTPATIENT',
      schedule: 'Flex Hours',
      location: '1675 Story Ave, Louisville, KY 40206',
      phone: '(502) 555-0103',
      email: 'dui@avisionforyou.org',
      capacity: 50
    }
  ]

  const programs: Array<{ id: string; name: string }> = []
  for (const prog of programData) {
    const program = await getOrCreateProgram(prog)
    programs.push(program)
  }

  console.log(`✅ Created ${programs.length} programs`)

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10)
  const adminUser = await upsertUser('admin@avisionforyou.org', {
    email: 'admin@avisionforyou.org',
    name: 'Admin User',
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    emailVerified: new Date(),
    profile: {
      create: {
        bio: 'A Vision For You Administrator',
        phone: '(502) 555-9999'
      }
    }
  })

  console.log(`✅ Created admin user: ${adminUser.email}`)

  // Create Test User (for easy testing)
  const testUserPasswordHash = await bcrypt.hash('TestUser123!', 10)
  const testUser = await upsertUser('testuser@avisionforyou.org', {
    email: 'testuser@avisionforyou.org',
    name: 'Test User',
    passwordHash: testUserPasswordHash,
    role: 'USER',
    emailVerified: new Date(),
    profile: {
      create: {
        bio: 'Regular user account for testing',
        phone: '(502) 555-0001'
      }
    }
  })

  console.log(`✅ Created test user: ${testUser.email}`)

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
    const passwordHash = await bcrypt.hash('TestPassword123!', 10)
    const existingUser = await prisma.user.findUnique({ where: { email } })
    const user = existingUser
      ? existingUser
      : await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            passwordHash,
            role: 'USER',
            emailVerified: new Date(),
            profile: {
              create: {
                bio: 'Recovery journey member',
                phone: `(502) 555-${Math.floor(Math.random() * 9000) + 1000}`
              }
            }
          }
        })
    testUsers.push(user)
  }

  console.log(`✅ Created ${testUsers.length} test users`)

  // Create Program Sessions (Meetings)
  const today = new Date()
  const sessions = []

  // Map program IDs by index
  const programIds = [
    programs[0].id, // Surrender
    programs[1].id, // MindBodySoul
    programs[2].id, // Moving Mountains
    programs[3].id  // DUI Classes
  ]

  // Create meetings for next 30 days
  for (let i = 0; i < 12; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + (i * 2) + 1)
    date.setHours(10 + (i % 8), 0, 0, 0)

    const programId = programIds[i % 4]
    const format = i % 3 === 0 ? 'ONLINE' : 'IN_PERSON'

    const session = await prisma.programSession.create({
      data: {
        programId,
        title: `Recovery Session ${i + 1}`,
        description: `Join us for our ${i % 2 === 0 ? 'morning' : 'evening'} recovery session covering spiritual growth and peer support.`,
        startDate: date,
        endDate: new Date(date.getTime() + 90 * 60000), // 90 minutes
        format,
        link: format === 'ONLINE' ? 'https://zoom.us/j/mock-meeting-id' : null,
        location: format === 'IN_PERSON' ? '1675 Story Ave, Louisville, KY 40206' : null,
        capacity: 30
      }
    })
    sessions.push(session)
  }

  console.log(`✅ Created ${sessions.length} program sessions`)

  // Create RSVPs (users signing up for sessions)
  for (let i = 0; i < testUsers.length; i++) {
    for (let j = 0; j < Math.min(3, sessions.length); j++) {
      const randomSession = sessions[Math.floor(Math.random() * sessions.length)]
      try {
        await prisma.rSVP.create({
          data: {
            userId: testUsers[i].id,
            sessionId: randomSession.id,
            status: 'CONFIRMED'
          }
        })
      } catch (e) {
        // Skip if duplicate
      }
    }
  }

  console.log(`✅ Created RSVPs for test users`)

  // Create Assessments for users
  const assessmentScores = [
    { answers: { q1: 180, q2: 'Good', q3: 'Stable', q4: 'Yes', q5: 'No', q6: 'Working' }, program: 'MindBodySoul IOP' },
    { answers: { q1: 30, q2: 'Struggling', q3: 'Unstable', q4: 'No', q5: 'Yes', q6: 'Unemployed' }, program: 'Surrender Program' },
    { answers: { q1: 90, q2: 'Good', q3: 'Stable', q4: 'Yes', q5: 'No', q6: 'Working' }, program: 'DUI Education & Supervision' },
    { answers: { q1: 200, q2: 'Excellent', q3: 'Stable', q4: 'Yes', q5: 'No', q6: 'Working' }, program: 'Moving Mountains Ministry' },
    { answers: { q1: 60, q2: 'Fair', q3: 'Improving', q4: 'Yes', q5: 'Yes', q6: 'Seeking' }, program: 'MindBodySoul IOP' }
  ]

  for (let i = 0; i < testUsers.length; i++) {
    const assessment = assessmentScores[i % assessmentScores.length]
    const existingAssessment = await prisma.assessment.findUnique({ where: { userId: testUsers[i].id } })
    if (existingAssessment) {
      continue
    }
    await prisma.assessment.create({
      data: {
        userId: testUsers[i].id,
        answers: assessment.answers,
        recommendedProgram: assessment.program,
        completed: true
      }
    })
  }

  console.log(`✅ Created assessments for test users`)

  // Create Donations (mix of one-time and recurring)
  const donationNames = [
    'John Smith',
    'Sarah Johnson',
    'Michael Davis',
    'Jessica Martinez',
    'Robert Wilson',
    'Emily Brown',
    'James Taylor',
    'Anonymous',
    'David Anderson',
    'Lisa Garcia'
  ]

  const donations = []
  for (let i = 0; i < 20; i++) {
    const amount = Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 100) + 25
    const frequency = Math.random() > 0.8 ? 'MONTHLY' : Math.random() > 0.6 ? 'YEARLY' : 'ONE_TIME'
    const status = Math.random() > 0.95 ? 'FAILED' : Math.random() > 0.9 ? 'PENDING' : 'COMPLETED'
    const daysAgo = Math.floor(Math.random() * 90)

    const donation = await prisma.donation.create({
      data: {
        userId: Math.random() > 0.6 ? testUsers[Math.floor(Math.random() * testUsers.length)].id : null,
        amount,
        currency: 'USD',
        frequency,
        status,
        name: donationNames[Math.floor(Math.random() * donationNames.length)],
        email: Math.random() > 0.5 ? `donor${i}@example.com` : null,
        comment: [
          'Supporting the mission',
          'Keep up the great work!',
          'God bless your ministry',
          'Hope this helps',
          'Monthly support',
          null,
          null,
          null
        ][Math.floor(Math.random() * 8)],
        stripeId: `stripe_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      }
    })
    donations.push(donation)
  }

  console.log(`✅ Created ${donations.length} donations`)

  // Create Sample Blog Posts
  const blogPostsData = [
    {
      title: 'Recovery is a Journey, Not a Destination',
      slug: 'recovery-journey',
      content: 'Taking the first step towards recovery is often the hardest part. Learn about the importance of community support and how our programs can help you...',
      excerpt: 'Discover the power of community in your recovery journey',
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      readTimeMinutes: 5,
      views: 124,
      likes: 18,
      category: 'Recovery Stories',
      tags: JSON.stringify(['recovery', 'community', 'healing'])
    },
    {
      title: 'The Power of Peer Support in Recovery',
      slug: 'peer-support',
      content: 'Peer support is the heart of our Surrender Program. Learn how connecting with others who understand your journey can transform your life...',
      excerpt: 'How peer support accelerates recovery',
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      readTimeMinutes: 6,
      views: 89,
      likes: 12,
      category: 'Program Insights',
      tags: JSON.stringify(['peer-support', 'community', 'program'])
    },
    {
      title: "New DUI Education & Supervision Program",
      slug: 'new-dui-program',
      content: 'We are excited to announce our comprehensive DUI Education & Supervision program, designed to meet court requirements while providing evidence-based intervention and support...',
      excerpt: 'Court-ordered DUI education and supervision program now available',
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      readTimeMinutes: 4,
      views: 156,
      likes: 28,
      category: 'Program Updates',
      tags: JSON.stringify(['dui-classes', 'announcement', 'new-program'])
    }
  ]

  let blogCount = 0
  for (const post of blogPostsData) {
    const existingPost = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existingPost) {
      console.log(`ℹ️  Blog post already exists, skipping: ${post.slug}`)
      continue
    }
    await prisma.blogPost.create({
      data: post
    })
    blogCount++
  }

  console.log(`✅ Created ${blogCount} blog posts`)

  console.log('\n✨ Database seed completed successfully!')
  console.log('\n📝 Test Accounts:')
  console.log(`   Admin: admin@avisionforyou.org / AdminPassword123!`)
  console.log(`   Test User: testuser@avisionforyou.org / TestUser123!`)
  const userList = userEmails.join(', ')
  console.log(`   Other Users: ${userList} (all with password: TestPassword123!)`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
