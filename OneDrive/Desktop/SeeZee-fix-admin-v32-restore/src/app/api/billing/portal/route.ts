import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/**
 * POST /api/billing/portal
 * Create a Stripe customer portal session
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { projectId?: string; returnUrl?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional, continue
    }

    const { projectId, returnUrl } = body;

    let stripeCustomerId: string | null = null;
    let projectWithCustomerId: { id: string } | null = null;

    // If projectId provided, use that project's customer ID
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          organization: {
            include: {
              members: {
                where: {
                  user: { email: session.user.email },
                },
                take: 1,
              },
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      // Verify user has access
      if (project.organization.members.length === 0 && session.user.role !== "CEO" && session.user.role !== "CFO") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      stripeCustomerId = project.stripeCustomerId;
      if (stripeCustomerId) {
        projectWithCustomerId = { id: project.id };
      }
    } else {
      // Find user's organization and get customer ID from any project
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          organizations: {
            include: {
              organization: {
                include: {
                  projects: {
                    where: {
                      stripeCustomerId: { not: null },
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Find first project with a customer ID
      for (const orgMember of user.organizations) {
        if (orgMember.organization.projects.length > 0 && orgMember.organization.projects[0].stripeCustomerId) {
          stripeCustomerId = orgMember.organization.projects[0].stripeCustomerId;
          projectWithCustomerId = { id: orgMember.organization.projects[0].id };
          break;
        }
      }
    }

    // If no customer ID found, try to create one from organization or user
    if (!stripeCustomerId) {
      // Try to find organization and create customer
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          organizations: {
            include: {
              organization: {
                include: {
                  projects: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                  },
                },
              },
            },
            take: 1,
          },
        },
      });

      if (user && user.organizations.length > 0) {
        const org = user.organizations[0].organization;
        const project = org.projects[0];

        // Create Stripe customer
        try {
          const customer = await stripe.customers.create({
            email: session.user.email || undefined,
            name: user.name || undefined,
            metadata: {
              userId: user.id,
              organizationId: org.id,
              projectId: project?.id || '',
            },
          });

          stripeCustomerId = customer.id;

          // Save to project if exists
          if (project) {
            await prisma.project.update({
              where: { id: project.id },
              data: { stripeCustomerId: customer.id },
            });
          }

          // Also save to organization if it has that field
          if (org.stripeCustomerId === null) {
            await prisma.organization.update({
              where: { id: org.id },
              data: { stripeCustomerId: customer.id },
            });
          }

          console.log(`Created Stripe customer ${customer.id} for user ${user.id}`);
        } catch (error: any) {
          console.error("Failed to create Stripe customer:", error);
          return NextResponse.json(
            { error: "No billing account found. You need to make a payment first to create a billing account." },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "No billing account found. You need to make a payment first to create a billing account." },
          { status: 400 }
        );
      }
    }

    // Verify customer exists in Stripe
    try {
      await stripe.customers.retrieve(stripeCustomerId);
    } catch (error: any) {
      // If customer doesn't exist, clear the invalid ID and return error
      if (error.code === 'resource_missing' || error.statusCode === 404) {
        console.error(`Stripe customer ${stripeCustomerId} not found, clearing from database`);
        
        // Clear invalid customer ID from database
        if (projectWithCustomerId) {
          await prisma.project.update({
            where: { id: projectWithCustomerId.id },
            data: { stripeCustomerId: null },
          });
        } else {
          // Fallback: Find and clear from all projects with this customer ID
          await prisma.project.updateMany({
            where: { stripeCustomerId: stripeCustomerId },
            data: { stripeCustomerId: null },
          });
        }
        
        return NextResponse.json(
          { error: "Your billing account is no longer valid. Please make a new payment to create a new billing account." },
          { status: 400 }
        );
      }
      throw error;
    }

    // Create portal session
    const defaultReturnUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/settings?tab=billing`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || defaultReturnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("[Billing Portal Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
