import { Client, Environment } from "square"

export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === "production" 
    ? Environment.Production 
    : Environment.Sandbox,
  userAgentDetail: "AVFY_Recovery_Donations"
})

export const paymentsApi = squareClient.paymentsApi
export const checkoutApi = squareClient.checkoutApi
export const customersApi = squareClient.customersApi
