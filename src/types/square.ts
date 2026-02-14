export interface SquareWebhookEvent {
  merchant_id: string
  type: string
  event_id: string
  id: string
  created_at: string
  data: {
    type: string
    id: string
    object: SquarePaymentObject | SquareInvoiceObject | SquareSubscriptionObject | Record<string, unknown>
  }
}

export interface SquarePaymentObject {
  payment?: {
    id: string
    status: string
    amount_money?: { amount: number; currency: string }
    order_id?: string
    receipt_url?: string
    buyer_email_address?: string
    note?: string
  }
}

export interface SquareInvoiceObject {
  invoice?: {
    id: string
    status: string
    custom_fields?: Array<{
      label: string
      value: string
    }>
  }
}

export interface SquareSubscriptionObject {
  subscription?: {
    id: string
    status: string
    customer_id?: string
    plan_variation_id?: string
    billing_anchor_date?: string
  }
}
