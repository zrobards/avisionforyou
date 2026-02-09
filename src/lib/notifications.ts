import { db } from "./db"

/**
 * Log an activity to the shared activity feed
 */
export async function logActivity(
  type: string,
  title: string,
  detail?: string,
  link?: string
) {
  try {
    await db.activityLog.create({
      data: { type, title, detail, link },
    })
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}

/**
 * Send a notification to specific users by role
 */
export async function notifyByRole(
  roles: string[],
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    const users = await db.user.findMany({
      where: { role: { in: roles as any } },
      select: { id: true },
    })

    if (users.length === 0) return

    await db.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type,
        title,
        message,
        link,
      })),
    })
  } catch (error) {
    console.error("Failed to send notifications:", error)
  }
}

/**
 * Send a notification to a single user
 */
export async function notifyUser(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await db.notification.create({
      data: { userId, type, title, message, link },
    })
  } catch (error) {
    console.error("Failed to send notification:", error)
  }
}
