import { SquareClient, SquareEnvironment } from "square"

let squareClientInstance: SquareClient | null = null

export function getSquareEnvironment() {
  return process.env.SQUARE_ENVIRONMENT?.trim() === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox
}

export function getSquareApiBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT?.trim() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com"
}

export function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID?.trim()
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID environment variable is required")
  }
  return locationId
}

export function getSquareWebhookNotificationUrl() {
  const explicitUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim()
  if (explicitUrl) {
    return explicitUrl
  }

  const baseUrl = process.env.NEXTAUTH_URL?.trim()
  if (!baseUrl) {
    throw new Error("SQUARE_WEBHOOK_NOTIFICATION_URL or NEXTAUTH_URL must be configured")
  }

  return `${baseUrl.replace(/\/$/, "")}/api/webhooks/square`
}

function initializeSquare() {
  if (!squareClientInstance) {
    squareClientInstance = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: getSquareEnvironment(),
    })
  }
  return squareClientInstance
}

export const getCheckoutApi = () => {
  const client = initializeSquare()
  return client.checkout
}

export const getCustomersApi = () => {
  const client = initializeSquare()
  return client.customers
}
