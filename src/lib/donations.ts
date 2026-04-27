import { db } from "@/lib/db"
import { sendDonationConfirmationEmail } from "@/lib/email"
import { logActivity, notifyByRole } from "@/lib/notifications"
import { logger } from "@/lib/logger"
import { getSquareApiBaseUrl } from "@/lib/square"
import type { Donation, DonationStatus } from "@prisma/client"

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

type VisibleDonationResult = {
  donation: Donation
  visible: boolean
}

async function fetchSquareOrderSnapshot(orderId: string) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim()

  if (!accessToken) {
    return null
  }

  try {
    const response = await fetch(`${getSquareApiBaseUrl()}/v2/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Square-Version": "2024-12-18"
      },
      cache: "no-store"
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      logger.warn({ orderId, status: response.status, payload }, "Square order lookup failed for donation visibility")
      return null
    }

    const payload = await response.json()
    const orderState = typeof payload?.order?.state === "string" ? payload.order.state : "UNKNOWN"
    const tenderCount = Array.isArray(payload?.order?.tenders) ? payload.order.tenders.length : 0

    return { orderState, tenderCount }
  } catch (error) {
    logger.warn({ err: error, orderId }, "Square order lookup threw during donation visibility check")
    return null
  }
}

export async function resolveVisibleDonation(donation: Donation): Promise<VisibleDonationResult> {
  if (donation.status !== "PENDING") {
    return { donation, visible: true }
  }

  if (!donation.squarePaymentId) {
    return { donation, visible: false }
  }

  const snapshot = await fetchSquareOrderSnapshot(donation.squarePaymentId)

  if (!snapshot) {
    return { donation, visible: false }
  }

  if (snapshot.orderState === "COMPLETED") {
    await applyDonationPaymentStatus(donation.id, "COMPLETED")
    return {
      donation: {
        ...donation,
        status: "COMPLETED",
        updatedAt: new Date()
      },
      visible: true
    }
  }

  if (snapshot.orderState === "CANCELED") {
    await applyDonationPaymentStatus(donation.id, "FAILED")
    return {
      donation: {
        ...donation,
        status: "FAILED",
        updatedAt: new Date()
      },
      visible: true
    }
  }

  if (snapshot.tenderCount > 0) {
    return { donation, visible: true }
  }

  return { donation, visible: false }
}

export async function getVisibleDonationsForDashboard(donations: Donation[]) {
  const resolved = await Promise.all(donations.map(resolveVisibleDonation))
  return resolved
    .filter((entry) => entry.visible)
    .map((entry) => entry.donation)
}
