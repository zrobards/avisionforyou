import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf";
import { getClientAccessContext } from "@/lib/client-access";

/**
 * GET /api/client/invoices/[id]/download
 * Download invoice as PDF
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get client's accessible organizations and projects
    const identity = {
      userId: session.user.id,
      email: session.user.email,
    };
    const { organizationIds, leadProjectIds } = await getClientAccessContext(identity);

    if (organizationIds.length === 0 && leadProjectIds.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the invoice with all necessary details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
            email: true,
            address: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
        items: {
          select: {
            description: true,
            quantity: true,
            rate: true,
            amount: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if client has access to this invoice
    const hasAccess =
      (invoice.organizationId && organizationIds.includes(invoice.organizationId)) ||
      (invoice.projectId && leadProjectIds.includes(invoice.projectId));

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Format invoice data for PDF generation
    const invoiceData = {
      number: invoice.number,
      title: invoice.title,
      description: invoice.description,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString() || null,
      amount: Number(invoice.amount),
      tax: Number(invoice.tax || 0),
      total: Number(invoice.total),
      currency: invoice.currency,
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: Number(item.rate),
        amount: Number(item.amount),
      })),
      organization: invoice.organization
        ? {
            name: invoice.organization.name,
            email: invoice.organization.email,
            address: invoice.organization.address,
          }
        : undefined,
      project: invoice.project
        ? {
            name: invoice.project.name,
          }
        : undefined,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/client/invoices/:id/download]", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}

