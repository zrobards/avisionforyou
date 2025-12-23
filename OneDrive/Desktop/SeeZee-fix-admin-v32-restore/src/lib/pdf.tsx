import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #E53E3E',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666',
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    color: '#1A202C',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #E2E8F0',
    paddingBottom: 8,
    marginBottom: 8,
    backgroundColor: '#F7FAFC',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottom: '0.5 solid #E2E8F0',
  },
  tableCol: {
    fontSize: 10,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4A5568',
    textTransform: 'uppercase',
  },
  description: {
    width: '50%',
  },
  quantity: {
    width: '15%',
    textAlign: 'center',
  },
  rate: {
    width: '15%',
    textAlign: 'right',
  },
  amount: {
    width: '20%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    borderTop: '2 solid #E2E8F0',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginRight: 40,
    width: 100,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 12,
    color: '#1A202C',
    width: 100,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1.5 solid #E53E3E',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginRight: 40,
    width: 100,
    textAlign: 'right',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53E3E',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #E2E8F0',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    padding: '5 10',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  statusPaid: {
    backgroundColor: '#C6F6D5',
    color: '#22543D',
  },
  statusSent: {
    backgroundColor: '#BEE3F8',
    color: '#2C5282',
  },
  statusDraft: {
    backgroundColor: '#E2E8F0',
    color: '#4A5568',
  },
  statusOverdue: {
    backgroundColor: '#FED7D7',
    color: '#742A2A',
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F7FAFC',
    borderLeft: '3 solid #E53E3E',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 10,
    color: '#666',
    lineHeight: 1.5,
  },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  number: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  dueDate: string;
  paidAt?: string | null;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  organization?: {
    name: string;
    email?: string | null;
    address?: string | null;
  };
  project?: {
    name: string;
  };
}

