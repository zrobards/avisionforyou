import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get Square API base URL
function getSquareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

// Get Square Location ID from environment
function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID;
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

    // Get class details
    const duiClass = await db.dUIClass.findUnique({
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
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if class is active
    if (!duiClass.active) {
      return NextResponse.json(
        { error: "Class is no longer available" },
        { status: 400 }
      );
    }

    // Check if class date has passed
    if (new Date(duiClass.date) < new Date()) {
      return NextResponse.json(
        { error: "Class date has passed" },
        { status: 400 }
      );
    }

    // Check capacity
    if (duiClass._count.registrations >= duiClass.capacity) {
      return NextResponse.json({ error: "Class is full" }, { status: 400 });
    }

    // Check for duplicate registration (same email, non-cancelled)
    const existingReg = await db.dUIRegistration.findFirst({
      where: {
        classId,
        email,
        status: { not: "CANCELLED" },
      },
    });

    if (existingReg) {
      return NextResponse.json(
        { error: "You're already registered for this class" },
        { status: 400 }
      );
    }

    // Generate unique ID for payment
    const registrationId = `dui-${classId}-${email}-${Date.now()}`;

    try {
      // Get location ID
      const locationId = getSquareLocationId();

      // Create payment link via Square Payment Links API (replaces deprecated /v2/checkouts)
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
            Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
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

      // Create registration record
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
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
