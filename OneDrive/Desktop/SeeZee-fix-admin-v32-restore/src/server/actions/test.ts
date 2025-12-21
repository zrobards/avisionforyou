"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { feedHelpers } from "@/lib/feed/emit";
import { ProjectStatus, InvoiceStatus, PaymentStatus, LeadStatus, ServiceCategory } from "@prisma/client";

// Map package types to ServiceCategory
const packageToServiceType: Record<string, ServiceCategory> = {
  starter: ServiceCategory.PERSONAL_WEBSITE,
  pro: ServiceCategory.BUSINESS_WEBSITE,
  elite: ServiceCategory.NONPROFIT_WEBSITE,
};

interface CreateTestProjectParams {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  packageType?: "starter" | "pro" | "elite";
  totalAmount?: number;
  depositAmount?: number;
}

/**
 * Create a test project setup without payment
 * Simulates what happens after Stripe checkout for testing purposes
 * Only accessible by CEO/Admin
 */
export async function createTestProject(params: CreateTestProjectParams) {
  const session = await auth();

  if (!session?.user || !["CEO", "CFO"].includes(session.user.role || "")) {
    throw new Error("Unauthorized: CEO or Admin role required");
  }

  const {
    name,
    email,
    company,
    phone,
    packageType = "starter",
    totalAmount,
    depositAmount,
  } = params;

  try {
    // Calculate amounts based on package type if not provided
    const packagePrices = {
      starter: { total: 120000, deposit: 30000 }, // $1,200 total, $300 deposit (25%)
      pro: { total: 199900, deposit: 49975 }, // $1,999 total, ~$500 deposit (25%)
      elite: { total: 299900, deposit: 74975 }, // $2,999 total, ~$750 deposit (25%)
    };

    const finalTotalAmount = totalAmount || packagePrices[packageType].total;
    const finalDepositAmount = depositAmount || packagePrices[packageType].deposit;

    // Create organization
    const orgSlug = `${company || name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const organization = await prisma.organization.upsert({
      where: { slug: orgSlug },
      update: {},
      create: {
        name: company || `${name}'s Organization`,
        slug: `${orgSlug}-${Date.now()}`, // Ensure unique slug
        email: email,
        phone: phone || null,
      },
    });

    // Create user account for the client
    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: {
        email: email.toLowerCase(),
        name: name,
        role: "CLIENT",
        emailVerified: new Date(),
        phone: phone || null,
        company: company || null,
      },
    });

    // Add user to organization
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        organizationId: organization.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        company: company || null,
        phone: phone || null,
        message: `Test ${packageType} package project - Created for practice/testing purposes`,
        serviceType: packageToServiceType[packageType],
        status: LeadStatus.CONVERTED,
        convertedAt: new Date(),
        organizationId: organization.id,
        source: "test",
        budget: "20plus",
        timeline: "standard",
      },
    });

    // Create project
    const project = await prisma.project.create({
      data: {
        name: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Development Project - ${company || name}`,
        description: `${packageType} development project for ${organization.name} (Test/Practice Project)`,
        organizationId: organization.id,
        leadId: lead.id,
        budget: finalTotalAmount.toString(),
        status: ProjectStatus.ACTIVE,
        milestones: {
          create: [
            {
              title: "Project Planning & Design",
              description: "Initial consultation, requirements gathering, and design mockups",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
            },
            {
              title: "Development Phase",
              description: "Core development and feature implementation",
              dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
            },
            {
              title: "Testing & Launch",
              description: "Quality testing, optimization, and project launch",
              dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks
            },
          ],
        },
      },
    });

    // Create invoice for deposit
    const depositInvoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}-DEP`,
        title: "Project Deposit",
        description: `50% deposit for ${packageType} development project (Test)`,
        amount: finalDepositAmount,
        tax: 0,
        total: finalDepositAmount,
        status: InvoiceStatus.PAID,
        organizationId: organization.id,
        projectId: project.id,
        sentAt: new Date(),
        paidAt: new Date(),
        dueDate: new Date(),
        items: {
          create: {
            description: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Development - Deposit (50%) - TEST`,
            quantity: 1,
            rate: finalDepositAmount,
            amount: finalDepositAmount,
          },
        },
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        amount: finalDepositAmount,
        currency: "USD",
        status: PaymentStatus.COMPLETED,
        method: "test",
        invoiceId: depositInvoice.id,
        processedAt: new Date(),
      },
    });

    // Create remaining balance invoice
    const remainingAmount = finalTotalAmount - finalDepositAmount;
    if (remainingAmount > 0) {
      await prisma.invoice.create({
        data: {
          number: `INV-${Date.now()}-BAL`,
          title: "Project Balance",
          description: `Remaining balance for ${packageType} development project (Test)`,
          amount: remainingAmount,
          tax: 0,
          total: remainingAmount,
          status: InvoiceStatus.DRAFT,
          organizationId: organization.id,
          projectId: project.id,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          items: {
            create: {
              description: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Development - Final Payment (50%) - TEST`,
              quantity: 1,
              rate: remainingAmount,
              amount: remainingAmount,
            },
          },
        },
      });
    }

    // Emit feed events
    await feedHelpers.projectCreated(project.id, project.name);
    await feedHelpers.paymentSucceeded(project.id, finalDepositAmount, depositInvoice.id);

    // Create notification for client
    await prisma.notification.create({
      data: {
        title: "Welcome to SeeZee Studio! (Test Project)",
        message: `Your test project has been successfully created. This is a practice/test project for testing purposes.`,
        type: "INFO",
        userId: user.id,
      },
    });

    revalidatePath("/admin/pipeline/leads");
    revalidatePath("/admin/pipeline/projects");
    revalidatePath("/client/projects");

    return {
      success: true,
      projectId: project.id,
      leadId: lead.id,
      organizationId: organization.id,
      userId: user.id,
      message: `Test project created successfully! Project ID: ${project.id}`,
    };
  } catch (error) {
    console.error("[createTestProject] Error:", error);
    throw error;
  }
}


