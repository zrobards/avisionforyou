import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { CheckCircle2, CreditCard, ArrowLeft } from "lucide-react";
import { InvoiceSuccessEmailTrigger } from "./InvoiceSuccessEmailTrigger";

interface SuccessPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export const dynamic = "force-dynamic";

export default async function InvoiceSuccessPage({ params, searchParams }: SuccessPageProps) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id: invoiceId } = await params;
  const { session_id } = await searchParams;

  // Get invoice
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      organization: {
        include: {
          members: {
            where: {
              user: {
                email: session.user.email,
              },
            },
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  // Verify user has access to this invoice
  if (invoice.organization.members.length === 0) {
    notFound();
  }

  // Verify Stripe session if provided
  let paymentVerified = false;
  let paymentAmount = null;
  let paymentDate = null;

  if (session_id) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (checkoutSession.payment_status === "paid") {
        paymentVerified = true;
        paymentAmount = checkoutSession.amount_total ? checkoutSession.amount_total / 100 : null;
        paymentDate = new Date(checkoutSession.created * 1000);
        
        // If invoice is not yet marked as paid, mark it now
        // (Webhook might not have processed it yet)
        if (invoice.status !== "PAID") {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "PAID",
              paidAt: paymentDate,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error verifying Stripe session:", error);
      // Continue anyway - webhook might have processed it
    }
  }

  // If no session_id but invoice is paid, assume payment was successful
  if (!paymentVerified && invoice.status === "PAID") {
    paymentVerified = true;
    paymentDate = invoice.paidAt;
  }

  // Determine if we should send email (client component will handle it)
  const shouldSendEmail = paymentVerified || invoice.status === "PAID";
  
  // Get customer email for toast notification
  const customerEmail = invoice.organization.members[0]?.user?.email || session.user.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">
              Payment Successful!
            </h1>
            <p className="text-lg text-slate-300 mb-2">
              Your payment for invoice <span className="font-mono font-semibold text-white">{invoice.number}</span> has been processed successfully.
            </p>
            {paymentAmount && (
              <p className="text-xl font-semibold text-green-400 mt-4">
                ${paymentAmount.toLocaleString()} paid
              </p>
            )}
            {paymentDate && (
              <p className="text-sm text-slate-400 mt-2">
                {paymentDate.toLocaleDateString()} at {paymentDate.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Invoice Details */}
          <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Invoice Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice Number</span>
                <span className="text-white font-mono font-medium">{invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="text-white font-semibold">${Number(invoice.total).toLocaleString()}</span>
              </div>
              {invoice.project && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Project</span>
                  <span className="text-white">{invoice.project.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-sm font-medium">
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {invoice.project && (
              <Link
                href={`/client/projects/${invoice.project.id}?tab=invoices`}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Project
              </Link>
            )}
            <Link
              href="/client/invoices"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              View All Invoices
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-slate-400 mt-8">
            A receipt has been sent to your email address. If you have any questions, please contact support.
          </p>

          {/* Email trigger component - sends email on client side */}
          {shouldSendEmail && (
            <InvoiceSuccessEmailTrigger 
              invoiceId={invoiceId} 
              customerEmail={invoice.organization.members[0]?.user?.email || session.user.email}
            />
          )}
        </div>
      </div>
    </div>
  );
}

