/**
 * Cleanup test data from the community portal.
 *
 * Run with: npx ts-node scripts/cleanup-test-data.ts
 *
 * Removes:
 *  - Community announcements with title "abc" (test data)
 *  - Community polls titled "Poll" with 0 votes (empty test polls)
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up test data...\n')

  // Remove test announcement "abc"
  const deletedAnnouncements = await prisma.communityAnnouncement.deleteMany({
    where: { title: 'abc' },
  })
  console.log(`Deleted ${deletedAnnouncements.count} test announcement(s) with title "abc"`)

  // Remove empty test polls titled "Poll" with 0 votes
  const emptyPolls = await prisma.communityPoll.findMany({
    where: { title: 'Poll' },
    include: { _count: { select: { votes: true } } },
  })

  let deletedPollCount = 0
  for (const poll of emptyPolls) {
    if (poll._count.votes === 0) {
      await prisma.communityPoll.delete({ where: { id: poll.id } })
      deletedPollCount++
    }
  }
  console.log(`Deleted ${deletedPollCount} empty test poll(s) titled "Poll"`)

  console.log('\nDone!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e: unknown) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
