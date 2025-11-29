'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Printer, Package, User, Mail, Phone, Building2, Target, Calendar, MessageSquare, Share2, Clock } from 'lucide-react';
import { getPackage } from '@/lib/qwiz/packages';

interface QuestionnaireReceiptProps {
  data: {
    package: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    referralSource?: string;
    stage?: string;
    outreachProgram?: string;
    projectType?: string[];
    projectGoals?: string;
    timeline?: string;
    specialRequirements?: string;
    submittedAt?: string;
    leadId?: string;
  };
}

export default function QuestionnaireReceipt({ data }: QuestionnaireReceiptProps) {
  const pkg = getPackage(data.package as 'starter' | 'pro' | 'elite');
  const submittedDate = data.submittedAt ? new Date(data.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Project Request Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              background: white;
              color: #1a1a1a;
            }
            .header {
              border-bottom: 3px solid #ef4444;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #ef4444;
              margin: 0;
            }
            .section {
              margin-bottom: 25px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e5e5e5;
            }
            .section:last-child {
              border-bottom: none;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #ef4444;
              margin-bottom: 10px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: 600;
              width: 150px;
              color: #666;
            }
            .info-value {
              flex: 1;
            }
            .package-badge {
              display: inline-block;
              padding: 8px 16px;
              background: #ef4444;
              color: white;
              border-radius: 6px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .project-types {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .project-type-tag {
              padding: 4px 12px;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              font-size: 14px;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div id="receipt-content" className="glass-container rounded-xl border-2 border-gray-700 hover:border-trinity-red transition-all duration-300 p-8 shadow-large">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
          <div>
            <h2 className="text-3xl font-heading font-bold gradient-text mb-2 flex items-center gap-3">
              <FileText className="w-8 h-8 text-trinity-red" />
              Project Request Receipt
            </h2>
            <p className="text-white/60 text-sm">Submitted on {submittedDate}</p>
          </div>
          <div className="flex gap-2 no-print">
            <button
              onClick={handlePrint}
              className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white transition-colors"
              title="Download Receipt"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Package Information */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-trinity-red" />
            <h3 className="text-xl font-heading font-bold text-white">Package Selected</h3>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="package-badge">{pkg.title} Package</span>
              <span className="text-white/80 font-semibold">${(pkg.basePrice / 100).toLocaleString()}</span>
            </div>
            <p className="text-white/70 text-sm mt-2">{pkg.description}</p>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-trinity-red" />
            <h3 className="text-xl font-heading font-bold text-white">Client Information</h3>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white/60 text-sm">Full Name</p>
                <p className="text-white font-medium">{data.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-white/60 text-sm">Email</p>
                <p className="text-white font-medium">{data.email}</p>
              </div>
            </div>
            {data.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Phone</p>
                  <p className="text-white font-medium">{data.phone}</p>
                </div>
              </div>
            )}
            {data.company && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Company</p>
                  <p className="text-white font-medium">{data.company}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-trinity-red" />
            <h3 className="text-xl font-heading font-bold text-white">Project Details</h3>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-4">
            {data.projectType && data.projectType.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Project Type</p>
                <div className="flex flex-wrap gap-2">
                  {data.projectType.map((type, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-trinity-red/20 text-trinity-red border border-trinity-red/30 rounded-lg text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.projectGoals && (
              <div>
                <p className="text-white/60 text-sm mb-2">Project Goals</p>
                <p className="text-white">{data.projectGoals}</p>
              </div>
            )}
            {data.timeline && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white/60 text-sm">Timeline</p>
                  <p className="text-white font-medium">{data.timeline}</p>
                </div>
              </div>
            )}
            {data.specialRequirements && (
              <div>
                <p className="text-white/60 text-sm mb-2">Special Requirements</p>
                <p className="text-white">{data.specialRequirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-trinity-red" />
            <h3 className="text-xl font-heading font-bold text-white">Additional Information</h3>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3">
            {data.referralSource && (
              <div>
                <p className="text-white/60 text-sm">How did you hear about us?</p>
                <p className="text-white font-medium">{data.referralSource}</p>
              </div>
            )}
            {data.stage && (
              <div>
                <p className="text-white/60 text-sm">What stage are you at?</p>
                <p className="text-white font-medium">{data.stage}</p>
              </div>
            )}
            {data.outreachProgram && (
              <div>
                <p className="text-white/60 text-sm">Outreach Program</p>
                <p className="text-white font-medium">{data.outreachProgram}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-start gap-3 bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-semibold mb-1">Next Steps</p>
              <p className="text-white/80 text-sm">
                Your project request has been submitted successfully. Our team will review your request and get back to you within 24 hours. Once approved, you'll receive an invoice for the starting deposit.
              </p>
            </div>
          </div>
        </div>

        {/* Receipt ID */}
        {data.leadId && (
          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">Receipt ID: {data.leadId}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}













