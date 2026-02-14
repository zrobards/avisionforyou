import { SquareClient, SquareEnvironment } from "square"

let squareClientInstance: SquareClient | null = null

function initializeSquare() {
  if (!squareClientInstance) {
    squareClientInstance = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.SQUARE_ENVIRONMENT === "production" 
        ? SquareEnvironment.Production 
        : SquareEnvironment.Sandbox,
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
