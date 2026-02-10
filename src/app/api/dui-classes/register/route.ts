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

      // Create Square order
      const orderBody = {
        idempotencyKey: registrationId,
        order: {
          locationId: locationId,
          lineItems: [
            {
              name: `DUI Class: ${duiClass.title}`,
              quantity: "1",
              basePriceMoney: {
                amount: duiClass.price,
                currency: "USD",
              },
            },
          ],
        },
      };

      const orderResponse = await fetch(`${getSquareBaseUrl()}/v2/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "Square-Version": "2024-12-18",
        },
        body: JSON.stringify(orderBody),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Square order error:", errorData);
        throw new Error(`Failed to create order: ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.order.id;

      // Create checkout link from the order
      const checkoutBody = {
        idempotencyKey: `${registrationId}-checkout`,
        order: {
          id: orderId,
        },
        redirectUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/programs/dui-classes/success`,
        askForShippingAddress: false,
      };

      const checkoutResponse = await fetch(
        `${getSquareBaseUrl()}/v2/checkouts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "Square-Version": "2024-12-18",
          },
          body: JSON.stringify(checkoutBody),
        }
      );

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        console.error("Square checkout error:", errorData);
        throw new Error(`Square API error: ${checkoutResponse.status}`);
      }

      const checkout = await checkoutResponse.json();

      if (!checkout.checkout?.checkout_page_url) {
        throw new Error("Checkout URL not returned from Square");
      }

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
          paymentUrl: checkout.checkout.checkout_page_url,
          paymentId: orderId, // Store order ID for webhook matching (will be updated with payment ID)
          paymentStatus: "PENDING",
          status: "PENDING",
        },
      });

      return NextResponse.json({
        registrationId: registration.id,
        paymentUrl: checkout.checkout.checkout_page_url,
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
