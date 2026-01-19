import { Client, Environment } from "square"

let squareClientInstance: any = null

function initializeSquare() {
  if (!squareClientInstance) {
    squareClientInstance = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === "production" 
        ? Environment.Production 
        : Environment.Sandbox,
      userAgentDetail: "AVFY_Recovery_Donations"
    })
  }
  return squareClientInstance
}

export const getCheckoutApi = () => {
  const client = initializeSquare()
  return client.checkoutApi
}

export const getCustomersApi = () => {
  const client = initializeSquare()
  return client.customersApi
}
