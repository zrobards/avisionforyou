import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { logActivity, notifyByRole } from "@/lib/notifications"
import { logger } from "@/lib/logger"
import type { DonationStatus } from "@prisma/client"

export async function applyDonationPaymentStatus(
  donationId: string,
  newStatus: DonationStatus
) {
  const donation = await db.donation.findUnique({
    where: { id: donationId }
  })

  if (!donation) {
    return { updated: false, status: null as DonationStatus | null, donation: null }
  }

  const previousStatus = donation.status

  if (previousStatus !== newStatus) {
    await db.donation.update({
      where: { id: donationId },
      data: { status: newStatus }
    })
  }

  if (previousStatus !== "COMPLETED" && newStatus === "COMPLETED") {
    try {
      if (donation.email) {
        await sendDonationConfirmationEmail(
          donation.id,
          donation.email,
          donation.name || "Friend",
          Number(donation.amount),
          donation.frequency
        )
      }
    } catch (error) {
      logger.error({ err: error, donationId }, "Donation completion email failed")
    }

    try {
      const freqLabel =
        donation.frequency === "ONE_TIME"
          ? "one-time"
          : donation.frequency === "MONTHLY"
            ? "monthly"
            : "annual"

      await logActivity(
        "donation",
        `Confirmed $${Number(donation.amount)} ${freqLabel} donation`,
        donation.name || donation.email || "Anonymous",
        "/admin/donations"
      )

      await notifyByRole(
        ["BOARD", "ADMIN"],
        "donation",
        "Donation Confirmed",
        `$${Number(donation.amount)} ${freqLabel} donation from ${donation.name || donation.email || "Anonymous"} was confirmed by Square.`,
        "/admin/donations"
      )
    } catch (error) {
      logger.error({ err: error, donationId }, "Donation completion notifications failed")
    }
  }

  return {
    updated: previousStatus !== newStatus,
    status: newStatus,
    donation
  }
}
