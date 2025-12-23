import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf";
import { getClientAccessContext } from "@/lib/client-access";
import React from "react";

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

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:35',message:'Raw invoice from Prisma',data:{invoiceKeys:Object.keys(invoice),hasItems:!!invoice.items,itemsCount:invoice.items?.length,hasOrg:!!invoice.organization,hasProject:!!invoice.project},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Format invoice data for PDF generation
    const invoiceData = {
      number: String(invoice.number || ''),
      title: String(invoice.title || ''),
      description: invoice.description ? String(invoice.description) : null,
      status: String(invoice.status || 'DRAFT'),
      createdAt: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString() || null,
      amount: Number(invoice.amount) || 0,
      tax: Number(invoice.tax || 0),
      total: Number(invoice.total) || 0,
      currency: String(invoice.currency || 'USD'),
      items: invoice.items.map((item) => ({
        description: String(item.description || ''),
        quantity: Number(item.quantity) || 0,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0,
      })),
      organization: invoice.organization
        ? {
            name: String(invoice.organization.name || ''),
            email: invoice.organization.email ? String(invoice.organization.email) : null,
            address: invoice.organization.address ? String(invoice.organization.address) : null,
          }
        : undefined,
      project: invoice.project
        ? {
            name: String(invoice.project.name || ''),
          }
        : undefined,
    };

    // #region agent log
    // Find React elements tracer - this will tell us exactly where React elements are hiding
    function findReactElements(value: any, path = 'root', hits: string[] = []): string[] {
      if (React.isValidElement(value)) {
        hits.push(path);
        return hits;
      }
      if (!value || typeof value !== 'object') return hits;

      if (Array.isArray(value)) {
        value.forEach((v, i) => findReactElements(v, `${path}[${i}]`, hits));
        return hits;
      }

      for (const k of Object.keys(value)) {
        findReactElements(value[k], `${path}.${k}`, hits);
      }
      return hits;
    }
    const reactElementHits = findReactElements(invoiceData);
    if (reactElementHits.length > 0) {
      console.error('🚨 React elements found in invoiceData at:', reactElementHits);
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:findReactElements',message:'React elements found in invoiceData',data:{hits:reactElementHits,count:reactElementHits.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } else {
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:findReactElements',message:'No React elements found in invoiceData',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion

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
    console.error("[GET /api/client/invoices/:id/download] Error:", error);
    console.error("[GET /api/client/invoices/:id/download] Error stack:", error?.stack);
    console.error("[GET /api/client/invoices/:id/download] Error message:", error?.message);
    return NextResponse.json(
      { 
        error: "Failed to generate invoice PDF",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

