# Board System - Sample Seed Data

## Creating Test Board Member Account

Add this to your `prisma/seed.ts` file or run directly in Prisma Studio:

```typescript
// Create a test board member account
const boardMember = await prisma.user.upsert({
  where: { email: 'board@avisionforyou.org' },
  update: {},
  create: {
    email: 'board@avisionforyou.org',
    name: 'Board Member Test',
    role: 'BOARD',
    passwordHash: await bcrypt.hash('BoardTest123!', 10), // Change this password
  },
})

console.log('Created board member:', boardMember.email)
```

## Sample Board Updates

```typescript
// Sample board updates
const updates = [
  {
    title: 'Q1 2026 Financial Summary',
    content: 'Our first quarter has shown remarkable growth. Total donations reached $125,000, exceeding our target by 15%. Program participation increased by 23% compared to Q4 2025. We successfully launched the new MindBodySoul IOP program with 12 participants in the first cohort.',
    category: 'FINANCIAL_SUMMARY',
    priority: true,
  },
  {
    title: 'Executive Director Appointment',
    content: 'The board has unanimously approved the appointment of Sarah Johnson as our new Executive Director, effective March 1st, 2026. Sarah brings 15 years of nonprofit leadership experience and a deep commitment to our mission. Please join us in welcoming her to the AVFY family.',
    category: 'EXECUTIVE_DIRECTIVE',
    priority: true,
  },
  {
    title: 'Updated Governance Policies',
    content: 'The governance committee has completed the annual review of our policies and procedures. Key updates include revised conflict of interest guidelines, updated financial controls, and enhanced data privacy measures. All board members are required to review and acknowledge these changes by March 15th.',
    category: 'GOVERNANCE',
    priority: false,
  },
  {
    title: 'Annual Gala Planning Update',
    content: 'Planning for our 2026 Annual Gala is well underway. The event is scheduled for June 15th at the Grand Hotel. We have secured commitments from three major sponsors and expect 200+ attendees. Board members are encouraged to invite potential donors and community partners.',
    category: 'BOARD_UPDATE',
    priority: false,
  },
  {
    title: 'New Board Member Orientation',
    content: 'We will be holding a comprehensive orientation session for our three new board members on February 28th at 6 PM. The session will cover our mission, programs, financial overview, governance structure, and board member responsibilities. All current board members are welcome to attend.',
    category: 'BOARD_UPDATE',
    priority: false,
  },
]

// Create updates
for (const update of updates) {
  await prisma.boardUpdate.create({
    data: {
      ...update,
      authorId: adminUser.id, // Use your admin user ID
    },
  })
}

console.log('Created', updates.length, 'board updates')
```

## Sample Board Documents

```typescript
// Note: For actual file uploads, you'll need to use the admin interface
// This is just for reference on what documents to create

const sampleDocuments = [
  {
    title: '2026 Annual Budget',
    description: 'Approved budget for fiscal year 2026 including program allocations and operational expenses',
    category: 'FINANCIAL_SUMMARY',
    fileName: '2026-annual-budget.pdf',
  },
  {
    title: 'Board Member Handbook',
    description: 'Comprehensive guide covering board member roles, responsibilities, and expectations',
    category: 'GOVERNANCE',
    fileName: 'board-member-handbook.pdf',
  },
  {
    title: 'Q4 2025 Financial Report',
    description: 'Detailed financial report for Q4 2025 including income statement and balance sheet',
    category: 'FINANCIAL_SUMMARY',
    fileName: 'q4-2025-financial-report.pdf',
  },
  {
    title: 'Strategic Plan 2026-2028',
    description: 'Three-year strategic plan outlining organizational goals and initiatives',
    category: 'EXECUTIVE_DIRECTIVE',
    fileName: 'strategic-plan-2026-2028.pdf',
  },
  {
    title: 'Conflict of Interest Policy',
    description: 'Updated policy regarding conflicts of interest for board members and staff',
    category: 'GOVERNANCE',
    fileName: 'conflict-of-interest-policy.pdf',
  },
]

console.log('Sample documents to upload:', sampleDocuments.length)
```

## SQL Script for Quick Setup

If you prefer SQL, run these commands in your database:

