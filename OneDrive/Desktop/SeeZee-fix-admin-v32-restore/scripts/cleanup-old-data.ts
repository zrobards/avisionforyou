/**
 * Database Cleanup Script
 * Safely removes old/unused data from the database
 * 
 * Usage: npx tsx scripts/cleanup-old-data.ts [--dry-run] [--days=30] [--all]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CleanupOptions {
  dryRun: boolean;
  daysOld: number;
  cleanAll: boolean;
}

async function cleanupOldData(options: CleanupOptions) {
  const { dryRun, daysOld, cleanAll } = options;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  console.log(`\n🧹 Database Cleanup Script`);
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE (will delete)"}`);
  console.log(`Cutoff date: ${cutoffDate.toISOString()} (${daysOld} days ago)\n`);

  const stats = {
    leads: { deleted: 0, total: 0 },
    messages: { deleted: 0, total: 0 },
    quotes: { deleted: 0, total: 0 },
    activities: { deleted: 0, total: 0 },
    notifications: { deleted: 0, total: 0 },
    sessions: { deleted: 0, total: 0 },
    webhookEvents: { deleted: 0, total: 0 },
    systemLogs: { deleted: 0, total: 0 },
  };

  try {
    // 1. Clean up old leads (LOST or very old NEW leads)
    console.log("📋 Checking leads...");
    const oldLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { status: "LOST" },
          { status: "NEW", createdAt: { lt: cutoffDate } },
        ],
      },
      select: { id: true, status: true, createdAt: true, name: true },
    });

    stats.leads.total = oldLeads.length;
    console.log(`  Found ${oldLeads.length} old leads to clean`);

    if (!dryRun && oldLeads.length > 0) {
      const result = await prisma.lead.deleteMany({
        where: {
          id: { in: oldLeads.map((l) => l.id) },
        },
      });
      stats.leads.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} leads`);
    }

    // 2. Clean up legacy Message model (old contact form messages)
    console.log("\n📧 Checking legacy messages...");
    const oldMessages = await prisma.message.findMany({
      where: {
        OR: [
          { status: "REPLIED", createdAt: { lt: cutoffDate } },
          { status: "READ", createdAt: { lt: cutoffDate } },
          { createdAt: { lt: cutoffDate } },
        ],
      },
    });

    stats.messages.total = oldMessages.length;
    console.log(`  Found ${oldMessages.length} old messages to clean`);

    if (!dryRun && oldMessages.length > 0) {
      const result = await prisma.message.deleteMany({
        where: {
          id: { in: oldMessages.map((m) => m.id) },
        },
      });
      stats.messages.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} messages`);
    }

    // 3. Clean up expired quotes
    console.log("\n💰 Checking expired quotes...");
    const expiredQuotes = await prisma.quote.findMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { convertedToLead: false, createdAt: { lt: cutoffDate } },
        ],
      },
    });

    stats.quotes.total = expiredQuotes.length;
    console.log(`  Found ${expiredQuotes.length} expired quotes to clean`);

    if (!dryRun && expiredQuotes.length > 0) {
      const result = await prisma.quote.deleteMany({
        where: {
          id: { in: expiredQuotes.map((q) => q.id) },
        },
      });
      stats.quotes.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} quotes`);
    }

    // 4. Clean up old activities (read and old)
    console.log("\n📊 Checking old activities...");
    const oldActivities = await prisma.activity.findMany({
      where: {
        AND: [
          { read: true },
          { createdAt: { lt: cutoffDate } },
        ],
      },
    });

    stats.activities.total = oldActivities.length;
    console.log(`  Found ${oldActivities.length} old read activities to clean`);

    if (!dryRun && oldActivities.length > 0) {
      const result = await prisma.activity.deleteMany({
        where: {
          id: { in: oldActivities.map((a) => a.id) },
        },
      });
      stats.activities.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} activities`);
    }

    // 5. Clean up old read notifications
    console.log("\n🔔 Checking old notifications...");
    const oldNotifications = await prisma.notification.findMany({
      where: {
        AND: [
          { read: true },
          { createdAt: { lt: cutoffDate } },
        ],
      },
    });

    stats.notifications.total = oldNotifications.length;
    console.log(`  Found ${oldNotifications.length} old read notifications to clean`);

    if (!dryRun && oldNotifications.length > 0) {
      const result = await prisma.notification.deleteMany({
        where: {
          id: { in: oldNotifications.map((n) => n.id) },
        },
      });
      stats.notifications.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} notifications`);
    }

    // 6. Clean up expired sessions
    console.log("\n🔐 Checking expired sessions...");
    const expiredSessions = await prisma.session.findMany({
      where: {
        expires: { lt: new Date() },
      },
    });

    stats.sessions.total = expiredSessions.length;
    console.log(`  Found ${expiredSessions.length} expired sessions to clean`);

    if (!dryRun && expiredSessions.length > 0) {
      const result = await prisma.session.deleteMany({
        where: {
          id: { in: expiredSessions.map((s) => s.id) },
        },
      });
      stats.sessions.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} sessions`);
    }

    // 7. Clean up old processed webhook events
    console.log("\n🔗 Checking old webhook events...");
    const oldWebhooks = await prisma.webhookEvent.findMany({
      where: {
        AND: [
          { processed: true },
          { createdAt: { lt: cutoffDate } },
        ],
      },
    });

    stats.webhookEvents.total = oldWebhooks.length;
    console.log(`  Found ${oldWebhooks.length} old processed webhook events to clean`);

    if (!dryRun && oldWebhooks.length > 0) {
      const result = await prisma.webhookEvent.deleteMany({
        where: {
          id: { in: oldWebhooks.map((w) => w.id) },
        },
      });
      stats.webhookEvents.deleted = result.count;
      console.log(`  ✅ Deleted ${result.count} webhook events`);
    }

    // 8. Clean up old system logs (optional - only if cleanAll)
    if (cleanAll) {
      console.log("\n📜 Checking old system logs...");
      const oldLogs = await prisma.systemLog.findMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
        take: 1000, // Limit to avoid huge deletions
      });

      stats.systemLogs.total = oldLogs.length;
      console.log(`  Found ${oldLogs.length} old system logs to clean (limited to 1000)`);

      if (!dryRun && oldLogs.length > 0) {
        const result = await prisma.systemLog.deleteMany({
          where: {
            id: { in: oldLogs.map((l) => l.id) },
          },
        });
        stats.systemLogs.deleted = result.count;
        console.log(`  ✅ Deleted ${result.count} system logs`);
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Cleanup Summary");
    console.log("=".repeat(50));
    Object.entries(stats).forEach(([key, value]) => {
      if (value.total > 0) {
        console.log(
          `  ${key.padEnd(20)} ${dryRun ? `Would delete: ${value.total}` : `Deleted: ${value.deleted}/${value.total}`}`
        );
      }
    });

    const totalToDelete = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0);
    const totalDeleted = Object.values(stats).reduce((sum, stat) => sum + stat.deleted, 0);

    console.log("\n" + "-".repeat(50));
    if (dryRun) {
      console.log(`  Total items that would be deleted: ${totalToDelete}`);
      console.log("\n  💡 Run without --dry-run to actually delete these items");
    } else {
      console.log(`  Total items deleted: ${totalDeleted}`);
      console.log("\n  ✅ Cleanup complete!");
    }

  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: CleanupOptions = {
  dryRun: args.includes("--dry-run"),
  daysOld: parseInt(args.find((arg) => arg.startsWith("--days="))?.split("=")[1] || "30"),
  cleanAll: args.includes("--all"),
};

// Run cleanup
cleanupOldData(options)
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Failed:", error);
    process.exit(1);
  });









