import { PrismaClient, UserRole, OrgRole, LeadStatus, ProjectStatus, InvoiceStatus, PaymentStatus, TodoStatus, TodoPriority, NotificationType, ActivityType, MaintenanceStatus, RequestStatus, RequestSource, BudgetTier, ServiceType, ServiceCategory } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// Helper function to get random date in the past
function randomPastDate(daysAgo: number = 30): Date {
  const now = new Date()
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return past
}

// Helper function to get random date in the future
function randomFutureDate(daysAhead: number = 30): Date {
  const now = new Date()
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  return future
}

// Helper function to get random element from array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await clearDatabase()

  // ============================================
  // 1. USERS
  // ============================================
  console.log('\n📝 Creating users...')
  
  const ownerEmail = process.env.OWNER_EMAIL || 'sean@seezee.studio'
  const ownerName = process.env.OWNER_NAME || 'Sean - SeeZee Studio'

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: ownerName,
      role: UserRole.CEO,
      emailVerified: new Date(),
      company: 'SeeZee Studio',
    },
  })

  // Create staff users
  const staffUsers = [
    { email: 'zach@seezee.studio', name: 'Zach Smith', role: UserRole.STAFF },
    { email: 'seezee.enterprises@gmail.com', name: 'Admin User', role: UserRole.ADMIN },
    { email: 'designer@seezee.studio', name: 'Sarah Designer', role: UserRole.DESIGNER },
    { email: 'dev@seezee.studio', name: 'Mike Developer', role: UserRole.DEV },
    { email: 'frontend@seezee.studio', name: 'Alex Frontend', role: UserRole.FRONTEND },
    { email: 'backend@seezee.studio', name: 'Jordan Backend', role: UserRole.BACKEND },
  ]

  const createdStaff = []
  for (const staff of staffUsers) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: { role: staff.role },
      create: {
        email: staff.email,
        name: staff.name,
        role: staff.role,
        emailVerified: new Date(),
        company: 'SeeZee Studio',
      },
    })
    createdStaff.push(user)
  }

  // Create client users
  const clientUsers = [
    { email: 'john@acmecorp.com', name: 'John Doe', company: 'Acme Corp' },
    { email: 'jane@techstart.io', name: 'Jane Smith', company: 'TechStart' },
    { email: 'bob@innovate.com', name: 'Bob Johnson', company: 'Innovate Inc' },
    { email: 'alice@digital.com', name: 'Alice Williams', company: 'Digital Solutions' },
    { email: 'charlie@nextgen.com', name: 'Charlie Brown', company: 'NextGen Labs' },
    { email: 'diana@cloudtech.com', name: 'Diana Prince', company: 'CloudTech' },
    { email: 'edward@smartbiz.com', name: 'Edward Lee', company: 'SmartBiz' },
    { email: 'fiona@webpro.com', name: 'Fiona Green', company: 'WebPro' },
  ]

  const createdClients = []
  for (const client of clientUsers) {
    const user = await prisma.user.upsert({
      where: { email: client.email },
      update: {},
      create: {
        email: client.email,
        name: client.name,
        role: UserRole.CLIENT,
        emailVerified: new Date(),
        company: client.company,
      },
    })
    createdClients.push(user)
  }

  console.log(`✅ Created ${createdStaff.length} staff users and ${createdClients.length} client users`)

  // ============================================
  // 2. ORGANIZATIONS
  // ============================================
  console.log('\n🏢 Creating organizations...')

  const organization = await prisma.organization.upsert({
    where: { slug: 'seezee-studio' },
    update: {},
    create: {
      name: 'SeeZee Studio',
      slug: 'seezee-studio',
      email: ownerEmail,
      website: 'https://seezee.studio',
      country: 'US',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      address: '123 Tech Street',
      phone: '+1 (555) 123-4567',
      members: {
        create: {
          userId: owner.id,
          role: OrgRole.OWNER,
        },
      },
    },
  })

  // Create client organizations
  const clientOrgs = []
  for (let i = 0; i < createdClients.length; i++) {
    const client = createdClients[i]
    const org = await prisma.organization.create({
      data: {
        name: client.company || `${client.name}'s Company`,
        slug: `${client.company?.toLowerCase().replace(/\s+/g, '-') || `client-${i}`}`,
        email: client.email,
        website: `https://${client.company?.toLowerCase().replace(/\s+/g, '') || 'example'}.com`,
        country: 'US',
        city: randomElement(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
        state: randomElement(['CA', 'NY', 'TX', 'IL', 'AZ']),
        zipCode: String(Math.floor(10000 + Math.random() * 90000)),
        phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        members: {
          create: {
            userId: client.id,
            role: OrgRole.OWNER,
          },
        },
      },
    })
    clientOrgs.push(org)
  }

  console.log(`✅ Created ${clientOrgs.length + 1} organizations`)

  // ============================================
  // 3. LEADS
  // ============================================
  console.log('\n🎯 Creating leads...')

  const leadStatuses: LeadStatus[] = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.PROPOSAL_SENT, LeadStatus.CONVERTED, LeadStatus.LOST]
  const serviceTypes: ServiceCategory[] = [ServiceCategory.BUSINESS_WEBSITE, ServiceCategory.NONPROFIT_WEBSITE, ServiceCategory.PERSONAL_WEBSITE, ServiceCategory.MAINTENANCE_PLAN]
  const timelines = ['rush', 'standard', 'extended']
  const budgets = ['1000-2500', '2500-5000', '5000-10000', '10000+']

  const leads = []
  for (let i = 0; i < 25; i++) {
    const status = randomElement(leadStatuses)
    const serviceType = randomElement(serviceTypes)
    const org = i < clientOrgs.length ? clientOrgs[i % clientOrgs.length] : null

    const lead = await prisma.lead.create({
      data: {
        name: `Lead ${i + 1}`,
        email: `lead${i + 1}@example.com`,
        phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        company: org?.name || `Company ${i + 1}`,
        message: `Interested in ${serviceType.toLowerCase().replace('_', ' ')} development services. Looking for a modern solution.`,
        serviceType,
        timeline: randomElement(timelines),
        budget: randomElement(budgets),
        source: randomElement(['website', 'referral', 'social', 'direct', 'ad']),
        status,
        requirements: {
          features: ['responsive', 'cms', 'seo'],
          pages: Math.floor(5 + Math.random() * 15),
          design_preference: randomElement(['modern', 'minimal', 'bold', 'classic']),
        },
        organizationId: org?.id,
        createdAt: randomPastDate(60),
        convertedAt: status === LeadStatus.CONVERTED ? randomPastDate(30) : null,
      },
    })
    leads.push(lead)
  }

  console.log(`✅ Created ${leads.length} leads`)

  // ============================================
  // 4. PROJECTS
  // ============================================
  console.log('\n🚀 Creating projects...')

  const projectStatuses: ProjectStatus[] = [ProjectStatus.LEAD, ProjectStatus.QUOTED, ProjectStatus.DEPOSIT_PAID, ProjectStatus.ACTIVE, ProjectStatus.REVIEW, ProjectStatus.COMPLETED, ProjectStatus.MAINTENANCE, ProjectStatus.CANCELLED]
  
  const projects = []
  for (let i = 0; i < 15; i++) {
    const status = randomElement(projectStatuses)
    const org = clientOrgs[i % clientOrgs.length]
    const lead = i < leads.length ? leads[i] : null
    const assignee = randomElement(createdStaff)

    const project = await prisma.project.create({
      data: {
        name: `${org.name} - ${randomElement(['Website', 'Web App', 'E-commerce', 'Mobile App', 'Branding'])}`,
        description: `Custom ${randomElement(['website', 'web application', 'e-commerce platform'])} for ${org.name}`,
        status,
        budget: new Decimal(Math.floor(2500 + Math.random() * 20000)),
        startDate: status !== ProjectStatus.LEAD ? randomPastDate(45) : null,
        endDate: status === ProjectStatus.COMPLETED ? randomPastDate(10) : (status === ProjectStatus.ACTIVE ? randomFutureDate(30) : null),
        organizationId: org.id,
        assigneeId: assignee.id,
        leadId: lead?.id,
        maintenancePlan: randomElement(['basic', 'standard', 'premium', null]),
        maintenanceStatus: randomElement(['active', 'pending', null]),
        nextBillingDate: randomFutureDate(30),
        githubRepo: `https://github.com/seezee/${org.slug}-${i}`,
        createdAt: randomPastDate(60),
      },
    })
    projects.push(project)
  }

  console.log(`✅ Created ${projects.length} projects`)

  // ============================================
  // 5. INVOICES & PAYMENTS
  // ============================================
  console.log('\n💰 Creating invoices and payments...')

  const invoiceStatuses: InvoiceStatus[] = [InvoiceStatus.DRAFT, InvoiceStatus.SENT, InvoiceStatus.PAID, InvoiceStatus.OVERDUE]
  const invoices = []

  for (let i = 0; i < 20; i++) {
    const project = randomElement(projects)
    const org = clientOrgs[i % clientOrgs.length]
    const status = randomElement(invoiceStatuses)
    const amount = new Decimal(Math.floor(500 + Math.random() * 5000))
    const tax = new Decimal(amount.toNumber() * 0.08)
    const total = new Decimal(amount.toNumber() + tax.toNumber())

    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${String(1000 + i).padStart(4, '0')}`,
        title: `Invoice for ${project.name}`,
        description: `Payment for ${project.name} development services`,
        status,
        amount,
        tax,
        total,
        currency: 'USD',
        dueDate: randomFutureDate(30),
        organizationId: org.id,
        projectId: project.id,
        invoiceType: randomElement(['deposit', 'final', 'subscription', 'custom']),
        isFirstInvoice: i < 5,
        sentAt: status !== InvoiceStatus.DRAFT ? randomPastDate(20) : null,
        paidAt: status === InvoiceStatus.PAID ? randomPastDate(10) : null,
        customerApprovedAt: status === InvoiceStatus.PAID ? randomPastDate(15) : null,
        adminApprovedAt: status === InvoiceStatus.PAID ? randomPastDate(20) : null,
        createdAt: randomPastDate(30),
        items: {
          create: [
            {
              description: 'Development Services',
              quantity: 1,
              rate: amount,
              amount,
            },
            {
              description: 'Design Services',
              quantity: 1,
              rate: new Decimal(amount.toNumber() * 0.3),
              amount: new Decimal(amount.toNumber() * 0.3),
            },
          ],
        },
      },
    })

    // Create payment if invoice is paid
    if (status === InvoiceStatus.PAID) {
      await prisma.payment.create({
        data: {
          amount: total,
          status: PaymentStatus.COMPLETED,
          method: randomElement(['stripe', 'bank_transfer', 'check']),
          currency: 'USD',
          invoiceId: invoice.id,
          processedAt: invoice.paidAt,
          stripeChargeId: `ch_${Math.random().toString(36).substring(7)}`,
        },
      })
    }

    invoices.push(invoice)
  }

  console.log(`✅ Created ${invoices.length} invoices`)

  // ============================================
  // 6. TODOS
  // ============================================
  console.log('\n✅ Creating todos...')

  const todoStatuses: TodoStatus[] = [TodoStatus.TODO, TodoStatus.IN_PROGRESS, TodoStatus.SUBMITTED, TodoStatus.DONE]
  const todoPriorities: TodoPriority[] = [TodoPriority.LOW, TodoPriority.MEDIUM, TodoPriority.HIGH]

  for (let i = 0; i < 30; i++) {
    const project = randomElement(projects)
    const assignee = randomElement(createdStaff)
    const creator = randomElement([...createdStaff, owner])

    await prisma.todo.create({
      data: {
        title: `Task ${i + 1}: ${randomElement(['Design mockups', 'Implement feature', 'Fix bug', 'Code review', 'Write tests', 'Update documentation'])}`,
        description: `Complete ${randomElement(['design', 'development', 'testing', 'documentation'])} task for ${project.name}`,
        status: randomElement(todoStatuses),
        priority: randomElement(todoPriorities),
        assignedToId: assignee.id,
        createdById: creator.id,
        projectId: project.id,
        dueDate: randomFutureDate(14),
        completedAt: randomElement(todoStatuses) === TodoStatus.DONE ? randomPastDate(5) : null,
        createdAt: randomPastDate(30),
      },
    })
  }

  console.log(`✅ Created 30 todos`)

  // ============================================
  // 7. TOOLS
  // ============================================
  console.log('\n🔧 Creating tools...')

  const toolsData = [
    { name: 'Figma', category: 'Design', url: 'https://figma.com', description: 'Design and prototyping tool', pricing: 'Free/Paid', tags: ['design', 'ui', 'prototyping'] },
    { name: 'Notion', category: 'Productivity', url: 'https://notion.so', description: 'All-in-one workspace', pricing: 'Free/Paid', tags: ['productivity', 'docs', 'notes'] },
    { name: 'GitHub', category: 'Development', url: 'https://github.com', description: 'Code repository and version control', pricing: 'Free/Paid', tags: ['git', 'code', 'version-control'] },
    { name: 'Vercel', category: 'Development', url: 'https://vercel.com', description: 'Deployment platform', pricing: 'Free/Paid', tags: ['deployment', 'hosting', 'ci-cd'] },
    { name: 'Stripe', category: 'Tools', url: 'https://stripe.com', description: 'Payment processing', pricing: 'Paid', tags: ['payments', 'billing', 'api'] },
    { name: 'Slack', category: 'Communication', url: 'https://slack.com', description: 'Team communication', pricing: 'Free/Paid', tags: ['chat', 'team', 'communication'] },
    { name: 'Linear', category: 'Productivity', url: 'https://linear.app', description: 'Issue tracking and project management', pricing: 'Paid', tags: ['project-management', 'issues', 'tracking'] },
    { name: 'Postman', category: 'Development', url: 'https://postman.com', description: 'API development and testing', pricing: 'Free/Paid', tags: ['api', 'testing', 'development'] },
    { name: 'Canva', category: 'Design', url: 'https://canva.com', description: 'Graphic design tool', pricing: 'Free/Paid', tags: ['design', 'graphics', 'marketing'] },
    { name: 'Google Analytics', category: 'Analytics', url: 'https://analytics.google.com', description: 'Web analytics platform', pricing: 'Free', tags: ['analytics', 'tracking', 'metrics'] },
    { name: 'Hotjar', category: 'Analytics', url: 'https://hotjar.com', description: 'User behavior analytics', pricing: 'Paid', tags: ['analytics', 'heatmaps', 'user-research'] },
    { name: 'Typeform', category: 'Tools', url: 'https://typeform.com', description: 'Interactive forms and surveys', pricing: 'Free/Paid', tags: ['forms', 'surveys', 'data-collection'] },
    { name: 'Loom', category: 'Communication', url: 'https://loom.com', description: 'Video messaging', pricing: 'Free/Paid', tags: ['video', 'communication', 'screencast'] },
    { name: '1Password', category: 'Tools', url: 'https://1password.com', description: 'Password manager', pricing: 'Paid', tags: ['security', 'passwords', 'vault'] },
    { name: 'Cloudflare', category: 'Tools', url: 'https://cloudflare.com', description: 'CDN and security', pricing: 'Free/Paid', tags: ['cdn', 'security', 'performance'] },
  ]

  for (const tool of toolsData) {
    await prisma.tool.create({
      data: {
        name: tool.name,
        category: tool.category,
        url: tool.url,
        description: tool.description,
        pricing: tool.pricing,
        tags: tool.tags,
        logoUrl: null,
        createdAt: randomPastDate(90),
      },
    })
  }

  console.log(`✅ Created ${toolsData.length} tools`)

  // ============================================
  // 8. NOTIFICATIONS
  // ============================================
  console.log('\n🔔 Creating notifications...')

  const notificationTypes: NotificationType[] = [NotificationType.INFO, NotificationType.SUCCESS, NotificationType.WARNING, NotificationType.ERROR]

  for (let i = 0; i < 50; i++) {
    const user = randomElement([...createdStaff, ...createdClients, owner])
    const type = randomElement(notificationTypes)

    await prisma.notification.create({
      data: {
        type,
        title: randomElement([
          'New lead assigned',
          'Invoice paid',
          'Project milestone completed',
          'Task assigned to you',
          'Payment received',
          'New message received',
        ]),
        message: `This is a ${type.toLowerCase()} notification for ${user.name}`,
        userId: user.id,
        read: Math.random() > 0.5,
        createdAt: randomPastDate(30),
      },
    })
  }

  console.log(`✅ Created 50 notifications`)

  // ============================================
  // 9. ACTIVITIES
  // ============================================
  console.log('\n📊 Creating activities...')

  const activityTypes: ActivityType[] = [
    ActivityType.LEAD_CREATED,
    ActivityType.LEAD_UPDATED,
    ActivityType.PROJECT_CREATED,
    ActivityType.PROJECT_UPDATED,
    ActivityType.TASK_COMPLETED,
    ActivityType.USER_JOINED,
    ActivityType.INVOICE_PAID,
    ActivityType.MAINTENANCE_DUE,
  ]

  for (let i = 0; i < 40; i++) {
    const user = randomElement([...createdStaff, ...createdClients, owner])
    const type = randomElement(activityTypes)
    const project = randomElement(projects)

    await prisma.activity.create({
      data: {
        type,
        title: `${type.replace(/_/g, ' ')}`,
        description: `Activity related to ${project.name}`,
        userId: user.id,
        entityType: 'project',
        entityId: project.id,
        metadata: {
          projectId: project.id,
          projectName: project.name,
        },
        read: Math.random() > 0.6,
        readAt: Math.random() > 0.6 ? randomPastDate(5) : null,
        createdAt: randomPastDate(30),
      },
    })
  }

  console.log(`✅ Created 40 activities`)

  // ============================================
  // 10. SYSTEM LOGS
  // ============================================
  console.log('\n📝 Creating system logs...')

  const actions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'EXPORT']
  const areas = ['admin', 'pipeline', 'projects', 'invoices', 'clients', 'settings']

  for (let i = 0; i < 60; i++) {
    const user = randomElement([...createdStaff, owner])
    const action = randomElement(actions)
    const area = randomElement(areas)

    await prisma.systemLog.create({
      data: {
        action,
        entityType: randomElement(['user', 'project', 'invoice', 'lead', 'client']),
        entityId: `entity-${i}`,
        userId: user.id,
        area,
        message: `${action} action performed in ${area}`,
        metadata: {
          area,
          action,
          timestamp: new Date().toISOString(),
        },
        createdAt: randomPastDate(30),
      },
    })
  }

  console.log(`✅ Created 60 system logs`)

  // ============================================
  // 11. REQUESTS
  // ============================================
  console.log('\n📋 Creating requests...')

  for (let i = 0; i < 20; i++) {
    const project = randomElement(projects)

    await prisma.request.create({
      data: {
        title: `Request ${i + 1}: ${randomElement(['Add feature', 'Fix bug', 'Update design', 'Change content', 'Add integration'])}`,
        details: `Detailed description of the requested change for ${project.name}`,
        state: randomElement(['new', 'in_progress', 'completed', 'rejected']),
        projectId: project.id,
        source: randomElement([RequestSource.MANUAL, RequestSource.AI]),
        createdAt: randomPastDate(30),
      },
    })
  }

  console.log(`✅ Created 20 requests`)

  // ============================================
  // 12. SUBSCRIPTIONS & CHANGE REQUESTS
  // ============================================
  console.log('\n💳 Creating subscriptions...')

  const subscriptions = []
  for (let i = 0; i < 8; i++) {
    const project = projects[i % projects.length]
    const planNames = ['Standard Monthly', 'Premium Monthly', 'Standard Annual', 'Premium Annual']

    const subscription = await prisma.subscription.create({
      data: {
        projectId: project.id,
        stripeId: `sub_${Math.random().toString(36).substring(7)}`,
        priceId: `price_${Math.random().toString(36).substring(7)}`,
        status: randomElement(['active', 'canceled', 'past_due']),
        planName: randomElement(planNames),
        currentPeriodEnd: randomFutureDate(30),
        changeRequestsAllowed: randomElement([2, 5, 10]),
        changeRequestsUsed: Math.floor(Math.random() * 3),
        resetDate: randomFutureDate(30),
        createdAt: randomPastDate(60),
      },
    })
    subscriptions.push(subscription)

    // Create change requests for some subscriptions
    if (i < 5) {
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        await prisma.changeRequest.create({
          data: {
            projectId: project.id,
            subscriptionId: subscription.id,
            description: `Change request ${j + 1} for ${project.name}`,
            status: randomElement(['pending', 'approved', 'completed', 'rejected']),
            completedAt: randomElement(['completed', 'rejected']).includes('completed') ? randomPastDate(5) : null,
            createdAt: randomPastDate(20),
          },
        })
      }
    }
  }

  console.log(`✅ Created ${subscriptions.length} subscriptions`)

  // ============================================
  // 13. MAINTENANCE SCHEDULES
  // ============================================
  console.log('\n🔧 Creating maintenance schedules...')

  const maintenanceStatuses: MaintenanceStatus[] = [MaintenanceStatus.ACTIVE, MaintenanceStatus.UPCOMING, MaintenanceStatus.OVERDUE, MaintenanceStatus.COMPLETED]

  for (let i = 0; i < 15; i++) {
    const project = randomElement(projects)
    const status = randomElement(maintenanceStatuses)

    await prisma.maintenanceSchedule.create({
      data: {
        projectId: project.id,
        title: `Maintenance ${i + 1}: ${randomElement(['Security update', 'Performance optimization', 'Bug fixes', 'Feature update', 'Database backup'])}`,
        description: `Scheduled maintenance for ${project.name}`,
        status,
        scheduledFor: status === MaintenanceStatus.UPCOMING ? randomFutureDate(30) : randomPastDate(30),
        completedAt: status === MaintenanceStatus.COMPLETED ? randomPastDate(10) : null,
        notes: `Maintenance notes for ${project.name}`,
        createdAt: randomPastDate(60),
      },
    })
  }

  console.log(`✅ Created 15 maintenance schedules`)

  // ============================================
  // 14. PROJECT MILESTONES
  // ============================================
  console.log('\n🎯 Creating project milestones...')

  for (let i = 0; i < 25; i++) {
    const project = randomElement(projects)

    await prisma.projectMilestone.create({
      data: {
        projectId: project.id,
        title: `Milestone ${i + 1}: ${randomElement(['Design Phase', 'Development Phase', 'Testing Phase', 'Launch Phase', 'Review Phase'])}`,
        description: `Milestone description for ${project.name}`,
        dueDate: randomFutureDate(30),
        completed: Math.random() > 0.5,
        completedAt: Math.random() > 0.5 ? randomPastDate(10) : null,
        createdAt: randomPastDate(45),
      },
    })
  }

  console.log(`✅ Created 25 project milestones`)

  // ============================================
  // 15. FEED EVENTS
  // ============================================
  console.log('\n📰 Creating feed events...')

  const feedEventTypes = ['project_created', 'milestone_completed', 'invoice_paid', 'task_completed', 'update_posted']

  for (let i = 0; i < 30; i++) {
    const project = randomElement(projects)
    const type = randomElement(feedEventTypes)

    await prisma.feedEvent.create({
      data: {
        projectId: project.id,
        type,
        payload: {
          message: `${type} for ${project.name}`,
          timestamp: new Date().toISOString(),
        },
        createdAt: randomPastDate(30),
      },
    })
  }

  console.log(`✅ Created 30 feed events`)

  // ============================================
  // 16. MESSAGE THREADS
  // ============================================
  console.log('\n💬 Creating message threads...')

  for (let i = 0; i < 15; i++) {
    const project = randomElement(projects)
    const client = randomElement(createdClients)

    const thread = await prisma.messageThread.create({
      data: {
        projectId: project.id,
        clientId: client.id,
        subject: `Discussion about ${project.name}`,
        status: randomElement(['open', 'closed', 'pending']),
        createdAt: randomPastDate(30),
        messages: {
          create: [
            {
              senderId: client.id,
              role: 'client',
              content: `Initial message about ${project.name}`,
              createdAt: randomPastDate(30),
            },
            {
              senderId: randomElement(createdStaff).id,
              role: 'admin',
              content: `Response to client message about ${project.name}`,
              createdAt: randomPastDate(25),
            },
          ],
        },
      },
    })
  }

  console.log(`✅ Created 15 message threads`)

  // ============================================
  // 17. PROJECT REQUESTS
  // ============================================
  console.log('\n📝 Creating project requests...')

  const requestStatuses: RequestStatus[] = [RequestStatus.DRAFT, RequestStatus.SUBMITTED, RequestStatus.REVIEWING, RequestStatus.APPROVED, RequestStatus.REJECTED]
  const budgetTiers: BudgetTier[] = [BudgetTier.SMALL, BudgetTier.MEDIUM, BudgetTier.LARGE, BudgetTier.ENTERPRISE]

  for (let i = 0; i < 12; i++) {
    const client = randomElement(createdClients)
    const status = randomElement(requestStatuses)

    await prisma.projectRequest.create({
      data: {
        userId: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        contactEmail: client.email,
        title: `Project Request ${i + 1}`,
        description: `Detailed project request description ${i + 1}`,
        projectType: randomElement(['website', 'webapp', 'ecommerce']),
        goal: `Project goal ${i + 1}`,
        timeline: randomElement(['rush', 'standard', 'extended']),
        budget: randomElement(budgetTiers),
        status,
        services: [randomElement([ServiceType.WEB_APP, ServiceType.WEBSITE, ServiceType.ECOMMERCE])],
        notes: `Additional notes for request ${i + 1}`,
        createdAt: randomPastDate(45),
      },
    })
  }

  console.log(`✅ Created 12 project requests`)

  // ============================================
  // 18. PRICING RULES
  // ============================================
  console.log('\n💵 Creating pricing rules...')

  const pricingRules = [
    {
      name: 'Standard Website',
      description: 'Professional business website with modern design',
      serviceType: 'website',
      basePrice: 2500,
      features: {
        responsive: 0,
        cms: 500,
        contact_form: 0,
        seo: 300,
        analytics: 200,
        blog: 400,
        gallery: 300,
        social_media: 100,
      },
    },
    {
      name: 'E-commerce Store',
      description: 'Full-featured online store with payment processing',
      serviceType: 'ecommerce',
      basePrice: 5000,
      features: {
        responsive: 0,
        product_catalog: 0,
        shopping_cart: 0,
        payment_processing: 800,
        inventory_management: 600,
        order_management: 400,
        customer_accounts: 300,
        analytics: 200,
        seo: 300,
        reviews: 250,
      },
    },
    {
      name: 'Web Application',
      description: 'Custom web application with advanced functionality',
      serviceType: 'webapp',
      basePrice: 8000,
      features: {
        user_authentication: 800,
        database_integration: 1200,
        api_development: 1500,
        admin_dashboard: 1000,
        real_time_features: 1200,
        third_party_integrations: 800,
        automated_testing: 600,
        deployment: 400,
      },
    },
    {
      name: 'Landing Page',
      description: 'High-converting single page for marketing campaigns',
      serviceType: 'landing',
      basePrice: 1200,
      features: {
        responsive: 0,
        contact_form: 0,
        analytics: 200,
        a_b_testing: 300,
        lead_capture: 250,
        social_proof: 150,
      },
    },
  ]

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: { name: rule.name },
      update: {},
      create: {
        name: rule.name,
        description: rule.description,
        serviceType: rule.serviceType,
        basePrice: rule.basePrice,
        features: rule.features,
        rushMultiplier: 1.5,
        standardMultiplier: 1.0,
        extendedMultiplier: 0.9,
        active: true,
      },
    })
  }

  console.log(`✅ Created ${pricingRules.length} pricing rules`)

  // ============================================
  // 19. RESOURCES
  // ============================================
  console.log('\n📚 Creating resources...')

  const resources = [
    { title: 'Getting Started Guide', description: 'Complete guide to getting started', url: 'https://docs.example.com/start', tags: ['guide', 'onboarding'] },
    { title: 'API Documentation', description: 'Complete API reference', url: 'https://docs.example.com/api', tags: ['api', 'docs'] },
    { title: 'Design System', description: 'Our design system and components', url: 'https://design.example.com', tags: ['design', 'components'] },
    { title: 'Best Practices', description: 'Development best practices', url: 'https://docs.example.com/best-practices', tags: ['development', 'guidelines'] },
  ]

  for (const resource of resources) {
    await prisma.resource.create({
      data: {
        title: resource.title,
        description: resource.description,
        url: resource.url,
        visibility: 'PUBLIC',
        tags: resource.tags,
        createdById: owner.id,
        createdAt: randomPastDate(90),
      },
    })
  }

  console.log(`✅ Created ${resources.length} resources`)

  // ============================================
  // 20. TRAININGS & ASSIGNMENTS
  // ============================================
  console.log('\n🎓 Creating trainings and assignments...')

  const trainings = [
    { title: 'Onboarding Training', type: 'DOC', description: 'Complete onboarding process', url: 'https://training.example.com/onboarding', tags: ['onboarding', 'training'] },
    { title: 'Security Best Practices', type: 'VIDEO', description: 'Learn security best practices', url: 'https://training.example.com/security', tags: ['security', 'video'] },
    { title: 'Project Management', type: 'QUIZ', description: 'Test your project management knowledge', url: 'https://training.example.com/pm', tags: ['pm', 'quiz'] },
  ]

  for (const training of trainings) {
    const createdTraining = await prisma.training.create({
      data: {
        title: training.title,
        type: training.type as any,
        description: training.description,
        url: training.url,
        visibility: 'INTERNAL',
        tags: training.tags,
        createdById: owner.id,
        createdAt: randomPastDate(60),
      },
    })

    // Create assignments for some trainings
    if (Math.random() > 0.3) {
      await prisma.assignment.create({
        data: {
          trainingId: createdTraining.id,
          audienceType: 'ROLE',
          role: UserRole.STAFF,
          dueAt: randomFutureDate(30),
          createdById: owner.id,
          createdAt: randomPastDate(30),
        },
      })
    }
  }

  console.log(`✅ Created ${trainings.length} trainings`)

  // ============================================
  // 21. MESSAGES (Legacy)
  // ============================================
  console.log('\n📧 Creating legacy messages...')

  const sampleMessages = [
    { name: 'Mike Wilson', email: 'mike@example.com', subject: 'Project Inquiry', content: "I'm interested in your web development services", status: 'UNREAD' },
    { name: 'Lisa Chen', email: 'lisa@company.net', subject: 'Website Redesign', content: 'We need to redesign our company website', status: 'REPLIED' },
    { name: 'Tom Anderson', email: 'tom@startup.io', subject: 'E-commerce Platform', content: 'Looking for an e-commerce solution', status: 'UNREAD' },
  ]

  for (const message of sampleMessages) {
    const existing = await prisma.message.findFirst({ where: { email: message.email } })
    if (!existing) {
      await prisma.message.create({ data: message })
    }
  }

  console.log(`✅ Created ${sampleMessages.length} legacy messages`)

  console.log('\n🎉 Database seeded successfully with comprehensive mock data!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: ${createdStaff.length + createdClients.length + 1} (1 owner, ${createdStaff.length} staff, ${createdClients.length} clients)`)
  console.log(`   - Organizations: ${clientOrgs.length + 1}`)
  console.log(`   - Leads: ${leads.length}`)
  console.log(`   - Projects: ${projects.length}`)
  console.log(`   - Invoices: ${invoices.length}`)
  console.log(`   - Tools: ${toolsData.length}`)
  console.log(`   - Subscriptions: ${subscriptions.length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
