import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/apiAuth"
import { getSquareApiBaseUrl, getSquareLocationId, getSquareWebhookNotificationUrl } from "@/lib/square"

export async function GET(request: NextRequest) {
  const session = await requireAdminAuth(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const environment = process.env.SQUARE_ENVIRONMENT?.trim() || "not-configured"
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim()
  const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim()

  let locationId: string | null = null
  let webhookNotificationUrl: string | null = null
  let squareConnection: {
    ok: boolean
    locationFound: boolean
    locationCount: number
    errors: string[]
  } = {
    ok: false,
    locationFound: false,
    locationCount: 0,
    errors: []
  }

  try {
    locationId = getSquareLocationId()
  } catch (error) {
    squareConnection.errors.push(error instanceof Error ? error.message : "Missing Square location ID")
  }

  try {
    webhookNotificationUrl = getSquareWebhookNotificationUrl()
  } catch (error) {
    squareConnection.errors.push(error instanceof Error ? error.message : "Missing Square webhook notification URL")
  }

  if (accessToken && locationId) {
    try {
      const response = await fetch(`${getSquareApiBaseUrl()}/v2/locations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Square-Version": "2024-12-18"
        },
        cache: "no-store"
      })

      const payload = await response.json()

      if (!response.ok) {
        squareConnection.errors.push(`Square locations check failed with status ${response.status}`)
        if (Array.isArray(payload?.errors)) {
          squareConnection.errors.push(...payload.errors.map((item: { detail?: string }) => item.detail || "Unknown Square error"))
        }
      } else {
        const locations = Array.isArray(payload?.locations) ? payload.locations : []
        squareConnection.ok = true
        squareConnection.locationCount = locations.length
        squareConnection.locationFound = locations.some((location: { id?: string }) => location.id === locationId)
        if (!squareConnection.locationFound) {
          squareConnection.errors.push("Configured SQUARE_LOCATION_ID was not returned by Square locations API")
        }
      }
    } catch (error) {
      squareConnection.errors.push(error instanceof Error ? error.message : "Square connectivity check failed")
    }
  } else if (!accessToken) {
    squareConnection.errors.push("SQUARE_ACCESS_TOKEN environment variable is required")
  }

  return NextResponse.json({
    status: squareConnection.ok && squareConnection.locationFound ? "ok" : "warning",
    timestamp: new Date().toISOString(),
    square: {
      configured: Boolean(accessToken && locationId),
      environment,
      webhookSignatureConfigured: Boolean(webhookSignatureKey),
      webhookNotificationUrl,
      locationId,
      connection: squareConnection
    }
  })
}