```sql
-- Create test board member (update password hash as needed)
INSERT INTO users (id, email, name, role, "passwordHash", "createdAt", "updatedAt")
VALUES (
  'board_test_001',
  'board@avisionforyou.org',
  'Board Member Test',
  'BOARD',
  '$2a$10$YourHashedPasswordHere', -- Generate with bcrypt
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET role = 'BOARD';

-- Create sample board updates (replace 'admin_user_id' with actual admin ID)
INSERT INTO board_updates (id, title, content, category, priority, "authorId", "createdAt", "updatedAt")
VALUES
  (
    gen_random_uuid()::text,
    'Q1 2026 Financial Summary',
    'Our first quarter has shown remarkable growth. Total donations reached $125,000, exceeding our target by 15%.',
    'FINANCIAL_SUMMARY',
    true,
    'admin_user_id',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid()::text,
    'Executive Director Appointment',
    'The board has unanimously approved the appointment of Sarah Johnson as our new Executive Director.',
    'EXECUTIVE_DIRECTIVE',
    true,
    'admin_user_id',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid()::text,
    'Updated Governance Policies',
    'The governance committee has completed the annual review of our policies and procedures.',
    'GOVERNANCE',
    false,
    'admin_user_id',
    NOW(),
    NOW()
  );
```

## Creating Test Files for Upload

Create these sample PDF files for testing document uploads:

1. **2026-annual-budget.pdf**
   - Simple PDF with budget tables
   - Size: ~500KB

2. **board-member-handbook.pdf**
   - Multi-page document
   - Size: ~2MB

3. **q4-2025-financial-report.xlsx**
   - Excel spreadsheet with financial data
   - Size: ~200KB

4. **strategic-plan-2026-2028.docx**
   - Word document with strategic plan
   - Size: ~1MB

5. **conflict-of-interest-policy.pdf**
   - Policy document
   - Size: ~300KB

## Quick Test Data Script

Create a file `scripts/seed-board-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Find or create admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    console.error('No admin user found. Please create an admin user first.')
    return
  }

  // Create board member
  const boardMember = await prisma.user.upsert({
    where: { email: 'board@avisionforyou.org' },
    update: { role: 'BOARD' },
    create: {
      email: 'board@avisionforyou.org',
      name: 'Board Member Test',
      role: 'BOARD',
      passwordHash: await bcrypt.hash('BoardTest123!', 10),
    },
  })
  console.log('✓ Created board member:', boardMember.email)

  // Create sample updates
  const updates = [
    {
      title: 'Q1 2026 Financial Summary',
      content: 'Our first quarter has shown remarkable growth. Total donations reached $125,000, exceeding our target by 15%. Program participation increased by 23% compared to Q4 2025.',
      category: 'FINANCIAL_SUMMARY',
      priority: true,
    },
    {
      title: 'Executive Director Appointment',
      content: 'The board has unanimously approved the appointment of Sarah Johnson as our new Executive Director, effective March 1st, 2026.',
      category: 'EXECUTIVE_DIRECTIVE',
      priority: true,
    },
    {
      title: 'Updated Governance Policies',
      content: 'The governance committee has completed the annual review of our policies and procedures. Key updates include revised conflict of interest guidelines.',
      category: 'GOVERNANCE',
      priority: false,
    },
  ]

  for (const update of updates) {
    await prisma.boardUpdate.create({
      data: {
        ...update,
        authorId: admin.id,
      },
    })
  }
  console.log('✓ Created', updates.length, 'board updates')

  console.log('\n✅ Board system seed data created successfully!')
  console.log('\nTest Credentials:')
  console.log('Email: board@avisionforyou.org')
  console.log('Password: BoardTest123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run with:
```bash
npx ts-node scripts/seed-board-data.ts
```

## Verification

After seeding, verify the data:

```sql
-- Check board member exists
SELECT id, email, role FROM users WHERE role = 'BOARD';

-- Check updates were created
SELECT id, title, category, priority FROM board_updates;

-- Check counts
SELECT 
  (SELECT COUNT(*) FROM users WHERE role = 'BOARD') as board_members,
  (SELECT COUNT(*) FROM board_updates) as updates,
  (SELECT COUNT(*) FROM board_documents) as documents;
```

## Production Considerations

When deploying to production:

1. **Remove test accounts** - Delete any test board member accounts
2. **Create real board members** - Use actual board member emails
3. **Set strong passwords** - Use secure password generation
4. **Verify email addresses** - Ensure board members can receive notifications
5. **Upload real documents** - Replace test documents with actual board materials
6. **Set appropriate permissions** - Review and confirm role assignments
7. **Test access** - Have each board member verify they can log in

## Security Notes

- Never commit passwords or hashes to version control
- Use environment variables for sensitive data
- Rotate test credentials regularly
- Use strong passwords for all accounts
- Enable 2FA for board member accounts (if implemented)
