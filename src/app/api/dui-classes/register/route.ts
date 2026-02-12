import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get Square API base URL
function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT?.trim() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

// Get Square Location ID from environment
function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  if (!locationId) {
    throw new Error("SQUARE_LOCATION_ID environment variable is required");
  }
  return locationId;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { classId, firstName, lastName, email, phone } = await request.json();

    // Validate required fields
    if (!classId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use transaction to prevent race condition on capacity check
    const result = await db.$transaction(async (tx) => {
      // Get class details
      const duiClass = await tx.dUIClass.findUnique({
        where: { id: classId },
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: { not: "CANCELLED" }
                }
              }
            }
          }
        },
      });

      if (!duiClass) {
        return { error: "Class not found", status: 404 };
      }

      if (!duiClass.active) {
        return { error: "Class is no longer available", status: 400 };
      }

      if (new Date(duiClass.date) < new Date()) {
        return { error: "Class date has passed", status: 400 };
      }

      if (duiClass._count.registrations >= duiClass.capacity) {
        return { error: "Class is full", status: 400 };
      }

      // Check for duplicate registration
      const existingReg = await tx.dUIRegistration.findFirst({
        where: {
          classId,
          email,
          status: { not: "CANCELLED" },
        },
      });

      if (existingReg) {
        return { error: "You're already registered for this class", status: 400 };
      }

      return { duiClass };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { duiClass } = result;

    // Generate unique ID for payment
    const registrationId = `dui-${classId}-${email}-${Date.now()}`;

    try {
      const locationId = getSquareLocationId();

      const paymentLinkBody = {
        idempotency_key: registrationId,
        quick_pay: {
          name: `DUI Class: ${duiClass.title}`,
          price_money: {
            amount: duiClass.price,
            currency: "USD",
          },
          location_id: locationId,
        },
        checkout_options: {
          redirect_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/programs/dui-classes/success`,
          ask_for_shipping_address: false,
        },
      };

      const response = await fetch(
        `${getSquareBaseUrl()}/v2/online-checkout/payment-links`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN?.trim()}`,
            "Content-Type": "application/json",
            "Square-Version": "2024-12-18",
          },
          body: JSON.stringify(paymentLinkBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Square payment link error:", errorData);
        throw new Error(`Square API error: ${response.status}`);
      }

      const paymentLinkData = await response.json();

      if (!paymentLinkData.payment_link?.url) {
        throw new Error("Payment link URL not returned from Square");
      }

      const paymentUrl = paymentLinkData.payment_link.url;
      const orderId = paymentLinkData.payment_link.order_id;

      const registration = await db.dUIRegistration.create({
        data: {
          classId,
          userId: session?.user?.id || null,
          firstName,
          lastName,
          email,
          phone: phone || null,
          amount: duiClass.price,
          paymentUrl: paymentUrl,
          paymentId: orderId,
          paymentStatus: "PENDING",
          status: "PENDING",
        },
      });

      return NextResponse.json({
        registrationId: registration.id,
        paymentUrl: paymentUrl,
      });
    } catch (squareError: any) {
      console.error("Square payment error:", squareError);
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("DUI registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