// Invoice PDF Component
const InvoicePDF = ({ invoice }: { invoice: InvoiceData }) => {
  // ✅ NUCLEAR OPTION: Sanitize the invoice prop itself when component renders
  // This catches any React elements that might have slipped through
  const sanitized = deepSanitize(invoice);
  const sanitizedInvoice: InvoiceData = {
    number: String(sanitized.number || ''),
    title: String(sanitized.title || ''),
    description: sanitized.description != null ? String(sanitized.description) : null,
    status: String(sanitized.status || 'DRAFT'),
    createdAt: String(sanitized.createdAt || new Date().toISOString()),
    dueDate: String(sanitized.dueDate || new Date().toISOString()),
    paidAt: sanitized.paidAt != null ? String(sanitized.paidAt) : null,
    amount: Number(sanitized.amount) || 0,
    tax: Number(sanitized.tax) || 0,
    total: Number(sanitized.total) || 0,
    currency: String(sanitized.currency || 'USD'),
    items: Array.isArray(sanitized.items) 
      ? sanitized.items.map((item: any) => ({
          description: String(item?.description ?? ''),
          quantity: Number(item?.quantity ?? 0),
          rate: Number(item?.rate ?? 0),
          amount: Number(item?.amount ?? 0),
        }))
      : [],
    organization: sanitized.organization && typeof sanitized.organization === 'object'
      ? {
          name: String(sanitized.organization.name ?? ''),
          email: sanitized.organization.email != null ? String(sanitized.organization.email) : null,
          address: sanitized.organization.address != null ? String(sanitized.organization.address) : null,
        }
      : undefined,
    project: sanitized.project && typeof sanitized.project === 'object'
      ? {
          name: String(sanitized.project.name ?? ''),
        }
      : undefined,
  };
  
  // Helper function to safely convert any value to a string
  // CRITICAL: This must strip React elements to prevent "Minified React error #31"
  const safeString = (value: any): string => {
    try {
      if (value == null) return '';

      // ✅ KILL REACT ELEMENTS FIRST - this is the root cause of error #31
      if (React.isValidElement(value)) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:safeString',message:'React element detected and stripped',data:{elementType:typeof (value as any).type,hasChildren:!!(value as any).props?.children},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        // Try to salvage text from children if it's like <span>Text</span>
        const children = (value as any).props?.children;
        if (children != null) {
          return safeString(children);
        }
        return '[Component]';
      }

      // ✅ Handle arrays: join text-ish stuff
      if (Array.isArray(value)) {
        return value.map(safeString).filter(Boolean).join(' ');
      }

      const t = typeof value;
      if (t === 'string') return value;
      if (t === 'number' || t === 'boolean' || t === 'bigint') return String(value);
      if (t === 'function') return '[Function]';

      // ✅ Plain object -> never render raw, stringify it
      if (typeof value === 'object' && value !== null) {
        try {
          const stringified = JSON.stringify(value);
          if (stringified && stringified !== '{}' && stringified !== '[]') {
            return stringified.length > 200 ? stringified.slice(0, 200) + '...' : stringified;
          }
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:safeString',message:'JSON.stringify failed in safeString',data:{error:String(e),valueKeys:Object.keys(value)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
        return '[Object]';
      }

      return String(value);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:safeString',message:'safeString error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('[PDF safeString] Unexpected error:', error);
      return '';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return styles.statusPaid;
      case 'SENT':
        return styles.statusSent;
      case 'DRAFT':
        return styles.statusDraft;
      case 'OVERDUE':
        return styles.statusOverdue;
      default:
        return styles.statusDraft;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0.00';
    return `$${(numAmount / 100).toFixed(2)}`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const invoiceNumberStr = safeString(sanitizedInvoice.number);
  const invoiceStatusStr = safeString(sanitizedInvoice.status);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Company Info */}
        <View style={styles.header}>
          <Text style={styles.companyName}>SeeZee Enterprises</Text>
          <Text style={styles.companyDetails}>Professional Web Development Services</Text>
          <Text style={styles.companyDetails}>seanpm1007@gmail.com</Text>
        </View>

        {/* Invoice Title and Number */}
        <View style={styles.section}>
          <Text style={styles.invoiceTitle}>INVOICE #{invoiceNumberStr}</Text>
          <View style={[styles.statusBadge, getStatusStyle(invoiceStatusStr)]}>
            <Text>{invoiceStatusStr}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.value}>{safeString(sanitizedInvoice.organization?.name || 'N/A')}</Text>
              {sanitizedInvoice.organization?.email ? (
                <Text style={[styles.value, { fontSize: 10, color: '#666' }]}>
                  {safeString(sanitizedInvoice.organization.email)}
                </Text>
              ) : null}
              {sanitizedInvoice.organization?.address ? (
                <Text style={[styles.value, { fontSize: 10, color: '#666' }]}>
                  {safeString(sanitizedInvoice.organization.address)}
                </Text>
              ) : null}
            </View>
            <View style={{ textAlign: 'right' }}>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.label}>Invoice Date</Text>
                <Text style={styles.value}>{safeString(formatDate(sanitizedInvoice.createdAt))}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>{safeString(formatDate(sanitizedInvoice.dueDate))}</Text>
              </View>
              {sanitizedInvoice.paidAt ? (
                <View>
                  <Text style={styles.label}>Paid On</Text>
                  <Text style={[styles.value, { color: '#22543D' }]}>
                    {safeString(formatDate(sanitizedInvoice.paidAt))}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Project Info */}
        {sanitizedInvoice.project ? (
          <View style={styles.section}>
            <Text style={styles.label}>Project</Text>
            <Text style={styles.value}>{safeString(sanitizedInvoice.project.name)}</Text>
          </View>
        ) : null}

        {/* Invoice Title and Description */}
        {sanitizedInvoice.title ? (
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.value}>{safeString(sanitizedInvoice.title)}</Text>
            {sanitizedInvoice.description ? (
              <Text style={[styles.value, { fontSize: 10, color: '#666', marginTop: 5 }]}>
                {safeString(sanitizedInvoice.description)}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableColHeader, styles.description]}>Description</Text>
            <Text style={[styles.tableColHeader, styles.quantity]}>Qty</Text>
            <Text style={[styles.tableColHeader, styles.rate]}>Rate</Text>
            <Text style={[styles.tableColHeader, styles.amount]}>Amount</Text>
          </View>
          {sanitizedInvoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.description]}>{safeString(item.description)}</Text>
              <Text style={[styles.tableCol, styles.quantity]}>{safeString(item.quantity)}</Text>
              <Text style={[styles.tableCol, styles.rate]}>{safeString(formatCurrency(Number(item.rate) || 0))}</Text>
              <Text style={[styles.tableCol, styles.amount]}>{safeString(formatCurrency(Number(item.amount) || 0))}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{safeString(formatCurrency(sanitizedInvoice.amount))}</Text>
          </View>
          {sanitizedInvoice.tax > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{safeString(formatCurrency(sanitizedInvoice.tax))}</Text>
            </View>
          ) : null}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>{safeString(formatCurrency(sanitizedInvoice.total))}</Text>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Payment Information</Text>
          <Text style={styles.notesText}>
            {safeString(sanitizedInvoice.status).toUpperCase() === 'PAID'
              ? 'This invoice has been paid in full. Thank you for your business!'
              : 'Please make payment via the Stripe payment link provided in your email or contact us for alternative payment methods.'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 5 }}>
            For questions about this invoice, please contact us at seanpm1007@gmail.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Deep sanitization function to remove React elements and ensure all values are serializable
 * Uses React.isValidElement for reliable React element detection
 */
function deepSanitize(value: any, visited = new WeakSet()): any {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitives
  if (typeof value !== 'object') {
    return value;
  }

  // Prevent circular references
  if (visited.has(value)) {
    return '[Circular]';
  }

  // ✅ CRITICAL: Use React.isValidElement for reliable React element detection
  if (React.isValidElement(value)) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:deepSanitize',message:'React element detected and sanitized',data:{valueKeys:Object.keys(value),elementType:typeof (value as any).type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Try to extract text from children if possible
    const children = (value as any).props?.children;
    if (children != null) {
      return deepSanitize(children, visited);
    }
    return '[React Component]';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    visited.add(value);
    const sanitized = value.map(item => deepSanitize(item, visited));
    visited.delete(value);
    return sanitized;
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle plain objects
  visited.add(value);
  const sanitized: any = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      sanitized[key] = deepSanitize(value[key], visited);
    }
  }
  visited.delete(value);
  return sanitized;
}

/**
 * Generate a PDF buffer for an invoice
 */
export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:474',message:'generateInvoicePDF entry',data:{invoiceType:typeof invoice,hasItems:!!invoice?.items,itemsCount:invoice?.items?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Validate invoice data before rendering
    if (!invoice || typeof invoice !== 'object') {
      throw new Error('Invalid invoice data: invoice must be an object');
    }
    
    // ✅ CRITICAL: Always deep sanitize first to remove React elements
    // This must happen BEFORE JSON serialization to catch React elements
    const sanitizedRaw = deepSanitize(invoice);
    
    // Then ensure the invoice can be JSON serialized (this removes any remaining non-serializable values)
    let serializedInvoice: any;
    try {
      serializedInvoice = JSON.parse(JSON.stringify(sanitizedRaw));
    } catch (e) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:548',message:'JSON serialization failed after sanitization',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw new Error('Invoice data cannot be serialized: ' + String(e));
    }
    
    // Reconstruct the invoice as a completely plain object with only primitives
    // This ensures no React elements or non-serializable values remain
    const sanitizedInvoice: InvoiceData = {
      number: String(serializedInvoice.number || ''),
      title: String(serializedInvoice.title || ''),
      description: serializedInvoice.description != null ? String(serializedInvoice.description) : null,
      status: String(serializedInvoice.status || 'DRAFT'),
      createdAt: String(serializedInvoice.createdAt || new Date().toISOString()),
      dueDate: String(serializedInvoice.dueDate || new Date().toISOString()),
      paidAt: serializedInvoice.paidAt != null ? String(serializedInvoice.paidAt) : null,
      amount: Number(serializedInvoice.amount) || 0,
      tax: Number(serializedInvoice.tax) || 0,
      total: Number(serializedInvoice.total) || 0,
      currency: String(serializedInvoice.currency || 'USD'),
      items: Array.isArray(serializedInvoice.items) 
        ? serializedInvoice.items.map((item: any) => ({
            description: String(item?.description ?? ''),
            quantity: Number(item?.quantity ?? 0),
            rate: Number(item?.rate ?? 0),
            amount: Number(item?.amount ?? 0),
          }))
        : [],
      organization: serializedInvoice.organization && typeof serializedInvoice.organization === 'object'
        ? {
            name: String(serializedInvoice.organization.name ?? ''),
            email: serializedInvoice.organization.email != null ? String(serializedInvoice.organization.email) : null,
            address: serializedInvoice.organization.address != null ? String(serializedInvoice.organization.address) : null,
          }
        : undefined,
      project: serializedInvoice.project && typeof serializedInvoice.project === 'object'
        ? {
            name: String(serializedInvoice.project.name ?? ''),
          }
        : undefined,
    };
    
    // #region agent log
    // ✅ Use React.isValidElement for reliable React element detection
    const deepCheckReact = (obj: any, path: string = '', found: any[] = []): any[] => {
      if (!obj || typeof obj !== 'object') return found;
      
      // ✅ CRITICAL: Use React.isValidElement for reliable detection
      if (React.isValidElement(obj)) {
        found.push({ path, keys: Object.keys(obj), hasTypeof: '$$typeof' in obj, elementType: typeof (obj as any).type });
        return found;
      }
      
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => deepCheckReact(item, `${path}[${idx}]`, found));
        return found;
      }
      
      Object.entries(obj).forEach(([key, val]) => {
        if (val && typeof val === 'object') deepCheckReact(val, path ? `${path}.${key}` : key, found);
      });
      return found;
    };
    const reactElements = deepCheckReact(sanitizedInvoice);
    if (reactElements.length > 0) {
      console.error('🚨 CRITICAL: React elements found in sanitizedInvoice:', reactElements);
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:606',message:'🚨 CRITICAL: React elements found in sanitizedInvoice',data:{foundReactElements:true,reactElements:reactElements},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // Re-sanitize if React elements are found
      const reSanitized = deepSanitize(sanitizedInvoice);
      Object.assign(sanitizedInvoice, reSanitized);
    } else {
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:606',message:'Sanitized invoice React element check - no elements found',data:{foundReactElements:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    
    // Final verification: ensure the invoice can be JSON serialized (proves no React elements)
    try {
      JSON.stringify(sanitizedInvoice);
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:610',message:'Invoice is JSON serializable',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    } catch (e) {
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:612',message:'Invoice NOT JSON serializable',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      throw new Error('Invoice data contains non-serializable values: ' + String(e));
    }
    // #endregion
    
    // ✅ NUCLEAR OPTION: Final check - recursively sanitize the entire invoice object one more time
    // This catches any React elements that might have been introduced during object reconstruction
    const finalSanitized = deepSanitize(sanitizedInvoice);
    
    // Verify final sanitized object has no React elements
    const finalCheck = deepCheckReact(finalSanitized);
    if (finalCheck.length > 0) {
      console.error('🚨 CRITICAL: React elements STILL found after final sanitization:', finalCheck);
      fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:finalCheck',message:'🚨 CRITICAL: React elements STILL found',data:{reactElements:finalCheck},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // Force convert to plain object by JSON round-trip
      const forcedClean = JSON.parse(JSON.stringify(finalSanitized));
      Object.assign(sanitizedInvoice, forcedClean);
    }
    
    // ✅ Create a completely fresh, plain object from the sanitized data
    // This ensures no references to original objects that might contain React elements
    const ultraCleanInvoice: InvoiceData = {
      number: String(finalSanitized.number || ''),
      title: String(finalSanitized.title || ''),
      description: finalSanitized.description != null ? String(finalSanitized.description) : null,
      status: String(finalSanitized.status || 'DRAFT'),
      createdAt: String(finalSanitized.createdAt || new Date().toISOString()),
      dueDate: String(finalSanitized.dueDate || new Date().toISOString()),
      paidAt: finalSanitized.paidAt != null ? String(finalSanitized.paidAt) : null,
      amount: Number(finalSanitized.amount) || 0,
      tax: Number(finalSanitized.tax) || 0,
      total: Number(finalSanitized.total) || 0,
      currency: String(finalSanitized.currency || 'USD'),
      items: Array.isArray(finalSanitized.items) 
        ? finalSanitized.items.map((item: any) => ({
            description: String(item?.description ?? ''),
            quantity: Number(item?.quantity ?? 0),
            rate: Number(item?.rate ?? 0),
            amount: Number(item?.amount ?? 0),
          }))
        : [],
      organization: finalSanitized.organization && typeof finalSanitized.organization === 'object'
        ? {
            name: String(finalSanitized.organization.name ?? ''),
            email: finalSanitized.organization.email != null ? String(finalSanitized.organization.email) : null,
            address: finalSanitized.organization.address != null ? String(finalSanitized.organization.address) : null,
          }
        : undefined,
      project: finalSanitized.project && typeof finalSanitized.project === 'object'
        ? {
            name: String(finalSanitized.project.name ?? ''),
          }
        : undefined,
    };
    
    const doc = <InvoicePDF invoice={ultraCleanInvoice} />;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:aboutToRender',message:'About to call pdf()',data:{docType:typeof doc,hasInvoice:!!ultraCleanInvoice},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/44a284b2-eeef-4d7c-adae-bec1bc572ac3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'pdf.tsx:500',message:'generateInvoicePDF error caught',data:{errorMessage:error?.message,errorStack:error?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    console.error('Invoice data that caused error:', JSON.stringify(invoice, null, 2));
    throw error;
  }
}

/**
 * Generate a PDF and return as base64 string
 */
export async function generateInvoicePDFBase64(invoice: InvoiceData): Promise<string> {
  const buffer = await generateInvoicePDF(invoice);
  return buffer.toString('base64');
}




